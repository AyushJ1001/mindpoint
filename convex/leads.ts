import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Storefront lead capture. Marketing consent is recorded separately from Course
// communication, with the purpose and wording version agreed at capture
// (see #134). A honeypot field plus a short per-email throttle keep casual spam
// out without external I/O, which a Convex mutation cannot perform.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_TEXT_VERSION = "2026-09";
const CONSENT_PURPOSE = "marketing";
const THROTTLE_MS = 10_000;

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const submitLead = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    educationStatus: v.optional(v.string()),
    interest: v.optional(v.string()),
    message: v.optional(v.string()),
    source: v.string(),
    marketingConsent: v.boolean(),
    // Honeypot. Real people never see or fill this.
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (clean(args.company)) {
      return { ok: true };
    }

    const email = args.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new Error("Enter a valid email address.");
    }

    const source = clean(args.source) ?? "storefront";
    const now = Date.now();
    const consentFields = args.marketingConsent
      ? {
          marketingConsent: true,
          consentPurpose: CONSENT_PURPOSE,
          consentTextVersion: CONSENT_TEXT_VERSION,
          consentAt: now,
        }
      : {};

    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      if (now - existing.updatedAt < THROTTLE_MS) {
        return { ok: true };
      }
      await ctx.db.patch(existing._id, {
        name: clean(args.name) ?? existing.name,
        phone: clean(args.phone) ?? existing.phone,
        city: clean(args.city) ?? existing.city,
        educationStatus:
          clean(args.educationStatus) ?? existing.educationStatus,
        interest: clean(args.interest) ?? existing.interest,
        message: clean(args.message) ?? existing.message,
        source,
        ...consentFields,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.insert("leads", {
      email,
      name: clean(args.name),
      phone: clean(args.phone),
      city: clean(args.city),
      educationStatus: clean(args.educationStatus),
      interest: clean(args.interest),
      message: clean(args.message),
      source,
      marketingConsent: args.marketingConsent,
      ...consentFields,
      createdAt: now,
      updatedAt: now,
    });

    // Deliver the resource the visitor asked for. Only on first capture, so a
    // repeat submission does not re-send.
    await ctx.scheduler.runAfter(
      0,
      internal.emailActions.sendLeadConfirmation,
      {
        email,
        name: clean(args.name),
        source,
      },
    );

    return { ok: true };
  },
});
