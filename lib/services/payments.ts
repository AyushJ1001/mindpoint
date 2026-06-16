import "client-only";

import { postJson, type FetchImpl } from "./http";

export type CheckoutReconciliationPayload = {
  status?: "valid" | "changed" | "blocked";
  totalAmountPaid?: number;
  checkoutPricing?: unknown;
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

type RequestPaymentOrderOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function requestPaymentOrder(
  input: CreatePaymentOrderInput,
  options: RequestPaymentOrderOptions = {},
): Promise<PaymentSession> {
  return postJson<CreatePaymentOrderInput, PaymentSession>(
    options.endpoint ?? "/api/create-order",
    input,
    { fetchImpl: options.fetchImpl },
  );
}
