import "client-only";

import type { CheckoutPricing } from "@/lib/domain/checkout";
import { postJson, type FetchImpl } from "./http";

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

export type PaymentOrder = {
  amount: number;
  currency: string;
  id: string;
  checkoutAttemptId?: string;
  reconciliation?: {
    checkoutPricing?: CheckoutPricing;
    status?: "valid" | "changed" | "blocked";
  };
};

export type VerifyPaymentInput = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type RequestPaymentOrderOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function requestPaymentOrder(
  input: CreatePaymentOrderInput,
  options: RequestPaymentOrderOptions = {},
): Promise<PaymentOrder> {
  return postJson<CreatePaymentOrderInput, PaymentOrder>(
    options.endpoint ?? "/api/create-order",
    input,
    { fetchImpl: options.fetchImpl },
  );
}
