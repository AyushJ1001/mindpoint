import "client-only";

import { postJson, type FetchImpl } from "./http";

export type CreatePaymentOrderInput = {
  amount: number;
};

export type PaymentOrder = {
  amount: number;
  currency: string;
  id: string;
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
