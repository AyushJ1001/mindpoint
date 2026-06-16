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
  assert.match(source, /convexSuccess/);
  assert.match(source, /convexFailure/);
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
