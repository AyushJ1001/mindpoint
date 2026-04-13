import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

/** Reasonable upper bound for active campaigns. */
const MAX_ACTIVE_CAMPAIGNS = 50;

function isBundleCampaignActive(campaign: {
  enabled: boolean;
  isArchived: boolean;
  startDate?: string;
  endDate?: string;
}) {
  if (!campaign.enabled || campaign.isArchived) {
    return false;
  }

  const now = Date.now();

  if (campaign.startDate) {
    const start = new Date(campaign.startDate).getTime();
    if (Number.isNaN(start) || now < start) {
      return false;
    }
  }

  if (campaign.endDate) {
    const end = new Date(campaign.endDate).getTime();
    if (Number.isNaN(end) || now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Returns all active (enabled, not archived, within date window) bundle campaigns.
 * Used by course listing pages to show bundle-eligibility badges on cards.
 */
export const listAllActiveBundleCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("bundleCampaigns")
      .withIndex("by_enabled_isArchived_priority", (q) =>
        q.eq("enabled", true).eq("isArchived", false),
      )
      .order("desc")
      .take(MAX_ACTIVE_CAMPAIGNS);

    if (campaigns.length === MAX_ACTIVE_CAMPAIGNS) {
      console.warn(
        `[bundleCampaigns] Hit ${MAX_ACTIVE_CAMPAIGNS} campaign cap — some may be missing from badge display`,
      );
    }

    return campaigns
      .filter((campaign) => isBundleCampaignActive(campaign))
      .map((campaign) => ({
        _id: campaign._id,
        name: campaign.name,
        description: campaign.description,
        flatFee: campaign.flatFee,
        requiredCourseCountMin: campaign.requiredCourseCountMin,
        requiredCourseCountMax: campaign.requiredCourseCountMax,
        eligibleCourseIds: campaign.eligibleCourseIds,
        priority: campaign.priority,
      }));
  },
});

export const listActiveBundleCampaignsForCourses = query({
  args: {
    courseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const uniqueCourseIds = Array.from(
      new Set(args.courseIds.map((courseId) => String(courseId))),
    );
    if (uniqueCourseIds.length === 0) {
      return [];
    }

    const courseIdSet = new Set(uniqueCourseIds);
    const campaigns = await ctx.db
      .query("bundleCampaigns")
      .withIndex("by_enabled_isArchived_priority", (q) =>
        q.eq("enabled", true).eq("isArchived", false),
      )
      .order("desc")
      .take(MAX_ACTIVE_CAMPAIGNS);

    if (campaigns.length === MAX_ACTIVE_CAMPAIGNS) {
      console.warn(
        `[bundleCampaigns] Hit ${MAX_ACTIVE_CAMPAIGNS} campaign cap in listActiveBundleCampaignsForCourses`,
      );
    }

    return campaigns
      .filter((campaign) => isBundleCampaignActive(campaign))
      .filter((campaign) =>
        campaign.eligibleCourseIds.some((courseId) =>
          courseIdSet.has(String(courseId)),
        ),
      )
      .map((campaign) => ({
        _id: campaign._id,
        _creationTime: campaign._creationTime,
        name: campaign.name,
        description: campaign.description,
        flatFee: campaign.flatFee,
        requiredCourseCountMin: campaign.requiredCourseCountMin,
        requiredCourseCountMax: campaign.requiredCourseCountMax,
        eligibleCourseIds: campaign.eligibleCourseIds,
        priority: campaign.priority,
        enabled: campaign.enabled,
        isArchived: campaign.isArchived,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      }));
  },
});

/**
 * Disables bundle campaigns whose endDate has passed.
 * Called by the cron in convex/crons.ts to ensure Convex subscriptions
 * re-evaluate when a campaign expires (document change triggers update).
 */
export const disableExpiredCampaigns = internalMutation({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("bundleCampaigns")
      .withIndex("by_enabled_isArchived_priority", (q) =>
        q.eq("enabled", true).eq("isArchived", false),
      )
      .collect();

    const now = Date.now();
    let disabled = 0;

    for (const campaign of campaigns) {
      if (!campaign.endDate) continue;
      const end = new Date(campaign.endDate).getTime();
      if (Number.isNaN(end) || now <= end) continue;

      await ctx.db.patch(campaign._id, {
        enabled: false,
        updatedAt: now,
        updatedByAdminId: "system:cron",
      });
      disabled += 1;
    }

    if (disabled > 0) {
      console.log(
        `[bundleCampaigns] Cron disabled ${disabled} expired campaign(s)`,
      );
    }
  },
});
