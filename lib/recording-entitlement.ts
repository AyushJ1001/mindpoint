/**
 * Lifetime recording access, as promised on the programme pages, the homepage
 * and the terms.
 *
 * Certificate courses and the Counselling Psychology internship enrolled on or
 * after 27 October 2026 keep their class recordings for as long as the platform
 * operates, with 90 days' notice and a download window if it ever closes.
 * Earlier enrolments keep the three-month access that applied when they joined;
 * pre-recorded introductions and workshops are unaffected.
 *
 * The rule is derived from the enrolment itself (course type plus creation
 * date), so it applies to every enrolment however it was created — checkout,
 * BOGO, guest email or an admin recovery — without a field that a new code path
 * might forget to set.
 */
export const LIFETIME_RECORDINGS_FROM = Date.UTC(2026, 9, 27);

const LIFETIME_RECORDING_TYPES = new Set(["certificate", "internship"]);

export function hasLifetimeRecordings(enrollment: {
  courseType?: string | null;
  _creationTime: number;
}): boolean {
  if (!enrollment.courseType) return false;
  if (!LIFETIME_RECORDING_TYPES.has(enrollment.courseType)) return false;
  return enrollment._creationTime >= LIFETIME_RECORDINGS_FROM;
}
