import type { Doc } from "./_generated/dataModel";

export function pickPublicCourse(course: Doc<"courses">) {
  const {
    enrolledUsers,
    lifecycleStatus: _lifecycleStatus,
    createdByAdminId: _createdByAdminId,
    updatedByAdminId: _updatedByAdminId,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    archivedAt: _archivedAt,
    ...publicFields
  } = course;

  return {
    ...publicFields,
    enrolledCount: enrolledUsers.length,
  };
}

export function pickCompatiblePublicCourse(course: Doc<"courses">) {
  return {
    ...pickPublicCourse(course),
    // Keep seat-count callers working while avoiding exposure of raw Clerk IDs.
    enrolledUsers: course.enrolledUsers.map(() => ""),
  };
}
