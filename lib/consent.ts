/**
 * Analytics consent, stored in the browser only.
 *
 * The essential site works without this. Google Analytics and Microsoft Clarity
 * load only after a visitor grants consent, so no analytics cookie is written
 * before they choose. Meta Pixel stays off unless it is explicitly enabled.
 */

export const ANALYTICS_CONSENT_KEY = "tmp.analytics-consent";
export const ANALYTICS_CONSENT_EVENT = "tmp:analytics-consent";

export type ConsentDecision = "granted" | "denied";

export function readAnalyticsConsent(): ConsentDecision | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeAnalyticsConsent(decision: ConsentDecision) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, decision);
  } catch {
    // Storage can be blocked; the choice still applies to this page view.
  }
  window.dispatchEvent(
    new CustomEvent<ConsentDecision>(ANALYTICS_CONSENT_EVENT, {
      detail: decision,
    }),
  );
}
