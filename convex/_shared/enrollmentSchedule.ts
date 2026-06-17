import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { convexFailure, type ConvexFailure } from "./result";

export type CourseDoc = Doc<"courses">;
export type CourseBatchDoc = Doc<"courseBatches">;

export type EnrollmentScheduleSnapshot = {
  batchId?: Id<"courseBatches">;
  batchLabel?: string;
  batchStartDate?: string;
  batchEndDate?: string;
  batchStartTime?: string;
  batchEndTime?: string;
  batchDaysOfWeek?: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
};

export type EnrollmentBatchResolution = EnrollmentScheduleSnapshot & {
  batch: CourseBatchDoc | null;
};

export type EnrollmentScheduleFailure = ConvexFailure<
  "CONFLICT" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

function enrollmentScheduleFailure(
  code: EnrollmentScheduleFailure["error"]["code"],
  message: string,
  details?: EnrollmentScheduleFailure["error"]["details"],
): EnrollmentScheduleFailure {
  return convexFailure({
    code,
    ...(details !== undefined ? { details } : {}),
    message,
  });
}

export function isEnrollmentScheduleFailure(
  result: EnrollmentBatchResolution | EnrollmentScheduleFailure,
): result is EnrollmentScheduleFailure {
  return "_tag" in result && result._tag === "Failure";
}

export function isEnrollmentCapacityFailure(
  result: CourseBatchDoc | EnrollmentScheduleFailure | null,
): result is EnrollmentScheduleFailure {
  return !!result && "_tag" in result && result._tag === "Failure";
}

export function isCourseBatchBacked(course: CourseDoc): boolean {
  return !!course.usesBatches;
}

export function sortCourseBatches(
  batches: readonly CourseBatchDoc[],
): CourseBatchDoc[] {
  return [...batches].sort((left, right) => {
    const sortDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    const leftStart = Date.parse(left.startDate ?? "");
    const rightStart = Date.parse(right.startDate ?? "");
    const normalizedLeft = Number.isNaN(leftStart)
      ? Number.POSITIVE_INFINITY
      : leftStart;
    const normalizedRight = Number.isNaN(rightStart)
      ? Number.POSITIVE_INFINITY
      : rightStart;
    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return left._creationTime - right._creationTime;
  });
}

export async function listPublishedCourseBatches(
  ctx: MutationCtx,
  courseId: Id<"courses">,
): Promise<CourseBatchDoc[]> {
  const rows = await ctx.db
    .query("courseBatches")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .collect();

  return sortCourseBatches(
    rows.filter((row) => (row.lifecycleStatus ?? "published") === "published"),
  );
}

export function pickDefaultBatch(
  batches: readonly CourseBatchDoc[],
): CourseBatchDoc | null {
  const openBatch =
    batches.find((batch) => {
      const capacity = batch.capacity ?? 0;
      const enrolled = (batch.enrolledUsers ?? []).length;
      return capacity <= 0 || enrolled < capacity;
    }) ?? null;

  return openBatch ?? batches[0] ?? null;
}

export function buildScheduleSnapshot(
  course: CourseDoc,
  batch?: CourseBatchDoc | null,
): EnrollmentScheduleSnapshot {
  if (batch) {
    return {
      batchId: batch._id,
      batchLabel: batch.label,
      batchStartDate: batch.startDate,
      batchEndDate: batch.endDate,
      batchStartTime: batch.startTime,
      batchEndTime: batch.endTime,
      batchDaysOfWeek: batch.daysOfWeek,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      daysOfWeek: batch.daysOfWeek,
    };
  }

  const today = new Date().toISOString().split("T")[0];

  return {
    batchId: undefined,
    batchLabel: undefined,
    batchStartDate: undefined,
    batchEndDate: undefined,
    batchStartTime: undefined,
    batchEndTime: undefined,
    batchDaysOfWeek: undefined,
    startDate: course.startDate ?? today,
    endDate: course.endDate ?? course.startDate ?? today,
    startTime: course.startTime ?? "00:00",
    endTime: course.endTime ?? "23:59",
    daysOfWeek: course.daysOfWeek ?? [],
  };
}

export async function resolveEnrollmentBatchResult(
  ctx: MutationCtx,
  course: CourseDoc,
  requestedBatchId?: Id<"courseBatches">,
  options: { allowDefaultBatch?: boolean } = {},
): Promise<EnrollmentBatchResolution | EnrollmentScheduleFailure> {
  if (!isCourseBatchBacked(course)) {
    return {
      batch: null,
      ...buildScheduleSnapshot(course, null),
    };
  }

  const batches = await listPublishedCourseBatches(ctx, course._id);
  if (batches.length === 0) {
    return enrollmentScheduleFailure(
      "NOT_FOUND",
      `Course "${course.name}" has no published batches.`,
      {
        courseId: course._id,
      },
    );
  }

  if (!requestedBatchId && !options.allowDefaultBatch) {
    return enrollmentScheduleFailure(
      "VALIDATION_ERROR",
      `Select a batch for "${course.name}" before checkout.`,
      {
        courseId: course._id,
      },
    );
  }

  const batch = requestedBatchId
    ? batches.find((row) => String(row._id) === String(requestedBatchId))
    : pickDefaultBatch(batches);

  if (!batch) {
    return enrollmentScheduleFailure(
      "NOT_FOUND",
      `Selected batch for "${course.name}" is no longer available.`,
      {
        courseId: course._id,
        requestedBatchId,
      },
    );
  }

  return {
    batch,
    ...buildScheduleSnapshot(course, batch),
  };
}

export async function resolveEnrollmentBatch(
  ctx: MutationCtx,
  course: CourseDoc,
  requestedBatchId?: Id<"courseBatches">,
  options: { allowDefaultBatch?: boolean } = {},
): Promise<EnrollmentBatchResolution> {
  const result = await resolveEnrollmentBatchResult(
    ctx,
    course,
    requestedBatchId,
    options,
  );
  if (isEnrollmentScheduleFailure(result)) {
    throw new Error(result.error.message);
  }
  return result;
}

export async function ensureEnrollmentCapacityResult(
  ctx: MutationCtx,
  course: CourseDoc,
  userId: string,
  batch?: CourseBatchDoc | null,
): Promise<CourseBatchDoc | EnrollmentScheduleFailure | null> {
  if (batch) {
    const latestBatch = await ctx.db.get(batch._id);
    if (!latestBatch) {
      return enrollmentScheduleFailure(
        "NOT_FOUND",
        "Selected batch no longer exists.",
        {
          batchId: batch._id,
          courseId: course._id,
        },
      );
    }
    const enrolledUsers = latestBatch.enrolledUsers ?? [];
    const capacity = latestBatch.capacity ?? 0;
    if (
      capacity > 0 &&
      enrolledUsers.length >= capacity &&
      !enrolledUsers.includes(userId)
    ) {
      return enrollmentScheduleFailure(
        "CONFLICT",
        `Batch "${latestBatch.label}" is full.`,
        {
          batchId: latestBatch._id,
          capacity,
          courseId: course._id,
          enrolledCount: enrolledUsers.length,
        },
      );
    }
    return latestBatch;
  }

  const latestCourse = await ctx.db.get(course._id);
  if (!latestCourse) {
    return enrollmentScheduleFailure("NOT_FOUND", "Course no longer exists.", {
      courseId: course._id,
    });
  }
  const enrolledUsers = latestCourse.enrolledUsers ?? [];
  const capacity = latestCourse.capacity ?? 0;
  if (
    capacity > 0 &&
    enrolledUsers.length >= capacity &&
    !enrolledUsers.includes(userId)
  ) {
    return enrollmentScheduleFailure(
      "CONFLICT",
      `Course "${latestCourse.name}" is full.`,
      {
        capacity,
        courseId: latestCourse._id,
        enrolledCount: enrolledUsers.length,
      },
    );
  }
  return null;
}

export async function ensureEnrollmentCapacity(
  ctx: MutationCtx,
  course: CourseDoc,
  userId: string,
  batch?: CourseBatchDoc | null,
): Promise<CourseBatchDoc | null> {
  const result = await ensureEnrollmentCapacityResult(
    ctx,
    course,
    userId,
    batch,
  );
  if (isEnrollmentCapacityFailure(result)) {
    throw new Error(result.error.message);
  }
  return result;
}

export async function addUserToEnrollmentTarget(
  ctx: MutationCtx,
  course: CourseDoc,
  userId: string,
  batch?: CourseBatchDoc | null,
): Promise<void> {
  if (batch) {
    const latestBatch = await ctx.db.get(batch._id);
    if (!latestBatch) {
      throw new Error("Selected batch no longer exists.");
    }
    const enrolledUsers = latestBatch.enrolledUsers ?? [];
    if (!enrolledUsers.includes(userId)) {
      await ctx.db.patch(latestBatch._id, {
        enrolledUsers: [...enrolledUsers, userId],
      });
    }
    return;
  }

  const latestCourse = await ctx.db.get(course._id);
  if (!latestCourse) {
    throw new Error("Course no longer exists.");
  }
  const enrolledUsers = latestCourse.enrolledUsers ?? [];
  if (!enrolledUsers.includes(userId)) {
    await ctx.db.patch(latestCourse._id, {
      enrolledUsers: [...enrolledUsers, userId],
    });
  }
}
