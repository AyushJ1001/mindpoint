// Conversion events for GA4 (gtag), the Meta Pixel (fbq) and Microsoft
// Clarity. Each tool is loaded by components/AnalyticsScripts.tsx only when its
// id is configured; `track` forwards to whichever ones are on the page and is
// a silent no-op otherwise (including during server rendering).
//
// Privacy: every payload goes through `sanitizeAnalyticsEvent`, which keeps
// only allowlisted keys, accepts catalogue-style course codes, finite
// non-negative amounts and fixed enum values, and drops everything else. Names,
// emails, phone numbers, free text and therapy details can never reach a
// vendor because no parameter accepts them.
//
// `trackEvent` below is the older untyped helper for engagement events
// (waitlist, leads, referrals); new conversion events use `track`.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export type CardSource =
  | "home"
  | "catalogue"
  | "course_type"
  | "january_2027"
  | "other";

export type PaymentFailureReason =
  | "order_failed"
  | "enrollment_failed"
  | "dismissed"
  | "other";

export type ContactChannel = "whatsapp" | "email" | "phone";

export type AnalyticsEventParams = {
  course_card_click: { course_code: string; source: CardSource };
  programme_view: { course_code: string };
  enroll_click: { course_code: string; price?: number };
  checkout_start: { value: number; currency: "INR"; item_codes: string[] };
  purchase: { value: number; currency: "INR"; item_codes: string[] };
  payment_failed: { reason: PaymentFailureReason };
  contact_click: { channel: ContactChannel };
};

export type AnalyticsEventName = keyof AnalyticsEventParams;

export type SanitizedAnalyticsEvent = {
  [E in AnalyticsEventName]: { name: E; params: AnalyticsEventParams[E] };
}[AnalyticsEventName];

const CARD_SOURCES: readonly CardSource[] = [
  "home",
  "catalogue",
  "course_type",
  "january_2027",
  "other",
];
const FAILURE_REASONS: readonly PaymentFailureReason[] = [
  "order_failed",
  "enrollment_failed",
  "dismissed",
  "other",
];
const CONTACT_CHANNELS: readonly ContactChannel[] = [
  "whatsapp",
  "email",
  "phone",
];
const MAX_ITEM_CODES = 20;

// Catalogue codes are upper-case (CCCBT, INCLP); programme slugs are
// lower-case and hyphenated (personality-disorders). Both start with a letter,
// so phone numbers and numeric ids fail; neither allows spaces, "@", "+" or
// mixed case, so names, emails and free text fail.
const CATALOGUE_CODE_PATTERN = /^[A-Z][A-Z0-9_-]{1,31}$/;
const PROGRAMME_SLUG_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/;

export function sanitizeCourseCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length > 48) return undefined;
  return CATALOGUE_CODE_PATTERN.test(trimmed) ||
    PROGRAMME_SLUG_PATTERN.test(trimmed)
    ? trimmed
    : undefined;
}

function sanitizeAmount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return Math.round(value * 100) / 100;
}

function sanitizeItemCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const codes = new Set<string>();
  for (const entry of value) {
    const code = sanitizeCourseCode(entry);
    if (code) codes.add(code);
    if (codes.size >= MAX_ITEM_CODES) break;
  }
  return [...codes];
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((option) => option === value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Rebuilds an event from allowlisted fields only. Returns null when a required
 * field is missing or invalid, so a bad call sends nothing rather than
 * something partial.
 */
export function sanitizeAnalyticsEvent(
  name: unknown,
  rawParams: unknown,
): SanitizedAnalyticsEvent | null {
  const params = asRecord(rawParams);

  switch (name) {
    case "course_card_click": {
      const course_code = sanitizeCourseCode(params.course_code);
      if (!course_code) return null;
      const source = pickEnum(params.source, CARD_SOURCES) ?? "other";
      return { name, params: { course_code, source } };
    }
    case "programme_view": {
      const course_code = sanitizeCourseCode(params.course_code);
      if (!course_code) return null;
      return { name, params: { course_code } };
    }
    case "enroll_click": {
      const course_code = sanitizeCourseCode(params.course_code);
      if (!course_code) return null;
      const price = sanitizeAmount(params.price);
      return {
        name,
        params: price === undefined ? { course_code } : { course_code, price },
      };
    }
    case "checkout_start":
    case "purchase": {
      const value = sanitizeAmount(params.value);
      if (value === undefined) return null;
      // Every sale is in rupees; anything else is a caller bug, not data.
      if (params.currency !== undefined && params.currency !== "INR") {
        return null;
      }
      return {
        name,
        params: {
          value,
          currency: "INR",
          item_codes: sanitizeItemCodes(params.item_codes),
        },
      };
    }
    case "payment_failed": {
      const reason = pickEnum(params.reason, FAILURE_REASONS) ?? "other";
      return { name, params: { reason } };
    }
    case "contact_click": {
      const channel = pickEnum(params.channel, CONTACT_CHANNELS);
      if (!channel) return null;
      return { name, params: { channel } };
    }
    default:
      return null;
  }
}

/** Classifies a link's href as a contact channel without keeping the href. */
export function contactChannelForHref(href: unknown): ContactChannel | null {
  if (typeof href !== "string") return null;
  const value = href.trim().toLowerCase();
  if (value.startsWith("mailto:")) return "email";
  if (value.startsWith("tel:")) return "phone";
  if (value.startsWith("whatsapp:")) return "whatsapp";
  try {
    const host = new URL(value).hostname;
    if (
      host === "wa.me" ||
      host === "api.whatsapp.com" ||
      host === "web.whatsapp.com" ||
      host === "chat.whatsapp.com"
    ) {
      return "whatsapp";
    }
  } catch {
    // Relative or malformed hrefs are not contact links.
  }
  return null;
}

export type AnalyticsDispatch =
  | { vendor: "gtag"; args: ["event", string, Record<string, unknown>] }
  | {
      vendor: "fbq";
      args: ["track" | "trackCustom", string, Record<string, unknown>];
    }
  | { vendor: "clarity"; args: ["event", string] };

/**
 * Maps a sanitised event onto each vendor's call. Checkout and purchase use
 * GA4's ecommerce names and Meta's standard events so both tools' built-in
 * conversion reports pick them up; everything else stays a custom event.
 */
export function buildAnalyticsDispatches(
  event: SanitizedAnalyticsEvent,
): AnalyticsDispatch[] {
  const clarity: AnalyticsDispatch = {
    vendor: "clarity",
    args: ["event", event.name],
  };

  switch (event.name) {
    case "checkout_start":
    case "purchase": {
      const { value, currency, item_codes } = event.params;
      const gaName = event.name === "purchase" ? "purchase" : "begin_checkout";
      const metaName =
        event.name === "purchase" ? "Purchase" : "InitiateCheckout";
      return [
        {
          vendor: "gtag",
          args: [
            "event",
            gaName,
            {
              value,
              currency,
              items: item_codes.map((code) => ({ item_id: code })),
            },
          ],
        },
        {
          vendor: "fbq",
          args: [
            "track",
            metaName,
            {
              value,
              currency,
              content_ids: item_codes,
              content_type: "product",
              num_items: item_codes.length,
            },
          ],
        },
        clarity,
      ];
    }
    case "enroll_click": {
      const { course_code, price } = event.params;
      const meta: Record<string, unknown> = {
        content_ids: [course_code],
        content_type: "product",
      };
      if (price !== undefined) {
        meta.value = price;
        meta.currency = "INR";
      }
      return [
        { vendor: "gtag", args: ["event", event.name, { ...event.params }] },
        { vendor: "fbq", args: ["track", "AddToCart", meta] },
        clarity,
      ];
    }
    case "programme_view":
      return [
        { vendor: "gtag", args: ["event", event.name, { ...event.params }] },
        {
          vendor: "fbq",
          args: [
            "track",
            "ViewContent",
            {
              content_ids: [event.params.course_code],
              content_type: "product",
            },
          ],
        },
        clarity,
      ];
    case "contact_click":
      return [
        { vendor: "gtag", args: ["event", event.name, { ...event.params }] },
        { vendor: "fbq", args: ["track", "Contact", { ...event.params }] },
        clarity,
      ];
    default:
      return [
        { vendor: "gtag", args: ["event", event.name, { ...event.params }] },
        {
          vendor: "fbq",
          args: ["trackCustom", event.name, { ...event.params }],
        },
        clarity,
      ];
  }
}

/** Sends a conversion event to whichever analytics tools are loaded. */
export function track<E extends AnalyticsEventName>(
  name: E,
  params: AnalyticsEventParams[E],
): void {
  try {
    if (typeof window === "undefined") return;
    const event = sanitizeAnalyticsEvent(name, params);
    if (!event) return;

    for (const dispatch of buildAnalyticsDispatches(event)) {
      const fn: unknown = window[dispatch.vendor];
      if (typeof fn !== "function") continue;
      try {
        fn(...dispatch.args);
      } catch {
        // One vendor failing must not stop the others or the page.
      }
    }
  } catch {
    // Analytics must never break the page.
  }
}

/** Course codes carried on cart lines, for checkout and purchase events. */
export function cartItemCodes(items: ReadonlyArray<object>) {
  return sanitizeItemCodes(
    items.map((item) => (item as { courseCode?: unknown }).courseCode),
  );
}

type EventParams = Record<string, unknown>;

// Fire a conversion/engagement event at whichever free trackers are loaded.
// Safe to call anywhere in client code; each call is a no-op when its provider
// is not configured.
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
