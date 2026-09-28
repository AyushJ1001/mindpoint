// Fire a conversion/engagement event at whichever free trackers are loaded.
// Safe to call anywhere in client code; each call is a no-op when its provider
// is not configured.

type EventParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break a user action.
  }

  try {
    window.fbq?.("trackCustom", name, params);
  } catch {
    // no-op
  }

  try {
    window.clarity?.("event", name);
  } catch {
    // no-op
  }
}

/** The few events worth reporting on, so names stay consistent site-wide. */
export const ANALYTICS_EVENTS = {
  waitlistJoined: "waitlist_joined",
  leadCaptured: "lead_captured",
  previewPlayed: "preview_played",
  checkoutStarted: "checkout_started",
  purchaseSubmitted: "purchase_submitted",
  referralLinkCopied: "referral_link_copied",
} as const;
