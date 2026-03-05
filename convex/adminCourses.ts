import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CourseLifecycleStatus, CourseType } from "./schema";
import { requireAdmin, normalizeCourseLifecycleStatus } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

const coursePatchValidator = {
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  type: v.optional(CourseType),
  code: v.optional(v.string()),
  price: v.optional(v.number()),
  offer: v.optional(
    v.union(
      v.null(),
      v.object({
        name: v.string(),
        discount: v.optional(v.number()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
      }),
    ),
  ),
  bogo: v.optional(
    v.union(
      v.null(),
      v.object({
        enabled: v.boolean(),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        label: v.optional(v.string()),
      }),
    ),
  ),
  sessions: v.optional(v.number()),
  capacity: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  daysOfWeek: v.optional(v.array(v.string())),
  content: v.optional(v.string()),
  duration: v.optional(v.string()),
  prerequisites: v.optional(v.string()),
  imageUrls: v.optional(v.array(v.string())),
  modules: v.optional(
    v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      }),
    ),
  ),
  learningOutcomes: v.optional(
    v.array(
      v.object({
        icon: v.string(),
        title: v.string(),
      }),
    ),
  ),
  allocation: v.optional(
    v.array(
      v.object({
        topic: v.string(),
        hours: v.number(),
      }),
    ),
  ),
  fileUrl: v.optional(v.string()),
  worksheetDescription: v.optional(v.string()),
  targetAudience: v.optional(v.array(v.string())),
  lifecycleStatus: v.optional(CourseLifecycleStatus),
};

function hasText(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function toSortableTimestamp(value?: string): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function hasRequiredSchedule(course: {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
}) {
  return (
    hasText(course.startDate) &&
    hasText(course.endDate) &&
    hasText(course.startTime) &&
    hasText(course.endTime) &&
    Array.isArray(course.daysOfWeek) &&
    course.daysOfWeek.length > 0
  );
}

function validatePublishableCourse(course: {
  name?: string;
  code?: string;
  type?:
    | "certificate"
    | "internship"
    | "diploma"
    | "pre-recorded"
    | "masterclass"
    | "therapy"
    | "supervised"
    | "resume-studio"
    | "worksheet";
  content?: string;
  description?: string;
  learningOutcomes?: Array<{ icon: string; title: string }>;
  allocation?: Array<{ topic: string; hours: number }>;
  duration?: string;
  sessions?: number;
  fileUrl?: string;
  worksheetDescription?: string;
  targetAudience?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
}) {
  if (!hasText(course.name)) {
    throw new Error("Course name is required before publishing");
  }
  if (!hasText(course.code)) {
    throw new Error("Course code is required before publishing");
  }
  if (!course.type) {
    throw new Error("Course type is required before publishing");
  }
  if (!hasText(course.description)) {
    throw new Error("Course description is required before publishing");
  }
  if (!hasText(course.content)) {
    throw new Error("Course content is required before publishing");
  }

  switch (course.type) {
    case "certificate":
    case "diploma":
    case "masterclass":
    case "resume-studio": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        throw new Error("Learning outcomes are required before publishing");
      }
      if (!hasRequiredSchedule(course)) {
        throw new Error(
          "Start/end date, time, and days of week are required before publishing",
        );
      }
      break;
    }

    case "internship": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        throw new Error("Learning outcomes are required before publishing");
      }
      if (!Array.isArray(course.allocation) || course.allocation.length === 0) {
        throw new Error("Internship allocation is required before publishing");
      }
      if (!hasText(course.duration)) {
        throw new Error("Internship duration is required before publishing");
      }
      if (!hasRequiredSchedule(course)) {
        throw new Error(
          "Start/end date, time, and days of week are required before publishing",
        );
      }
      break;
    }

    case "pre-recorded": {
      if (
        !Array.isArray(course.learningOutcomes) ||
        course.learningOutcomes.length === 0
      ) {
        throw new Error("Learning outcomes are required before publishing");
      }
      break;
    }

    case "therapy":
    case "supervised": {
      if (typeof course.sessions !== "number" || course.sessions <= 0) {
        throw new Error("Sessions are required before publishing");
      }
      break;
    }

    case "worksheet": {
      if (!hasText(course.fileUrl)) {
        throw new Error("Worksheet file URL is required before publishing");
      }
      if (!hasText(course.worksheetDescription)) {
        throw new Error("Worksheet description is required before publishing");
      }
      if (
        !Array.isArray(course.targetAudience) ||
        course.targetAudience.length === 0
      ) {
        throw new Error(
          "Worksheet target audience is required before publishing",
        );
      }
      break;
    }

    default:
      break;
  }
}

export const listCourses = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(CourseType),
    lifecycleStatus: v.optional(CourseLifecycleStatus),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("name"),
        v.literal("price"),
        v.literal("startDate"),
        v.literal("updatedAt"),
        v.literal("createdAt"),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);
    const scanLimit = Math.min(Math.max(limit * 5, 500), 2000);
    const useLifecycleIndexes =
      !!args.lifecycleStatus && args.lifecycleStatus !== "published";

    let courses: any[];

    if (args.lifecycleStatus === "published") {
      const publishedIndexQuery = args.type
        ? ctx.db
            .query("courses")
            .withIndex("by_type_and_lifecycleStatus", (q) =>
              q.eq("type", args.type!).eq("lifecycleStatus", "published"),
            )
        : ctx.db
            .query("courses")
            .withIndex("by_lifecycleStatus", (q) =>
              q.eq("lifecycleStatus", "published"),
            );

      const [publishedViaIndex, publishedLegacy] = await Promise.all([
        publishedIndexQuery.order("desc").take(scanLimit),
        ctx.db
          .query("courses")
          .filter((q) => q.eq(q.field("lifecycleStatus"), undefined))
          .order("desc")
          .take(scanLimit),
      ]);
      const mergedMap = new Map<string, any>();
      for (const c of publishedViaIndex) {
        mergedMap.set(String(c._id), c);
      }
      for (const c of publishedLegacy) {
        if (!mergedMap.has(String(c._id))) {
          mergedMap.set(String(c._id), c);
        }
      }
      courses = Array.from(mergedMap.values());
    } else {
      const baseQuery =
        args.type && useLifecycleIndexes
          ? ctx.db
              .query("courses")
              .withIndex("by_type_and_lifecycleStatus", (q) =>
                q
                  .eq("type", args.type!)
                  .eq("lifecycleStatus", args.lifecycleStatus!),
              )
          : useLifecycleIndexes
            ? ctx.db
                .query("courses")
                .withIndex("by_lifecycleStatus", (q) =>
                  q.eq("lifecycleStatus", args.lifecycleStatus!),
                )
            : args.type
              ? ctx.db
                  .query("courses")
                  .withIndex("by_type", (q) => q.eq("type", args.type!))
              : ctx.db.query("courses");

      courses = await baseQuery.order("desc").take(scanLimit);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      courses = courses.filter((course) => {
        const fields = [
          course.name,
          course.code,
          course.description ?? "",
          course.type ?? "",
        ];
        return fields.some((field) => field.toLowerCase().includes(search));
      });
    }

    if (args.type && !useLifecycleIndexes) {
      courses = courses.filter((course) => course.type === args.type);
    }

    if (args.lifecycleStatus && !useLifecycleIndexes) {
      courses = courses.filter(
        (course) =>
          normalizeCourseLifecycleStatus(course.lifecycleStatus) ===
          args.lifecycleStatus,
      );
    }

    const sortOrder = args.sortOrder ?? "desc";
    const multiplier = sortOrder === "asc" ? 1 : -1;

    courses.sort((a, b) => {
      const sortBy = args.sortBy ?? "createdAt";

      if (sortBy === "name") {
        return a.name.localeCompare(b.name) * multiplier;
      }
      if (sortBy === "price") {
        return ((a.price ?? 0) - (b.price ?? 0)) * multiplier;
      }
      if (sortBy === "startDate") {
        const aTime = toSortableTimestamp(a.startDate);
        const bTime = toSortableTimestamp(b.startDate);
        return (aTime - bTime) * multiplier;
      }
      if (sortBy === "updatedAt") {
        return (
          ((a.updatedAt ?? a._creationTime) -
            (b.updatedAt ?? b._creationTime)) *
          multiplier
        );
      }

      return (a._creationTime - b._creationTime) * multiplier;
    });

    return courses.slice(0, limit);
  },
});

export const getCourseById = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.courseId);
  },
});

export const createCourse = mutation({
  args: {
    name: v.string(),
    type: v.optional(CourseType),
    lifecycleStatus: v.optional(CourseLifecycleStatus),
    data: v.optional(v.object(coursePatchValidator)),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];

    const lifecycleStatus = args.lifecycleStatus ?? "draft";

    const payload = {
      ...args.data,
      name: args.name,
      type: args.type ?? args.data?.type ?? "certificate",
      code: args.data?.code || `TMP-${now}`,
      price: args.data?.price ?? 0,
      capacity: args.data?.capacity ?? 1,
      enrolledUsers: [],
      startDate: args.data?.startDate ?? today,
      endDate: args.data?.endDate ?? today,
      startTime: args.data?.startTime ?? "00:00",
      endTime: args.data?.endTime ?? "23:59",
      daysOfWeek: args.data?.daysOfWeek ?? [],
      content: args.data?.content ?? "",
      reviews: [],
      offer: args.data?.offer ?? undefined,
      bogo: args.data?.bogo ?? undefined,
      lifecycleStatus,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
      updatedAt: now,
      publishedAt: lifecycleStatus === "published" ? now : undefined,
      archivedAt: lifecycleStatus === "archived" ? now : undefined,
    };

    if (lifecycleStatus === "published") {
      validatePublishableCourse(payload);
    }

    const courseId = await ctx.db.insert("courses", payload);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.create",
      entityType: "course",
      entityId: String(courseId),
      after: payload,
    });

    return courseId;
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    patch: v.object(coursePatchValidator),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);
    if (!existing) {
      throw new Error("Course not found");
    }

    const nextLifecycle = args.patch.lifecycleStatus
      ? args.patch.lifecycleStatus
      : normalizeCourseLifecycleStatus(existing.lifecycleStatus);

    const patch = {
      ...args.patch,
      offer: args.patch.offer === null ? undefined : args.patch.offer,
      bogo: args.patch.bogo === null ? undefined : args.patch.bogo,
      updatedByAdminId: admin.userId,
      updatedAt: Date.now(),
      publishedAt:
        nextLifecycle === "published" &&
        normalizeCourseLifecycleStatus(existing.lifecycleStatus) !== "published"
          ? Date.now()
          : existing.publishedAt,
      archivedAt:
        nextLifecycle === "archived" &&
        normalizeCourseLifecycleStatus(existing.lifecycleStatus) !== "archived"
          ? Date.now()
          : nextLifecycle !== "archived"
            ? undefined
            : existing.archivedAt,
    };

    const preview = {
      ...existing,
      ...patch,
      lifecycleStatus: nextLifecycle,
    };

    if (nextLifecycle === "published") {
      validatePublishableCourse(preview);
    }

    await ctx.db.patch(args.courseId, patch);

    const updated = await ctx.db.get(args.courseId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.update",
      entityType: "course",
      entityId: String(args.courseId),
      before: existing,
      after: updated,
    });

    return updated;
  },
});

export const deleteCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);

    if (!existing) {
      throw new Error("Course not found");
    }

    const linkedEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    if (linkedEnrollment) {
      throw new Error("Cannot delete a course with enrollments");
    }

    if ((existing.reviews ?? []).length > 0) {
      throw new Error("Cannot delete a course with reviews");
    }

    await ctx.db.delete(args.courseId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.delete",
      entityType: "course",
      entityId: String(args.courseId),
      before: existing,
    });

    return { success: true };
  },
});

export const transitionCourseLifecycle = mutation({
  args: {
    courseId: v.id("courses"),
    lifecycleStatus: CourseLifecycleStatus,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.courseId);

    if (!existing) {
      throw new Error("Course not found");
    }

    const currentStatus = normalizeCourseLifecycleStatus(
      existing.lifecycleStatus,
    );
    if (currentStatus === args.lifecycleStatus) {
      return existing;
    }

    const now = Date.now();

    if (args.lifecycleStatus === "published") {
      validatePublishableCourse(existing);
    }

    await ctx.db.patch(args.courseId, {
      lifecycleStatus: args.lifecycleStatus,
      updatedByAdminId: admin.userId,
      updatedAt: now,
      publishedAt:
        args.lifecycleStatus === "published" ? now : existing.publishedAt,
      archivedAt: args.lifecycleStatus === "archived" ? now : undefined,
    });

    const updated = await ctx.db.get(args.courseId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "course.transition",
      entityType: "course",
      entityId: String(args.courseId),
      before: { lifecycleStatus: currentStatus },
      after: { lifecycleStatus: args.lifecycleStatus },
    });

    return updated;
  },
});
