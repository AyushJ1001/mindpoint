import { normalizeCourseLifecycleStatus } from "./adminUtils";
import type { Doc, Id } from "./_generated/dataModel";

export const BATCH_SUPPORTED_COURSE_TYPES = new Set<
  NonNullable<Doc<"courses">["type"]>
>(["certificate", "diploma", "masterclass", "resume-studio"]);

export type PublicCourseBatch = {
  _id: Id<"courseBatches">;
  _creationTime: number;
  courseId: Id<"courses">;
  label: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  capacity: number;
  enrolledCount: number;
  lifecycleStatus: "draft" | "published" | "archived";
  availabilityStatus: "upcoming_open" | "upcoming_full" | "past" | "archived";
  sortOrder: number;
};

function toTimestamp(value?: string) {
  if (!value) {
    return Number.NaN;
  }
  return new Date(value).getTime();
}

export function isBatchSupportedCourseType(type?: Doc<"courses">["type"]) {
  return !!type && BATCH_SUPPORTED_COURSE_TYPES.has(type);
}

export function isMergedCourse(course: Pick<Doc<"courses">, "mergedIntoCourseId">) {
  return !!course.mergedIntoCourseId;
}

export function isPublishedCourse(course: {
  lifecycleStatus?: "draft" | "published" | "archived";
  mergedIntoCourseId?: Id<"courses">;
}) {
  return !isMergedCourse(course) && normalizeCourseLifecycleStatus(course.lifecycleStatus) === "published";
}

export function getBatchLabel(batch: Pick<Doc<"courseBatches">, "label" | "startDate" | "endDate">) {
  if (batch.label.trim()) {
    return batch.label.trim();
  }

  if (batch.startDate && batch.endDate && batch.startDate !== batch.endDate) {
    return `${batch.startDate} to ${batch.endDate}`;
  }

  if (batch.startDate) {
    return batch.startDate;
  }

  return "Upcoming batch";
}

export function getPublicCourseBatch(
  batch: Doc<"courseBatches">,
  now = Date.now(),
): PublicCourseBatch {
  const lifecycleStatus = normalizeCourseLifecycleStatus(batch.lifecycleStatus);
  const enrolledCount = (batch.enrolledUsers ?? []).length;
  const capacity = batch.capacity ?? 0;
  const startTimestamp = toTimestamp(batch.startDate);
  const endTimestamp = toTimestamp(batch.endDate);

  let availabilityStatus: PublicCourseBatch["availabilityStatus"];
  if (lifecycleStatus === "archived") {
    availabilityStatus = "archived";
  } else if (Number.isFinite(endTimestamp) && endTimestamp < now) {
    availabilityStatus = "past";
  } else if (capacity > 0 && enrolledCount >= capacity) {
    availabilityStatus = "upcoming_full";
  } else {
    availabilityStatus = "upcoming_open";
  }

  return {
    _id: batch._id,
    _creationTime: batch._creationTime,
    courseId: batch.courseId,
    label: getBatchLabel(batch),
    startDate: batch.startDate,
    endDate: batch.endDate,
    startTime: batch.startTime,
    endTime: batch.endTime,
    daysOfWeek: batch.daysOfWeek ?? [],
    capacity,
    enrolledCount,
    lifecycleStatus,
    availabilityStatus,
    sortOrder: batch.sortOrder ?? 0,
  };
}

export function sortPublicCourseBatches(batches: PublicCourseBatch[]) {
  return [...batches].sort((left, right) => {
    const lifecycleOrder = (status: PublicCourseBatch["lifecycleStatus"]) => {
      if (status === "published") return 0;
      if (status === "draft") return 1;
      return 2;
    };
    const lifecycleDelta =
      lifecycleOrder(left.lifecycleStatus) - lifecycleOrder(right.lifecycleStatus);
    if (lifecycleDelta !== 0) {
      return lifecycleDelta;
    }

    const sortDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortDelta !== 0) {
      return sortDelta;
    }

    const startDelta = (toTimestamp(left.startDate) || 0) - (toTimestamp(right.startDate) || 0);
    if (startDelta !== 0) {
      return startDelta;
    }

    return left._creationTime - right._creationTime;
  });
}

export function getDefaultPublicCourseBatch(batches: PublicCourseBatch[]) {
  const sorted = sortPublicCourseBatches(batches);
  return (
    sorted.find(
      (batch) =>
        batch.lifecycleStatus === "published" &&
        batch.availabilityStatus === "upcoming_open",
    ) ??
    sorted.find((batch) => batch.lifecycleStatus === "published") ??
    sorted[0] ??
    null
  );
}

