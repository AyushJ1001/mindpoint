import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import { OfferOccasion } from "./schema";
import {
  OCCASION_LABEL,
  pickCampaignForCourse,
  planReconciliation,
  priceWithDiscount,
  type CampaignRule,
  type OfferDiscountType,
  type OfferOccasion as Occasion,
} from "../lib/domain/promo-campaigns";

// Scheduled offer campaigns.
//
// A campaign is enabled, has a window, a priority and a list of eligible
// courses. A cron reconciles live campaigns onto `course.offer`, which is the
// single field every price surface already reads (cards, detail pages, cart,
// checkout, payment records). Expiry needs no code change: the next run clears
// the offer and the standard fee returns.
//
// Only offers this reconciler wrote are ever cleared (`offer.campaignId`), so a
// hand-applied offer on a course is left alone.

const ACTOR = "campaign:reconciler";

function toRule(campaign: Doc<"offerCampaigns">): CampaignRule {
  return {
    _id: String(campaign._id),
    name: campaign.name,
    occasion: campaign.occasion,
    enabled: campaign.enabled,
    priority: campaign.priority,
    headline: campaign.headline,
    lead: campaign.lead,
    bannerImageUrl: campaign.bannerImageUrl,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    eligibleCourseIds: (campaign.eligibleCourseIds ?? []).map(String),
    isArchived: campaign.isArchived,
    createdAt: campaign.createdAt,
    offer: campaign.offer
      ? {
          name: campaign.name,
          discount: campaign.offer.discount,
          discountType: campaign.offer.discountType,
          discountValue: campaign.offer.discountValue,
          startDate: campaign.offer.startDate,
          endDate: campaign.offer.endDate,
        }
      : undefined,
  };
}

function toCourse(course: Doc<"courses">) {
  return {
    _id: String(course._id),
    price: course.price,
    offer: course.offer
      ? {
          name: course.offer.name,
          campaignId: course.offer.campaignId,
          discount: course.offer.discount,
          discountType: course.offer.discountType,
          discountValue: course.offer.discountValue,
          startDate: course.offer.startDate,
          endDate: course.offer.endDate,
          occasion: course.offer.occasion,
          headline: course.offer.headline,
          lead: course.offer.lead,
          bannerImageUrl: course.offer.bannerImageUrl,
          standardPrice: course.offer.standardPrice,
          offerPrice: course.offer.offerPrice,
        }
      : undefined,
  };
}

export async function reconcileCampaignsNow(
  ctx: MutationCtx,
  now = Date.now(),
) {
  const campaigns = await ctx.db.query("offerCampaigns").take(200);
  const courses = await ctx.db.query("courses").take(2000);

  const plan = planReconciliation(
    courses.map(toCourse),
    campaigns.map(toRule),
    now,
  );

  const byId = new Map(courses.map((course) => [String(course._id), course]));

  for (const { courseId, offer } of plan.apply) {
    const course = byId.get(courseId);
    if (!course) continue;
    await ctx.db.patch(course._id, {
      offer,
      updatedAt: now,
      updatedByAdminId: ACTOR,
    });
    await createAdminAuditLog(ctx, {
      actorAdminId: ACTOR,
      action: "offer_campaign.auto_apply",
      entityType: "course",
      entityId: courseId,
      before: course.offer,
      after: offer,
      metadata: {
        campaignId: offer.campaignId,
        occasion: offer.occasion,
        standardPrice: offer.standardPrice,
        offerPrice: offer.offerPrice,
      },
    });
  }

  for (const courseId of plan.clear) {
    const course = byId.get(courseId);
    if (!course) continue;
    await ctx.db.patch(course._id, {
      offer: undefined,
      updatedAt: now,
      updatedByAdminId: ACTOR,
    });
    await createAdminAuditLog(ctx, {
      actorAdminId: ACTOR,
      action: "offer_campaign.auto_expire",
      entityType: "course",
      entityId: courseId,
      before: course.offer,
      metadata: { restoredStandardPrice: course.price },
    });
  }

  // Record what each campaign currently owns, so the admin list can say
  // "live on 3 courses" without recomputing.
  const appliedByCampaign = new Map<string, typeof courses>();
  for (const { courseId, offer } of plan.apply) {
    const course = byId.get(courseId);
    if (!course) continue;
    const list = appliedByCampaign.get(offer.campaignId) ?? [];
    list.push(course);
    appliedByCampaign.set(offer.campaignId, list);
  }
  // Courses whose offer already matched keep their campaign ownership.
  for (const course of courses) {
    const campaignId = course.offer?.campaignId;
    if (!campaignId || plan.apply.some((item) => item.courseId === String(course._id))) {
      continue;
    }
    const list = appliedByCampaign.get(campaignId) ?? [];
    list.push(course);
    appliedByCampaign.set(campaignId, list);
  }

  for (const campaign of campaigns) {
    const owned = (appliedByCampaign.get(String(campaign._id)) ?? []).map(
      (course) => course._id,
    );
    const unchanged =
      (campaign.appliedCourseIds ?? []).length === owned.length &&
      (campaign.appliedCourseIds ?? []).every((id, index) => id === owned[index]);
    if (unchanged) continue;
    await ctx.db.patch(campaign._id, {
      appliedCourseIds: owned,
      lastAppliedAt: now,
      lastReconciledAt: now,
    });
  }

  return {
    applied: plan.apply.length,
    cleared: plan.clear.length,
    checkedCourses: courses.length,
  };
}

/** Run by the cron every five minutes, and right after an admin saves. */
export const reconcileCampaigns = internalMutation({
  args: {},
  handler: async (ctx) => reconcileCampaignsNow(ctx),
});

const draftValidator = {
  campaignId: v.optional(v.id("offerCampaigns")),
  name: v.string(),
  occasion: v.optional(OfferOccasion),
  priority: v.optional(v.number()),
  discountType: v.optional(
    v.union(
      v.literal("percentage"),
      v.literal("fixedPrice"),
      v.literal("flatOff"),
    ),
  ),
  discountValue: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  eligibleCourseIds: v.optional(v.array(v.id("courses"))),
  enabled: v.optional(v.boolean()),
};

function draftRule(args: {
  campaignId?: string;
  name: string;
  occasion?: Occasion;
  priority?: number;
  discountType?: OfferDiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  eligibleCourseIds?: string[];
  enabled?: boolean;
  createdAt?: number;
}): CampaignRule {
  return {
    _id: args.campaignId ?? "preview",
    name: args.name,
    occasion: args.occasion ?? "general",
    enabled: args.enabled ?? true,
    priority: args.priority ?? 0,
    startDate: args.startDate,
    endDate: args.endDate,
    eligibleCourseIds: args.eligibleCourseIds ?? [],
    isArchived: false,
    // A brand-new draft is the newest campaign; an edit keeps its age, so the
    // preview's tie-breaking matches what would really happen.
    createdAt: args.createdAt ?? Date.now(),
    offer: {
      discountType: args.discountType ?? "percentage",
      discountValue: args.discountValue ?? 0,
    },
  };
}

/**
 * What this draft would do, against the campaigns already configured, without
 * writing anything. The same winner logic the reconciler uses, so a preview
 * cannot promise a price the scheduler would not apply.
 */
export const previewCampaign = query({
  args: draftValidator,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const campaigns = await ctx.db.query("offerCampaigns").take(200);

    const existingCampaign = args.campaignId
      ? await ctx.db.get(args.campaignId)
      : null;

    const draft = draftRule({
      campaignId: args.campaignId ? String(args.campaignId) : undefined,
      name: args.name,
      occasion: args.occasion,
      priority: args.priority,
      discountType: args.discountType,
      discountValue: args.discountValue,
      startDate: args.startDate,
      endDate: args.endDate,
      eligibleCourseIds: (args.eligibleCourseIds ?? []).map(String),
      enabled: args.enabled,
      createdAt: existingCampaign?.createdAt,
    });

    const others = campaigns
      .filter((campaign) => String(campaign._id) !== String(args.campaignId))
      .map(toRule);

    const eligible = new Set((args.eligibleCourseIds ?? []).map(String));

    const rows = courses
      .filter((course) => eligible.has(String(course._id)))
      .map((course) => {
        const winner = pickCampaignForCourse(
          toCourse(course),
          [draft, ...others],
          now,
        );
        const isThisCampaign = winner?.campaign._id === draft._id;
        const offerPrice = winner
          ? priceWithDiscount(course.price, winner.discount)
          : Math.round(course.price);

        return {
          courseId: course._id,
          courseName: course.name,
          standardPrice: Math.round(course.price),
          offerPrice,
          saving: Math.max(0, Math.round(course.price) - offerPrice),
          occasionLabel: winner
            ? winner.campaign._id === draft._id
              ? OCCASION_LABEL[draft.occasion ?? "general"]
              : OCCASION_LABEL[winner.campaign.occasion ?? "general"]
            : null,
          winningCampaignName: winner?.campaign.name ?? null,
          overriddenByOtherCampaign: Boolean(winner && !isThisCampaign),
        };
      });

    return {
      occasionLabel: OCCASION_LABEL[draft.occasion ?? "general"],
      rows,
      appliedCount: rows.filter(
        (row) => row.saving > 0 && !row.overriddenByOtherCampaign,
      ).length,
      overriddenCount: rows.filter((row) => row.overriddenByOtherCampaign)
        .length,
      inactiveCount: rows.filter(
        (row) => !row.winningCampaignName || row.saving === 0,
      ).length,
    };
  },
});

/** Manual "apply now", used by the admin list to skip the cron wait. */
export const runReconciliation = internalMutation({
  args: {},
  handler: async (ctx) => reconcileCampaignsNow(ctx),
});
