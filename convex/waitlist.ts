import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";
import { WaitlistCourseTypeValue, WaitlistDeliveryValue } from "./schema";
import { normalizeWhatsapp } from "./_shared/waitlist";

// Early-bird pre-registration. Joining is transactional — the entrant expects
// one email when registration opens — so consent is recorded but not gated on
// the marketing checkbox. A honeypot plus a short per-email throttle keep
// casual spam out without external I/O, which a Convex mutation cannot perform.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_PURPOSE = "early-bird-waitlist";
const CONSENT_TEXT_VERSION = "2026-09";
const THROTTLE_MS = 10_000;

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Records one waitlist entry per Course, Cohort (batch, optional) and Delivery.
 * Returns silently on a honeypot hit so bots learn nothing.
 */
export const joinWaitlist = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    courseTitle: v.string(),
    courseType: WaitlistCourseTypeValue,
    delivery: WaitlistDeliveryValue,
    courseId: v.optional(v.id("courses")),
    batchId: v.optional(v.id("courseBatches")),
    cohortLabel: v.optional(v.string()),
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

    const fullName = args.fullName.trim();
    if (fullName.length < 2) {
      throw new Error("Enter your full name.");
    }

    const whatsapp = normalizeWhatsapp(args.whatsapp);
    if (!whatsapp) {
      throw new Error("Enter a valid WhatsApp number with country code.");
    }

    let courseTitle = args.courseTitle.trim();
    let cohortLabel = clean(args.cohortLabel);
    if (args.courseId) {
      const course = await ctx.db.get(args.courseId);
      if (!course) {
        throw new Error("That course is no longer available.");
      }
      courseTitle = course.name;
    }
    if (args.batchId) {
      const batch = await ctx.db.get(args.batchId);
      if (batch) {
        cohortLabel = batch.label.trim() || cohortLabel;
      }
    }

    const source = clean(args.source) ?? "waitlist";
    const now = Date.now();
    const consentFields = {
      consentPurpose: CONSENT_PURPOSE,
      consentTextVersion: CONSENT_TEXT_VERSION,
      consentAt: now,
    };

    // One entry per person per offering. Repeat submissions within the throttle
    // window are ignored; later ones refresh the details instead of duplicating.
    const existing = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const match = existing.find(
      (row) =>
        row.courseType === args.courseType &&
        row.delivery === args.delivery &&
        (row.courseId ?? null) === (args.courseId ?? null) &&
        (row.batchId ?? null) === (args.batchId ?? null),
    );

    if (match) {
      if (now - match.updatedAt < THROTTLE_MS) {
        return { ok: true };
      }
      await ctx.db.patch(match._id, {
        fullName,
        whatsapp,
        courseTitle,
        cohortLabel,
        source,
        marketingConsent: args.marketingConsent,
        ...consentFields,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.insert("waitlistEntries", {
      fullName,
      email,
      whatsapp,
      courseId: args.courseId,
      courseTitle,
      courseType: args.courseType,
      batchId: args.batchId,
      cohortLabel,
      delivery: args.delivery,
      source,
      marketingConsent: args.marketingConsent,
      ...consentFields,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(0, internal.emailActions.sendWaitlistJoined, {
      fullName,
      email,
      whatsapp,
      courseTitle,
      courseType: args.courseType,
      delivery: args.delivery,
      cohortLabel,
      source,
    });

    return { ok: true };
  },
});
