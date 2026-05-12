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

  assert.equal(fullBatchResult.status, "changed");
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
