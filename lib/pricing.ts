/**
 * Owner-set standard fees, in rupees, as of 27 October 2026.
 *
 * These are the prices the public pages describe. The catalogue remains the
 * source of truth for what checkout actually charges; these constants only
 * back copy that has to name a fee (metadata, static cards, guides) and are
 * replaced by the catalogue price whenever a course row is available.
 */
export const JANUARY_CERTIFICATE_FEE = 4500;
export const COUNSELLING_INTERNSHIP_FEE = 2499;
export const INTRO_COURSE_FEE = 999;

/**
 * Public availability copy.
 *
 * Seat counts are never shown to visitors. A low-capacity warning appears only
 * when the batch is genuinely close to full: five seats or fewer, or under a
 * fifth of the cohort. Anything else reads as a plain registration invitation.
 */
export function availabilityLabel(remaining?: number, capacity?: number): string {
  if (typeof remaining !== "number" || !Number.isFinite(remaining)) {
    // No published batch: do not promise a place we cannot give.
    return "Live cohort, eight weeks";
  }
  if (remaining <= 0) {
    return "Registrations closed";
  }

  const threshold =
    typeof capacity === "number" && capacity > 0
      ? Math.max(5, Math.ceil(capacity * 0.2))
      : 5;

  return remaining <= threshold ? "Limited availability" : "Registrations open";
}
