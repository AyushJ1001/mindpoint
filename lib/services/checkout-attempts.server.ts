import "server-only";

import { api } from "@/lib/backend/api";
import {
  BoundaryConfigurationError,
  BoundaryConflictError,
  type BoundaryError,
  BoundaryExternalServiceError,
  BoundaryForbiddenError,
  BoundaryNotFoundError,
  BoundaryUnauthorizedError,
  BoundaryValidationError,
  boundaryErrorFromThrowable,
  type BoundaryThrowable,
  type JsonValue,
} from "@/lib/effect";
import { Effect } from "effect";
import { ConvexHttpClient } from "convex/browser";
import type {
  ConvexFailure,
  ConvexSerializable,
} from "../../convex/_shared/result";

import type { CreatePaymentOrderInput } from "./payments";

type CheckoutAttemptErrorCode =
  | "CHECKOUT_ATTEMPT_INVALID_STATE"
  | "CHECKOUT_ATTEMPT_NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

type CheckoutAttemptFailure = ConvexFailure<CheckoutAttemptErrorCode>;

type CheckoutAttemptReconciliation = {
  readonly totalAmountPaid: number;
  readonly [key: string]: JsonValue;
};

type CreateCheckoutAttemptSuccess = {
  readonly _tag: "Success";
  readonly checkoutAttemptId: string;
  readonly reconciliation: CheckoutAttemptReconciliation;
  readonly success: true;
};

type CreateCheckoutAttemptResult =
  | CheckoutAttemptFailure
  | CreateCheckoutAttemptSuccess;

type LegacyCreateCheckoutAttemptResult =
  | {
      readonly checkoutAttemptId: string;
      readonly ok: true;
      readonly reconciliation: CheckoutAttemptReconciliation;
    }
  | {
      readonly ok: false;
      readonly reconciliation: JsonValue;
    };

type CreateCheckoutAttemptMutationResult =
  | CreateCheckoutAttemptResult
  | LegacyCreateCheckoutAttemptResult
  | null
  | undefined;

type CheckoutAttemptServiceOptions = {
  convexUrl?: string;
  convexAuthToken?: string;
  checkoutServerSecret?: string;
  buyerUserId?: string;
};

function resolveConvexUrl(
  convexUrl?: string,
): string | BoundaryConfigurationError {
  const resolvedConvexUrl = convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!resolvedConvexUrl) {
    return new BoundaryConfigurationError({
      message:
        "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot execute Convex mutation.",
    });
  }

  return resolvedConvexUrl;
}

function createAuthedConvexClient(options: CheckoutAttemptServiceOptions) {
  const resolvedConvexUrl = resolveConvexUrl(options.convexUrl);
  if (resolvedConvexUrl instanceof BoundaryConfigurationError) {
    return resolvedConvexUrl;
  }

  const convex = new ConvexHttpClient(resolvedConvexUrl);
  if (options.convexAuthToken) {
    convex.setAuth(options.convexAuthToken);
  }

  return convex;
}

export async function createCheckoutAttempt(
  input: CreatePaymentOrderInput,
  options: CheckoutAttemptServiceOptions = {},
): Promise<CreateCheckoutAttemptMutationResult> {
  const convex = createAuthedConvexClient(options);
  if (convex instanceof BoundaryConfigurationError) {
    return Promise.reject(convex);
  }

  const cartIntent = {
    items: input.cartIntent.items.map((item) => ({
      ...item,
      courseId: item.courseId as never,
      batchId: item.batchId as never,
      selectedFreeCourseId: item.selectedFreeCourseId as never,
      selectedFreeBatchId: item.selectedFreeBatchId as never,
    })),
  };

  if (options.checkoutServerSecret && options.buyerUserId) {
    return (await convex.mutation(
      api.checkout.createCheckoutAttemptFromServer,
      {
        serverSecret: options.checkoutServerSecret,
        buyerUserId: options.buyerUserId,
        cartIntent,
        buyerEmail: input.buyerEmail,
        referrerClerkUserId: input.referrerClerkUserId,
      },
    )) as CreateCheckoutAttemptMutationResult;
  }

  return (await convex.mutation(api.checkout.createCheckoutAttempt, {
    cartIntent,
    buyerEmail: input.buyerEmail,
    referrerClerkUserId: input.referrerClerkUserId,
  })) as CreateCheckoutAttemptMutationResult;
}

export function createCheckoutAttemptEffect(
  input: CreatePaymentOrderInput,
  options: CheckoutAttemptServiceOptions = {},
): Effect.Effect<CreateCheckoutAttemptSuccess, BoundaryError> {
  return Effect.tryPromise({
    try: () => createCheckoutAttempt(input, options),
    catch: (cause) => checkoutAttemptBoundaryError(cause as BoundaryThrowable),
  }).pipe(Effect.flatMap(normalizeCreateCheckoutAttemptResultEffect));
}
export function normalizeCreateCheckoutAttemptResultEffect(
  result: CreateCheckoutAttemptMutationResult,
): Effect.Effect<CreateCheckoutAttemptSuccess, BoundaryError> {
  if (result === null || result === undefined) {
    return invalidCheckoutAttemptResultEffect();
  }

  if (isCreateCheckoutAttemptTaggedResult(result)) {
    return unwrapTaggedCheckoutAttemptResult(result);
  }

  switch (result.ok) {
    case true:
      return Effect.succeed({
        _tag: "Success",
        checkoutAttemptId: result.checkoutAttemptId,
        reconciliation: result.reconciliation,
        success: true,
      });
    case false:
      return Effect.fail(
        new BoundaryConflictError({
          details: { reconciliation: result.reconciliation },
          message: "Your cart changed. Review it before checkout.",
        }),
      );
  }
}

function unwrapTaggedCheckoutAttemptResult<
  Success extends { readonly _tag: "Success"; readonly success: true },
>(
  result: CheckoutAttemptFailure | Success,
): Effect.Effect<Success, BoundaryError> {
  switch (result._tag) {
    case "Success":
      return Effect.succeed(result);
    case "Failure":
      return Effect.fail(checkoutAttemptResultErrorToBoundaryError(result));
  }
}

function isCreateCheckoutAttemptTaggedResult(
  result: CreateCheckoutAttemptMutationResult,
): result is CreateCheckoutAttemptResult {
  if (result === null || result === undefined || !("_tag" in result)) {
    return false;
  }

  return result._tag === "Success" || result._tag === "Failure";
}

function invalidCheckoutAttemptResultEffect<Success>(): Effect.Effect<
  Success,
  BoundaryError
> {
  return Effect.fail(
    new BoundaryExternalServiceError({
      message: "Checkout attempt mutation returned an invalid result.",
    }),
  );
}

function checkoutAttemptResultErrorToBoundaryError(
  result: CheckoutAttemptFailure,
): BoundaryError {
  const details = checkoutAttemptErrorDetails(result.error.details);

  switch (result.error.code) {
    case "CHECKOUT_ATTEMPT_INVALID_STATE":
      return new BoundaryConflictError({
        ...(details !== undefined ? { details } : {}),
        message: result.error.message,
      });
    case "CHECKOUT_ATTEMPT_NOT_FOUND":
      return new BoundaryNotFoundError({
        ...(details !== undefined ? { details } : {}),
        message: result.error.message,
      });
    case "CONFLICT":
      return new BoundaryConflictError({
        ...(details !== undefined ? { details } : {}),
        message: result.error.message,
      });
    case "FORBIDDEN":
      return new BoundaryForbiddenError({
        message: result.error.message,
      });
    case "UNAUTHORIZED":
      return new BoundaryUnauthorizedError({
        message: result.error.message,
      });
    case "VALIDATION_ERROR":
      return new BoundaryValidationError({
        ...(details !== undefined ? { details } : {}),
        message: result.error.message,
      });
  }
}

function checkoutAttemptErrorDetails(
  details: ConvexSerializable | undefined,
): JsonValue | undefined {
  return details === undefined ? undefined : (details as JsonValue);
}

function checkoutAttemptBoundaryError(cause: BoundaryThrowable): BoundaryError {
  const error = boundaryErrorFromThrowable(cause);

  if (error instanceof BoundaryConfigurationError) {
    return error;
  }

  const message = cause instanceof Error ? cause.message : String(cause);
  if (message.includes("No auth provider found matching the given token")) {
    return new BoundaryConfigurationError({
      ...(cause instanceof Error ? { cause } : {}),
      message:
        "Checkout authentication is not configured for this Clerk instance.",
    });
  }

  return new BoundaryExternalServiceError({
    ...(cause instanceof Error ? { cause } : {}),
    message,
  });
}
