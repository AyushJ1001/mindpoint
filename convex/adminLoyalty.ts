import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import { CourseType } from "./schema";
import {
  buildLoyaltySearchFields,
  loyaltySearchFieldsChanged,
  loyaltySearchMatches,
} from "./loyaltySearch";

const MAX_POINTS_DELTA = 100_000;

function generateCouponCode() {
  const uuid = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `MPA-${uuid.substring(0, 8)}-${timestamp}`;
}

export const listLoyaltyAccounts = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);
    const scanLimit = Math.min(Math.max(limit * 5, 500), 5000);
    const pointsRows = await ctx.db
      .query("mindPoints")
      .order("desc")
      .take(scanLimit);
    const filteredRows = args.search
      ? pointsRows.filter((row) => loyaltySearchMatches(row, args.search))
      : pointsRows;
    const visiblePointsRows = filteredRows.slice(0, limit);

    return visiblePointsRows.map((row) => ({
      ...row,
      profile:
        row.userName || row.userEmail || row.userPhone
          ? {
              userName: row.userName,
              userEmail: row.userEmail,
              userPhone: row.userPhone,
              latestAt: row._creationTime,
            }
          : null,
    }));
  },
});

export const backfillLoyaltySearchFields = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 100, 100);
    const pointsRows = await ctx.db
      .query("mindPoints")
      .order("desc")
      .take(limit);
    let updated = 0;

    for (const row of pointsRows) {
      const latestEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", row.clerkUserId))
        .order("desc")
        .first();

      if (!latestEnrollment) {
        continue;
      }

      const patch = buildLoyaltySearchFields({
        clerkUserId: row.clerkUserId,
        userName: row.userName ?? latestEnrollment.userName,
        userEmail: row.userEmail ?? latestEnrollment.userEmail,
        userPhone: row.userPhone ?? latestEnrollment.userPhone,
      });

      if (!loyaltySearchFieldsChanged(row, patch)) {
        continue;
      }

      await ctx.db.patch(row._id, patch);
      updated += 1;
    }

    return {
      scanned: pointsRows.length,
      updated,
    };
  },
});

export const getLoyaltyDetail = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const [
      points,
      transactions,
      coupons,
      referralsAsReferrer,
      referralsAsReferred,
    ] = await Promise.all([
      ctx.db
        .query("mindPoints")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId),
        )
        .first(),
      ctx.db
        .query("pointsTransactions")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId),
        )
        .order("desc")
        .take(200),
      ctx.db
        .query("coupons")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId),
        )
        .order("desc")
        .take(200),
      ctx.db
        .query("referralRewards")
        .withIndex("by_referrerClerkUserId", (q) =>
          q.eq("referrerClerkUserId", args.clerkUserId),
        )
        .order("desc")
        .take(200),
      ctx.db
        .query("referralRewards")
        .withIndex("by_referredClerkUserId", (q) =>
          q.eq("referredClerkUserId", args.clerkUserId),
        )
        .order("desc")
        .take(200),
    ]);

    return {
      points,
      transactions,
      coupons,
      referralsAsReferrer,
      referralsAsReferred,
    };
  },
});

export const adjustPoints = mutation({
  args: {
    clerkUserId: v.string(),
    delta: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (args.delta === 0) {
      throw new Error("Delta cannot be 0");
    }

    if (Math.abs(args.delta) > MAX_POINTS_DELTA) {
      throw new Error(
        `Adjustment exceeds maximum allowed delta of ${MAX_POINTS_DELTA}`,
      );
    }

    const existing = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const before = existing;
    const now = Date.now();

    if (!existing) {
      if (args.delta < 0) {
        throw new Error(
          "Cannot deduct points from a user with no points record",
        );
      }

      const latestEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
        .order("desc")
        .first();
      const profileFields = buildLoyaltySearchFields({
        clerkUserId: args.clerkUserId,
        userName: latestEnrollment?.userName,
        userEmail: latestEnrollment?.userEmail,
        userPhone: latestEnrollment?.userPhone,
      });

      await ctx.db.insert("mindPoints", {
        clerkUserId: args.clerkUserId,
        balance: args.delta,
        totalEarned: args.delta,
        totalRedeemed: 0,
        ...profileFields,
      });

      await ctx.db.insert("pointsTransactions", {
        clerkUserId: args.clerkUserId,
        type: "earn",
        points: args.delta,
        description: `Admin adjustment: ${args.reason}`,
        createdAt: now,
      });
    } else {
      const newBalance = existing.balance + args.delta;
      if (newBalance < 0) {
        throw new Error("Point balance cannot become negative");
      }

      const latestEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
        .order("desc")
        .first();
      const profileFields = buildLoyaltySearchFields({
        clerkUserId: args.clerkUserId,
        userName: latestEnrollment?.userName ?? existing.userName,
        userEmail: latestEnrollment?.userEmail ?? existing.userEmail,
        userPhone: latestEnrollment?.userPhone ?? existing.userPhone,
      });

      await ctx.db.patch(existing._id, {
        balance: newBalance,
        totalEarned:
          args.delta > 0
            ? existing.totalEarned + args.delta
            : existing.totalEarned,
        totalRedeemed:
          args.delta < 0
            ? existing.totalRedeemed + Math.abs(args.delta)
            : existing.totalRedeemed,
        ...(loyaltySearchFieldsChanged(existing, profileFields)
          ? profileFields
          : {}),
      });

      await ctx.db.insert("pointsTransactions", {
        clerkUserId: args.clerkUserId,
        type: args.delta > 0 ? "earn" : "redeem",
        points: args.delta,
        description: `Admin adjustment: ${args.reason}`,
        createdAt: now,
      });
    }

    const after = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "loyalty.adjust_points",
      entityType: "mindPoints",
      entityId: args.clerkUserId,
      before,
      after,
      metadata: { delta: args.delta, reason: args.reason },
    });

    return after;
  },
});

export const createManualCoupon = mutation({
  args: {
    clerkUserId: v.string(),
    courseType: CourseType,
    pointsCost: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (args.pointsCost < 0) {
      throw new Error("pointsCost cannot be negative");
    }

    let beforePoints = null;
    let afterPoints = null;

    if (args.pointsCost > 0) {
      const existingPoints = await ctx.db
        .query("mindPoints")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId),
        )
        .first();

      if (!existingPoints || existingPoints.balance < args.pointsCost) {
        throw new Error("User does not have enough points for this coupon");
      }

      beforePoints = existingPoints;

      await ctx.db.patch(existingPoints._id, {
        balance: existingPoints.balance - args.pointsCost,
        totalRedeemed: existingPoints.totalRedeemed + args.pointsCost,
      });

      await ctx.db.insert("pointsTransactions", {
        clerkUserId: args.clerkUserId,
        type: "redeem",
        points: -args.pointsCost,
        description: `Admin coupon redemption: ${args.reason}`,
        createdAt: Date.now(),
      });

      afterPoints = await ctx.db
        .query("mindPoints")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId),
        )
        .first();
    }

    const couponId = await ctx.db.insert("coupons", {
      code: generateCouponCode(),
      clerkUserId: args.clerkUserId,
      courseType: args.courseType,
      discount: 100,
      isUsed: false,
      pointsCost: args.pointsCost,
      createdAt: Date.now(),
    });

    const created = await ctx.db.get(couponId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "loyalty.create_coupon",
      entityType: "coupon",
      entityId: String(couponId),
      after: created,
      metadata: {
        reason: args.reason,
        pointsCost: args.pointsCost,
        pointsBefore: beforePoints,
        pointsAfter: afterPoints,
      },
    });

    return created;
  },
});
