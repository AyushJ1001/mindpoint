import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  buildLoyaltySearchFields,
  loyaltySearchFieldsChanged,
} from "./loyaltySearch";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
} from "./_shared/result";

const redeemPointsErrorValidator = v.object({
  _tag: v.literal("ConvexResultError"),
  code: v.union(
    v.literal(convexResultErrorCode.INSUFFICIENT_POINTS),
    v.literal(convexResultErrorCode.INVALID_POINTS_REQUIREMENT),
    v.literal(convexResultErrorCode.POINTS_ACCOUNT_NOT_FOUND),
    v.literal(convexResultErrorCode.POINTS_RECORD_NOT_FOUND),
  ),
  message: v.string(),
});

const redeemPointsResultValidator = v.union(
  v.object({
    _tag: v.literal("Failure"),
    error: redeemPointsErrorValidator,
    success: v.literal(false),
  }),
  v.object({
    _tag: v.literal("Success"),
    couponCode: v.string(),
    couponId: v.id("coupons"),
    newBalance: v.number(),
    success: v.literal(true),
  }),
);

const validateCouponErrorValidator = v.object({
  _tag: v.literal("ConvexResultError"),
  code: v.union(
    v.literal(convexResultErrorCode.COUPON_ALREADY_USED),
    v.literal(convexResultErrorCode.FORBIDDEN),
    v.literal(convexResultErrorCode.INVALID_COUPON_CODE),
  ),
  message: v.string(),
});

const validateCouponResultValidator = v.union(
  v.object({
    _tag: v.literal("Failure"),
    error: validateCouponErrorValidator,
    success: v.literal(false),
  }),
  v.object({
    _tag: v.literal("Success"),
    coupon: v.object({
      code: v.string(),
      courseType: v.string(),
      discount: v.number(),
      pointsCost: v.number(),
    }),
    success: v.literal(true),
  }),
);

const markCouponUsedErrorValidator = v.object({
  _tag: v.literal("ConvexResultError"),
  code: v.union(
    v.literal(convexResultErrorCode.COUPON_ALREADY_USED),
    v.literal(convexResultErrorCode.COUPON_NOT_FOUND),
    v.literal(convexResultErrorCode.FORBIDDEN),
  ),
  message: v.string(),
});

const markCouponUsedResultValidator = v.union(
  v.object({
    _tag: v.literal("Failure"),
    error: markCouponUsedErrorValidator,
    success: v.literal(false),
  }),
  v.object({
    _tag: v.literal("Success"),
    success: v.literal(true),
  }),
);

const awardPointsErrorValidator = v.object({
  _tag: v.literal("ConvexResultError"),
  code: v.union(
    v.literal(convexResultErrorCode.POINTS_RECORD_NOT_FOUND),
    v.literal(convexResultErrorCode.VALIDATION_ERROR),
  ),
  message: v.string(),
});

const awardPointsResultValidator = v.union(
  v.object({
    _tag: v.literal("Failure"),
    error: awardPointsErrorValidator,
    success: v.literal(false),
  }),
  v.object({
    _tag: v.literal("Success"),
    newBalance: v.number(),
    success: v.literal(true),
  }),
);

/**
 * Get user's current Mind Points balance and summary
 */
export const getUserPoints = query({
  args: {},
  returns: v.object({
    balance: v.number(),
    totalEarned: v.number(),
    totalRedeemed: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const transactions = await ctx.db
      .query("pointsTransactions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

/**
 * Get user's active (unused) coupons
 */
export const getUserCoupons = query({
  args: {},
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
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Use composite index for better performance
    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_clerkUserId_and_isUsed", (q) =>
        q.eq("clerkUserId", identity.subject).eq("isUsed", false),
      )
      .order("desc")
      .collect();

    return coupons;
  },
});

/**
 * Award points to a user after successful payment
 * This is server-only and should only be called from verified checkout flows.
 */
export const awardPoints = internalMutation({
  args: {
    clerkUserId: v.string(),
    points: v.number(),
    description: v.string(),
    enrollmentId: v.optional(v.id("enrollments")),
  },
  returns: awardPointsResultValidator,
  handler: async (ctx, args) => {
    if (args.points <= 0) {
      return convexFailure({
        code: convexResultErrorCode.VALIDATION_ERROR,
        message: "Points must be greater than 0",
      });
    }

    const enrollment = args.enrollmentId
      ? await ctx.db.get(args.enrollmentId)
      : null;
    const latestEnrollment =
      enrollment && enrollment.userId === args.clerkUserId
        ? enrollment
        : await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", args.clerkUserId))
            .order("desc")
            .first();
    const enrollmentProfile = latestEnrollment
      ? {
          userName: latestEnrollment.userName,
          userEmail: latestEnrollment.userEmail,
          userPhone: latestEnrollment.userPhone,
        }
      : null;

    // Get or create points record
    const pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!pointsRecord) {
      // Create new points record
      const profileFields = buildLoyaltySearchFields({
        clerkUserId: args.clerkUserId,
        userName: enrollmentProfile?.userName,
        userEmail: enrollmentProfile?.userEmail,
        userPhone: enrollmentProfile?.userPhone,
      });

      await ctx.db.insert("mindPoints", {
        clerkUserId: args.clerkUserId,
        balance: args.points,
        totalEarned: args.points,
        totalRedeemed: 0,
        ...profileFields,
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

      return convexSuccess({ newBalance: args.points });
    }

    // Atomic update: reload the record immediately before updating to prevent race conditions
    const currentRecord = await ctx.db.get(pointsRecord._id);
    if (!currentRecord) {
      return convexFailure({
        code: convexResultErrorCode.POINTS_RECORD_NOT_FOUND,
        message: "Points record not found",
      });
    }

    const newBalance = currentRecord.balance + args.points;
    const newTotalEarned = currentRecord.totalEarned + args.points;
    const profileFields = buildLoyaltySearchFields({
      clerkUserId: args.clerkUserId,
      userName: enrollmentProfile?.userName ?? currentRecord.userName,
      userEmail: enrollmentProfile?.userEmail ?? currentRecord.userEmail,
      userPhone: enrollmentProfile?.userPhone ?? currentRecord.userPhone,
    });

    await ctx.db.patch(pointsRecord._id, {
      balance: newBalance,
      totalEarned: newTotalEarned,
      ...(loyaltySearchFieldsChanged(currentRecord, profileFields)
        ? profileFields
        : {}),
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

    return convexSuccess({ newBalance });
  },
});

/**
 * Redeem points for a course type - generates a 100% discount coupon
 */
export const redeemPoints = mutation({
  args: {
    courseType: v.string(),
    pointsRequired: v.number(),
  },
  returns: redeemPointsResultValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const clerkUserId = identity.subject;

    if (args.pointsRequired <= 0) {
      return convexFailure({
        code: convexResultErrorCode.INVALID_POINTS_REQUIREMENT,
        message: "Invalid points requirement",
      });
    }

    // Get user's points balance - reload immediately before checking to prevent race conditions
    const pointsRecord = await ctx.db
      .query("mindPoints")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!pointsRecord) {
      return convexFailure({
        code: convexResultErrorCode.POINTS_ACCOUNT_NOT_FOUND,
        message: "No points account found",
      });
    }

    // Reload the record immediately before updating to ensure we have the latest balance
    const currentRecord = await ctx.db.get(pointsRecord._id);
    if (!currentRecord) {
      return convexFailure({
        code: convexResultErrorCode.POINTS_RECORD_NOT_FOUND,
        message: "Points record not found",
      });
    }

    // Check balance with the freshly loaded record
    if (currentRecord.balance < args.pointsRequired) {
      return convexFailure({
        code: convexResultErrorCode.INSUFFICIENT_POINTS,
        message: `Insufficient points. You have ${currentRecord.balance} points, but need ${args.pointsRequired}`,
      });
    }

    // Generate unique coupon code using crypto.randomUUID() for better uniqueness
    const uuid = crypto.randomUUID().replace(/-/g, "").toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const couponCode = `MP-${uuid.substring(0, 8)}-${timestamp}`;

    // Create coupon
    const couponId = await ctx.db.insert("coupons", {
      code: couponCode,
      clerkUserId,
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
      clerkUserId,
      type: "redeem",
      points: -args.pointsRequired,
      description: `Redeemed ${args.pointsRequired} points for ${args.courseType}`,
      couponId: couponId,
      createdAt: Date.now(),
    });

    return convexSuccess({
      couponCode,
      couponId,
      newBalance,
    });
  },
});

/**
 * Validate and get coupon details
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
  },
  returns: validateCouponResultValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!coupon) {
      return convexFailure({
        code: convexResultErrorCode.INVALID_COUPON_CODE,
        message: "Invalid coupon code",
      });
    }

    if (coupon.isUsed) {
      return convexFailure({
        code: convexResultErrorCode.COUPON_ALREADY_USED,
        message: "This coupon has already been used",
      });
    }

    if (coupon.clerkUserId !== identity.subject) {
      return convexFailure({
        code: convexResultErrorCode.FORBIDDEN,
        message: "This coupon does not belong to your account",
      });
    }

    return convexSuccess({
      coupon: {
        code: coupon.code,
        courseType: coupon.courseType,
        discount: coupon.discount,
        pointsCost: coupon.pointsCost,
      },
    });
  },
});

/**
 * Mark a coupon as used after successful checkout
 */
export const markCouponUsed = mutation({
  args: {
    couponCode: v.string(),
  },
  returns: markCouponUsedResultValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.couponCode))
      .first();

    if (!coupon) {
      return convexFailure({
        code: convexResultErrorCode.COUPON_NOT_FOUND,
        message: "Coupon not found",
      });
    }

    if (coupon.isUsed) {
      return convexFailure({
        code: convexResultErrorCode.COUPON_ALREADY_USED,
        message: "Coupon already used",
      });
    }

    if (coupon.clerkUserId !== identity.subject) {
      return convexFailure({
        code: convexResultErrorCode.FORBIDDEN,
        message: "Coupon does not belong to your account",
      });
    }

    await ctx.db.patch(coupon._id, {
      isUsed: true,
      usedAt: Date.now(),
    });

    return convexSuccess({});
  },
});

/**
 * Batch query for account summary - fetches points, history, and coupons in parallel
 * Reduces 3 separate subscriptions to 1
 */
export const getUserAccountSummary = query({
  args: {
    historyLimit: v.optional(v.number()),
  },
  returns: v.object({
    points: v.object({
      balance: v.number(),
      totalEarned: v.number(),
      totalRedeemed: v.number(),
    }),
    history: v.array(
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
    coupons: v.array(
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
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Run all queries in parallel
    const [pointsRecord, history, coupons] = await Promise.all([
      ctx.db
        .query("mindPoints")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", identity.subject),
        )
        .first(),
      ctx.db
        .query("pointsTransactions")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", identity.subject),
        )
        .order("desc")
        .take(args.historyLimit || 20),
      ctx.db
        .query("coupons")
        .withIndex("by_clerkUserId_and_isUsed", (q) =>
          q.eq("clerkUserId", identity.subject).eq("isUsed", false),
        )
        .order("desc")
        .collect(),
    ]);

    return {
      points: pointsRecord
        ? {
            balance: pointsRecord.balance,
            totalEarned: pointsRecord.totalEarned,
            totalRedeemed: pointsRecord.totalRedeemed,
          }
        : { balance: 0, totalEarned: 0, totalRedeemed: 0 },
      history,
      coupons,
    };
  },
});
