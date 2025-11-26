import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get user's current Mind Points balance and summary
 */
export const getUserPoints = query({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.object({
    balance: v.number(),
    totalEarned: v.number(),
    totalRedeemed: v.number(),
  }),
  handler: async (ctx, args) => {
    const pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .first();

    if (!pointsRecord) {
      return {
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
      };
    }

    return {
      balance: pointsRecord.balance,
      totalEarned: pointsRecord.totalEarned,
      totalRedeemed: pointsRecord.totalRedeemed,
    };
  },
});

/**
 * Get user's points transaction history
 */
export const getPointsHistory = query({
  args: {
    clerkUserId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("pointsTransactions"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      type: v.union(v.literal("earn"), v.literal("redeem")),
      points: v.number(),
      description: v.string(),
      enrollmentId: v.optional(v.id("enrollments")),
      couponId: v.optional(v.id("coupons")),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("pointsTransactions")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

/**
 * Get user's active (unused) coupons
 */
export const getUserCoupons = query({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("coupons"),
      _creationTime: v.number(),
      code: v.string(),
      clerkUserId: v.string(),
      courseType: v.string(),
      discount: v.number(),
      isUsed: v.boolean(),
      pointsCost: v.number(),
      createdAt: v.number(),
      usedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .filter((q) => q.eq(q.field("isUsed"), false))
      .order("desc")
      .collect();

    return coupons;
  },
});

/**
 * Award points to a user after successful payment
 * This is called internally from checkout mutations
 */
export const awardPoints = mutation({
  args: {
    clerkUserId: v.string(),
    points: v.number(),
    description: v.string(),
    enrollmentId: v.optional(v.id("enrollments")),
  },
  returns: v.object({
    success: v.boolean(),
    newBalance: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (args.points <= 0) {
      return { success: false, error: "Points must be greater than 0" };
    }

    // Get or create points record
    let pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .first();

    if (!pointsRecord) {
      // Create new points record
      const newRecordId = await ctx.db.insert("mindPoints", {
        clerkUserId: args.clerkUserId,
        balance: args.points,
        totalEarned: args.points,
        totalRedeemed: 0,
      });

      // Create transaction record
      await ctx.db.insert("pointsTransactions", {
        clerkUserId: args.clerkUserId,
        type: "earn",
        points: args.points,
        description: args.description,
        enrollmentId: args.enrollmentId,
        createdAt: Date.now(),
      });

      return { success: true, newBalance: args.points };
    }

    // Atomic update: reload the record immediately before updating to prevent race conditions
    const currentRecord = await ctx.db.get(pointsRecord._id);
    if (!currentRecord) {
      return { success: false, error: "Points record not found" };
    }

    const newBalance = currentRecord.balance + args.points;
    const newTotalEarned = currentRecord.totalEarned + args.points;

    await ctx.db.patch(pointsRecord._id, {
      balance: newBalance,
      totalEarned: newTotalEarned,
    });

    // Create transaction record
    await ctx.db.insert("pointsTransactions", {
      clerkUserId: args.clerkUserId,
      type: "earn",
      points: args.points,
      description: args.description,
      enrollmentId: args.enrollmentId,
      createdAt: Date.now(),
    });

    return { success: true, newBalance };
  },
});

/**
 * Redeem points for a course type - generates a 100% discount coupon
 */
export const redeemPoints = mutation({
  args: {
    clerkUserId: v.string(),
    courseType: v.string(),
    pointsRequired: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    couponCode: v.optional(v.string()),
    couponId: v.optional(v.id("coupons")),
    newBalance: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (args.pointsRequired <= 0) {
      return { success: false, error: "Invalid points requirement" };
    }

    // Get user's points balance - reload immediately before checking to prevent race conditions
    const pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", args.clerkUserId),
      )
      .first();

    if (!pointsRecord) {
      return { success: false, error: "No points account found" };
    }

    // Reload the record immediately before updating to ensure we have the latest balance
    const currentRecord = await ctx.db.get(pointsRecord._id);
    if (!currentRecord) {
      return { success: false, error: "Points record not found" };
    }

    // Check balance with the freshly loaded record
    if (currentRecord.balance < args.pointsRequired) {
      return {
        success: false,
        error: `Insufficient points. You have ${currentRecord.balance} points, but need ${args.pointsRequired}`,
      };
    }

    // Generate unique coupon code using crypto.randomUUID() for better uniqueness
    const uuid = crypto.randomUUID().replace(/-/g, "").toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const couponCode = `MP-${uuid.substring(0, 8)}-${timestamp}`;

    // Create coupon
    const couponId = await ctx.db.insert("coupons", {
      code: couponCode,
      clerkUserId: args.clerkUserId,
      courseType: args.courseType,
      discount: 100, // 100% off
      isUsed: false,
      pointsCost: args.pointsRequired,
      createdAt: Date.now(),
    });

    // Deduct points using the current record's balance
    const newBalance = currentRecord.balance - args.pointsRequired;
    const newTotalRedeemed = currentRecord.totalRedeemed + args.pointsRequired;

    await ctx.db.patch(pointsRecord._id, {
      balance: newBalance,
      totalRedeemed: newTotalRedeemed,
    });

    // Create transaction record
    await ctx.db.insert("pointsTransactions", {
      clerkUserId: args.clerkUserId,
      type: "redeem",
      points: -args.pointsRequired,
      description: `Redeemed ${args.pointsRequired} points for ${args.courseType}`,
      couponId: couponId,
      createdAt: Date.now(),
    });

    return {
      success: true,
      couponCode,
      couponId,
      newBalance,
    };
  },
});

/**
 * Validate and get coupon details
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
    clerkUserId: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      valid: v.literal(false),
      error: v.string(),
    }),
    v.object({
      valid: v.literal(true),
      coupon: v.object({
        code: v.string(),
        courseType: v.string(),
        discount: v.number(),
        pointsCost: v.number(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (coupon.isUsed) {
      return { valid: false, error: "This coupon has already been used" };
    }

    // If clerkUserId is provided, verify it matches
    if (args.clerkUserId && coupon.clerkUserId !== args.clerkUserId) {
      return {
        valid: false,
        error: "This coupon does not belong to your account",
      };
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        courseType: coupon.courseType,
        discount: coupon.discount,
        pointsCost: coupon.pointsCost,
      },
    };
  },
});

/**
 * Mark a coupon as used after successful checkout
 */
export const markCouponUsed = mutation({
  args: {
    couponCode: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.couponCode))
      .first();

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    if (coupon.isUsed) {
      return { success: false, error: "Coupon already used" };
    }

    await ctx.db.patch(coupon._id, {
      isUsed: true,
      usedAt: Date.now(),
    });

    return { success: true };
  },
});

