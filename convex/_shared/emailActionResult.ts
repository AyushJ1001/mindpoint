import { v } from "convex/values";
import {
  convexFailure,
  convexResultErrorValidator,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
  type ConvexSuccess,
} from "./result";

export type EmailActionErrorCode = "EMAIL_DELIVERY_FAILED" | "RATE_LIMITED";

export type EmailActionResult =
  | ConvexFailure<EmailActionErrorCode>
  | ConvexSuccess<{}>;

export const emailActionResultValidator = v.union(
  v.object({
    _tag: v.literal("Success"),
    success: v.literal(true),
  }),
  v.object({
    _tag: v.literal("Failure"),
    error: convexResultErrorValidator,
    success: v.literal(false),
  }),
);

export function emailActionSuccess(): EmailActionResult {
  return convexSuccess({});
}

export function emailRateLimitFailure(
  message: string,
): ConvexFailure<"RATE_LIMITED"> {
  return convexFailure({
    code: convexResultErrorCode.RATE_LIMITED,
    message,
  });
}

export function emailDeliveryFailure(
  message: string,
): ConvexFailure<"EMAIL_DELIVERY_FAILED"> {
  return convexFailure({
    code: convexResultErrorCode.EMAIL_DELIVERY_FAILED,
    message,
  });
}

export function emailDeliveryFailureFromThrowable(
  error: Error | object | string,
): ConvexFailure<"EMAIL_DELIVERY_FAILED"> {
  return emailDeliveryFailure(
    error instanceof Error ? error.message : String(error),
  );
}

export function isEmailActionFailure(
  result: EmailActionResult,
): result is ConvexFailure<EmailActionErrorCode> {
  return result._tag === "Failure";
}
