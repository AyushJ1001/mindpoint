import {
  BoundaryValidationError,
  isJsonObject,
  type JsonValue,
  parseJsonEffect,
  runApiEffect,
} from "@/lib/effect";
import { verifyPaymentSignatureEffect } from "@/lib/services/payments.server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { Effect } from "effect";
import type { NextRequest } from "next/server";

function jsonString(value: JsonValue | undefined): string {
  return typeof value === "string" ? value : "";
}

async function handleVerifyPayment(req: NextRequest) {
  return runApiEffect(
    Effect.gen(function* () {
      const body = yield* parseJsonEffect(req);
      const razorpayOrderId = isJsonObject(body)
        ? jsonString(body.razorpayOrderId)
        : "";
      const razorpayPaymentId = isJsonObject(body)
        ? jsonString(body.razorpayPaymentId)
        : "";
      const razorpaySignature = isJsonObject(body)
        ? jsonString(body.razorpaySignature)
        : "";

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return yield* Effect.fail(
          new BoundaryValidationError({
            message: "Missing payment verification fields.",
          }),
        );
      }

      const isValid = yield* verifyPaymentSignatureEffect({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isValid) {
        return yield* Effect.fail(
          new BoundaryValidationError({
            message: "Invalid payment signature.",
          }),
        );
      }

      return { success: true };
    }),
  );
}

export const POST = withRateLimit(handleVerifyPayment, {
  errorMessage:
    "Too many payment verification requests. Please wait before trying again.",
});
