import {
  BoundaryValidationError,
  isJsonObject,
  type BoundaryError,
  type JsonObject,
  type JsonValue,
} from "@/lib/effect";
import { Effect } from "effect";

import type { CreatePaymentOrderInput } from "./payments";

export type CreateOrderBody = CreatePaymentOrderInput;

type CreateOrderCartItem =
  CreatePaymentOrderInput["cartIntent"]["items"][number];

function jsonString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function jsonNumber(value: JsonValue | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function readCartItem(value: JsonValue): CreateOrderCartItem | null {
  if (!isJsonObject(value)) {
    return null;
  }

  const cartItemId = jsonString(value.cartItemId);
  const courseId = jsonString(value.courseId);

  if (!cartItemId || !courseId) {
    return null;
  }

  return {
    cartItemId,
    courseId,
    batchId: jsonString(value.batchId),
    clientCheckoutPrice: jsonNumber(value.clientCheckoutPrice),
    clientListedPrice: jsonNumber(value.clientListedPrice),
    couponCode: jsonString(value.couponCode),
    mindPointsRedeemed: jsonNumber(value.mindPointsRedeemed),
    quantity: jsonNumber(value.quantity),
    selectedFreeBatchId: jsonString(value.selectedFreeBatchId),
    selectedFreeCourseId: jsonString(value.selectedFreeCourseId),
  };
}

function readCartIntent(
  value: JsonValue | undefined,
): CreatePaymentOrderInput["cartIntent"] | null {
  if (!isJsonObject(value) || !Array.isArray(value.items)) {
    return null;
  }

  const items = value.items.map(readCartItem);

  if (items.length === 0 || items.some((item) => item === null)) {
    return null;
  }

  return {
    items: items.filter((item): item is CreateOrderCartItem => item !== null),
  };
}

function failInvalidCart() {
  return Effect.fail(
    new BoundaryValidationError({
      message: "Checkout requires a current cart.",
    }),
  );
}

export function validateCreateOrderBodyEffect(
  body: JsonValue,
): Effect.Effect<CreateOrderBody, BoundaryError> {
  return Effect.gen(function* () {
    if (!isJsonObject(body)) {
      return yield* failInvalidCart();
    }

    const rawBody: JsonObject = body;
    const cartIntent = readCartIntent(rawBody.cartIntent);

    if (!cartIntent) {
      return yield* failInvalidCart();
    }

    return {
      cartIntent,
      buyerEmail: jsonString(rawBody.buyerEmail),
      referrerClerkUserId: jsonString(rawBody.referrerClerkUserId),
    };
  });
}
