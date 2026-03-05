import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

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

    const enrollmentProfilePromises = new Map<
      string,
      Promise<{
        userName?: string;
        userEmail?: string;
        userPhone?: string;
        latestAt: number;
      } | null>
    >();

    const getEnrollmentProfile = (
      userId: string,
    ): Promise<{
      userName?: string;
      userEmail?: string;
      userPhone?: string;
      latestAt: number;
    } | null> => {
      const existing = enrollmentProfilePromises.get(userId);
      if (existing) return existing;

      const next = ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .first()
        .then((enrollment) =>
          enrollment
            ? {
                userName: enrollment.userName,
                userEmail: enrollment.userEmail,
                userPhone: enrollment.userPhone,
                latestAt: enrollment._creationTime,
              }
            : null,
        );

      enrollmentProfilePromises.set(userId, next);
      return next;
    };

    let visiblePointsRows = pointsRows.slice(0, limit);

    if (args.search) {
      const search = args.search.toLowerCase();
      const matchedRows: typeof pointsRows = [];

      for (const row of pointsRows) {
        if (row.clerkUserId.toLowerCase().includes(search)) {
          matchedRows.push(row);
          if (matchedRows.length >= limit) break;
          continue;
        }

        const profile = await getEnrollmentProfile(row.clerkUserId);
        const fields = [
          profile?.userName ?? "",
          profile?.userEmail ?? "",
          profile?.userPhone ?? "",
        ];

        if (fields.some((field) => field.toLowerCase().includes(search))) {
          matchedRows.push(row);
          if (matchedRows.length >= limit) break;
        }
      }

      visiblePointsRows = matchedRows;
    }

    const visibleProfiles = await Promise.all(
      visiblePointsRows.map((row) => getEnrollmentProfile(row.clerkUserId)),
    );

    const rows = visiblePointsRows.map((row, index) => ({
      ...row,
      profile: visibleProfiles[index],
    }));

    return rows;
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

      await ctx.db.insert("mindPoints", {
        clerkUserId: args.clerkUserId,
        balance: args.delta,
        totalEarned: args.delta,
        totalRedeemed: 0,
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
    courseType: v.string(),
    pointsCost: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (args.pointsCost < 0) {
      throw new Error("pointsCost cannot be negative");
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
      metadata: { reason: args.reason },
    });

    return created;
  },
});
