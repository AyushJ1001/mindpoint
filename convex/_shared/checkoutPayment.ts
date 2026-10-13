/**
 * The payment rule for a cart checkout, kept pure so it can be unit-tested.
 *
 * A checkout may only create an enrollment without payment evidence when the
 * validated amount due is zero — that is a cart genuinely discounted to nothing
 * by a coupon, bundle or Mind Points, all of which the pricing validator checks
 * server-side. Any non-zero amount due needs evidence: a payment screenshot
 * (which always routes to admin verification) or a payment reference.
 *
 * A payment reference is deliberately NOT treated as proof on its own: nothing
 * verifies it against the provider server-side, so a paid cart is still
 * "verify" — it becomes pending and waits for an administrator. Only a
 * genuinely free cart skips verification.
 */
export type CheckoutPaymentRequirement = "free" | "verify" | "missing_payment";

export function resolveCheckoutPaymentRequirement(args: {
  /** Validated amount due per line item, after any discount. */
  amountsDue: readonly number[];
  hasPaymentReference: boolean;
  hasPaymentScreenshot: boolean;
}): CheckoutPaymentRequirement {
  const totalDue = args.amountsDue.reduce(
    (sum, amount) => sum + Math.max(0, amount),
    0,
  );

  if (totalDue <= 0) {
    return "free";
  }

  if (!args.hasPaymentReference && !args.hasPaymentScreenshot) {
    return "missing_payment";
  }

  return "verify";
}
