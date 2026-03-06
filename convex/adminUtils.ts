export function normalizeCourseLifecycleStatus(
  status?: string,
): "draft" | "published" | "archived" {
  if (status === "draft" || status === "archived") {
    return status;
  }
  return "published";
}

export function normalizeEnrollmentStatus(
  status?: string,
): "active" | "cancelled" | "transferred" {
  if (status === "cancelled" || status === "transferred") {
    return status;
  }
  return "active";
}
