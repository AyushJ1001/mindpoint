import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { roundCurrency } from "./enrollment";
import { convexFailure, type ConvexFailure } from "./result";

export type CheckoutPricingItem = {
  courseId: Id<"courses">;
  batchId?: Id<"courseBatches">;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
  bundleCampaignId?: Id<"bundleCampaigns">;
  bundleCampaignName?: string;
};

export type CheckoutPricing = {
  totalAmountPaid: number;
  items: CheckoutPricingItem[];
};

export type EnrollmentLineItem = {
  courseId: Id<"courses">;
  batchId?: Id<"courseBatches">;
};

export type CheckoutPricingFailure = ConvexFailure<
  | "CONFLICT"
  | "COUPON_ALREADY_USED"
  | "FORBIDDEN"
  | "INVALID_COUPON_CODE"
  | "INVALID_POINTS_REQUIREMENT"
  | "VALIDATION_ERROR"
>;

type ValidateCheckoutPricingItemOptions = {
  consumeCoupon?: boolean;
};

export const checkoutPricingItemValidator = v.object({
  courseId: v.id("courses"),
  batchId: v.optional(v.id("courseBatches")),
  listedPrice: v.number(),
  checkoutPrice: v.number(),
  amountPaid: v.number(),
  redemptionDiscountAmount: v.optional(v.number()),
  couponCode: v.optional(v.string()),
  mindPointsRedeemed: v.optional(v.number()),
  bundleCampaignId: v.optional(v.id("bundleCampaigns")),
  bundleCampaignName: v.optional(v.string()),
});

export const checkoutPricingValidator = v.object({
  totalAmountPaid: v.number(),
  items: v.array(checkoutPricingItemValidator),
});

export const enrollmentLineItemValidator = v.object({
  courseId: v.id("courses"),
  batchId: v.optional(v.id("courseBatches")),
});

export function getCheckoutPricingItem(
  checkoutPricing: CheckoutPricing | undefined,
  courseId: Id<"courses">,
  batchId?: Id<"courseBatches">,
): CheckoutPricingItem | undefined {
  return (
    checkoutPricing?.items.find(
      (item) =>
        String(item.courseId) === String(courseId) &&
        (batchId ? String(item.batchId) === String(batchId) : true),
    ) ??
    checkoutPricing?.items.find(
      (item) =>
        String(item.courseId) === String(courseId) &&
        item.batchId === undefined,
    )
  );
}

export function buildEnrollmentPricingFields(
  course: Doc<"courses">,
  pricingItem?: CheckoutPricingItem,
) {
  const listedPrice = roundCurrency(pricingItem?.listedPrice ?? course.price);
  const checkoutPrice = roundCurrency(
    pricingItem?.checkoutPrice ?? course.price ?? listedPrice,
  );
  const amountPaid = roundCurrency(
    pricingItem?.amountPaid ?? pricingItem?.checkoutPrice ?? course.price,
  );
  const redemptionDiscountAmount = roundCurrency(
    pricingItem?.redemptionDiscountAmount ??
      Math.max(0, checkoutPrice - amountPaid),
  );

  return {
    listedPrice,
    checkoutPrice,
    amountPaid,
    redemptionDiscountAmount:
      redemptionDiscountAmount > 0 ? redemptionDiscountAmount : undefined,
    couponCode: pricingItem?.couponCode?.trim() || undefined,
    mindPointsRedeemed:
      pricingItem?.mindPointsRedeemed && pricingItem.mindPointsRedeemed > 0
        ? roundCurrency(pricingItem.mindPointsRedeemed)
        : undefined,
    bundleCampaignId: pricingItem?.bundleCampaignId,
    bundleCampaignName: pricingItem?.bundleCampaignName?.trim() || undefined,
  };
}

function checkoutPricingFailure(
  code: CheckoutPricingFailure["error"]["code"],
  message: string,
  details?: CheckoutPricingFailure["error"]["details"],
): CheckoutPricingFailure {
  return convexFailure({
    code,
    ...(details !== undefined ? { details } : {}),
    message,
  });
}

export async function validateCheckoutPricingItemResult(
  ctx: MutationCtx,
  args: {
    userId: string;
    course: Doc<"courses">;
    pricingItem?: CheckoutPricingItem;
  },
  options: ValidateCheckoutPricingItemOptions = {},
): Promise<CheckoutPricingFailure | null> {
  const pricingItem = args.pricingItem;
  if (!pricingItem) {
    return null;
  }

  const checkoutPrice = roundCurrency(
    pricingItem.checkoutPrice ?? args.course.price,
  );
  const amountPaid = roundCurrency(pricingItem.amountPaid ?? checkoutPrice);
  if (amountPaid > checkoutPrice) {
    return checkoutPricingFailure(
      "VALIDATION_ERROR",
      "Amount paid cannot exceed checkout price.",
      {
        amountPaid,
        checkoutPrice,
        courseId: args.course._id,
      },
    );
  }

  const couponCode = pricingItem.couponCode?.trim();
  if (!couponCode && amountPaid === 0 && checkoutPrice > 0) {
    return checkoutPricingFailure(
      "VALIDATION_ERROR",
      "Free checkout requires a valid coupon.",
      {
        checkoutPrice,
        courseId: args.course._id,
      },
    );
  }

  if (!couponCode) {
    return null;
  }

  const coupon = await ctx.db
    .query("coupons")
    .withIndex("by_code", (q) => q.eq("code", couponCode))
    .first();

  if (!coupon) {
    const adminCoupon = await ctx.db
      .query("adminCoupons")
      .withIndex("by_code", (q) => q.eq("code", couponCode.toUpperCase()))
      .first();

    if (!adminCoupon) {
      return checkoutPricingFailure(
        "INVALID_COUPON_CODE",
        "Invalid coupon code.",
        {
          couponCode,
          courseId: args.course._id,
        },
      );
    }

    if (
      !adminCoupon.enabled ||
      adminCoupon.isArchived ||
      (adminCoupon.startDate &&
        Date.now() < new Date(adminCoupon.startDate).getTime()) ||
      (adminCoupon.endDate &&
        Date.now() > new Date(adminCoupon.endDate).getTime()) ||
      (adminCoupon.redemptionLimit !== undefined &&
        adminCoupon.redemptionLimit > 0 &&
        adminCoupon.totalRedemptions >= adminCoupon.redemptionLimit)
    ) {
      return checkoutPricingFailure(
        "INVALID_COUPON_CODE",
        "This coupon is no longer active.",
        {
          couponCode,
          courseId: args.course._id,
        },
      );
    }

    const appliesToCourse =
      adminCoupon.appliesTo.type === "cart" ||
      (adminCoupon.appliesTo.type === "courses" &&
        adminCoupon.appliesTo.courseIds.some(
          (courseId) => String(courseId) === String(args.course._id),
        )) ||
      (adminCoupon.appliesTo.type === "courseTypes" &&
        !!args.course.type &&
        adminCoupon.appliesTo.courseTypes.includes(args.course.type));

    if (!appliesToCourse) {
      return checkoutPricingFailure(
        "INVALID_COUPON_CODE",
        "This coupon is not valid for this course.",
        {
          couponCode,
          courseId: args.course._id,
        },
      );
    }

    if (amountPaid === checkoutPrice) {
      return checkoutPricingFailure(
        "CONFLICT",
        "Coupon pricing does not include a discount.",
        {
          amountPaid,
          checkoutPrice,
          couponCode,
          courseId: args.course._id,
        },
      );
    }

    if (options.consumeCoupon ?? true) {
      await ctx.db.patch(adminCoupon._id, {
        totalRedemptions: adminCoupon.totalRedemptions + 1,
        updatedAt: Date.now(),
      });
    }

    return null;
  }
  if (coupon.isUsed) {
    return checkoutPricingFailure(
      "COUPON_ALREADY_USED",
      "This coupon has already been used.",
      {
        couponCode,
        couponId: coupon._id,
      },
    );
  }
  if (coupon.clerkUserId !== args.userId) {
    return checkoutPricingFailure(
      "FORBIDDEN",
      "This coupon does not belong to this user.",
      {
        couponCode,
        couponId: coupon._id,
        courseId: args.course._id,
      },
    );
  }
  if (coupon.courseType !== args.course.type) {
    return checkoutPricingFailure(
      "INVALID_COUPON_CODE",
      "This coupon is not valid for this course type.",
      {
        couponCode,
        couponCourseType: coupon.courseType,
        courseId: args.course._id,
        courseType: args.course.type,
      },
    );
  }

  const expectedDiscountAmount = Math.min(
    checkoutPrice,
    Math.round(checkoutPrice * (coupon.discount / 100)),
  );
  const expectedAmountPaid = Math.max(
    0,
    checkoutPrice - expectedDiscountAmount,
  );
  const redemptionDiscountAmount = roundCurrency(
    pricingItem.redemptionDiscountAmount,
  );
  const mindPointsRedeemed = roundCurrency(pricingItem.mindPointsRedeemed);

  if (
    redemptionDiscountAmount !== expectedDiscountAmount ||
    amountPaid !== expectedAmountPaid
  ) {
    return checkoutPricingFailure(
      "CONFLICT",
      "Coupon pricing does not match the coupon discount.",
      {
        amountPaid,
        couponCode,
        couponId: coupon._id,
        expectedAmountPaid,
        expectedDiscountAmount,
        redemptionDiscountAmount,
      },
    );
  }

  if (mindPointsRedeemed > 0 && mindPointsRedeemed !== coupon.pointsCost) {
    return checkoutPricingFailure(
      "INVALID_POINTS_REQUIREMENT",
      "Mind Points redeemed does not match the coupon cost.",
      {
        couponCode,
        couponId: coupon._id,
        expectedPointsCost: coupon.pointsCost,
        mindPointsRedeemed,
      },
    );
  }

  if (options.consumeCoupon ?? true) {
    await ctx.db.patch(coupon._id, {
      isUsed: true,
      usedAt: Date.now(),
    });
  }

  return null;
}
