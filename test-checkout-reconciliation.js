const assert = require("node:assert/strict");

async function main() {
  const { buildCheckoutAttemptPayload, reconcileCheckoutIntent } = await import(
    "./lib/domain/checkout-reconciliation.ts"
  );

  const now = new Date("2026-05-12T12:00:00Z");

  const baseCourse = {
    _id: "course-a",
    name: "Certificate A",
    code: "CERTA",
    type: "certificate",
    lifecycleStatus: "published",
    price: 3600,
    enrolledUsers: [],
    usesBatches: false,
  };

  const expiredOfferResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 1400,
      },
    ],
    courses: [
      {
        ...baseCourse,
        offer: {
          name: "Mother's Day",
          discount: 61,
          startDate: "2026-05-01T00:00:00Z",
          endDate: "2026-05-10T23:59:59Z",
        },
      },
    ],
    batches: [],
    bundleCampaigns: [],
  });

  assert.equal(expiredOfferResult.status, "changed");
  assert.equal(expiredOfferResult.totalAmountPaid, 3600);
  assert.equal(expiredOfferResult.items[0].amountPaid, 3600);
  assert.deepEqual(expiredOfferResult.updatedItems[0].reasons, [
    "DISCOUNT_EXPIRED",
    "PRICE_CHANGED",
  ]);

  const fullBatchResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-b:batch-full",
        courseId: "course-b",
        batchId: "batch-full",
        clientListedPrice: 2500,
        clientCheckoutPrice: 2500,
      },
    ],
    courses: [
      {
        ...baseCourse,
        _id: "course-b",
        name: "Certificate B",
        price: 2500,
        usesBatches: true,
      },
    ],
    batches: [
      {
        _id: "batch-full",
        courseId: "course-b",
        label: "May cohort",
        lifecycleStatus: "published",
        startDate: "2026-05-20",
        endDate: "2026-05-25",
        capacity: 1,
        enrolledUsers: ["user_existing"],
        sortOrder: 0,
      },
    ],
    bundleCampaigns: [],
  });

  assert.equal(fullBatchResult.status, "blocked");
  assert.equal(fullBatchResult.items.length, 0);
  assert.equal(fullBatchResult.removedItems[0].reason, "BATCH_FULL");

  const expiredBogoResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-c",
        courseId: "course-c",
        clientListedPrice: 3600,
        clientCheckoutPrice: 3600,
        selectedFreeCourseId: "course-free",
      },
    ],
    courses: [
      {
        ...baseCourse,
        _id: "course-c",
        name: "Certificate C",
        bogo: {
          enabled: true,
          label: "Mother's Day bonus",
          startDate: "2026-05-01T00:00:00Z",
          endDate: "2026-05-10T23:59:59Z",
        },
      },
      {
        ...baseCourse,
        _id: "course-free",
        name: "Free Certificate",
      },
    ],
    batches: [],
    bundleCampaigns: [],
  });

  assert.equal(expiredBogoResult.status, "changed");
  assert.equal(expiredBogoResult.items[0].selectedFreeCourseId, undefined);
  assert.deepEqual(expiredBogoResult.updatedItems[0].reasons, ["BOGO_EXPIRED"]);

  const couponResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 0,
        couponCode: "MP-100",
        couponDiscount: 100,
        couponCourseType: "certificate",
        couponPointsCost: 120,
        mindPointsRedeemed: 120,
      },
    ],
    courses: [baseCourse],
    batches: [],
    bundleCampaigns: [],
  });

  assert.equal(couponResult.status, "valid");
  assert.equal(couponResult.totalAmountPaid, 0);
  assert.equal(couponResult.items[0].couponCode, "MP-100");
  assert.equal(couponResult.items[0].mindPointsRedeemed, 120);

  const adminCartCouponResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 3600,
        couponCode: "SAVE500",
      },
      {
        cartItemId: "course-b",
        courseId: "course-b",
        clientListedPrice: 2500,
        clientCheckoutPrice: 2500,
        couponCode: "SAVE500",
      },
    ],
    courses: [
      baseCourse,
      {
        ...baseCourse,
        _id: "course-b",
        name: "Certificate B",
        price: 2500,
      },
    ],
    batches: [],
    bundleCampaigns: [],
    adminCoupons: [
      {
        _id: "coupon-save500",
        code: "SAVE500",
        name: "Save 500",
        enabled: true,
        isArchived: false,
        discount: { type: "flat", value: 500 },
        appliesTo: { type: "cart" },
        requires: { type: "none" },
      },
    ],
  });

  assert.equal(adminCartCouponResult.status, "changed");
  assert.equal(adminCartCouponResult.totalAmountPaid, 5600);
  assert.equal(adminCartCouponResult.items[0].couponCode, "SAVE500");
  assert.equal(adminCartCouponResult.items[1].couponCode, "SAVE500");
  assert.deepEqual(
    adminCartCouponResult.items.map((item) => item.amountPaid),
    [3305, 2295],
  );

  const adminCourseCouponResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 3600,
        couponCode: "CERT25",
      },
      {
        cartItemId: "course-therapy",
        courseId: "course-therapy",
        clientListedPrice: 2000,
        clientCheckoutPrice: 2000,
        couponCode: "CERT25",
      },
    ],
    courses: [
      baseCourse,
      {
        ...baseCourse,
        _id: "course-therapy",
        name: "Therapy",
        type: "therapy",
        price: 2000,
      },
    ],
    batches: [],
    bundleCampaigns: [],
    adminCoupons: [
      {
        _id: "coupon-cert25",
        code: "CERT25",
        name: "Certificate 25",
        enabled: true,
        isArchived: false,
        discount: { type: "percentage", value: 25 },
        appliesTo: { type: "courseTypes", courseTypes: ["certificate"] },
        requires: { type: "none" },
      },
    ],
  });

  assert.equal(adminCourseCouponResult.status, "changed");
  assert.equal(adminCourseCouponResult.totalAmountPaid, 4700);
  assert.equal(adminCourseCouponResult.items[0].amountPaid, 2700);
  assert.equal(adminCourseCouponResult.items[1].amountPaid, 2000);

  const adminRequirementCouponResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 3600,
        couponCode: "THERAPY-GATE",
      },
    ],
    courses: [baseCourse],
    batches: [],
    bundleCampaigns: [],
    adminCoupons: [
      {
        _id: "coupon-therapy-gate",
        code: "THERAPY-GATE",
        name: "Therapy required",
        enabled: true,
        isArchived: false,
        discount: { type: "percentage", value: 20 },
        appliesTo: { type: "cart" },
        requires: { type: "courseTypes", courseTypes: ["therapy"] },
      },
    ],
  });

  assert.equal(adminRequirementCouponResult.status, "changed");
  assert.equal(adminRequirementCouponResult.totalAmountPaid, 3600);
  assert.deepEqual(adminRequirementCouponResult.updatedItems[0].reasons, [
    "COUPON_NOT_APPLICABLE",
  ]);

  const adminFreeCourseCouponResult = reconcileCheckoutIntent({
    now,
    items: [
      {
        cartItemId: "course-a",
        courseId: "course-a",
        clientListedPrice: 3600,
        clientCheckoutPrice: 3600,
        couponCode: "FREEB",
      },
      {
        cartItemId: "course-b",
        courseId: "course-b",
        clientListedPrice: 2500,
        clientCheckoutPrice: 2500,
        couponCode: "FREEB",
      },
    ],
    courses: [
      baseCourse,
      {
        ...baseCourse,
        _id: "course-b",
        name: "Certificate B",
        price: 2500,
      },
    ],
    batches: [],
    bundleCampaigns: [],
    adminCoupons: [
      {
        _id: "coupon-freeb",
        code: "FREEB",
        name: "Free Course B",
        enabled: true,
        isArchived: false,
        discount: { type: "free" },
        appliesTo: { type: "courses", courseIds: ["course-b"] },
        requires: { type: "courses", courseIds: ["course-a"] },
      },
    ],
  });

  assert.equal(adminFreeCourseCouponResult.status, "changed");
  assert.equal(adminFreeCourseCouponResult.totalAmountPaid, 3600);
  assert.equal(adminFreeCourseCouponResult.items[1].amountPaid, 0);

  const attemptPayload = buildCheckoutAttemptPayload({
    reconciliation: expiredOfferResult,
    buyerUserId: "user_buyer",
    buyerEmail: "buyer@example.com",
    referrerClerkUserId: "user_referrer",
  });

  assert.equal(attemptPayload.authoritativeAmount, 3600);
  assert.equal(attemptPayload.status, "created");
  assert.equal(attemptPayload.referrerClerkUserId, "user_referrer");
  assert.equal(attemptPayload.authoritativeLineItems.length, 1);
  assert.equal(attemptPayload.cartIntent.items[0].clientCheckoutPrice, 1400);

  console.log("checkout reconciliation tests passed");
}

main().catch((error) => {
  console.error("checkout reconciliation tests failed");
  console.error(error);
  process.exit(1);
});
