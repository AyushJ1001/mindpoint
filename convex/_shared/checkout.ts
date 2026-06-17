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
  cartCourses?: Array<Pick<Doc<"courses">, "_id" | "type">>;
  consumeCoupon?: boolean;
  consumedAdminCouponCodes?: Set<string>;
  remainingAdminCouponDiscountByCode?: Map<string, number>;
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

function expectedAdminCouponDiscountForLine(args: {
  coupon: Doc<"adminCoupons">;
  checkoutPrice: number;
  remainingDiscount?: number;
}) {
  const checkoutPrice = roundCurrency(args.checkoutPrice);
  if (checkoutPrice <= 0) {
    return 0;
  }

  const remainingDiscount =
    args.remainingDiscount === undefined
      ? Number.POSITIVE_INFINITY
      : roundCurrency(args.remainingDiscount);

  if (remainingDiscount <= 0) {
    return 0;
  }

  const discount = args.coupon.discount;
  if (discount.type === "free") {
    return Math.min(checkoutPrice, remainingDiscount);
  }

  if (discount.type === "flat") {
    return Math.min(
      checkoutPrice,
      roundCurrency(discount.value),
      remainingDiscount,
    );
  }

  const percentageDiscount = Math.min(
    checkoutPrice,
    Math.round(checkoutPrice * (discount.value / 100)),
  );
  const cappedPercentageDiscount =
    discount.maxDiscount === undefined
      ? percentageDiscount
      : Math.min(percentageDiscount, roundCurrency(discount.maxDiscount));

  return Math.min(cappedPercentageDiscount, remainingDiscount);
}

function adminCouponUsesSharedDiscountBudget(coupon: Doc<"adminCoupons">) {
  return (
    coupon.discount.type === "flat" ||
    coupon.discount.type === "free" ||
    (coupon.discount.type === "percentage" &&
      coupon.discount.maxDiscount !== undefined)
  );
}

function initialAdminCouponDiscountBudget(
  coupon: Doc<"adminCoupons">,
  checkoutPrice: number,
) {
  if (coupon.discount.type === "flat") {
    return roundCurrency(coupon.discount.value);
  }

  if (coupon.discount.type === "free") {
    return roundCurrency(checkoutPrice);
  }

  return roundCurrency(coupon.discount.maxDiscount);
}

function adminCouponRequirementsSatisfied(
  coupon: Doc<"adminCoupons">,
  cartCourses: Array<Pick<Doc<"courses">, "_id" | "type">> | undefined,
) {
  const requires = coupon.requires;
  if (requires.type === "none") {
    return true;
  }

  if (!cartCourses || cartCourses.length === 0) {
    return false;
  }

  if (requires.type === "courses") {
    const cartCourseIds = new Set(
      cartCourses.map((course) => String(course._id)),
    );
    return requires.courseIds.some((courseId) =>
      cartCourseIds.has(String(courseId)),
    );
  }

  const cartCourseTypes = new Set(
    cartCourses.map((course) => course.type).filter(Boolean),
  );
  return requires.courseTypes.some((courseType) =>
    cartCourseTypes.has(courseType),
  );
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

    const normalizedAdminCouponCode = adminCoupon.code.toUpperCase();
    const adminCouponAlreadyConsumed =
      options.consumedAdminCouponCodes?.has(normalizedAdminCouponCode) ?? false;

    if (
      !adminCoupon.enabled ||
      adminCoupon.isArchived ||
      (adminCoupon.startDate &&
        Date.now() < new Date(adminCoupon.startDate).getTime()) ||
      (adminCoupon.endDate &&
        Date.now() > new Date(adminCoupon.endDate).getTime()) ||
      (!adminCouponAlreadyConsumed &&
        adminCoupon.redemptionLimit !== undefined &&
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

    if (!adminCouponRequirementsSatisfied(adminCoupon, options.cartCourses)) {
      return checkoutPricingFailure(
        "INVALID_COUPON_CODE",
        "This coupon is not valid for the current cart.",
        {
          couponCode,
          courseId: args.course._id,
        },
      );
    }

    const redemptionDiscountAmount = roundCurrency(
      pricingItem.redemptionDiscountAmount,
    );
    const usesSharedDiscountBudget =
      adminCouponUsesSharedDiscountBudget(adminCoupon);
    let remainingAdminCouponDiscount = usesSharedDiscountBudget
      ? options.remainingAdminCouponDiscountByCode?.get(
          normalizedAdminCouponCode,
        )
      : undefined;
    if (
      usesSharedDiscountBudget &&
      options.remainingAdminCouponDiscountByCode &&
      remainingAdminCouponDiscount === undefined
    ) {
      remainingAdminCouponDiscount = initialAdminCouponDiscountBudget(
        adminCoupon,
        checkoutPrice,
      );
      options.remainingAdminCouponDiscountByCode.set(
        normalizedAdminCouponCode,
        remainingAdminCouponDiscount,
      );
    }
    const expectedDiscountAmount = expectedAdminCouponDiscountForLine({
      coupon: adminCoupon,
      checkoutPrice,
      remainingDiscount: remainingAdminCouponDiscount,
    });
    const expectedAmountPaid = Math.max(
      0,
      checkoutPrice - expectedDiscountAmount,
    );

    if (
      expectedDiscountAmount <= 0 ||
      redemptionDiscountAmount !== expectedDiscountAmount ||
      amountPaid !== expectedAmountPaid
    ) {
      return checkoutPricingFailure(
        "CONFLICT",
        "Coupon pricing does not match the coupon discount.",
        {
          amountPaid,
          checkoutPrice,
          couponCode,
          expectedAmountPaid,
          expectedDiscountAmount,
          redemptionDiscountAmount,
          courseId: args.course._id,
        },
      );
    }

    if (
      usesSharedDiscountBudget &&
      options.remainingAdminCouponDiscountByCode
    ) {
      options.remainingAdminCouponDiscountByCode.set(
        normalizedAdminCouponCode,
        Math.max(
          0,
          (remainingAdminCouponDiscount ?? 0) - expectedDiscountAmount,
        ),
      );
    }

    const shouldConsumeAdminCoupon =
      (options.consumeCoupon ?? true) && !adminCouponAlreadyConsumed;

    if (shouldConsumeAdminCoupon) {
      await ctx.db.patch(adminCoupon._id, {
        totalRedemptions: adminCoupon.totalRedemptions + 1,
        updatedAt: Date.now(),
      });
      options.consumedAdminCouponCodes?.add(normalizedAdminCouponCode);
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
