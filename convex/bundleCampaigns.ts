import { v } from "convex/values";
import { query } from "./_generated/server";

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
      .withIndex("by_enabled_priority", (q) => q.eq("enabled", true))
      .order("desc")
      .take(500);

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
