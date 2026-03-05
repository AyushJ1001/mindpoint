import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { EnrollmentStatus } from "./schema";
import {
  requireAdmin,
  normalizeEnrollmentStatus,
  isAuthenticatedUserId,
} from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

function generateEnrollmentNumber(courseCode: string, startDate: string): string {
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

  return `TMP-${courseCode}-${month}${year}-${randomNumber}`;
}

function isActiveEnrollmentStatus(status?: string): boolean {
  return normalizeEnrollmentStatus(status) === "active";
}

async function removeUserFromCourseIfNoActiveEnrollment(
  ctx: MutationCtx,
  args: { userId: string; courseId: Id<"courses"> },
) {
  const allUserEnrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
    .collect();

  const hasActiveEnrollment = allUserEnrollments.some(
    (row: any) => row.courseId === args.courseId && isActiveEnrollmentStatus(row.status),
  );

  if (!hasActiveEnrollment) {
    const course = await ctx.db.get(args.courseId);
    if (!course) return;

    const filteredUsers = (course.enrolledUsers ?? []).filter(
      (user: string) => user !== args.userId,
    );

    await ctx.db.patch(args.courseId, { enrolledUsers: filteredUsers });
  }
}

export const listEnrollments = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(EnrollmentStatus),
    userId: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 250, 500);

    let enrollments = await ctx.db.query("enrollments").order("desc").take(limit);

    if (args.userId) {
      enrollments = enrollments.filter((row) => row.userId === args.userId);
    }

    if (args.courseId) {
      enrollments = enrollments.filter((row) => row.courseId === args.courseId);
    }

    if (args.status) {
      enrollments = enrollments.filter(
        (row) => normalizeEnrollmentStatus(row.status) === args.status,
      );
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      enrollments = enrollments.filter((row) => {
        const fields = [
          row.userId,
          row.userName ?? "",
          row.userEmail ?? "",
          row.courseName ?? "",
          row.enrollmentNumber,
        ];

        return fields.some((field) => field.toLowerCase().includes(search));
      });
    }

    const courseIds = Array.from(new Set(enrollments.map((row) => row.courseId)));
    const courses = await Promise.all(courseIds.map((courseId) => ctx.db.get(courseId)));
    const courseMap = new Map(
      courses
        .filter((course): course is NonNullable<typeof course> => course !== null)
        .map((course) => [course._id, course]),
    );

    return enrollments.map((enrollment) => ({
      ...enrollment,
      status: normalizeEnrollmentStatus(enrollment.status),
      course: courseMap.get(enrollment.courseId) ?? null,
    }));
  },
});

export const getEnrollmentDetail = query({
  args: {
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return null;
    }

    const [course, userProfile, mindPoints, relatedEnrollments] = await Promise.all([
      ctx.db.get(enrollment.courseId),
      isAuthenticatedUserId(enrollment.userId)
        ? ctx.db
            .query("userProfiles")
            .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", enrollment.userId))
            .first()
        : null,
      isAuthenticatedUserId(enrollment.userId)
        ? ctx.db
            .query("mindPoints")
            .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", enrollment.userId))
            .first()
        : null,
      ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", enrollment.userId))
        .order("desc")
        .take(25),
    ]);

    return {
      ...enrollment,
      status: normalizeEnrollmentStatus(enrollment.status),
      course,
      userProfile,
      mindPoints,
      relatedEnrollments: relatedEnrollments.map((row) => ({
        ...row,
        status: normalizeEnrollmentStatus(row.status),
      })),
    };
  },
});

export const createManualEnrollment = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    courseId: v.id("courses"),
    isGuestUser: v.optional(v.boolean()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const isGuestUser = args.isGuestUser ?? !isAuthenticatedUserId(args.userId);

    let enrollmentId: Id<"enrollments"> | null = null;

    if (isGuestUser) {
      const enrollments = (await ctx.runMutation(
        api.myFunctions.handleGuestUserCartCheckoutWithData as any,
        {
          userData: {
            name: args.userName || args.userEmail,
            email: args.userEmail,
            phone: args.userPhone || "",
          },
          courseIds: [args.courseId],
          sessionType: args.sessionType,
        },
      )) as Array<{
        enrollmentId: Id<"enrollments">;
        courseId: Id<"courses">;
      }>;

      const matching = enrollments.find((row) => row.courseId === args.courseId);
      if (matching) {
        enrollmentId = matching.enrollmentId;
      }
    } else {
      const created = (await ctx.runMutation(
        api.myFunctions.handleSuccessfulPayment as any,
        {
          userId: args.userId,
          userEmail: args.userEmail,
          userPhone: args.userPhone,
          studentName: args.userName,
          courseId: args.courseId,
          sessionType: args.sessionType,
        },
      )) as Id<"enrollments">;
      enrollmentId = created;
    }

    if (!enrollmentId) {
      throw new Error("Failed to create enrollment");
    }

    const createdEnrollment = await ctx.db.get(enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.create_manual",
      entityType: "enrollment",
      entityId: String(enrollmentId),
      after: createdEnrollment,
      metadata: {
        source: "admin",
        isGuestUser,
      },
    });

    return createdEnrollment;
  },
});

export const cancelEnrollment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const currentStatus = normalizeEnrollmentStatus(enrollment.status);
    if (currentStatus === "cancelled") {
      return enrollment;
    }

    const now = Date.now();

    await ctx.db.patch(args.enrollmentId, {
      status: "cancelled",
      statusReason: args.reason,
      cancelledAt: now,
      cancelledByAdminId: admin.userId,
    });

    await removeUserFromCourseIfNoActiveEnrollment(ctx, {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
    });

    const updated = await ctx.db.get(args.enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.cancel",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      before: enrollment,
      after: updated,
      metadata: { reason: args.reason },
    });

    return updated;
  },
});

export const transferEnrollment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    targetCourseId: v.id("courses"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const [sourceEnrollment, targetCourse] = await Promise.all([
      ctx.db.get(args.enrollmentId),
      ctx.db.get(args.targetCourseId),
    ]);

    if (!sourceEnrollment) {
      throw new Error("Enrollment not found");
    }

    if (!targetCourse) {
      throw new Error("Target course not found");
    }

    if (sourceEnrollment.courseId === args.targetCourseId) {
      throw new Error("Source and target course cannot be the same");
    }

    const currentStatus = normalizeEnrollmentStatus(sourceEnrollment.status);
    if (currentStatus !== "active") {
      throw new Error("Only active enrollments can be transferred");
    }

    const now = Date.now();

    await ctx.db.patch(args.enrollmentId, {
      status: "transferred",
      statusReason: args.reason,
      transferredAt: now,
      transferredByAdminId: admin.userId,
      transferredToCourseId: args.targetCourseId,
    });

    await removeUserFromCourseIfNoActiveEnrollment(ctx, {
      userId: sourceEnrollment.userId,
      courseId: sourceEnrollment.courseId,
    });

    const enrollmentNumber =
      targetCourse.type === "therapy" ||
      targetCourse.type === "supervised" ||
      targetCourse.type === "worksheet"
        ? "N/A"
        : generateEnrollmentNumber(targetCourse.code, targetCourse.startDate);

    const newEnrollmentId = await ctx.db.insert("enrollments", {
      userId: sourceEnrollment.userId,
      userName: sourceEnrollment.userName,
      userEmail: sourceEnrollment.userEmail,
      userPhone: sourceEnrollment.userPhone,
      courseId: args.targetCourseId,
      courseName: targetCourse.name,
      enrollmentNumber,
      isGuestUser: sourceEnrollment.isGuestUser,
      sessionType: sourceEnrollment.sessionType,
      courseType: targetCourse.type,
      internshipPlan: sourceEnrollment.internshipPlan,
      sessions: targetCourse.sessions,
      isBogoFree: sourceEnrollment.isBogoFree,
      bogoSourceCourseId: sourceEnrollment.bogoSourceCourseId,
      bogoOfferName: sourceEnrollment.bogoOfferName,
      status: "active",
      statusReason: `Transfer from ${sourceEnrollment.courseName || String(sourceEnrollment.courseId)}`,
    });

    if (!(targetCourse.enrolledUsers ?? []).includes(sourceEnrollment.userId)) {
      await ctx.db.patch(args.targetCourseId, {
        enrolledUsers: [...(targetCourse.enrolledUsers ?? []), sourceEnrollment.userId],
      });
    }

    const [updatedSource, createdTarget] = await Promise.all([
      ctx.db.get(args.enrollmentId),
      ctx.db.get(newEnrollmentId),
    ]);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.transfer",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      before: sourceEnrollment,
      after: updatedSource,
      metadata: {
        reason: args.reason,
        newEnrollmentId: String(newEnrollmentId),
        targetCourseId: String(args.targetCourseId),
      },
    });

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.transfer_created",
      entityType: "enrollment",
      entityId: String(newEnrollmentId),
      after: createdTarget,
      metadata: {
        sourceEnrollmentId: String(args.enrollmentId),
        reason: args.reason,
      },
    });

    return {
      sourceEnrollment: updatedSource,
      newEnrollment: createdTarget,
    };
  },
});
