/**
 * Student LMS grouping.
 *
 * Grandfathering is the default: nothing an enrolled student currently has is
 * ever hidden by these rules. The date cutoffs decide which section a course
 * appears in — "current" versus "previous" — not whether access exists.
 *
 * A missing start date is never treated as "old" or "new"; it stays with the
 * previous-learning group so the student keeps it, and is flagged for an admin
 * to backfill rather than guessed at.
 */

export const COURSE_CUTOFF = "2027-01-01";
export const EVENT_CUTOFF = "2026-11-01";

const EVENT_TYPES = new Set(["masterclass", "worksheet"]);

export type VisibilityEnrollment = {
  startDate?: string | null;
  courseType?: string | null;
  status?: string | null;
};

export type AccessSection = "current" | "previous";

/**
 * Which section an enrollment belongs to.
 *
 * `missingDate` is surfaced so the dashboard can note it and an admin can fix
 * the record; it does not affect access.
 */
export function classifyEnrollment(enrollment: VisibilityEnrollment): {
  section: AccessSection;
  missingDate: boolean;
} {
  const start = enrollment.startDate?.trim();
  if (!start) {
    return { section: "previous", missingDate: true };
  }

  const cutoff = EVENT_TYPES.has(enrollment.courseType ?? "")
    ? EVENT_CUTOFF
    : COURSE_CUTOFF;

  // String comparison is safe here: both sides are ISO calendar dates.
  return { section: start >= cutoff ? "current" : "previous", missingDate: false };
}

/** Cancelled enrollments stay visible in history but grant no material access. */
export function enrollmentGrantsAccess(enrollment: VisibilityEnrollment): boolean {
  return (enrollment.status ?? "active") !== "cancelled";
}

export function groupEnrollments<T extends VisibilityEnrollment>(
  enrollments: T[],
): {
  current: T[];
  previous: T[];
  missingDates: T[];
} {
  const current: T[] = [];
  const previous: T[] = [];
  const missingDates: T[] = [];

  for (const enrollment of enrollments) {
    const { section, missingDate } = classifyEnrollment(enrollment);
    if (section === "current") current.push(enrollment);
    else previous.push(enrollment);
    if (missingDate) missingDates.push(enrollment);
  }

  return { current, previous, missingDates };
}
