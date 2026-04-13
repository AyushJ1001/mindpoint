import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

const MAX_ELIGIBLE_COURSES = 500;

const bundleCampaignPayload = {
  name: v.string(),
  description: v.optional(v.string()),
  flatFee: v.number(),
  requiredCourseCountMin: v.number(),
  requiredCourseCountMax: v.number(),
  eligibleCourseIds: v.array(v.id("courses")),
  priority: v.number(),
  enabled: v.boolean(),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
};

type BundleCampaignInput = {
  name: string;
  description?: string;
  flatFee: number;
  requiredCourseCountMin: number;
  requiredCourseCountMax: number;
  eligibleCourseIds: Id<"courses">[];
  priority: number;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
};

function normalizeString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function toInteger(value: number, field: string) {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer`);
  }

  return value;
}

function assertValidBundleCampaign(input: BundleCampaignInput) {
  const name = normalizeString(input.name);
  if (!name) {
    throw new Error("Campaign name is required");
  }

  const flatFee = Math.round(input.flatFee);
  if (!Number.isFinite(flatFee) || flatFee <= 0) {
    throw new Error("Flat fee must be greater than 0");
  }

  const minCount = toInteger(
    Math.round(input.requiredCourseCountMin),
    "Minimum course count",
  );
  const maxCount = toInteger(
    Math.round(input.requiredCourseCountMax),
    "Maximum course count",
  );
  if (minCount < 1) {
    throw new Error("Minimum course count must be at least 1");
  }
  if (maxCount < minCount) {
    throw new Error("Maximum course count must be greater than or equal to minimum course count");
  }

  const uniqueEligibleCourseIds = Array.from(
    new Set(input.eligibleCourseIds.map((courseId) => String(courseId))),
  ).map((courseId) => courseId as Id<"courses">);
  if (uniqueEligibleCourseIds.length === 0) {
    throw new Error("Select at least one eligible course");
  }
  if (uniqueEligibleCourseIds.length > MAX_ELIGIBLE_COURSES) {
    throw new Error(
      `Cannot target more than ${MAX_ELIGIBLE_COURSES} courses in one bundle campaign`,
    );
  }
  if (maxCount > uniqueEligibleCourseIds.length) {
    throw new Error("Maximum course count cannot exceed the number of eligible courses");
  }

  toInteger(Math.round(input.priority), "Priority");

  const startTimestamp = input.startDate
    ? new Date(input.startDate).getTime()
    : null;
  const endTimestamp = input.endDate ? new Date(input.endDate).getTime() : null;
  if (startTimestamp !== null && Number.isNaN(startTimestamp)) {
    throw new Error("Start date is invalid");
  }
  if (endTimestamp !== null && Number.isNaN(endTimestamp)) {
    throw new Error("End date is invalid");
  }
  if (
    startTimestamp !== null &&
    endTimestamp !== null &&
    startTimestamp > endTimestamp
  ) {
    throw new Error("End date must be on or after the start date");
  }

  return {
    name,
    description: normalizeString(input.description),
    flatFee,
    requiredCourseCountMin: minCount,
    requiredCourseCountMax: maxCount,
    eligibleCourseIds: uniqueEligibleCourseIds,
    priority: Math.round(input.priority),
    enabled: input.enabled,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
  };
}

export const listBundleCampaigns = query({
  args: {
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 100, 200);
    const scanLimit = args.search
      ? Math.min(Math.max(limit * 10, 500), 1500)
      : Math.min(Math.max(limit * 5, 200), 1000);

    let campaigns = args.includeArchived
      ? await ctx.db
          .query("bundleCampaigns")
          .withIndex("by_updatedAt")
          .order("desc")
          .take(scanLimit)
      : await ctx.db
          .query("bundleCampaigns")
          .withIndex("by_isArchived_updatedAt", (q) =>
            q.eq("isArchived", false),
          )
          .order("desc")
          .take(scanLimit);

    if (args.search) {
      const search = args.search.toLowerCase();
      campaigns = campaigns.filter((campaign) =>
        [campaign.name, campaign.description ?? ""].some((part) =>
          part.toLowerCase().includes(search),
        ),
      );
    }

    return campaigns.slice(0, limit);
  },
});

export const getBundleCampaignById = query({
  args: {
    campaignId: v.id("bundleCampaigns"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.campaignId);
  },
});

export const saveBundleCampaign = mutation({
  args: {
    campaignId: v.optional(v.id("bundleCampaigns")),
    ...bundleCampaignPayload,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const normalized = assertValidBundleCampaign(args);

    if (args.campaignId) {
      const existing = await ctx.db.get(args.campaignId);
      if (!existing) {
        throw new Error("Bundle campaign not found");
      }
      if (existing.isArchived && normalized.enabled) {
        throw new Error("Archived campaigns must be restored before they can be enabled");
      }

      await ctx.db.patch(args.campaignId, {
        ...normalized,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      const updated = await ctx.db.get(args.campaignId);

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "bundle_campaign.update",
        entityType: "bundleCampaign",
        entityId: String(args.campaignId),
        before: existing,
        after: updated,
      });

      return updated;
    }

    const campaignId = await ctx.db.insert("bundleCampaigns", {
      ...normalized,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      createdByAdminId: admin.userId,
      updatedByAdminId: admin.userId,
    });
    const created = await ctx.db.get(campaignId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "bundle_campaign.create",
      entityType: "bundleCampaign",
      entityId: String(campaignId),
      after: created,
    });

    return created;
  },
});

export const setBundleCampaignArchived = mutation({
  args: {
    campaignId: v.id("bundleCampaigns"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.campaignId);

    if (!existing) {
      throw new Error("Bundle campaign not found");
    }

    await ctx.db.patch(args.campaignId, {
      isArchived: args.isArchived,
      enabled: args.isArchived ? false : existing.enabled,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.campaignId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: args.isArchived
        ? "bundle_campaign.archive"
        : "bundle_campaign.restore",
      entityType: "bundleCampaign",
      entityId: String(args.campaignId),
      before: existing,
      after: updated,
    });

    return updated;
  },
});

export const setBundleCampaignEnabled = mutation({
  args: {
    campaignId: v.id("bundleCampaigns"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.campaignId);

    if (!existing) {
      throw new Error("Bundle campaign not found");
    }
    if (existing.isArchived && args.enabled) {
      throw new Error("Archived campaigns must be restored before they can be enabled");
    }

    await ctx.db.patch(args.campaignId, {
      enabled: args.enabled,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.campaignId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: args.enabled
        ? "bundle_campaign.enable"
        : "bundle_campaign.disable",
      entityType: "bundleCampaign",
      entityId: String(args.campaignId),
      before: existing,
      after: updated,
    });

    return updated;
  },
});
