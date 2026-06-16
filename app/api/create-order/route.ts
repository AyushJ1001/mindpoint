import { auth } from "@clerk/nextjs/server";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import {
  BoundaryConfigurationError,
  BoundaryExternalServiceError,
  BoundaryUnauthorizedError,
  BoundaryValidationError,
  parseJsonEffect,
  runApiEffect,
} from "@/lib/effect";
import { validateCreateOrderBodyEffect } from "@/lib/services/create-order-boundary";
import { createCheckoutAttemptEffect } from "@/lib/services/checkout-attempts.server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { Effect } from "effect";
import type { NextRequest } from "next/server";

async function handleCreateOrder(req: NextRequest) {
  return runApiEffect(
    Effect.gen(function* () {
      const body = yield* parseJsonEffect(req);
      const createOrderBody = yield* validateCreateOrderBodyEffect(body);

      if (!isClerkServerConfigured()) {
        return yield* Effect.fail(
          new BoundaryUnauthorizedError({
            message: "Checkout authentication is not configured.",
          }),
        );
      }

      const { userId, sessionClaims } = yield* Effect.tryPromise({
        try: () => auth(),
        catch: (cause) =>
          new BoundaryExternalServiceError({
            ...(cause instanceof Error ? { cause } : {}),
            message: "Checkout authentication service is unavailable.",
          }),
      });

      if (!userId) {
        return yield* Effect.fail(
          new BoundaryUnauthorizedError({
            message: "Sign in before checkout.",
          }),
        );
      }

      const checkoutServerSecret = process.env.CHECKOUT_SERVER_SECRET;
      if (!checkoutServerSecret) {
        return yield* Effect.fail(
          new BoundaryConfigurationError({
            message: "Checkout server authorization is not configured.",
          }),
        );
      }

      const sessionEmail = yield* Effect.tryPromise({
        try: () => resolveAuthEmail(sessionClaims),
        catch: (cause) =>
          new BoundaryExternalServiceError({
            ...(cause instanceof Error ? { cause } : {}),
            message: "Checkout authentication service is unavailable.",
          }),
      });
      const buyerEmail = sessionEmail || createOrderBody.buyerEmail;

      const attempt = yield* createCheckoutAttemptEffect(
        {
          cartIntent: createOrderBody.cartIntent,
          buyerEmail,
          referrerClerkUserId: createOrderBody.referrerClerkUserId,
        },
        { checkoutServerSecret, buyerUserId: userId },
      );

      const amount = Number(attempt.reconciliation.totalAmountPaid);
      if (!Number.isFinite(amount) || amount <= 0) {
        return yield* Effect.fail(
          new BoundaryValidationError({ message: "Invalid amount." }),
        );
      }

      return {
        amount,
        currency: "INR",
        id: String(attempt.checkoutAttemptId),
        checkoutAttemptId: attempt.checkoutAttemptId,
        reconciliation: attempt.reconciliation,
      };
    }),
  );
}

export const POST = withRateLimit(handleCreateOrder, {
  errorMessage: "Too many payment requests. Please wait before trying again.",
});
