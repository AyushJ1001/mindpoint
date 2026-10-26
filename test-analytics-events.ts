import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  buildAnalyticsDispatches,
  cartItemCodes,
  contactChannelForHref,
  sanitizeAnalyticsEvent,
  sanitizeCourseCode,
  track,
} from "./lib/analytics";

type Call = { vendor: string; args: unknown[] };

const globals = globalThis as { window?: unknown };

function installVendors(vendors: string[] = ["gtag", "fbq", "clarity"]) {
  const calls: Call[] = [];
  const fakeWindow: Record<string, unknown> = {};
  for (const vendor of vendors) {
    fakeWindow[vendor] = (...args: unknown[]) => calls.push({ vendor, args });
  }
  globals.window = fakeWindow;
  return { calls, fakeWindow };
}

afterEach(() => {
  delete globals.window;
});

test("track is a silent no-op during server rendering", () => {
  assert.equal(globals.window, undefined);
  assert.doesNotThrow(() => track("contact_click", { channel: "whatsapp" }));
});

test("track is a no-op when no vendor script has loaded", () => {
  globals.window = {};
  assert.doesNotThrow(() =>
    track("purchase", { value: 3499, currency: "INR", item_codes: ["CCPD"] }),
  );
});

test("track forwards only to the vendors that are loaded", () => {
  const { calls } = installVendors(["clarity"]);
  track("programme_view", { course_code: "CCICH" });
  assert.deepEqual(calls, [
    { vendor: "clarity", args: ["event", "programme_view"] },
  ]);
});

test("a throwing vendor does not stop the others or the caller", () => {
  const { calls, fakeWindow } = installVendors();
  fakeWindow.gtag = () => {
    throw new Error("blocked by an extension");
  };
  assert.doesNotThrow(() =>
    track("enroll_click", { course_code: "CCCBT", price: 3499 }),
  );
  assert.deepEqual(
    calls.map((call) => call.vendor),
    ["fbq", "clarity"],
  );
});

test("purchase maps to GA4 purchase and Meta Purchase with codes only", () => {
  const { calls } = installVendors();
  track("purchase", {
    value: 6998,
    currency: "INR",
    item_codes: ["CCCBT", "CCPD"],
  });
  assert.deepEqual(calls[0], {
    vendor: "gtag",
    args: [
      "event",
      "purchase",
      {
        value: 6998,
        currency: "INR",
        items: [{ item_id: "CCCBT" }, { item_id: "CCPD" }],
      },
    ],
  });
  assert.deepEqual(calls[1], {
    vendor: "fbq",
    args: [
      "track",
      "Purchase",
      {
        value: 6998,
        currency: "INR",
        content_ids: ["CCCBT", "CCPD"],
        content_type: "product",
        num_items: 2,
      },
    ],
  });
});

test("checkout_start maps to begin_checkout and InitiateCheckout", () => {
  const event = sanitizeAnalyticsEvent("checkout_start", {
    value: 3499,
    currency: "INR",
    item_codes: ["CCICH"],
  });
  assert.ok(event);
  const dispatches = buildAnalyticsDispatches(event);
  assert.equal(dispatches[0].args[1], "begin_checkout");
  assert.equal(dispatches[1].args[0], "track");
  assert.equal(dispatches[1].args[1], "InitiateCheckout");
});

test("card clicks and failures stay custom events on Meta", () => {
  const event = sanitizeAnalyticsEvent("payment_failed", {
    reason: "dismissed",
  });
  assert.ok(event);
  const fbq = buildAnalyticsDispatches(event).find(
    (dispatch) => dispatch.vendor === "fbq",
  );
  assert.deepEqual(fbq?.args, [
    "trackCustom",
    "payment_failed",
    { reason: "dismissed" },
  ]);
});

test("unknown keys are stripped, so personal data cannot ride along", () => {
  const event = sanitizeAnalyticsEvent("purchase", {
    value: 3499,
    currency: "INR",
    item_codes: ["CCPD"],
    email: "learner@example.com",
    name: "A Learner",
    phone: "+919876543210",
    enrollmentNumber: "TMP-CCPD-0001",
  });
  assert.deepEqual(event, {
    name: "purchase",
    params: { value: 3499, currency: "INR", item_codes: ["CCPD"] },
  });
});

test("course codes reject emails, phone numbers, names and free text", () => {
  for (const bad of [
    "learner@example.com",
    "+919876543210",
    "9876543210",
    "Asha",
    "asha",
    "I was abused as a child",
    "CC PD",
    "",
    42,
    null,
  ]) {
    assert.equal(sanitizeCourseCode(bad), undefined, String(bad));
  }
  assert.equal(sanitizeCourseCode(" CCPD "), "CCPD");
  assert.equal(sanitizeCourseCode("UPGRADE-CCCBT"), "UPGRADE-CCCBT");
  assert.equal(
    sanitizeCourseCode("personality-disorders"),
    "personality-disorders",
  );
});

test("an event whose required identifier is invalid is dropped entirely", () => {
  assert.equal(
    sanitizeAnalyticsEvent("course_card_click", {
      course_code: "learner@example.com",
      source: "catalogue",
    }),
    null,
  );
  assert.equal(
    sanitizeAnalyticsEvent("contact_click", { channel: "9876543210" }),
    null,
  );
  assert.equal(sanitizeAnalyticsEvent("made_up_event", {}), null);

  const { calls } = installVendors();
  track("programme_view", { course_code: "Asha Rao" });
  assert.equal(calls.length, 0);
});

test("failure reasons are categories, never error text", () => {
  const event = sanitizeAnalyticsEvent("payment_failed", {
    reason: "Card declined for asha@example.com",
  });
  assert.deepEqual(event, {
    name: "payment_failed",
    params: { reason: "other" },
  });
});

test("unknown card sources collapse to other", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent("course_card_click", {
      course_code: "CCCBT",
      source: "/therapy/anxiety?note=private",
    }),
    {
      name: "course_card_click",
      params: { course_code: "CCCBT", source: "other" },
    },
  );
});

test("amounts must be finite and non-negative; bad prices are dropped", () => {
  assert.equal(
    sanitizeAnalyticsEvent("purchase", { value: Number.NaN, currency: "INR" }),
    null,
  );
  assert.equal(
    sanitizeAnalyticsEvent("checkout_start", { value: -1, currency: "INR" }),
    null,
  );
  assert.equal(
    sanitizeAnalyticsEvent("purchase", { value: 10, currency: "USD" }),
    null,
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("enroll_click", {
      course_code: "CCPD",
      price: Number.POSITIVE_INFINITY,
    }),
    { name: "enroll_click", params: { course_code: "CCPD" } },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("purchase", { value: 3499.999, currency: "INR" }),
    {
      name: "purchase",
      params: { value: 3500, currency: "INR", item_codes: [] },
    },
  );
});

test("item codes are filtered, de-duplicated and capped", () => {
  const codes = cartItemCodes([
    { courseCode: "CCPD" },
    { courseCode: "CCPD" },
    { courseCode: "asha@example.com" },
    {},
    ...Array.from({ length: 30 }, (_, index) => ({
      courseCode: `CC${index}`,
    })),
  ]);
  assert.equal(codes[0], "CCPD");
  assert.equal(codes.length, 20);
  assert.ok(!codes.includes("asha@example.com"));
});

test("contact links are classified by channel, other links are ignored", () => {
  assert.equal(
    contactChannelForHref("https://wa.me/919137008686?text=Hi"),
    "whatsapp",
  );
  assert.equal(
    contactChannelForHref("https://api.whatsapp.com/send?phone=91"),
    "whatsapp",
  );
  assert.equal(contactChannelForHref("mailto:hello@example.com"), "email");
  assert.equal(contactChannelForHref("tel:14416"), "phone");
  assert.equal(contactChannelForHref("/courses/certificate"), null);
  assert.equal(contactChannelForHref("https://wa.me.example.com/"), null);
  assert.equal(contactChannelForHref(null), null);
});

test("contact_click sends the channel and nothing from the href", () => {
  const { calls } = installVendors(["gtag"]);
  track("contact_click", {
    channel: contactChannelForHref("https://wa.me/919137008686?text=PTSD")!,
  });
  assert.deepEqual(calls, [
    {
      vendor: "gtag",
      args: ["event", "contact_click", { channel: "whatsapp" }],
    },
  ]);
});
