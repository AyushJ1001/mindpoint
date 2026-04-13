import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { EnrollmentStatus } from "./schema";
import type { FunctionReturnType } from "convex/server";
import { requireAdmin } from "./adminAuth";
import { normalizeEnrollmentStatus } from "./adminUtils";
import { createAdminAuditLog } from "./adminAudit";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

function generateEnrollmentNumber(
  courseCode: string,
  startDate: string,
): string {
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString(36).toUpperCase();
  const entropy = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `EN-${courseCode}-${month}${year}-${timestamp}-${entropy}`;
}

async function generateUniqueEnrollmentNumber(
  ctx: MutationCtx,
  courseCode: string,
  startDate: string,
): Promise<string> {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const enrollmentNumber = generateEnrollmentNumber(courseCode, startDate);
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_enrollmentNumber", (q) =>
        q.eq("enrollmentNumber", enrollmentNumber),
      )
      .first();

    if (!existing) {
      return enrollmentNumber;
    }
  }

  throw new Error("Enrollment number collision. Please retry.");
}
function extractInternshipPlanFromDuration(
  duration?: string,
): "120" | "240" | null {
  if (!duration) return null;

  const durationLower = duration.toLowerCase().trim();
  if (durationLower.includes("120") || durationLower.includes("2 week")) {
    return "120";
  }
  if (durationLower.includes("240") || durationLower.includes("4 week")) {
    return "240";
  }

  return null;
}

function calculateInternshipEndDate(
  startDate: string | undefined,
  internshipPlan: "120" | "240",
): string {
  const parsedStart = startDate ? new Date(startDate) : new Date();
  const start = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const weeks = internshipPlan === "120" ? 2 : 4;
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + weeks * 7);

  return endDate.toISOString().split("T")[0];
}

type GuestCheckoutResult = FunctionReturnType<
  typeof api.myFunctions.handleGuestUserCartCheckoutWithData
>;
type SuccessfulPaymentResult = FunctionReturnType<
  typeof api.myFunctions.handleSuccessfulPayment
>;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isAuthenticatedUserId(userId: string): boolean {
  return userId.startsWith("user_");
}

async function removeUserFromCourseIfNoActiveEnrollment(
  ctx: MutationCtx,
  args: { userId: string; courseId: Id<"courses"> },
) {
  const activeEnrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_courseId_and_status_and_userId", (q) =>
      q
        .eq("courseId", args.courseId)
        .eq("status", "active")
        .eq("userId", args.userId),
    )
    .first();

  if (!activeEnrollment) {
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
    const scanLimit = Math.min(Math.max(limit * 5, 500), 2000);
    const effectiveScanLimit = args.search
      ? Math.min(Math.max(limit * 12, 1500), 5000)
      : scanLimit;
    const enrollments: Doc<"enrollments">[] = [];
    const seenEnrollmentIds = new Set<string>();
    const appendRows = (rows: Doc<"enrollments">[]) => {
      for (const row of rows) {
        const rowKey = String(row._id);
        if (seenEnrollmentIds.has(rowKey)) {
          continue;
        }
        seenEnrollmentIds.add(rowKey);
        enrollments.push(row);
      }
    };
    const remainingSlots = () =>
      Math.max(0, effectiveScanLimit - enrollments.length);

    if (args.userId && args.courseId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId_and_status_and_userId", (q) =>
            q
              .eq("courseId", args.courseId!)
              .eq("status", args.status!)
              .eq("userId", args.userId!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_userId_and_courseId", (q) =>
                q.eq("userId", args.userId!).eq("courseId", args.courseId!),
              )
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.userId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId_and_status", (q) =>
            q.eq("userId", args.userId!).eq("status", args.status!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.courseId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId_and_status", (q) =>
            q.eq("courseId", args.courseId!).eq("status", args.status!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.userId && args.courseId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId_and_courseId", (q) =>
            q.eq("userId", args.userId!).eq("courseId", args.courseId!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.userId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.courseId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          await ctx.db
            .query("enrollments")
            .filter((q) => q.eq(q.field("status"), undefined))
            .order("desc")
            .take(remainingSlots()),
        );
      }
    } else {
      appendRows(
        await ctx.db
          .query("enrollments")
          .order("desc")
          .take(effectiveScanLimit),
      );
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      const matchingRows = enrollments.filter((row) => {
        const fields = [
          row.userId,
          row.userName ?? "",
          row.userEmail ?? "",
          row.userPhone ?? "",
          row.courseName ?? "",
          row.enrollmentNumber,
          row.couponCode ?? "",
          row.bundleCampaignName ?? "",
        ];

        return fields.some((field) => field.toLowerCase().includes(search));
      });
      enrollments.length = 0;
      enrollments.push(...matchingRows);
    }

    const courseIds = Array.from(
      new Set(enrollments.map((row) => row.courseId)),
    );
    const courses = await Promise.all(
      courseIds.map((courseId) => ctx.db.get(courseId)),
    );
    const courseMap = new Map(
      courses
        .filter(
          (course): course is NonNullable<typeof course> => course !== null,
        )
        .map((course) => [course._id, course]),
    );

    return enrollments.slice(0, limit).map((enrollment) => ({
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

    const [course, userProfile, mindPoints, relatedEnrollments] =
      await Promise.all([
        ctx.db.get(enrollment.courseId),
        isAuthenticatedUserId(enrollment.userId)
          ? ctx.db
              .query("userProfiles")
              .withIndex("by_clerkUserId", (q) =>
                q.eq("clerkUserId", enrollment.userId),
              )
              .first()
          : null,
        isAuthenticatedUserId(enrollment.userId)
          ? ctx.db
              .query("mindPoints")
              .withIndex("by_clerkUserId", (q) =>
                q.eq("clerkUserId", enrollment.userId),
              )
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
    internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
  },
  handler: async (ctx, args): Promise<Doc<"enrollments"> | null> => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    if (args.isGuestUser && isAuthenticatedUserId(args.userId)) {
      throw new Error("A Clerk user ID cannot be enrolled as a guest user.");
    }

    if (args.isGuestUser === false && args.userId.includes("@")) {
      throw new Error(
        "An email-based user ID must be enrolled as a guest user.",
      );
    }

    if (
      args.userId.includes("@") &&
      normalizeEmail(args.userId) !== normalizeEmail(args.userEmail)
    ) {
      throw new Error(
        "When using an email as the user ID, the user email must match exactly.",
      );
    }

    const isGuestUser = args.isGuestUser ?? !isAuthenticatedUserId(args.userId);

    let enrollmentId: Id<"enrollments"> | null = null;

    if (isGuestUser) {
      const enrollments = (await ctx.runMutation(
        api.myFunctions.handleGuestUserCartCheckoutWithData,
        {
          userData: {
            name: args.userName || args.userEmail,
            email: args.userEmail,
            phone: args.userPhone || "",
          },
          courseIds: [args.courseId],
          sessionType: args.sessionType,
          internshipPlan: args.internshipPlan,
          checkoutPricing: {
            totalAmountPaid: 0,
            items: [
              {
                courseId: args.courseId,
                listedPrice: course.price,
                checkoutPrice: 0,
                amountPaid: 0,
              },
            ],
          },
        },
      )) as GuestCheckoutResult;

      if (enrollments.length === 0) {
        throw new Error(
          `handleGuestUserCartCheckoutWithData returned no enrollments for course ${args.courseId}.`,
        );
      }

      const matching = enrollments.find(
        (row) => String(row.courseId) === String(args.courseId),
      );
      if (!matching) {
        throw new Error(
          `handleGuestUserCartCheckoutWithData returned enrollments for [${enrollments
            .map((row) => String(row.courseId))
            .join(", ")}], but none matched course ${args.courseId}.`,
        );
      }
      enrollmentId = matching.enrollmentId;
    } else {
      try {
        const created: SuccessfulPaymentResult = await ctx.runMutation(
          api.myFunctions.handleSuccessfulPayment,
          {
            userId: args.userId,
            userEmail: args.userEmail,
            userPhone: args.userPhone,
            studentName: args.userName,
            courseId: args.courseId,
            sessionType: args.sessionType,
            internshipPlan: args.internshipPlan,
            checkoutPricing: {
              totalAmountPaid: 0,
              items: [
                {
                  courseId: args.courseId,
                  listedPrice: course.price,
                  checkoutPrice: 0,
                  amountPaid: 0,
                },
              ],
            },
          },
        );
        enrollmentId = created.enrollmentId;
      } catch (innerError) {
        throw new Error(
          `handleSuccessfulPayment failed: ${
            innerError instanceof Error
              ? innerError.message
              : String(innerError)
          }`,
        );
      }
    }

    if (!enrollmentId) {
      throw new Error("Failed to create enrollment");
    }

    try {
      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "enrollment.create_manual",
        entityType: "enrollment",
        entityId: String(enrollmentId),
        after: { enrollmentId: String(enrollmentId) },
        metadata: {
          source: "admin",
          isGuestUser,
        },
      });
    } catch (error) {
      throw new Error(
        `Enrollment ${enrollmentId} was created, but audit logging failed. Confirm the record before retrying: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const createdEnrollment = await ctx.db.get(enrollmentId);
    if (!createdEnrollment) {
      throw new Error(
        `Enrollment ${enrollmentId} was created, but it could not be reloaded. Confirm the record before retrying.`,
      );
    }

    await ctx.db.patch(enrollmentId, {
      registrationSource: "admin_manual",
    });

    return await ctx.db.get(enrollmentId);
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
    if (currentStatus === "cancelled" || currentStatus === "transferred") {
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

export const resendEnrollmentConfirmationEmail = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const currentStatus = normalizeEnrollmentStatus(enrollment.status);
    if (currentStatus !== "active") {
      throw new Error(
        `Cannot resend confirmation for a ${currentStatus} enrollment.`,
      );
    }

    const now = Date.now();
    const lastSentAt = enrollment.lastConfirmationSentAt ?? 0;
    if (now - lastSentAt < RESEND_COOLDOWN_MS) {
      throw new Error(
        `A confirmation email was already sent ${Math.round(
          (now - lastSentAt) / 1000,
        )}s ago. Please wait before resending.`,
      );
    }

    const course = await ctx.db.get(enrollment.courseId);
    if (!course) {
      throw new Error("Course not found for this enrollment");
    }

    const recipientEmail =
      enrollment.userEmail ||
      (enrollment.userId.includes("@") ? enrollment.userId : null);

    if (!recipientEmail) {
      throw new Error("Cannot send email: enrollment has no recipient email");
    }

    const userName = enrollment.userName || recipientEmail;
    const courseName = enrollment.courseName || course.name;
    const courseType = course.type || enrollment.courseType;
    const startDate = course.startDate;
    const endDate = course.endDate;
    const startTime = course.startTime;
    const endTime = course.endTime;

    let emailAction = "generic";
    let usedFallback = false;

    if (courseType === "supervised") {
      if (enrollment.sessionType) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: recipientEmail,
            studentName: userName,
            sessionType: enrollment.sessionType,
          },
        );
        emailAction = "supervised_welcome";
      } else {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendEnrollmentConfirmation,
          {
            userEmail: recipientEmail,
            userPhone: enrollment.userPhone,
            courseName,
            enrollmentNumber: enrollment.enrollmentNumber,
            startDate,
            endDate,
            startTime,
            endTime,
          },
        );
        emailAction = "generic";
        usedFallback = true;
      }
    } else if (courseType === "therapy") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          therapyType: course.name,
          sessionCount: enrollment.sessions || course.sessions || 1,
          enrollmentNumber: enrollment.enrollmentNumber,
        },
      );
      emailAction = "therapy_confirmation";
    } else if (courseType === "internship") {
      const internshipPlan =
        enrollment.internshipPlan ||
        extractInternshipPlanFromDuration(course.duration) ||
        "120";
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendInternshipEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate: calculateInternshipEndDate(startDate, internshipPlan),
          startTime,
          endTime,
          internshipPlan,
        },
      );
      emailAction = "internship_confirmation";
    } else if (courseType === "certificate" || courseType === "resume-studio") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCertificateEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction =
        courseType === "resume-studio"
          ? "resume_studio_confirmation"
          : "certificate_confirmation";
    } else if (courseType === "diploma") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendDiplomaEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "diploma_confirmation";
    } else if (courseType === "pre-recorded") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendPreRecordedEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
        },
      );
      emailAction = "pre_recorded_confirmation";
    } else if (courseType === "masterclass") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendMasterclassEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "masterclass_confirmation";
    } else if (courseType === "worksheet" && course.fileUrl) {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendWorksheetPurchaseConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          worksheets: [{ name: courseName, fileUrl: course.fileUrl }],
        },
      );
      emailAction = "worksheet_confirmation";
    } else {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "generic";
      usedFallback = courseType === "worksheet";
    }

    await ctx.db.patch(args.enrollmentId, {
      lastConfirmationSentAt: now,
    });

    const updatedEnrollment = await ctx.db.get(args.enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.resend_email",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      after: updatedEnrollment,
      metadata: {
        recipientEmail,
        courseType,
        emailAction,
        usedFallback,
        status: normalizeEnrollmentStatus(enrollment.status),
        lastConfirmationSentAt: now,
      },
    });

    return {
      enrollmentId: args.enrollmentId,
      recipientEmail,
      emailAction,
      usedFallback,
    };
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

    const existingActiveInTarget =
      (await ctx.db
        .query("enrollments")
        .withIndex("by_courseId_and_status", (q) =>
          q.eq("courseId", args.targetCourseId).eq("status", "active"),
        )
        .filter((q) => q.eq(q.field("userId"), sourceEnrollment.userId))
        .first()) ??
      (await ctx.db
        .query("enrollments")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.targetCourseId))
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), sourceEnrollment.userId),
            q.eq(q.field("status"), undefined),
          ),
        )
        .first());

    if (existingActiveInTarget) {
      throw new Error(
        `User is already actively enrolled in "${targetCourse.name}". Cannot transfer to the same course.`,
      );
    }

    const currentEnrolled = (targetCourse.enrolledUsers ?? []).length;
    const capacity = targetCourse.capacity ?? 0;
    if (
      capacity > 0 &&
      currentEnrolled >= capacity &&
      !(targetCourse.enrolledUsers ?? []).includes(sourceEnrollment.userId)
    ) {
      throw new Error(
        `Target course "${targetCourse.name}" is at full capacity (${currentEnrolled}/${capacity}).`,
      );
    }

    const now = Date.now();
    const transferredInternshipPlan =
      targetCourse.type === "internship"
        ? extractInternshipPlanFromDuration(targetCourse.duration) ||
          sourceEnrollment.internshipPlan ||
          undefined
        : undefined;

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

    const courseCode =
      targetCourse.code?.trim() ||
      targetCourse.name.slice(0, 8).toUpperCase().replace(/\s+/g, "") ||
      "COURSE";
    const courseStartDate =
      targetCourse.startDate ?? new Date().toISOString().split("T")[0];
    const enrollmentNumber =
      targetCourse.type === "therapy" ||
      targetCourse.type === "supervised" ||
      targetCourse.type === "worksheet"
        ? "N/A"
        : await generateUniqueEnrollmentNumber(
            ctx,
            courseCode,
            courseStartDate,
          );

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
      internshipPlan: transferredInternshipPlan,
      sessions: targetCourse.sessions,
      isBogoFree: sourceEnrollment.isBogoFree,
      bogoSourceCourseId: sourceEnrollment.bogoSourceCourseId,
      bogoOfferName: sourceEnrollment.bogoOfferName,
      listedPrice: sourceEnrollment.listedPrice ?? targetCourse.price,
      checkoutPrice: sourceEnrollment.checkoutPrice ?? targetCourse.price,
      amountPaid:
        sourceEnrollment.amountPaid ??
        sourceEnrollment.checkoutPrice ??
        undefined,
      redemptionDiscountAmount: sourceEnrollment.redemptionDiscountAmount,
      couponCode: sourceEnrollment.couponCode,
      mindPointsRedeemed: sourceEnrollment.mindPointsRedeemed,
      bundleCampaignId: sourceEnrollment.bundleCampaignId,
      bundleCampaignName: sourceEnrollment.bundleCampaignName,
      registrationSource: "admin_transfer",
      status: "active",
      statusReason: `Transfer from ${sourceEnrollment.courseName || String(sourceEnrollment.courseId)}`,
    });

    if (!(targetCourse.enrolledUsers ?? []).includes(sourceEnrollment.userId)) {
      await ctx.db.patch(args.targetCourseId, {
        enrolledUsers: [
          ...(targetCourse.enrolledUsers ?? []),
          sourceEnrollment.userId,
        ],
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
