import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  convexFailure,
  convexResultErrorValidator,
  convexSuccess,
  getConvexResultErrorMessage,
} from "./convex/_shared/result";

test("convex result constructors create serializable tagged data", () => {
  const success = convexSuccess({
    couponCode: "MP-123",
    newBalance: 20,
  });
  const failure = convexFailure({
    code: "INVALID_POINTS_REQUIREMENT",
    message: "Invalid points requirement",
  });

  assert.deepEqual(success, {
    _tag: "Success",
    success: true,
    couponCode: "MP-123",
    newBalance: 20,
  });
  assert.deepEqual(failure, {
    _tag: "Failure",
    success: false,
    error: {
      _tag: "ConvexResultError",
      code: "INVALID_POINTS_REQUIREMENT",
      message: "Invalid points requirement",
    },
  });
});

test("convex failure can carry serializable details", () => {
  const failure = convexFailure({
    code: "CONFLICT",
    details: {
      reconciliation: {
        status: "invalid",
        totalAmountPaid: 0,
      },
    },
    message: "Your cart changed.",
  });

  assert.deepEqual(failure, {
    _tag: "Failure",
    success: false,
    error: {
      _tag: "ConvexResultError",
      code: "CONFLICT",
      details: {
        reconciliation: {
          status: "invalid",
          totalAmountPaid: 0,
        },
      },
      message: "Your cart changed.",
    },
  });
});

test("convex result error validator accepts serializable details", () => {
  assert.ok("details" in convexResultErrorValidator.fields);
  assert.equal(
    convexResultErrorValidator.fields.details.isOptional,
    "optional",
  );
});

test("convex result error message helper is exhaustive for success and failure", () => {
  assert.equal(
    getConvexResultErrorMessage(
      convexFailure({
        code: "POINTS_ACCOUNT_NOT_FOUND",
        message: "No points account found",
      }),
      "Fallback",
    ),
    "No points account found",
  );
  assert.equal(
    getConvexResultErrorMessage(convexSuccess({ newBalance: 10 }), "Fallback"),
    "Fallback",
  );
});

test("convex result module avoids any and unknown", () => {
  const source = readFileSync("convex/_shared/result.ts", "utf8");

  assert.doesNotMatch(source, /\bany\b|\bunknown\b/);
});

test("validateCoupon no longer uses the legacy valid/error result shape", () => {
  const convexSource = readFileSync("convex/mindPoints.ts", "utf8");
  const cartSource = readFileSync("components/CartClient.tsx", "utf8");

  assert.doesNotMatch(convexSource, /valid:\s*v\.literal/);
  assert.doesNotMatch(convexSource, /valid:\s*false|valid:\s*true/);
  assert.doesNotMatch(cartSource, /couponValidation\?\.valid/);
  assert.doesNotMatch(cartSource, /couponValidation\?\.error/);
});

test("markCouponUsed no longer uses the legacy success/error result shape", () => {
  const convexSource = readFileSync("convex/mindPoints.ts", "utf8");
  const markCouponUsedSource = convexSource.slice(
    convexSource.indexOf("export const markCouponUsed"),
    convexSource.indexOf("export const getUserAccountSummary"),
  );

  assert.doesNotMatch(markCouponUsedSource, /success:\s*v\.boolean/);
  assert.doesNotMatch(markCouponUsedSource, /error:\s*v\.optional/);
  assert.doesNotMatch(markCouponUsedSource, /return\s+\{\s*success:\s*false/);
  assert.doesNotMatch(markCouponUsedSource, /return\s+\{\s*success:\s*true/);
});

test("awardPoints no longer uses the legacy success/error result shape", () => {
  const convexSource = readFileSync("convex/mindPoints.ts", "utf8");
  const awardPointsSource = convexSource.slice(
    convexSource.indexOf("export const awardPoints"),
    convexSource.indexOf("export const redeemPoints"),
  );

  assert.doesNotMatch(awardPointsSource, /success:\s*v\.boolean/);
  assert.doesNotMatch(awardPointsSource, /error:\s*v\.optional/);
  assert.doesNotMatch(awardPointsSource, /return\s+\{\s*success:\s*false/);
  assert.doesNotMatch(awardPointsSource, /return\s+\{\s*success:\s*true/);
});

test("checkout attempts use serializable Convex results instead of ok tuples", () => {
  const convexSource = readFileSync("convex/checkout.ts", "utf8");
  const serviceSource = readFileSync(
    "lib/services/checkout-attempts.server.ts",
    "utf8",
  );
  const routeSource = readFileSync("app/api/create-order/route.ts", "utf8");

  assert.match(convexSource, /convexSuccess/);
  assert.match(convexSource, /convexFailure/);
  assert.doesNotMatch(convexSource, /ok:\s*true|ok:\s*false/);
  assert.match(serviceSource, /normalizeCreateCheckoutAttemptResultEffect/);
  assert.doesNotMatch(routeSource, /attempt\.ok/);
});

test("rate-limited email actions return tagged Convex results", () => {
  const source = readFileSync("convex/emailActionsWithRateLimit.ts", "utf8");

  assert.match(source, /emailActionResultValidator/);
  assert.match(source, /emailActionSuccess/);
  assert.match(source, /emailRateLimitFailure/);
  assert.match(source, /isEmailActionFailure/);
  assert.doesNotMatch(source, /returns:\s*v\.null/);
  assert.doesNotMatch(source, /throw new Error/);
  assert.doesNotMatch(source, /throw error/);
});

test("small admin mutation groups use tagged Convex results", () => {
  const groups = [
    {
      convexFile: "convex/adminReviews.ts",
      uiFile: "app/admin/reviews/page.tsx",
    },
    {
      convexFile: "convex/adminManagers.ts",
      uiFile: "app/admin/admins/page.tsx",
    },
    {
      convexFile: "convex/adminBundles.ts",
      uiFile: "components/admin/BundleCampaignManager.tsx",
    },
    {
      convexFile: "convex/adminOffers.ts",
      uiFile: "app/admin/offers/page.tsx",
    },
    {
      convexFile: "convex/courses.ts",
      uiFile: "components/course/review-form.tsx",
    },
    {
      convexFile: "convex/adminLoyalty.ts",
      uiFile: "app/admin/loyalty/page.tsx",
    },
    {
      convexFile: "convex/adminCourses.ts",
      uiFile: "components/admin/CourseEditor.tsx",
    },
    {
      convexFile: "convex/adminEnrollments.ts",
      uiFile: "app/admin/enrollments/page.tsx",
    },
  ] as const;

  for (const group of groups) {
    const convexSource = readFileSync(group.convexFile, "utf8");
    const uiSource = readFileSync(group.uiFile, "utf8");

    assert.match(convexSource, /convexSuccess/, group.convexFile);
    assert.match(convexSource, /convexFailure/, group.convexFile);
    assert.doesNotMatch(convexSource, /throw new Error/, group.convexFile);
    assert.match(uiSource, /assertConvexSuccess/, group.uiFile);
  }
});

test("admin enrollment secondary pages consume tagged Convex results", () => {
  const detailSource = readFileSync(
    "app/admin/enrollments/[enrollmentId]/page.tsx",
    "utf8",
  );
  const recoverySource = readFileSync(
    "app/admin/enrollments/recover/page.tsx",
    "utf8",
  );

  assert.match(detailSource, /assertConvexSuccess/);
  assert.match(recoverySource, /assertConvexSuccess/);
});

test("checkout enrollment mutations expose tagged Convex results through Effect wrappers", () => {
  const convexSource = readFileSync("convex/myFunctions.ts", "utf8");
  const checkoutServiceSource = readFileSync(
    "lib/services/checkout.ts",
    "utf8",
  );
  const checkoutHelperSource = readFileSync(
    "convex/_shared/checkout.ts",
    "utf8",
  );
  const scheduleHelperSource = readFileSync(
    "convex/_shared/enrollmentSchedule.ts",
    "utf8",
  );

  assert.match(convexSource, /convexSuccess\(\{\s*enrollments:/);
  assert.match(convexSource, /validateCheckoutPricingItemResult/);
  assert.match(convexSource, /resolveEnrollmentBatchResult/);
  assert.match(
    convexSource,
    /handleGuestUserCartCheckoutByEmail[\s\S]+convexSuccess\(\{\s*enrollments/,
  );
  assert.match(
    convexSource,
    /handleGuestUserSingleEnrollmentByEmail[\s\S]+convexSuccess\(\{\s*[\s\S]*enrollment,/,
  );
  assert.match(
    convexSource,
    /handleSupervisedTherapyEnrollment[\s\S]+convexSuccess\(\{\s*[\s\S]*enrollment,/,
  );
  assert.match(checkoutServiceSource, /convexTaggedFailureToBoundaryError/);
  assert.match(checkoutServiceSource, /normalizeCartCheckoutMutationReturn/);
  assert.match(checkoutHelperSource, /CheckoutPricingFailure/);
  assert.match(scheduleHelperSource, /EnrollmentScheduleFailure/);
});

test("email delivery implementation is behind a shared module", () => {
  const emailSource = readFileSync("convex/emailActions.ts", "utf8");
  const emailResultSource = readFileSync(
    "convex/_shared/emailActionResult.ts",
    "utf8",
  );
  const deliverySource = readFileSync(
    "convex/_shared/emailDelivery.ts",
    "utf8",
  );

  assert.match(emailSource, /sendEmailWithCopy/);
  assert.match(emailSource, /emailActionResultValidator/);
  assert.doesNotMatch(emailSource, /returns:\s*v\.null/);
  assert.doesNotMatch(emailSource, /throw error/);
  assert.doesNotMatch(emailSource, /sendEmailWithCopyOrThrow/);
  assert.match(emailResultSource, /EmailActionResult/);
  assert.doesNotMatch(emailResultSource, /\bany\b|\bunknown\b/);
  assert.doesNotMatch(emailSource, /new Resend/);
  assert.doesNotMatch(
    emailSource,
    /RESEND_API_KEY environment variable is required/,
  );
  assert.match(deliverySource, /EmailDeliveryFailure/);
  assert.match(deliverySource, /sendEmailWithCopy/);
  assert.doesNotMatch(deliverySource, /sendEmailWithCopyOrThrow/);
  assert.doesNotMatch(deliverySource, /assertEmailDelivered/);
});

test("browser HTTP service exposes Effect/result APIs instead of throw APIs", () => {
  const httpSource = readFileSync("lib/services/http.ts", "utf8");
  const paymentSource = readFileSync("lib/services/payments.ts", "utf8");
  const cartSource = readFileSync("components/CartClient.tsx", "utf8");

  assert.match(httpSource, /postJsonEffect/);
  assert.match(httpSource, /postJsonResult/);
  assert.doesNotMatch(httpSource, /class HttpJsonError/);
  assert.doesNotMatch(httpSource, /throw new Error/);
  assert.doesNotMatch(httpSource, /throw error/);
  assert.match(paymentSource, /PaymentOrderResult/);
  assert.match(paymentSource, /requestPaymentOrderEffect/);
  assert.doesNotMatch(cartSource, /HttpJsonError/);
  assert.doesNotMatch(cartSource, /getCheckoutReconciliationFromError/);
});

test("payment order failures expose nested checkout reconciliation from 409 responses", async () => {
  const { requestPaymentOrder } = await import("./lib/services/payments");

  const result = await requestPaymentOrder(
    {
      cartIntent: {
        items: [{ cartItemId: "course_1", courseId: "course_1" }],
      },
    },
    {
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            success: false,
            error: "Your cart changed. Review it before checkout.",
            code: "CONFLICT",
            details: {
              reconciliation: {
                status: "changed",
                totalAmountPaid: 100,
                removedItems: [
                  {
                    cartItemId: "course_1",
                    courseId: "course_1",
                    reason: "archived",
                  },
                ],
              },
            },
          }),
          {
            status: 409,
            headers: { "content-type": "application/json" },
          },
        ),
    },
  );

  assert.equal(result.success, false);
  assert.deepEqual(result.reconciliation, {
    status: "changed",
    totalAmountPaid: 100,
    removedItems: [
      {
        cartItemId: "course_1",
        courseId: "course_1",
        reason: "archived",
      },
    ],
  });
});

test("cart checkout reconciliation auto-applies unavailable item removals with user-facing causes", async () => {
  const { buildCartReconciliationApplication } = await import(
    "./lib/services/cart-reconciliation"
  );
  const cartSource = readFileSync("components/CartClient.tsx", "utf8");

  const application = buildCartReconciliationApplication({
    status: "blocked",
    totalAmountPaid: 0,
    removedItems: [
      {
        cartItemId: "course_1",
        courseId: "course_1",
        reason: "COURSE_PAST_END_DATE",
        message: "Course A is no longer available because it has ended.",
      },
    ],
  });

  assert.deepEqual(application?.removedItemIds, ["course_1"]);
  assert.equal(application?.reviewRequired, true);
  assert.match(
    application?.toastDescription ?? "",
    /no longer available because it has ended/,
  );
  assert.match(cartSource, /buildCartReconciliationApplication/);
  assert.match(
    cartSource,
    /for \(const removedItemId of application\.removedItemIds\)[\s\S]+removeItem\(removedItemId\)/,
  );
});

test("google sheets actions return tagged results through extracted sheet modules", () => {
  const actionSource = readFileSync("convex/googleSheets.ts", "utf8");
  const clientSource = readFileSync(
    "convex/_shared/googleSheetsClient.ts",
    "utf8",
  );
  const sheetSource = readFileSync("convex/_shared/enrollmentSheet.ts", "utf8");

  assert.match(actionSource, /googleSheetsActionResultValidator/);
  assert.match(actionSource, /appendEnrollmentToSheet/);
  assert.match(actionSource, /setupEnrollmentSheetDocument/);
  assert.match(clientSource, /GoogleSheetsFailure/);
  assert.match(sheetSource, /enrollmentSheetRange/);
  assert.match(sheetSource, /status === 404/);
  assert.doesNotMatch(actionSource, /\bany\b/);
});
