export type FetchImpl = typeof fetch;

type RequestOptions = {
  fetchImpl?: FetchImpl;
  headers?: HeadersInit;
  timeoutMs?: number;
};

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

function getErrorMessage(payload: unknown, fallback: string): string {
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
  const {
    fetchImpl = fetch,
    headers,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
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
  const {
    fetchImpl = fetch,
    headers,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
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
