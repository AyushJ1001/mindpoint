import { publicEnv } from "./public-env";

/**
 * Base URL for the web API. Falls back to production URL if siteUrl is not set.
 */
function getBaseUrl(): string {
  return publicEnv.siteUrl || "https://themindpoint.org";
}

type RequestOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  if (
    "error" in payload &&
    typeof (payload as Record<string, unknown>).error === "string"
  ) {
    return (payload as Record<string, string>).error;
  }
  if (
    "message" in payload &&
    typeof (payload as Record<string, unknown>).message === "string"
  ) {
    return (payload as Record<string, string>).message;
  }
  return fallback;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let payload: T | null = null;
  try {
    payload = (await response.json()) as T;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        `Request failed with status ${response.status}.`,
      ),
    );
  }

  if (!payload) {
    throw new Error("Request succeeded without a response body.");
  }

  return payload;
}

export async function postJson<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { headers, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });

    return parseJsonResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export async function postFormData<TResponse>(
  endpoint: string,
  body: FormData,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { headers, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers,
      body,
    });

    return parseJsonResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/**
 * Create a Razorpay payment order via the web API.
 */
export async function createPaymentOrder(amount: number) {
  return postJson<
    { amount: number },
    { id: string; amount: number; currency: string }
  >("/api/create-order", { amount });
}

export async function verifyRazorpayPayment(payment: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return postJson<
    {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
    { success: boolean }
  >("/api/verify-payment", payment);
}
