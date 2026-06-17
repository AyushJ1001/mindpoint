import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildAdminCouponDiscountBudgetByCode,
  validateCheckoutPricingItemResult,
} from "./convex/_shared/checkout";
import { applyAdminCouponToItems } from "./lib/domain/admin-coupons";

function makeCtx(adminCoupon: unknown) {
  return {
    db: {
      query(tableName: string) {
        return {
          withIndex() {
            return {
              async first() {
                return tableName === "adminCoupons" ? adminCoupon : null;
              },
            };
          },
        };
      },
      async patch() {
        throw new Error("patch should not run during validation-only tests");
      },
    },
  };
}

const baseCourse = {
  _id: "course-a",
  name: "Certificate A",
  code: "CERTA",
  type: "certificate",
  price: 3600,
};

const activeAdminCoupon = {
  _id: "admin-coupon-save500",
  code: "SAVE500",
  enabled: true,
  isArchived: false,
  totalRedemptions: 0,
  discount: { type: "flat", value: 500 },
  appliesTo: { type: "cart" },
  requires: { type: "none" },
};

test("rejects tampered admin coupon pricing that exceeds the coupon discount", async () => {
  const result = await validateCheckoutPricingItemResult(
    makeCtx(activeAdminCoupon) as never,
    {
      userId: "user_123",
      course: baseCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 3600,
        checkoutPrice: 3600,
        amountPaid: 0,
        redemptionDiscountAmount: 3600,
        couponCode: "SAVE500",
      },
    },
    { consumeCoupon: false },
  );

  assert.equal(result?._tag, "Failure");
  assert.equal(result?.error.code, "CONFLICT");
});

test("rejects admin coupon pricing when cart prerequisites are missing", async () => {
  const gatedCoupon = {
    ...activeAdminCoupon,
    code: "THERAPY-GATE",
    discount: { type: "percentage", value: 20 },
    requires: { type: "courseTypes", courseTypes: ["therapy"] },
  };

  const result = await validateCheckoutPricingItemResult(
    makeCtx(gatedCoupon) as never,
    {
      userId: "user_123",
      course: baseCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 3600,
        checkoutPrice: 3600,
        amountPaid: 2880,
        redemptionDiscountAmount: 720,
        couponCode: "THERAPY-GATE",
      },
    },
    {
      cartCourses: [baseCourse],
      consumeCoupon: false,
    } as never,
  );

  assert.equal(result?._tag, "Failure");
  assert.equal(result?.error.code, "INVALID_COUPON_CODE");
});

test("accepts admin coupon pricing when cart prerequisites are present", async () => {
  const therapyCourse = {
    ...baseCourse,
    _id: "course-therapy",
    type: "therapy",
  };
  const gatedCoupon = {
    ...activeAdminCoupon,
    code: "THERAPY-GATE",
    discount: { type: "percentage", value: 20 },
    requires: { type: "courseTypes", courseTypes: ["therapy"] },
  };

  const result = await validateCheckoutPricingItemResult(
    makeCtx(gatedCoupon) as never,
    {
      userId: "user_123",
      course: baseCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 3600,
        checkoutPrice: 3600,
        amountPaid: 2880,
        redemptionDiscountAmount: 720,
        couponCode: "THERAPY-GATE",
      },
    },
    {
      cartCourses: [baseCourse, therapyCourse],
      consumeCoupon: false,
    } as never,
  );

  assert.equal(result, null);
});

test("rejects uncapped client math for capped percentage admin coupons", async () => {
  const cappedCoupon = {
    ...activeAdminCoupon,
    code: "CAP300",
    discount: { type: "percentage", value: 50, maxDiscount: 300 },
  };

  const result = await validateCheckoutPricingItemResult(
    makeCtx(cappedCoupon) as never,
    {
      userId: "user_123",
      course: baseCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 3600,
        checkoutPrice: 3600,
        amountPaid: 1800,
        redemptionDiscountAmount: 1800,
        couponCode: "CAP300",
      },
    },
    {
      cartCourses: [baseCourse],
      consumeCoupon: false,
    } as never,
  );

  assert.equal(result?._tag, "Failure");
  assert.equal(result?.error.code, "CONFLICT");
});

test("client and server agree on capped percentage allocation across cart items", async () => {
  const cappedCoupon = {
    ...activeAdminCoupon,
    code: "CAP500",
    discount: { type: "percentage" as const, value: 20, maxDiscount: 500 },
  };
  const firstCourse = {
    ...baseCourse,
    _id: "course-a",
    price: 1000,
  };
  const secondCourse = {
    ...baseCourse,
    _id: "course-b",
    price: 1000,
  };
  const application = applyAdminCouponToItems({
    coupon: {
      _id: String(cappedCoupon._id),
      code: cappedCoupon.code,
      name: "Cap 500",
      enabled: true,
      isArchived: false,
      discount: cappedCoupon.discount,
      appliesTo: { type: "cart" },
      requires: { type: "none" },
    },
    items: [
      {
        cartItemId: "cart-a",
        courseId: "course-a",
        courseType: "certificate",
        amountPaid: 1000,
      },
      {
        cartItemId: "cart-b",
        courseId: "course-b",
        courseType: "certificate",
        amountPaid: 1000,
      },
    ],
    now: Date.now(),
  });

  assert.equal(application.applied, true);
  if (!application.applied) {
    return;
  }
  assert.equal(application.discountAmount, 400);
  assert.equal(application.itemDiscounts.get("cart-a"), 200);
  assert.equal(application.itemDiscounts.get("cart-b"), 200);

  const ctx = makeCtx(cappedCoupon) as never;
  const remainingAdminCouponDiscountByCode =
    await buildAdminCouponDiscountBudgetByCode(ctx, [
      {
        course: firstCourse as never,
        pricingItem: {
          courseId: "course-a" as never,
          listedPrice: 1000,
          checkoutPrice: 1000,
          amountPaid: 800,
          redemptionDiscountAmount: 200,
          couponCode: "CAP500",
        },
      },
      {
        course: secondCourse as never,
        pricingItem: {
          courseId: "course-b" as never,
          listedPrice: 1000,
          checkoutPrice: 1000,
          amountPaid: 800,
          redemptionDiscountAmount: 200,
          couponCode: "CAP500",
        },
      },
    ] as never);

  const firstResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: firstCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 1000,
        checkoutPrice: 1000,
        amountPaid: 800,
        redemptionDiscountAmount: 200,
        couponCode: "CAP500",
      },
    },
    {
      cartCourses: [firstCourse, secondCourse],
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );
  const secondResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: secondCourse as never,
      pricingItem: {
        courseId: "course-b" as never,
        listedPrice: 1000,
        checkoutPrice: 1000,
        amountPaid: 800,
        redemptionDiscountAmount: 200,
        couponCode: "CAP500",
      },
    },
    {
      cartCourses: [firstCourse, secondCourse],
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );

  assert.equal(firstResult, null);
  assert.equal(secondResult, null);
});

test("rejects percentage rounding over-allocation across cart items", async () => {
  const percentageCoupon = {
    ...activeAdminCoupon,
    code: "HALF",
    discount: { type: "percentage", value: 50 },
  };
  const courses = ["course-a", "course-b", "course-c"].map((courseId) => ({
    ...baseCourse,
    _id: courseId,
    price: 1,
  }));
  const ctx = makeCtx(percentageCoupon) as never;
  const remainingAdminCouponDiscountByCode =
    await buildAdminCouponDiscountBudgetByCode(ctx, [
      {
        course: courses[0] as never,
        pricingItem: {
          courseId: "course-a" as never,
          listedPrice: 1,
          checkoutPrice: 1,
          amountPaid: 0,
          redemptionDiscountAmount: 1,
          couponCode: "HALF",
        },
      },
      {
        course: courses[1] as never,
        pricingItem: {
          courseId: "course-b" as never,
          listedPrice: 1,
          checkoutPrice: 1,
          amountPaid: 0,
          redemptionDiscountAmount: 1,
          couponCode: "HALF",
        },
      },
      {
        course: courses[2] as never,
        pricingItem: {
          courseId: "course-c" as never,
          listedPrice: 1,
          checkoutPrice: 1,
          amountPaid: 0,
          redemptionDiscountAmount: 1,
          couponCode: "HALF",
        },
      },
    ] as never);

  const firstResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: courses[0] as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 1,
        checkoutPrice: 1,
        amountPaid: 0,
        redemptionDiscountAmount: 1,
        couponCode: "HALF",
      },
    },
    {
      cartCourses: courses,
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );
  const secondResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: courses[1] as never,
      pricingItem: {
        courseId: "course-b" as never,
        listedPrice: 1,
        checkoutPrice: 1,
        amountPaid: 0,
        redemptionDiscountAmount: 1,
        couponCode: "HALF",
      },
    },
    {
      cartCourses: courses,
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );
  const thirdResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: courses[2] as never,
      pricingItem: {
        courseId: "course-c" as never,
        listedPrice: 1,
        checkoutPrice: 1,
        amountPaid: 0,
        redemptionDiscountAmount: 1,
        couponCode: "HALF",
      },
    },
    {
      cartCourses: courses,
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );

  assert.equal(firstResult, null);
  assert.equal(secondResult, null);
  assert.equal(thirdResult?._tag, "Failure");
  assert.equal(thirdResult?.error.code, "CONFLICT");
});

test("rejects splitting a free-course coupon across multiple cart items", async () => {
  const freeCoupon = {
    ...activeAdminCoupon,
    code: "FREEONE",
    discount: { type: "free" },
  };
  const cheapCourse = {
    ...baseCourse,
    _id: "course-cheap",
    price: 400,
  };
  const expensiveCourse = {
    ...baseCourse,
    _id: "course-expensive",
    price: 600,
  };
  const ctx = makeCtx(freeCoupon) as never;
  const remainingAdminCouponDiscountByCode =
    await buildAdminCouponDiscountBudgetByCode(ctx, [
      {
        course: cheapCourse as never,
        pricingItem: {
          courseId: "course-cheap" as never,
          listedPrice: 400,
          checkoutPrice: 400,
          amountPaid: 0,
          redemptionDiscountAmount: 400,
          couponCode: "FREEONE",
        },
      },
      {
        course: expensiveCourse as never,
        pricingItem: {
          courseId: "course-expensive" as never,
          listedPrice: 600,
          checkoutPrice: 600,
          amountPaid: 400,
          redemptionDiscountAmount: 200,
          couponCode: "FREEONE",
        },
      },
    ] as never);

  const cheapResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: cheapCourse as never,
      pricingItem: {
        courseId: "course-cheap" as never,
        listedPrice: 400,
        checkoutPrice: 400,
        amountPaid: 0,
        redemptionDiscountAmount: 400,
        couponCode: "FREEONE",
      },
    },
    {
      cartCourses: [cheapCourse, expensiveCourse],
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );
  const expensiveResult = await validateCheckoutPricingItemResult(
    ctx,
    {
      userId: "user_123",
      course: expensiveCourse as never,
      pricingItem: {
        courseId: "course-expensive" as never,
        listedPrice: 600,
        checkoutPrice: 600,
        amountPaid: 400,
        redemptionDiscountAmount: 200,
        couponCode: "FREEONE",
      },
    },
    {
      cartCourses: [cheapCourse, expensiveCourse],
      consumeCoupon: false,
      remainingAdminCouponDiscountByCode,
    } as never,
  );

  assert.equal(cheapResult, null);
  assert.equal(expensiveResult?._tag, "Failure");
  assert.equal(expensiveResult?.error.code, "CONFLICT");
});

test("rejects admin coupons on bundle-discounted checkout lines", async () => {
  const result = await validateCheckoutPricingItemResult(
    makeCtx(activeAdminCoupon) as never,
    {
      userId: "user_123",
      course: baseCourse as never,
      pricingItem: {
        courseId: "course-a" as never,
        listedPrice: 3600,
        checkoutPrice: 3600,
        amountPaid: 2600,
        redemptionDiscountAmount: 1000,
        couponCode: "SAVE500",
        bundleCampaignId: "bundle-a" as never,
      },
    },
    {
      cartCourses: [baseCourse],
      consumeCoupon: false,
    } as never,
  );

  assert.equal(result?._tag, "Failure");
  assert.equal(result?.error.code, "INVALID_COUPON_CODE");
});
