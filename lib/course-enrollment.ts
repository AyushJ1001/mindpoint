import type { CourseLike } from "@/lib/backend";

export function getEnrolledCount(course: CourseLike): number {
  if ("enrolledCount" in course) {
    return course.enrolledCount;
  }

  return course.enrolledUsers.length;
}
