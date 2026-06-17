import { Effect } from "effect";

import {
  BoundaryConflictError,
  type BoundaryError,
  type BoundaryErrorCode,
  BoundaryExternalServiceError,
  BoundaryForbiddenError,
  BoundaryNotFoundError,
  BoundaryUnauthorizedError,
  BoundaryUnexpectedError,
  BoundaryValidationError,
  type JsonValue,
} from "../effect/errors";

export type FetchImpl = typeof fetch;

type RequestOptions = {
  fetchImpl?: FetchImpl;
  headers?: HeadersInit;
  timeoutMs?: number;
};

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export type HttpClientFailure = {
  readonly code: BoundaryErrorCode;
  readonly details?: JsonValue;
  readonly error: string;
  readonly status: number;
  readonly success: false;
};

export type HttpClientResult<TResponse> =
  | {
      readonly data: TResponse;
      readonly success: true;
    }
  | HttpClientFailure;

function getErrorMessage(payload: JsonValue, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function boundaryErrorStatus(error: BoundaryError): number {
  switch (error._tag) {
    case "BoundaryValidationError":
      return 400;
    case "BoundaryUnauthorizedError":
      return 401;
    case "BoundaryForbiddenError":
      return 403;
    case "BoundaryNotFoundError":
      return 404;
    case "BoundaryConflictError":
      return 409;
    case "BoundaryConfigurationError":
    case "BoundaryUnexpectedError":
      return 500;
    case "BoundaryExternalServiceError":
      return 502;
  }
}

function boundaryErrorCode(error: BoundaryError): BoundaryErrorCode {
  switch (error._tag) {
    case "BoundaryValidationError":
      return "VALIDATION_ERROR";
    case "BoundaryUnauthorizedError":
      return "UNAUTHORIZED";
    case "BoundaryForbiddenError":
      return "FORBIDDEN";
    case "BoundaryNotFoundError":
      return "NOT_FOUND";
    case "BoundaryConflictError":
      return "CONFLICT";
    case "BoundaryConfigurationError":
      return "CONFIGURATION_ERROR";
    case "BoundaryExternalServiceError":
      return "EXTERNAL_SERVICE_ERROR";
    case "BoundaryUnexpectedError":
      return "UNEXPECTED_ERROR";
  }
}

export function boundaryErrorToHttpClientFailure(
  error: BoundaryError,
): HttpClientFailure {
  return {
    code: boundaryErrorCode(error),
    error: error.message,
    status: boundaryErrorStatus(error),
    success: false,
    ...("details" in error && error.details !== undefined
      ? { details: error.details }
      : {}),
  };
}

function httpStatusError(status: number, payload: JsonValue): BoundaryError {
  const message = getErrorMessage(
    payload,
    `Request failed with status ${status}.`,
  );
  const details = payload;

  switch (status) {
    case 400:
      return new BoundaryValidationError({ details, message });
    case 401:
      return new BoundaryUnauthorizedError({ message });
    case 403:
      return new BoundaryForbiddenError({ message });
    case 404:
      return new BoundaryNotFoundError({ details, message });
    case 409:
      return new BoundaryConflictError({ details, message });
    default:
      return new BoundaryExternalServiceError({ message });
  }
}

function requestFailureFromCause(
  cause: JsonValue | Error,
  timeoutMs: number,
): BoundaryError {
  if (cause instanceof Error && cause.name === "AbortError") {
    return new BoundaryExternalServiceError({
      cause,
      message: `Request timed out after ${timeoutMs}ms.`,
    });
  }

  return new BoundaryExternalServiceError({
    ...(cause instanceof Error ? { cause } : {}),
    message: cause instanceof Error ? cause.message : "Request failed.",
  });
}

function readJsonPayloadEffect(response: Response): Effect.Effect<JsonValue> {
  return Effect.promise(async () => {
    try {
      return (await response.json()) as JsonValue;
    } catch {
      return null;
    }
  });
}

function parseJsonResponseEffect<TResponse>(
  response: Response,
): Effect.Effect<TResponse, BoundaryError> {
  return readJsonPayloadEffect(response).pipe(
    Effect.flatMap((payload) => {
      if (!response.ok) {
        return Effect.fail(httpStatusError(response.status, payload));
      }

      if (payload === null) {
        return Effect.fail(
          new BoundaryUnexpectedError({
            message: "Request succeeded without a response body.",
          }),
        );
      }

      return Effect.succeed(payload as TResponse);
    }),
  );
}

export function postJsonEffect<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  options: RequestOptions = {},
): Effect.Effect<TResponse, BoundaryError> {
  const {
    fetchImpl = fetch,
    headers,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;

  return Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        return await fetchImpl(endpoint, {
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          method: "POST",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutHandle);
      }
    },
    catch: (cause) =>
      requestFailureFromCause(cause as JsonValue | Error, timeoutMs),
  }).pipe(Effect.flatMap(parseJsonResponseEffect<TResponse>));
}

export function postFormDataEffect<TResponse>(
  endpoint: string,
  body: FormData,
  options: RequestOptions = {},
): Effect.Effect<TResponse, BoundaryError> {
  const {
    fetchImpl = fetch,
    headers,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;

  return Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        return await fetchImpl(endpoint, {
          body,
          headers,
          method: "POST",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutHandle);
      }
    },
    catch: (cause) =>
      requestFailureFromCause(cause as JsonValue | Error, timeoutMs),
  }).pipe(Effect.flatMap(parseJsonResponseEffect<TResponse>));
}

export function postJsonResult<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  options: RequestOptions = {},
): Promise<HttpClientResult<TResponse>> {
  return Effect.runPromise(
    postJsonEffect<TRequest, TResponse>(endpoint, body, options).pipe(
      Effect.match({
        onFailure: boundaryErrorToHttpClientFailure,
        onSuccess: (data) => ({ data, success: true }),
      }),
    ),
  );
}

export function postFormDataResult<TResponse>(
  endpoint: string,
  body: FormData,
  options: RequestOptions = {},
): Promise<HttpClientResult<TResponse>> {
  return Effect.runPromise(
    postFormDataEffect<TResponse>(endpoint, body, options).pipe(
      Effect.match({
        onFailure: boundaryErrorToHttpClientFailure,
        onSuccess: (data) => ({ data, success: true }),
      }),
    ),
  );
}
