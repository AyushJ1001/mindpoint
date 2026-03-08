import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

const offerValue = v.object({
  name: v.string(),
  discount: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
});

const bogoValue = v.object({
  enabled: v.boolean(),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  label: v.optional(v.string()),
});

type OfferValue = {
  name: string;
  discount?: number;
  startDate?: string;
  endDate?: string;
};

type BogoValue = {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  label?: string;
};

const MAX_COURSES_PER_APPLY = 150;

function assertValidOffer(offer?: OfferValue | null) {
  if (
    offer?.discount !== undefined &&
    (!Number.isFinite(offer.discount) ||
      offer.discount < 0 ||
      offer.discount > 100)
  ) {
    throw new Error("Discount must be a number between 0 and 100");
  }
}

async function applyOffersToCourseIds(
  ctx: MutationCtx,
  args: {
    admin: { userId: string; email?: string };
    courseIds: Id<"courses">[];
    offer?: OfferValue | null;
    bogo?: BogoValue | null;
    source:
      | "direct"
      | {
          campaignId: Id<"offerCampaigns">;
          campaignName: string;
        };
  },
) {
  const uniqueCourseIds = Array.from(
    new Set(args.courseIds.map((courseId) => String(courseId))),
  ).map((value) => value as Id<"courses">);

  if (uniqueCourseIds.length === 0) {
    throw new Error("Select at least one course");
  }

  if (uniqueCourseIds.length > MAX_COURSES_PER_APPLY) {
    throw new Error(
      `Cannot apply offers to more than ${MAX_COURSES_PER_APPLY} courses at once`,
    );
  }

  if (args.offer === undefined && args.bogo === undefined) {
    throw new Error("Provide a discount offer, a BOGO campaign, or both");
  }

  assertValidOffer(args.offer);

  const now = Date.now();
  const updatedCourseIds: string[] = [];

  for (const courseId of uniqueCourseIds) {
    const existing = await ctx.db.get(courseId);

    if (!existing) {
      continue;
    }

    const patch = {
      ...(args.offer !== undefined
        ? { offer: args.offer === null ? undefined : args.offer }
        : {}),
      ...(args.bogo !== undefined
        ? { bogo: args.bogo === null ? undefined : args.bogo }
        : {}),
      updatedAt: now,
      updatedByAdminId: args.admin.userId,
    };

    await ctx.db.patch(courseId, patch);
    const updated = await ctx.db.get(courseId);

    await createAdminAuditLog(ctx, {
      actorAdminId: args.admin.userId,
      actorEmail: args.admin.email,
      action:
        args.source === "direct"
          ? "offer_manager.apply"
          : "offer_manager.apply_campaign",
      entityType: "course",
      entityId: String(courseId),
      before: existing,
      after: updated,
      metadata: {
        appliedOffer: args.offer === undefined ? "unchanged" : args.offer,
        appliedBogo: args.bogo === undefined ? "unchanged" : args.bogo,
        source:
          args.source === "direct"
            ? "builder"
            : {
                campaignId: String(args.source.campaignId),
                campaignName: args.source.campaignName,
              },
      },
    });

    updatedCourseIds.push(String(courseId));
  }

  if (args.source !== "direct") {
    await ctx.db.patch(args.source.campaignId, {
      lastAppliedAt: now,
      lastAppliedCourseIds: uniqueCourseIds,
      updatedAt: now,
      updatedByAdminId: args.admin.userId,
    });
  }

  return {
    updatedCount: updatedCourseIds.length,
    courseIds: updatedCourseIds,
  };
}

export const listCampaigns = query({
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
          .query("offerCampaigns")
          .withIndex("by_updatedAt")
          .order("desc")
          .take(scanLimit)
      : await ctx.db
          .query("offerCampaigns")
          .withIndex("by_isArchived_updatedAt", (q) =>
            q.eq("isArchived", false),
          )
          .order("desc")
          .take(scanLimit);

    if (args.search) {
      const search = args.search.toLowerCase();
      campaigns = campaigns.filter((campaign) =>
        [
          campaign.name,
          campaign.description ?? "",
          campaign.offer?.name ?? "",
          campaign.bogo?.label ?? "",
        ].some((part) => part.toLowerCase().includes(search)),
      );
    }

    return campaigns.slice(0, limit);
  },
});

export const saveCampaign = mutation({
  args: {
    campaignId: v.optional(v.id("offerCampaigns")),
    name: v.string(),
    description: v.optional(v.string()),
    offer: v.optional(v.union(v.null(), offerValue)),
    bogo: v.optional(v.union(v.null(), bogoValue)),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const name = args.name.trim();

    if (!name) {
      throw new Error("Campaign name is required");
    }

    const offer = args.offer === null ? undefined : args.offer;
    const bogo = args.bogo === null ? undefined : args.bogo;

    if (!offer && !bogo) {
      throw new Error(
        "A campaign must include a discount offer, a BOGO campaign, or both",
      );
    }

    assertValidOffer(offer);

    const now = Date.now();

    if (args.campaignId) {
      const existing = await ctx.db.get(args.campaignId);
      if (!existing) {
        throw new Error("Campaign not found");
      }

      await ctx.db.patch(args.campaignId, {
        name,
        description: args.description?.trim() || undefined,
        offer,
        bogo,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });

      const updated = await ctx.db.get(args.campaignId);

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "offer_campaign.update",
        entityType: "offerCampaign",
        entityId: String(args.campaignId),
        before: existing,
        after: updated,
      });

      return updated;
    }

    const campaignId = await ctx.db.insert("offerCampaigns", {
      name,
      description: args.description?.trim() || undefined,
      offer,
      bogo,
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
      action: "offer_campaign.create",
      entityType: "offerCampaign",
      entityId: String(campaignId),
      after: created,
    });

    return created;
  },
});

export const setCampaignArchived = mutation({
  args: {
    campaignId: v.id("offerCampaigns"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.campaignId);

    if (!existing) {
      throw new Error("Campaign not found");
    }

    await ctx.db.patch(args.campaignId, {
      isArchived: args.isArchived,
      updatedAt: Date.now(),
      updatedByAdminId: admin.userId,
    });
    const updated = await ctx.db.get(args.campaignId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: args.isArchived
        ? "offer_campaign.archive"
        : "offer_campaign.restore",
      entityType: "offerCampaign",
      entityId: String(args.campaignId),
      before: existing,
      after: updated,
    });

    return updated;
  },
});

export const applyOffersToCourses = mutation({
  args: {
    courseIds: v.array(v.id("courses")),
    offer: v.optional(v.union(v.null(), offerValue)),
    bogo: v.optional(v.union(v.null(), bogoValue)),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    return await applyOffersToCourseIds(ctx, {
      admin,
      courseIds: args.courseIds,
      offer: args.offer,
      bogo: args.bogo,
      source: "direct",
    });
  },
});

export const applyCampaignToCourses = mutation({
  args: {
    campaignId: v.id("offerCampaigns"),
    courseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const campaign = await ctx.db.get(args.campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.isArchived) {
      throw new Error("Archived campaigns cannot be applied");
    }

    return await applyOffersToCourseIds(ctx, {
      admin,
      courseIds: args.courseIds,
      offer: campaign.offer,
      bogo: campaign.bogo,
      source: {
        campaignId: campaign._id,
        campaignName: campaign.name,
      },
    });
  },
});
