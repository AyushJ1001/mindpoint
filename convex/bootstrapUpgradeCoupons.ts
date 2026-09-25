import { internalMutation } from "./_generated/server";

// Creates the self-paced → live upgrade coupons. Each coupon is a flat
// discount equal to the price difference between the live course and its
// self-paced introduction, requires that the learner already owns the
// self-paced course, and applies only to the live course.
//
//   npx convex run bootstrapUpgradeCoupons:createUpgradeCoupons --prod
//
// Idempotent: matched by coupon code.

const ACTOR = "bootstrap:upgrade-coupons";

const UPGRADES: {
  code: string;
  applied: string;
  intro: string;
  name: string;
}[] = [
  {
    code: "UPGRADE-CCCBT",
    applied: "CCCBT",
    intro: "PRCBTI",
    name: "Upgrade: CBT, REBT and CBMT",
  },
  {
    code: "UPGRADE-CCPD",
    applied: "CCPD",
    intro: "PRPDI",
    name: "Upgrade: Personality Disorders",
  },
  {
    code: "UPGRADE-CCICH",
    applied: "CCICH",
    intro: "PRICHI",
    name: "Upgrade: Inner Child Healing & Therapy",
  },
  {
    code: "UPGRADE-INCLP",
    applied: "INCLP",
    intro: "PRCVCP",
    name: "Upgrade: Counselling Psychology internship",
  },
];

export const createUpgradeCoupons = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);

    const find = (code: string) => {
      const matches = courses.filter((course) => course.code === code);
      return (
        matches.find((course) => course.lifecycleStatus !== "archived") ??
        matches[0]
      );
    };

    const results: {
      code: string;
      created: boolean;
      difference?: number;
      reason?: string;
    }[] = [];

    for (const seed of UPGRADES) {
      const applied = find(seed.applied);
      const intro = find(seed.intro);
      if (!applied || !intro) {
        results.push({
          code: seed.code,
          created: false,
          reason: "missing course",
        });
        continue;
      }

      const difference = Math.max(0, applied.price - intro.price);
      const existing = await ctx.db
        .query("adminCoupons")
        .withIndex("by_code", (q) => q.eq("code", seed.code))
        .first();

      const fields = {
        code: seed.code,
        name: seed.name,
        description: `Credits the ₹${intro.price.toLocaleString("en-IN")} self-paced fee when upgrading to the live course.`,
        enabled: true,
        isArchived: false,
        discount: { type: "flat" as const, value: difference },
        appliesTo: { type: "courses" as const, courseIds: [applied._id] },
        requires: { type: "courses" as const, courseIds: [intro._id] },
        totalRedemptions: existing?.totalRedemptions ?? 0,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        createdByAdminId: existing?.createdByAdminId ?? ACTOR,
        updatedByAdminId: ACTOR,
      };

      if (existing) {
        await ctx.db.patch(existing._id, fields);
        results.push({ code: seed.code, created: false, difference });
      } else {
        await ctx.db.insert("adminCoupons", fields);
        results.push({ code: seed.code, created: true, difference });
      }
    }

    return { coupons: results };
  },
});
