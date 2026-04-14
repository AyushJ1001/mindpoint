import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type CourseBatchDoc = Doc<"courseBatches">;

export const publicCourseBatchValidator = v.object({
  _id: v.id("courseBatches"),
  _creationTime: v.number(),
  courseId: v.id("courses"),
  batchCode: v.string(),
  label: v.optional(v.string()),
  timezone: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  daysOfWeek: v.array(v.string()),
  enrollmentCutoffAt: v.optional(v.string()),
  capacity: v.number(),
  seatsFilled: v.number(),
  availableSeats: v.number(),
  waitlistEnabled: v.boolean(),
  lifecycleStatus: v.union(
    v.literal("draft"),
    v.literal("open"),
    v.literal("closed"),
    v.literal("cancelled"),
    v.literal("completed"),
  ),
  isPurchasable: v.boolean(),
  isDefault: v.optional(v.boolean()),
});

function normalizeDateToken(date: string | undefined): string {
  if (!date) {
    return "00000000";
  }

  const compact = date.replace(/-/g, "");
  return /^\d{8}$/.test(compact) ? compact : "00000000";
}

function buildDefaultBatchCode(course: Doc<"courses">): string {
  const dateToken = normalizeDateToken(course.startDate);
  return `${course.code}-${dateToken}-001`;
}

function toSortableTimestamp(value: string | undefined): number {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function compareLearnerBatchOrder(a: CourseBatchDoc, b: CourseBatchDoc): number {
  const lifecyclePriority = (status: CourseBatchDoc["lifecycleStatus"]) => {
    if (status === "open") return 0;
    if (status === "draft") return 1;
    if (status === "closed") return 2;
    if (status === "completed") return 3;
    return 4;
  };

  const lifecycleDelta =
    lifecyclePriority(a.lifecycleStatus) - lifecyclePriority(b.lifecycleStatus);
  if (lifecycleDelta !== 0) {
    return lifecycleDelta;
  }

  const startDelta =
    toSortableTimestamp(a.startDate) - toSortableTimestamp(b.startDate);
  if (startDelta !== 0) {
    return startDelta;
  }

  return a.batchCode.localeCompare(b.batchCode);
}

function mapToPublicBatch(batch: CourseBatchDoc) {
  const availableSeats = Math.max(0, batch.capacity - batch.seatsFilled);
  const cutoffTimestamp = batch.enrollmentCutoffAt
    ? new Date(batch.enrollmentCutoffAt).getTime()
    : null;
  const now = Date.now();
  const isBeforeCutoff =
    cutoffTimestamp === null || !Number.isFinite(cutoffTimestamp)
      ? true
      : now <= cutoffTimestamp;
  const isPurchasable =
    batch.lifecycleStatus === "open" && availableSeats > 0 && isBeforeCutoff;

  return {
    _id: batch._id,
    _creationTime: batch._creationTime,
    courseId: batch.courseId,
    batchCode: batch.batchCode,
    label: batch.label,
    timezone: batch.timezone,
    startDate: batch.startDate,
    endDate: batch.endDate,
    startTime: batch.startTime,
    endTime: batch.endTime,
    daysOfWeek: batch.daysOfWeek,
    enrollmentCutoffAt: batch.enrollmentCutoffAt,
    capacity: batch.capacity,
    seatsFilled: batch.seatsFilled,
    availableSeats,
    waitlistEnabled: batch.waitlistEnabled,
    lifecycleStatus: batch.lifecycleStatus,
    isPurchasable,
    isDefault: batch.isDefault,
  };
}

export const listPublicBatchesForCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  returns: v.array(publicCourseBatchValidator),
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();

    return batches.sort(compareLearnerBatchOrder).map(mapToPublicBatch);
  },
});

export const ensureDefaultBatchForCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  returns: v.id("courseBatches"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();
    if (existing) {
      return existing._id;
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    return await ctx.db.insert("courseBatches", {
      courseId: course._id as Id<"courses">,
      batchCode: buildDefaultBatchCode(course),
      label: "Default Batch",
      timezone: "Asia/Kolkata",
      startDate: course.startDate,
      endDate: course.endDate,
      startTime: course.startTime,
      endTime: course.endTime,
      daysOfWeek: course.daysOfWeek,
      enrollmentCutoffAt: undefined,
      capacity: course.capacity,
      seatsFilled: course.enrolledUsers.length,
      waitlistEnabled: false,
      lifecycleStatus: "open",
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
