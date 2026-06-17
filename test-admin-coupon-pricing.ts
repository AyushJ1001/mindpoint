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
