import { Data } from "effect";
import { ZodError } from "zod";

export type JsonPrimitive = boolean | null | number | string;
export type JsonArray = readonly JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type BoundaryThrowable =
  | bigint
  | boolean
  | BoundaryError
  | Error
  | JsonArray
  | JsonObject
  | null
  | number
  | string
  | symbol
  | undefined
  | ZodError;

type ErrorCause = { readonly cause?: Error };
type TaggedCandidate = { readonly _tag?: string };

export function isJsonObject(
  value: JsonValue | undefined,
): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class BoundaryValidationError extends Data.TaggedError(
  "BoundaryValidationError",
)<{
  readonly cause?: Error;
  readonly details?: JsonValue;
  readonly message: string;
}> {}

export class BoundaryUnauthorizedError extends Data.TaggedError(
  "BoundaryUnauthorizedError",
)<{
  readonly cause?: Error;
  readonly message: string;
}> {}

export class BoundaryForbiddenError extends Data.TaggedError(
  "BoundaryForbiddenError",
)<{
  readonly cause?: Error;
  readonly message: string;
}> {}

export class BoundaryConflictError extends Data.TaggedError(
  "BoundaryConflictError",
)<{
  readonly cause?: Error;
  readonly details?: JsonValue;
  readonly message: string;
}> {}

export class BoundaryNotFoundError extends Data.TaggedError(
  "BoundaryNotFoundError",
)<{
  readonly cause?: Error;
  readonly details?: JsonValue;
  readonly message: string;
}> {}

export class BoundaryConfigurationError extends Data.TaggedError(
  "BoundaryConfigurationError",
)<{
  readonly cause?: Error;
  readonly message: string;
}> {}

export class BoundaryExternalServiceError extends Data.TaggedError(
  "BoundaryExternalServiceError",
)<{
  readonly cause?: Error;
  readonly message: string;
}> {}

export class BoundaryUnexpectedError extends Data.TaggedError(
  "BoundaryUnexpectedError",
)<{
  readonly cause?: Error;
  readonly message: string;
}> {}

export type BoundaryError =
  | BoundaryValidationError
  | BoundaryUnauthorizedError
  | BoundaryForbiddenError
  | BoundaryConflictError
  | BoundaryNotFoundError
  | BoundaryConfigurationError
  | BoundaryExternalServiceError
  | BoundaryUnexpectedError;

export type BoundaryErrorCode =
  | "CONFIGURATION_ERROR"
  | "CONFLICT"
  | "EXTERNAL_SERVICE_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "UNEXPECTED_ERROR"
  | "VALIDATION_ERROR";

const boundaryErrorTags = new Set([
  "BoundaryValidationError",
  "BoundaryUnauthorizedError",
  "BoundaryForbiddenError",
  "BoundaryConflictError",
  "BoundaryNotFoundError",
  "BoundaryConfigurationError",
  "BoundaryExternalServiceError",
  "BoundaryUnexpectedError",
]);

export function isBoundaryError(
  error: BoundaryThrowable,
): error is BoundaryError {
  if (typeof error !== "object" || error === null || !("_tag" in error)) {
    return false;
  }

  const candidate = error as TaggedCandidate;

  return (
    typeof candidate._tag === "string" && boundaryErrorTags.has(candidate._tag)
  );
}

export function errorCause(cause: BoundaryThrowable): ErrorCause {
  return cause instanceof Error ? { cause } : {};
}

export function zodErrorToBoundaryError(
  error: ZodError,
): BoundaryValidationError {
  return new BoundaryValidationError({
    cause: error,
    message: error.issues[0]?.message ?? "Invalid input.",
  });
}

export function boundaryErrorFromThrowable(
  cause: BoundaryThrowable,
  fallbackMessage = "Unexpected server error.",
): BoundaryError {
  if (isBoundaryError(cause)) {
    return cause;
  }

  if (cause instanceof ZodError) {
    return zodErrorToBoundaryError(cause);
  }

  if (cause instanceof Error) {
    if (
      cause.message.includes("environment variable is not set") ||
      cause.message.includes("not configured")
    ) {
      return new BoundaryConfigurationError({
        ...errorCause(cause),
        message: cause.message,
      });
    }

    return new BoundaryUnexpectedError({
      ...errorCause(cause),
      message: cause.message || fallbackMessage,
    });
  }

  return new BoundaryUnexpectedError({
    message: fallbackMessage,
  });
}
