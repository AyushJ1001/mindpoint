import "server-only";

import crypto from "node:crypto";
import { getRazorpayServerConfig } from "@mindpoint/config/server";
import Razorpay from "razorpay";

import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  VerifyPaymentInput,
} from "./payments";

export class InvalidPaymentAmountError extends Error {
  constructor() {
    super("Invalid amount.");
    this.name = "InvalidPaymentAmountError";
  }
}

export async function createPaymentOrder(
  input: CreatePaymentOrderInput,
): Promise<PaymentOrder> {
  const { razorpayKeyId, razorpayKeySecret } = getRazorpayServerConfig();
  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidPaymentAmountError();
  }

  const roundedAmount = Math.round(amount);

  return (await razorpay.orders.create({
    amount: roundedAmount * 100,
    currency: "INR",
  })) as PaymentOrder;
}

export function verifyPaymentSignature(input: VerifyPaymentInput): boolean {
  const { razorpayKeySecret } = getRazorpayServerConfig();
  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(input.razorpaySignature),
  );
}
