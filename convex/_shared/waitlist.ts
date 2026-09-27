// Early-bird pre-registration. A visitor joins the waitlist for one Course, one
// Cohort (batch, optional) and one Delivery (live or self-paced) while
// registration is paused, so the owner can contact them when it opens.
//
// Scope is deliberately narrow: only the four Course types below carry a
// waitlist. Everything else keeps its normal behaviour.

export const WAITLIST_COURSE_TYPES = [
  "certificate",
  "internship",
  "pre-recorded",
  "therapy",
] as const;

export type WaitlistCourseType = (typeof WAITLIST_COURSE_TYPES)[number];

export function isWaitlistCourseType(
  value?: string | null,
): value is WaitlistCourseType {
  return (
    !!value && (WAITLIST_COURSE_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Types whose registration is currently held behind the early-bird waitlist.
 * Self-paced intro courses (`pre-recorded`) are excluded: they deliver
 * automatically, so they stay on sale while the others are paused.
 */
export const WAITLIST_HELD_TYPES = [
  "certificate",
  "internship",
  "therapy",
] as const;

export type WaitlistHeldType = (typeof WAITLIST_HELD_TYPES)[number];

export function isWaitlistHeldType(
  value?: string | null,
): value is WaitlistHeldType {
  return !!value && (WAITLIST_HELD_TYPES as readonly string[]).includes(value);
}

export const WAITLIST_DELIVERIES = ["live", "self_paced"] as const;

export type WaitlistDelivery = (typeof WAITLIST_DELIVERIES)[number];

export function isWaitlistDelivery(
  value?: string | null,
): value is WaitlistDelivery {
  return !!value && (WAITLIST_DELIVERIES as readonly string[]).includes(value);
}

export function waitlistDeliveryLabel(delivery: WaitlistDelivery): string {
  return delivery === "live" ? "Live cohort" : "Self-paced";
}

/** The delivery options a Course type offers out of the box. */
export function waitlistDeliveriesForType(
  type: WaitlistCourseType,
): WaitlistDelivery[] {
  if (type === "pre-recorded") return ["self_paced"];
  if (type === "certificate") return ["live", "self_paced"];
  if (type === "internship") return ["live"];
  return ["live"];
}

export const WAITLIST_CONSENT_PURPOSE = "early-bird-waitlist";
export const WAITLIST_CONSENT_TEXT_VERSION = "2026-09";

// The transactional promise made by joining: we email when registration opens.
export const WAITLIST_CONSENT_TEXT =
  "Email or WhatsApp me when registration opens and the early-bird discount is shared.";

/**
 * Indian WhatsApp numbers: 10 digits, optionally prefixed with a country code
 * (+91 or 91). We keep the original text but reject anything that cannot be a
 * reachable number.
 */
export function normalizeWhatsapp(value: string): string | null {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return trimmed;
}
