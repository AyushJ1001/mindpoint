import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

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

type AdminBundleFailure = ConvexFailure<
  "CONFLICT" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

type ValidBundleCampaign = {
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

function adminBundleFailure(
  message: string,
  code:
    | "CONFLICT"
    | "NOT_FOUND"
    | "VALIDATION_ERROR" = convexResultErrorCode.VALIDATION_ERROR,
): AdminBundleFailure {
  return convexFailure({ code, message });
}

function normalizeString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function toInteger(value: number, field: string): number | AdminBundleFailure {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return adminBundleFailure(`${field} must be an integer`);
  }

  return value;
}

function normalizeBundleCampaign(
  input: BundleCampaignInput,
): AdminBundleFailure | ValidBundleCampaign {
  const name = normalizeString(input.name);
  if (!name) {
    return adminBundleFailure("Campaign name is required");
  }

  const flatFee = Math.round(input.flatFee);
  if (!Number.isFinite(flatFee) || flatFee <= 0) {
    return adminBundleFailure("Flat fee must be greater than 0");
  }

  const minCount = toInteger(
    Math.round(input.requiredCourseCountMin),
    "Minimum course count",
  );
  if (typeof minCount !== "number") {
    return minCount;
  }

  const maxCount = toInteger(
    Math.round(input.requiredCourseCountMax),
    "Maximum course count",
  );
  if (typeof maxCount !== "number") {
    return maxCount;
  }

  if (minCount < 1) {
    return adminBundleFailure("Minimum course count must be at least 1");
  }
  if (maxCount < minCount) {
    return adminBundleFailure(
      "Maximum course count must be greater than or equal to minimum course count",
    );
  }

  const uniqueEligibleCourseIds = Array.from(
    new Set(input.eligibleCourseIds.map((courseId) => String(courseId))),
  ).map((courseId) => courseId as Id<"courses">);
  if (uniqueEligibleCourseIds.length === 0) {
    return adminBundleFailure("Select at least one eligible course");
  }
  if (uniqueEligibleCourseIds.length > MAX_ELIGIBLE_COURSES) {
    return adminBundleFailure(
      `Cannot target more than ${MAX_ELIGIBLE_COURSES} courses in one bundle campaign`,
    );
  }
  if (maxCount > uniqueEligibleCourseIds.length) {
    return adminBundleFailure(
      "Maximum course count cannot exceed the number of eligible courses",
    );
  }

  const priority = toInteger(Math.round(input.priority), "Priority");
  if (typeof priority !== "number") {
    return priority;
  }

  const startTimestamp = input.startDate
    ? new Date(input.startDate).getTime()
    : null;
  const endTimestamp = input.endDate ? new Date(input.endDate).getTime() : null;
  if (startTimestamp !== null && Number.isNaN(startTimestamp)) {
    return adminBundleFailure("Start date is invalid");
  }
  if (endTimestamp !== null && Number.isNaN(endTimestamp)) {
    return adminBundleFailure("End date is invalid");
  }
  if (
    startTimestamp !== null &&
    endTimestamp !== null &&
    startTimestamp > endTimestamp
  ) {
    return adminBundleFailure("End date must be on or after the start date");
  }

  return {
    name,
    description: normalizeString(input.description),
    flatFee,
    requiredCourseCountMin: minCount,
    requiredCourseCountMax: maxCount,
    eligibleCourseIds: uniqueEligibleCourseIds,
    priority,
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
    const normalized = normalizeBundleCampaign(args);
    if ("_tag" in normalized) {
      return normalized;
    }

    if (args.campaignId) {
      const existing = await ctx.db.get(args.campaignId);
      if (!existing) {
        return adminBundleFailure(
          "Bundle campaign not found",
          convexResultErrorCode.NOT_FOUND,
        );
      }
      if (existing.isArchived && normalized.enabled) {
        return adminBundleFailure(
          "Archived campaigns must be restored before they can be enabled",
          convexResultErrorCode.CONFLICT,
        );
      }

      await ctx.db.patch(args.campaignId, {
        ...normalized,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      const updated = await ctx.db.get(args.campaignId);
      if (!updated) {
        return adminBundleFailure(
          "Bundle campaign could not be reloaded",
          convexResultErrorCode.NOT_FOUND,
        );
      }

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "bundle_campaign.update",
        entityType: "bundleCampaign",
        entityId: String(args.campaignId),
        before: existing,
        after: updated,
      });

      return convexSuccess({ campaign: updated });
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
    if (!created) {
      return adminBundleFailure(
        "Bundle campaign could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "bundle_campaign.create",
      entityType: "bundleCampaign",
      entityId: String(campaignId),
      after: created,
    });

    return convexSuccess({ campaign: created });
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
      return adminBundleFailure(
        "Bundle campaign not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await ctx.db.patch(args.campaignId, {
      isArchived: args.isArchived,
      enabled: args.isArchived ? false : existing.enabled,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.campaignId);
    if (!updated) {
      return adminBundleFailure(
        "Bundle campaign could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

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

    return convexSuccess({ campaign: updated });
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
      return adminBundleFailure(
        "Bundle campaign not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }
    if (existing.isArchived && args.enabled) {
      return adminBundleFailure(
        "Archived campaigns must be restored before they can be enabled",
        convexResultErrorCode.CONFLICT,
      );
    }

    await ctx.db.patch(args.campaignId, {
      enabled: args.enabled,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.campaignId);
    if (!updated) {
      return adminBundleFailure(
        "Bundle campaign could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

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

    return convexSuccess({ campaign: updated });
  },
});
