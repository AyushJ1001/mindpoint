import { v, type Validator } from "convex/values";

export const convexResultErrorCode = {
  CHECKOUT_ATTEMPT_INVALID_STATE: "CHECKOUT_ATTEMPT_INVALID_STATE",
  CHECKOUT_ATTEMPT_NOT_FOUND: "CHECKOUT_ATTEMPT_NOT_FOUND",
  CONFLICT: "CONFLICT",
  COUPON_ALREADY_USED: "COUPON_ALREADY_USED",
  COUPON_NOT_FOUND: "COUPON_NOT_FOUND",
  EMAIL_DELIVERY_FAILED: "EMAIL_DELIVERY_FAILED",
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_POINTS: "INSUFFICIENT_POINTS",
  INVALID_COUPON_CODE: "INVALID_COUPON_CODE",
  INVALID_POINTS_REQUIREMENT: "INVALID_POINTS_REQUIREMENT",
  NOT_FOUND: "NOT_FOUND",
  POINTS_ACCOUNT_NOT_FOUND: "POINTS_ACCOUNT_NOT_FOUND",
  POINTS_RECORD_NOT_FOUND: "POINTS_RECORD_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type ConvexResultErrorCode =
  (typeof convexResultErrorCode)[keyof typeof convexResultErrorCode];

export type ConvexSerializablePrimitive = boolean | null | number | string;
export type ConvexSerializableArray = readonly ConvexSerializable[];
export type ConvexSerializableObject = {
  readonly [key: string]: ConvexSerializable | undefined;
};
export type ConvexSerializable =
  | ConvexSerializableArray
  | ConvexSerializableObject
  | ConvexSerializablePrimitive;

export type ConvexResultPayload = Record<
  string,
  ConvexSerializable | undefined
>;

export type ConvexResultError<
  Code extends ConvexResultErrorCode = ConvexResultErrorCode,
> = {
  readonly _tag: "ConvexResultError";
  readonly code: Code;
  readonly details?: ConvexSerializable;
  readonly message: string;
};

export type ConvexFailure<
  Code extends ConvexResultErrorCode = ConvexResultErrorCode,
> = {
  readonly _tag: "Failure";
  readonly error: ConvexResultError<Code>;
  readonly success: false;
};

export type ConvexSuccess<Payload extends ConvexResultPayload> = {
  readonly _tag: "Success";
  readonly success: true;
} & Payload;

export type ConvexResult<
  Payload extends ConvexResultPayload,
  Code extends ConvexResultErrorCode = ConvexResultErrorCode,
> = ConvexFailure<Code> | ConvexSuccess<Payload>;

type ConvexSerializableValidator = Validator<
  ConvexSerializable,
  "required",
  string
>;

const convexSerializablePrimitiveValidator = v.union(
  v.boolean(),
  v.null(),
  v.number(),
  v.string(),
);

const convexSerializableDepth1Validator = v.union(
  convexSerializablePrimitiveValidator,
  v.array(convexSerializablePrimitiveValidator),
  v.record(v.string(), convexSerializablePrimitiveValidator),
);

const convexSerializableDepth2Validator = v.union(
  convexSerializablePrimitiveValidator,
  v.array(convexSerializableDepth1Validator),
  v.record(v.string(), convexSerializableDepth1Validator),
);

export const convexSerializableValidator: ConvexSerializableValidator = v.union(
  convexSerializablePrimitiveValidator,
  v.array(convexSerializableDepth2Validator),
  v.record(v.string(), convexSerializableDepth2Validator),
);

export const convexResultErrorCodeValidator = v.union(
  v.literal(convexResultErrorCode.CHECKOUT_ATTEMPT_INVALID_STATE),
  v.literal(convexResultErrorCode.CHECKOUT_ATTEMPT_NOT_FOUND),
  v.literal(convexResultErrorCode.CONFLICT),
  v.literal(convexResultErrorCode.COUPON_ALREADY_USED),
  v.literal(convexResultErrorCode.COUPON_NOT_FOUND),
  v.literal(convexResultErrorCode.EMAIL_DELIVERY_FAILED),
  v.literal(convexResultErrorCode.FORBIDDEN),
  v.literal(convexResultErrorCode.INSUFFICIENT_POINTS),
  v.literal(convexResultErrorCode.INVALID_COUPON_CODE),
  v.literal(convexResultErrorCode.INVALID_POINTS_REQUIREMENT),
  v.literal(convexResultErrorCode.NOT_FOUND),
  v.literal(convexResultErrorCode.POINTS_ACCOUNT_NOT_FOUND),
  v.literal(convexResultErrorCode.POINTS_RECORD_NOT_FOUND),
  v.literal(convexResultErrorCode.RATE_LIMITED),
  v.literal(convexResultErrorCode.UNAUTHORIZED),
  v.literal(convexResultErrorCode.VALIDATION_ERROR),
);

export const convexResultErrorValidator = v.object({
  _tag: v.literal("ConvexResultError"),
  code: convexResultErrorCodeValidator,
  details: v.optional(convexSerializableValidator),
  message: v.string(),
});

export function convexSuccess<Payload extends ConvexResultPayload>(
  payload: Payload,
): ConvexSuccess<Payload> {
  return {
    _tag: "Success",
    success: true,
    ...payload,
  };
}

export function convexFailure<Code extends ConvexResultErrorCode>(error: {
  readonly code: Code;
  readonly details?: ConvexSerializable;
  readonly message: string;
}): ConvexFailure<Code> {
  return {
    _tag: "Failure",
    error: {
      _tag: "ConvexResultError",
      code: error.code,
      ...(error.details !== undefined ? { details: error.details } : {}),
      message: error.message,
    },
    success: false,
  };
}

export function getConvexResultErrorMessage(
  result: ConvexResult<ConvexResultPayload>,
  fallback: string,
): string {
  switch (result._tag) {
    case "Failure":
      return result.error.message;
    case "Success":
      return fallback;
  }
}
