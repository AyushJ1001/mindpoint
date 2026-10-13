import assert from "node:assert/strict";
import test from "node:test";
import { resolveCheckoutPaymentRequirement } from "./convex/_shared/checkoutPayment";

test("A cart discounted to nothing needs no payment evidence", () => {
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [0, 0],
      hasPaymentReference: false,
      hasPaymentScreenshot: false,
    }),
    "free",
  );
});

test("A non-zero amount with no evidence is rejected", () => {
  // The reported hole: a direct call with no pricing and no payment fields must
  // not be recorded as paid.
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [299900],
      hasPaymentReference: false,
      hasPaymentScreenshot: false,
    }),
    "missing_payment",
  );
});

test("A payment screenshot routes to verification, never to free access", () => {
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [299900],
      hasPaymentReference: false,
      hasPaymentScreenshot: true,
    }),
    "verify",
  );
});

test("An unverified payment reference still requires verification", () => {
  // Nothing checks the reference against the provider server-side, so it must
  // not be treated as proof of payment.
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [299900],
      hasPaymentReference: true,
      hasPaymentScreenshot: false,
    }),
    "verify",
  );
});

test("A mixed cart keys off the paid lines", () => {
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [0, 199900],
      hasPaymentReference: false,
      hasPaymentScreenshot: true,
    }),
    "verify",
  );
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [0, 199900],
      hasPaymentReference: false,
      hasPaymentScreenshot: false,
    }),
    "missing_payment",
  );
});

test("Negative or empty amounts are treated as nothing due", () => {
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [],
      hasPaymentReference: false,
      hasPaymentScreenshot: false,
    }),
    "free",
  );
  assert.equal(
    resolveCheckoutPaymentRequirement({
      amountsDue: [-5],
      hasPaymentReference: false,
      hasPaymentScreenshot: false,
    }),
    "free",
  );
});
