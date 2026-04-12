import type { CourseLike } from "@mindpoint/backend";

function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function formatCourseDate(dateValue?: string): string | null {
  if (!hasText(dateValue)) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue!);
  if (!match) {
    return dateValue!;
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  if (Number.isNaN(date.getTime())) {
    return dateValue!;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCourseTime(timeValue?: string): string | null {
  if (!hasText(timeValue)) {
    return null;
  }

  const [hours, minutes] = timeValue!.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return timeValue!;
  }

  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes));
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

export function formatCourseTimeRange(
  startTime?: string,
  endTime?: string,
): string | null {
  const start = formatCourseTime(startTime);
  const end = formatCourseTime(endTime);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end;
}

export function formatCourseDays(daysOfWeek?: string[]): string | null {
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return null;
  }

  return daysOfWeek.join(", ");
}

export function shouldShowCourseTiming(
  course: Pick<CourseLike, "type">,
): boolean {
  return course.type !== "pre-recorded" && course.type !== "worksheet";
}

export function getCourseScheduleLines(
  course: Pick<
    CourseLike,
    "type" | "startDate" | "endDate" | "startTime" | "endTime" | "daysOfWeek"
  >,
): string[] {
  if (!shouldShowCourseTiming(course)) {
    return [];
  }

  const lines: string[] = [];
  const start = formatCourseDate(course.startDate);
  const end = formatCourseDate(course.endDate);
  const dateLine = start && end ? `${start} to ${end}` : start || end;
  const days = formatCourseDays(course.daysOfWeek);
  const timeRange = formatCourseTimeRange(course.startTime, course.endTime);

  if (dateLine) {
    lines.push(dateLine);
  }

  if (days && timeRange) {
    lines.push(`${days} • ${timeRange}`);
  } else if (days || timeRange) {
    lines.push(days || timeRange || "");
  }

  return lines.filter(Boolean);
}
