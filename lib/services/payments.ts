import "client-only";

import { Effect } from "effect";

import { isJsonObject, type JsonValue } from "../effect/errors";
import {
  boundaryErrorToHttpClientFailure,
  postJsonEffect,
  type FetchImpl,
  type HttpClientFailure,
} from "./http";

export type CheckoutReconciliationPayload = {
  status?: "valid" | "changed" | "blocked";
  totalAmountPaid?: number;
  checkoutPricing?: JsonValue;
  items?: Array<{
    cartItemId: string;
    courseId: string;
    batchId?: string;
    listedPrice: number;
    checkoutPrice: number;
    amountPaid: number;
    selectedFreeCourseId?: string;
  }>;
  removedItems?: Array<{
    cartItemId: string;
    courseId: string;
    batchId?: string;
    reason?: string;
    message?: string;
  }>;
  updatedItems?: Array<{
    cartItemId: string;
    courseId: string;
    batchId?: string;
    reasons: string[];
  }>;
};

export type CreatePaymentOrderInput = {
  cartIntent: {
    items: Array<{
      cartItemId: string;
      courseId: string;
      batchId?: string;
      quantity?: number;
      selectedFreeCourseId?: string;
      selectedFreeBatchId?: string;
      clientListedPrice?: number;
      clientCheckoutPrice?: number;
      couponCode?: string;
      mindPointsRedeemed?: number;
    }>;
  };
  buyerEmail?: string;
  referrerClerkUserId?: string;
};

export type PaymentSession = {
  amount: number;
  currency: string;
  id: string;
  checkoutAttemptId?: string;
  reconciliation?: CheckoutReconciliationPayload;
};

export type PaymentOrderFailure = HttpClientFailure & {
  readonly reconciliation?: CheckoutReconciliationPayload;
};

export type PaymentOrderResult =
  | {
      readonly data: PaymentSession;
      readonly success: true;
    }
  | PaymentOrderFailure;

type RequestPaymentOrderOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function requestPaymentOrder(
  input: CreatePaymentOrderInput,
  options: RequestPaymentOrderOptions = {},
): Promise<PaymentOrderResult> {
  return Effect.runPromise(
    requestPaymentOrderEffect(input, options).pipe(
      Effect.match({
        onFailure: (error): PaymentOrderFailure => {
          const failure = boundaryErrorToHttpClientFailure(error);
          return {
            ...failure,
            reconciliation: readCheckoutReconciliation(failure.details),
          };
        },
        onSuccess: (data) => ({ data, success: true }),
      }),
    ),
  );
}

export function requestPaymentOrderEffect(
  input: CreatePaymentOrderInput,
  options: RequestPaymentOrderOptions = {},
) {
  return postJsonEffect<CreatePaymentOrderInput, PaymentSession>(
    options.endpoint ?? "/api/create-order",
    input,
    { fetchImpl: options.fetchImpl },
  );
}

function readCheckoutReconciliation(
  details: JsonValue | undefined,
): CheckoutReconciliationPayload | undefined {
  if (!isJsonObject(details)) {
    return undefined;
  }

  const reconciliation = details.reconciliation;
  if (!isJsonObject(reconciliation)) {
    return undefined;
  }

  return reconciliation as CheckoutReconciliationPayload;
}
