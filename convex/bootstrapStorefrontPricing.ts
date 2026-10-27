import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Storefront pricing bootstrap (owner decision, 27 October 2026).
//
// The three applied certificate courses are ₹4,500. The Counselling Psychology
// internship is ₹2,499 with a ₹999 self-paced route, which reuses the existing
// "Clinical Vs Counselling Psychology" pre-recorded course. Every other
// published pre-recorded course in the standalone library drops to ₹999.
//
// Promotional offers (percentage / BOGO) are cleared on every course this file
// touches, so the price shown is the price paid.
//
// Run once against a deployment:
//   npx convex run bootstrapStorefrontPricing:applyStorefrontPricing --prod
//
// Idempotent: courses are matched by code (preferring the non-archived row),
// and existing rows are patched.

const CERT_APPLIED_PRICE = 4500;
const COUNSELLING_APPLIED_PRICE = 2499;
const SELF_PACED_LIBRARY_PRICE = 999;

const ACTOR = "bootstrap:storefront-pricing";

type AppliedSeed = { code: string; name: string; match: string };

const APPLIED_CERTIFICATES: AppliedSeed[] = [
  { code: "CCCBT", name: "CBT, REBT and CBMT", match: "cbmt" },
  {
    code: "CCICH",
    name: "Inner Child Healing & Therapy",
    match: "inner child",
  },
  {
    code: "CCPD",
    name: "Personality Disorders",
    match: "personality disorder",
  },
];

const COUNSELLING_APPLIED: AppliedSeed = {
  code: "INCLP",
  name: "Counselling Psychology",
  match: "counselling psychology",
};

// Only the self-paced intros with a complete asset set — lesson notes, a
// practice workbook, references and recordings — are sold at ₹999:
//   PRCVCP Clinical Vs Counselling · PRCP Criminal Psychology
//   PRSP   Sports Psychology      · PRPFA Psychological First Aid
// Everything else in the standalone library is archived by
// `archiveIncompleteIntros` until its material exists.
const SELF_PACED_LIBRARY_CODES = ["PRCVCP", "PRCP", "PRSP", "PRPFA"];

// The ₹1,499 intros (PRCBTI, PRICHI, PRPDI) were withdrawn from sale by
// `bootstrapSalesWithdrawal`. They stay in the catalogue with `salesEnabled:
// false`; this file no longer creates or republishes them.

function pickCourse(
  courses: Doc<"courses">[],
  code: string,
): Doc<"courses"> | undefined {
  const matches = courses.filter((course) => course.code === code);
  if (matches.length <= 1) return matches[0];
  // Prefer the live row over an archived duplicate.
  return (
    matches.find((course) => course.lifecycleStatus !== "archived") ??
    matches[0]
  );
}

export const applyStorefrontPricing = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: {
      code: string;
      name: string;
      courseId: Id<"courses"> | null;
      price: number;
      created: boolean;
    }[] = [];

    const setPrice = async (
      seed: { code: string; name: string },
      price: number,
      usesBatches: boolean,
    ) => {
      const existing = pickCourse(courses, seed.code);
      if (!existing) {
        results.push({
          code: seed.code,
          name: seed.name,
          courseId: null,
          price,
          created: false,
        });
        return;
      }
      await ctx.db.patch(existing._id, {
        price,
        usesBatches,
        lifecycleStatus: "published",
        offer: undefined,
        bogo: undefined,
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      results.push({
        code: seed.code,
        name: existing.name,
        courseId: existing._id,
        price,
        created: false,
      });
    };

    // ── Applied certificate courses → ₹4,500 ─────────────────────────
    for (const seed of APPLIED_CERTIFICATES) {
      await setPrice(seed, CERT_APPLIED_PRICE, true);
    }

    // ── Counselling Psychology internship → ₹2,499 ───────────────────
    await setPrice(COUNSELLING_APPLIED, COUNSELLING_APPLIED_PRICE, true);

    // ── Standalone pre-recorded library → ₹999 ───────────────────────
    for (const code of SELF_PACED_LIBRARY_CODES) {
      const existing = pickCourse(courses, code);
      if (!existing) continue;
      await ctx.db.patch(existing._id, {
        price: SELF_PACED_LIBRARY_PRICE,
        usesBatches: false,
        lifecycleStatus: "published",
        offer: undefined,
        bogo: undefined,
        publishedAt: existing.publishedAt ?? now,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      results.push({
        code,
        name: existing.name,
        courseId: existing._id,
        price: SELF_PACED_LIBRARY_PRICE,
        created: false,
      });
    }

    // ── Counselling January cohort → 18 Jan – 17 Feb 2027 (14 classes) ─
    let counsellingBatchUpdated = false;
    const counselling = pickCourse(courses, COUNSELLING_APPLIED.code);
    if (counselling) {
      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", counselling._id))
        .collect();
      const january = batches.find(
        (batch) => batch.label === "January 2027 Batch",
      );
      if (january) {
        await ctx.db.patch(january._id, {
          startDate: "2027-01-18",
          endDate: "2027-02-17",
          startTime: "19:30",
          endTime: "20:30",
          daysOfWeek: ["Monday", "Wednesday", "Friday"],
          lifecycleStatus: "published",
          updatedAt: now,
          updatedByAdminId: ACTOR,
        });
        counsellingBatchUpdated = true;
      }
    }

    return { pricing: results, counsellingBatchUpdated };
  },
});
