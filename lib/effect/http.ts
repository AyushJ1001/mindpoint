import { Effect } from "effect";
import { NextResponse } from "next/server";
import { ZodError, type z } from "zod";
import {
  BoundaryConfigurationError,
  type BoundaryError,
  type BoundaryErrorCode,
  type BoundaryThrowable,
  BoundaryUnexpectedError,
  BoundaryValidationError,
  boundaryErrorFromThrowable,
  type JsonValue,
  zodErrorToBoundaryError,
} from "./errors";

export type BoundaryFailureBody = {
  readonly code: BoundaryErrorCode;
  readonly details?: JsonValue;
  readonly error: string;
  readonly success: false;
};

export type BoundaryHttpFailure = {
  readonly body: BoundaryFailureBody;
  readonly status: number;
};

export function boundaryErrorToHttp(error: BoundaryError): BoundaryHttpFailure {
  const metadata = boundaryErrorMetadata(error);
  const body: BoundaryFailureBody = {
    code: metadata.code,
    error: error.message,
    success: false,
    ...("details" in error && error.details !== undefined
      ? { details: error.details }
      : {}),
  };

  return {
    body,
    status: metadata.status,
  };
}

function boundaryErrorMetadata(error: BoundaryError): {
  readonly code: BoundaryErrorCode;
  readonly status: number;
} {
  switch (error._tag) {
    case "BoundaryValidationError":
      return { code: "VALIDATION_ERROR", status: 400 };
    case "BoundaryUnauthorizedError":
      return { code: "UNAUTHORIZED", status: 401 };
    case "BoundaryForbiddenError":
      return { code: "FORBIDDEN", status: 403 };
    case "BoundaryConflictError":
      return { code: "CONFLICT", status: 409 };
    case "BoundaryNotFoundError":
      return { code: "NOT_FOUND", status: 404 };
    case "BoundaryConfigurationError":
      return { code: "CONFIGURATION_ERROR", status: 500 };
    case "BoundaryExternalServiceError":
      return { code: "EXTERNAL_SERVICE_ERROR", status: 502 };
    case "BoundaryUnexpectedError":
      return { code: "UNEXPECTED_ERROR", status: 500 };
  }
}

export function parseJsonEffect<A = JsonValue>(
  req: Request,
): Effect.Effect<A, BoundaryValidationError> {
  return Effect.tryPromise({
    try: async () => (await req.json()) as A,
    catch: (cause) =>
      new BoundaryValidationError({
        ...(cause instanceof Error ? { cause } : {}),
        message: "Request body must be valid JSON.",
      }),
  });
}

export function parseFormDataEffect(
  req: Request,
): Effect.Effect<FormData, BoundaryValidationError> {
  return Effect.tryPromise({
    try: () => req.formData(),
    catch: (cause) =>
      new BoundaryValidationError({
        ...(cause instanceof Error ? { cause } : {}),
        message: "Request body must be valid form data.",
      }),
  });
}

export function parseWithSchemaEffect<Schema extends z.ZodType>(
  schema: Schema,
  input: z.input<Schema>,
): Effect.Effect<z.infer<Schema>, BoundaryValidationError> {
  return Effect.try({
    try: () => schema.parse(input),
    catch: (cause) =>
      cause instanceof ZodError
        ? zodErrorToBoundaryError(cause)
        : new BoundaryValidationError({
            ...(cause instanceof Error ? { cause } : {}),
            message: "Invalid input.",
          }),
  });
}

export function configEffect<A>(
  readConfig: () => A,
): Effect.Effect<A, BoundaryConfigurationError> {
  return Effect.try({
    try: readConfig,
    catch: (cause) => {
      if (cause instanceof BoundaryConfigurationError) {
        return cause;
      }

      return new BoundaryConfigurationError({
        ...(cause instanceof Error ? { cause } : {}),
        message:
          cause instanceof Error
            ? cause.message
            : "Server configuration is invalid.",
      });
    },
  });
}

export function unexpectedEffect<A>(
  run: () => A,
): Effect.Effect<A, BoundaryUnexpectedError> {
  return Effect.try({
    try: run,
    catch: (cause) =>
      new BoundaryUnexpectedError({
        ...(cause instanceof Error ? { cause } : {}),
        message: cause instanceof Error ? cause.message : "Unexpected error.",
      }),
  });
}

export function runApiEffect<A>(
  effect: Effect.Effect<A, BoundaryError, never>,
  onSuccess: (value: A) => NextResponse = (value) => NextResponse.json(value),
): Promise<NextResponse> {
  return Effect.runPromise(
    effect.pipe(
      Effect.match({
        onFailure: (error) => {
          const http = boundaryErrorToHttp(error);
          return NextResponse.json(http.body, { status: http.status });
        },
        onSuccess,
      }),
    ),
  ).catch((cause) => {
    const http = boundaryErrorToHttp(
      boundaryErrorFromThrowable(cause as BoundaryThrowable),
    );
    return NextResponse.json(http.body, { status: http.status });
  });
}
