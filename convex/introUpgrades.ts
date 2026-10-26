import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { loadBuyerCouponContext } from "./_shared/checkout";

// Self-paced intro → certificate upgrades. Owning a self-paced intro credits
// its fee once against any certificate course. The coupons require the intro
// to be owned (not in the cart) and can be used once per learner.
//
//   npx convex run introUpgrades:applyIntroUpgradeCoupons --prod

const ACTOR = "bootstrap:intro-upgrades";

export const INTRO_UPGRADES: {
  code: string;
  name: string;
  introCodes: string[];
}[] = [
  {
    code: "UPGRADE-INTRO-999",
    name: "Upgrade: ₹999 intro to any certificate course",
    introCodes: ["PRPFA", "PRCP", "PRSP", "PRCVCP"],
  },
  {
    code: "UPGRADE-INTRO-1499",
    name: "Upgrade: ₹1,499 intro to any certificate course",
    introCodes: ["PRCBTI", "PRICHI", "PRPDI"],
  },
];

// Per-course upgrade coupons these replace. They required the intro in the
// same cart, so an owner could never use them.
const RETIRED_CODES = ["UPGRADE-CCCBT", "UPGRADE-CCPD", "UPGRADE-CCICH"];

function pickLiveRow(courses: Doc<"courses">[], code: string) {
  const matches = courses.filter(
    (course) => course.code === code && !course.mergedIntoCourseId,
  );
  return (
    matches.find((course) => course.lifecycleStatus !== "archived") ??
    matches[0]
  );
}

export const applyIntroUpgradeCoupons = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const results: { code: string; action: string; credit?: number }[] = [];

    for (const seed of INTRO_UPGRADES) {
      const intros = seed.introCodes
        .map((code) => pickLiveRow(courses, code))
        .filter((course): course is Doc<"courses"> => course !== undefined);
      if (intros.length === 0) {
        results.push({ code: seed.code, action: "skipped: no intro courses" });
        continue;
      }
      const credit = Math.min(...intros.map((course) => course.price));

      const existing = await ctx.db
        .query("adminCoupons")
        .withIndex("by_code", (q) => q.eq("code", seed.code))
        .first();
      const fields = {
        code: seed.code,
        name: seed.name,
        description: `Credits the ₹${credit.toLocaleString("en-IN")} self-paced intro fee once against any certificate course.`,
        enabled: true,
        isArchived: false,
        discount: { type: "flat" as const, value: credit },
        appliesTo: {
          type: "courseTypes" as const,
          courseTypes: ["certificate" as const],
        },
        requires: {
          type: "courses" as const,
          courseIds: intros.map((course) => course._id),
        },
        requirementSatisfiedBy: "owned" as const,
        perUserLimit: 1,
        totalRedemptions: existing?.totalRedemptions ?? 0,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        createdByAdminId: existing?.createdByAdminId ?? ACTOR,
        updatedByAdminId: ACTOR,
      };
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        results.push({ code: seed.code, action: "updated", credit });
      } else {
        await ctx.db.insert("adminCoupons", fields);
        results.push({ code: seed.code, action: "created", credit });
      }
    }

    // The internship primer upgrade keeps its course, but must check
    // ownership rather than the cart, once per learner.
    const internship = await ctx.db
      .query("adminCoupons")
      .withIndex("by_code", (q) => q.eq("code", "UPGRADE-INCLP"))
      .first();
    if (internship) {
      await ctx.db.patch(internship._id, {
        requirementSatisfiedBy: "owned",
        perUserLimit: 1,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      results.push({ code: internship.code, action: "now ownership-based" });
    }

    for (const code of RETIRED_CODES) {
      const coupon = await ctx.db
        .query("adminCoupons")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (coupon && coupon.enabled) {
        await ctx.db.patch(coupon._id, {
          enabled: false,
          updatedAt: now,
          updatedByAdminId: ACTOR,
        });
        results.push({ code, action: "disabled" });
      }
    }

    return results;
  },
});

/**
 * The best intro-upgrade credit the signed-in learner can use now, or null.
 * Server-side so the page never offers a credit checkout would refuse.
 */
export const getMyIntroUpgradeCredit = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      couponCode: v.string(),
      credit: v.number(),
      introName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const buyer = await loadBuyerCouponContext(ctx, identity.subject);
    let best: { couponCode: string; credit: number; introName: string } | null =
      null;

    for (const seed of INTRO_UPGRADES) {
      const coupon = await ctx.db
        .query("adminCoupons")
        .withIndex("by_code", (q) => q.eq("code", seed.code))
        .first();
      if (
        !coupon ||
        !coupon.enabled ||
        coupon.isArchived ||
        coupon.discount.type !== "flat" ||
        coupon.requires.type !== "courses"
      ) {
        continue;
      }
      const used = buyer.redemptionsByCode.get(coupon.code.toUpperCase()) ?? 0;
      if (coupon.perUserLimit !== undefined && used >= coupon.perUserLimit) {
        continue;
      }
      const ownedId = coupon.requires.courseIds.find((id) =>
        buyer.ownedCourseIds.has(String(id)),
      );
      if (!ownedId) continue;
      const intro = await ctx.db.get(ownedId);
      if (!best || coupon.discount.value > best.credit) {
        best = {
          couponCode: coupon.code,
          credit: coupon.discount.value,
          introName: intro?.name ?? "your intro course",
        };
      }
    }

    return best;
  },
});
