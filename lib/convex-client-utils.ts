/**
 * Utility functions for robust Convex client operations with retry logic
 * and timeout handling for payment-critical operations.
 */

import { ConvexHttpClient } from "convex/browser";
import { FunctionReference } from "convex/server";

/**
 * Retry configuration for payment-critical operations
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  timeoutMs: 30000, // 30 seconds timeout
} as const;

/**
 * Check if an error is retryable (transient network/server errors)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Network errors, timeouts, and server errors are retryable
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("econnreset") ||
      message.includes("etimedout") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("504") ||
      message.includes("500") ||
      // Convex-specific errors
      message.includes("rate limit") ||
      message.includes("temporary")
    );
  }
  return false;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.initialDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * baseDelay; // 30% jitter
  return Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a Convex mutation with retry logic and timeout handling
 */
export async function executeConvexMutationWithRetry<
  Args extends object,
  Return,
>(
  mutation: FunctionReference<
    "mutation",
    "public",
    { _returnType: Return; _argsType: Args }
  >,
  args: Args,
  context: {
    userId?: string;
    userEmail?: string;
    courseIds?: string[];
    operationType: string;
  },
): Promise<Return> {
  // Validate environment variable
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot execute Convex mutation.",
    );
  }

  // Create Convex client
  const convex = new ConvexHttpClient(convexUrl);

  let lastError: Error | unknown = null;
  const errors: Array<{ attempt: number; error: string; timestamp: Date }> = [];

  // Retry loop
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      // Log attempt
      if (attempt > 0) {
        console.log(
          `Retrying Convex mutation (${context.operationType}): attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`,
          {
            userId: context.userId,
            userEmail: context.userEmail,
            courseIds: context.courseIds,
          },
        );
      }

      // Execute with timeout using Promise.race
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mutationPromise = convex.mutation(mutation as any, args as any);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `Convex mutation timed out after ${RETRY_CONFIG.timeoutMs}ms`,
              ),
            ),
          RETRY_CONFIG.timeoutMs,
        );
      });

      const result = await Promise.race([mutationPromise, timeoutPromise]);

      // Success - log and return
      if (attempt > 0) {
        console.log(
          `Convex mutation succeeded after ${attempt + 1} attempts (${context.operationType})`,
        );
      }

      return result;
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push({
        attempt: attempt + 1,
        error: errorMessage,
        timestamp: new Date(),
      });

      // Log error with context
      console.error(
        `Convex mutation failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`,
        {
          operationType: context.operationType,
          error: errorMessage,
          userId: context.userId,
          userEmail: context.userEmail,
          courseIds: context.courseIds,
          retryable: isRetryableError(error),
        },
      );

      // If this is the last attempt or error is not retryable, throw
      if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
        // Log all errors for debugging
        console.error(
          `Convex mutation failed after all retries (${context.operationType}):`,
          {
            totalAttempts: attempt + 1,
            errors,
            userId: context.userId,
            userEmail: context.userEmail,
            courseIds: context.courseIds,
          },
        );

        throw new Error(
          `Failed to execute Convex mutation after ${attempt + 1} attempts: ${errorMessage}`,
        );
      }

      // Calculate backoff delay and wait before retrying
      const delay = calculateBackoffDelay(attempt);
      console.log(
        `Retrying Convex mutation in ${Math.round(delay)}ms (${context.operationType})`,
      );
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown error occurred during Convex mutation");
}

/**
 * Get or create Convex HTTP client (cached for reuse)
 */
let cachedClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot create Convex client.",
    );
  }

  // Reuse cached client if available (it's stateless)
  if (!cachedClient) {
    cachedClient = new ConvexHttpClient(convexUrl);
  }

  return cachedClient;
}
