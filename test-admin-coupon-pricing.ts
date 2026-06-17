import assert from "node:assert/strict";
import { test } from "node:test";

import { validateCheckoutPricingItemResult } from "./convex/_shared/checkout";

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
