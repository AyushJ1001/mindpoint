import "server-only";

import crypto from "node:crypto";
import { getRazorpayServerConfig } from "@/lib/config/server";
import {
  BoundaryExternalServiceError,
  BoundaryValidationError,
  configEffect,
  unexpectedEffect,
} from "@/lib/effect";
import { Effect } from "effect";
import Razorpay from "razorpay";

import type { PaymentOrder, VerifyPaymentInput } from "./payments";

type CreatePaymentOrderInput = {
  amount: number;
  receipt?: string;
};

export class InvalidPaymentAmountError extends Error {
  constructor() {
    super("Invalid amount.");
    this.name = "InvalidPaymentAmountError";
  }
}

export function createPaymentOrderEffect(input: CreatePaymentOrderInput) {
  return Effect.gen(function* () {
    const amount = Number(input.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return yield* Effect.fail(
        new BoundaryValidationError({ message: "Invalid amount." }),
      );
    }

    const { razorpayKeyId, razorpayKeySecret } = yield* configEffect(
      getRazorpayServerConfig,
    );
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    const roundedAmount = Math.round(amount);

    return yield* Effect.tryPromise({
      try: async () =>
        (await razorpay.orders.create({
          amount: roundedAmount * 100,
          currency: "INR",
          receipt: input.receipt,
        })) as PaymentOrder,
      catch: (cause) =>
        new BoundaryExternalServiceError({
          ...(cause instanceof Error ? { cause } : {}),
          message:
            cause instanceof Error
              ? cause.message
              : "Failed to create payment order.",
        }),
    });
  });
}

export async function createPaymentOrder(
  input: CreatePaymentOrderInput,
): Promise<PaymentOrder> {
  return Effect.runPromise(createPaymentOrderEffect(input));
}

export function verifyPaymentSignatureEffect(input: VerifyPaymentInput) {
  return Effect.gen(function* () {
    const { razorpayKeySecret } = yield* configEffect(getRazorpayServerConfig);
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");

    return yield* unexpectedEffect(() => {
      const expected = Buffer.from(expectedSignature);
      const received = Buffer.from(input.razorpaySignature);

      if (expected.length !== received.length) {
        return false;
      }

      return crypto.timingSafeEqual(expected, received);
    });
  });
}

export function verifyPaymentSignature(input: VerifyPaymentInput): boolean {
  return Effect.runSync(verifyPaymentSignatureEffect(input));
}
