import "server-only";

import { getRazorpayServerConfig } from "@mindpoint/config/server";
import Razorpay from "razorpay";

import type { CreatePaymentOrderInput, PaymentOrder } from "./payments";

export async function createPaymentOrder(
  input: CreatePaymentOrderInput,
): Promise<PaymentOrder> {
  const { razorpayKeyId, razorpayKeySecret } = getRazorpayServerConfig();
  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  const roundedAmount = Math.round(Number(input.amount) || 0);

  return (await razorpay.orders.create({
    amount: roundedAmount * 100,
    currency: "INR",
  })) as PaymentOrder;
}
