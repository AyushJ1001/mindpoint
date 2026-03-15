import "server-only";

import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import type { CheckoutPricing } from "@mindpoint/domain/checkout";
import { ConvexHttpClient } from "convex/browser";
import type { DefaultFunctionArgs, FunctionReference } from "convex/server";

const RETRY_CONFIG = {
  initialDelayMs: 500,
  maxDelayMs: 5000,
  maxRetries: 3,
  timeoutMs: 30000,
} as const;

type MutationContext = {
  operationType: string;
  courseIds?: string[];
  referrerClerkUserId?: string;
  userEmail?: string;
  userId?: string;
};

type CheckoutResult = {
  success: boolean;
  error?: string;
};

export type EnrollmentSummary = {
  courseId?: string;
  courseName: string;
  enrollmentId: string;
  enrollmentNumber: string;
  isBogoFree?: boolean;
  sessionType?: string;
};

function resolveConvexUrl(convexUrl?: string): string {
  const resolvedConvexUrl = convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!resolvedConvexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot execute Convex mutation.",
    );
  }

  return resolvedConvexUrl;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const hasRetryableStatusCode = /(^|\D)(502|503|504)(\D|$)/.test(message);

  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    hasRetryableStatusCode ||
    message.includes("rate limit") ||
    message.includes("temporary")
  );
}

function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.initialDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * baseDelay;
  return Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeConvexMutationWithRetry<Args extends object, Return>(
  mutation: FunctionReference<"mutation", "public", DefaultFunctionArgs>,
  args: Args,
  context: MutationContext,
  convexUrl?: string,
): Promise<Return> {
  const convex = new ConvexHttpClient(resolveConvexUrl(convexUrl));
  let lastError: Error | unknown = null;
  const errors: Array<{ attempt: number; error: string; timestamp: Date }> = [];

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      if (attempt > 0) {
        console.log(
          `Retrying Convex mutation (${context.operationType}): attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`,
          {
            courseIds: context.courseIds,
            userEmail: context.userEmail,
            userId: context.userId,
          },
        );
      }

      const mutationPromise = convex.mutation(
        mutation as FunctionReference<
          "mutation",
          "public",
          DefaultFunctionArgs
        >,
        args as DefaultFunctionArgs,
      );
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
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
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      if (attempt > 0) {
        console.log(
          `Convex mutation succeeded after ${attempt + 1} attempts (${context.operationType})`,
        );
      }

      return result as Return;
    } catch (error) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push({
        attempt: attempt + 1,
        error: errorMessage,
        timestamp: new Date(),
      });

      console.error(
        `Convex mutation failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`,
        {
          courseIds: context.courseIds,
          error: errorMessage,
          operationType: context.operationType,
          retryable: isRetryableError(error),
          userEmail: context.userEmail,
          userId: context.userId,
        },
      );

      if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
        console.error(
          `Convex mutation failed after all retries (${context.operationType}):`,
          {
            courseIds: context.courseIds,
            errors,
            totalAttempts: attempt + 1,
            userEmail: context.userEmail,
            userId: context.userId,
          },
        );

        throw new Error(
          `Failed to execute Convex mutation after ${attempt + 1} attempts: ${errorMessage}`,
        );
      }

      const delay = calculateBackoffDelay(attempt);
      console.log(
        `Retrying Convex mutation in ${Math.round(delay)}ms (${context.operationType})`,
      );
      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown error occurred during Convex mutation");
}

async function runCheckoutMutation<TResult>(
  mutation: FunctionReference<"mutation", "public", DefaultFunctionArgs>,
  args: DefaultFunctionArgs,
  context: MutationContext,
  convexUrl?: string,
): Promise<TResult> {
  return executeConvexMutationWithRetry<DefaultFunctionArgs, TResult>(
    mutation,
    args,
    context,
    convexUrl,
  );
}

export async function handlePaymentSuccess(
  userId: string,
  courseIds: Id<"courses">[],
  userEmail: string,
  userPhone?: string,
  studentName?: string,
  sessionType?: "focus" | "flow" | "elevate",
  bogoSelections?: Array<{
    sourceCourseId: Id<"courses">;
    selectedFreeCourseId: Id<"courses">;
  }>,
  referrerClerkUserId?: string,
  checkoutPricing?: CheckoutPricing,
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollments?: EnrollmentSummary[] }> {
  try {
    const enrollments = await runCheckoutMutation<EnrollmentSummary[]>(
      api.myFunctions.handleCartCheckout,
      {
        bogoSelections,
        checkoutPricing,
        courseIds,
        referrerClerkUserId,
        sessionType,
        studentName,
        userEmail,
        userId,
        userPhone,
      },
      {
        courseIds: courseIds.map((id) => id),
        operationType: "handleCartCheckout",
        referrerClerkUserId,
        userEmail,
        userId,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error("Error handling payment success (all retries exhausted):", {
      courseIds: courseIds.map((id) => id),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userEmail,
      userId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleGuestUserPaymentSuccess(
  userEmail: string,
  courseIds: Id<"courses">[],
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollments?: EnrollmentSummary[] }> {
  try {
    const enrollments = await runCheckoutMutation<EnrollmentSummary[]>(
      api.myFunctions.handleGuestUserCartCheckoutByEmail,
      {
        courseIds,
        userEmail,
      },
      {
        courseIds: courseIds.map((id) => id),
        operationType: "handleGuestUserCartCheckoutByEmail",
        userEmail,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error(
      "Error handling guest user payment success (all retries exhausted):",
      {
        courseIds: courseIds.map((id) => id),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userEmail,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleGuestUserPaymentSuccessWithData(
  userData: { email: string; name: string; phone: string },
  courseIds: Id<"courses">[],
  sessionType?: "focus" | "flow" | "elevate",
  bogoSelections?: Array<{
    sourceCourseId: Id<"courses">;
    selectedFreeCourseId: Id<"courses">;
  }>,
  checkoutPricing?: CheckoutPricing,
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollments?: EnrollmentSummary[] }> {
  try {
    const enrollments = await runCheckoutMutation<EnrollmentSummary[]>(
      api.myFunctions.handleGuestUserCartCheckoutWithData,
      {
        bogoSelections,
        checkoutPricing,
        courseIds,
        sessionType,
        userData,
      },
      {
        courseIds: courseIds.map((id) => id),
        operationType: "handleGuestUserCartCheckoutWithData",
        userEmail: userData.email,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error(
      "Error handling guest user payment success with data (all retries exhausted):",
      {
        courseIds: courseIds.map((id) => id),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userEmail: userData.email,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleSingleCourseEnrollment(
  userId: string,
  courseId: Id<"courses">,
  userEmail: string,
  userPhone?: string,
  studentName?: string,
  sessionType?: "focus" | "flow" | "elevate",
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollment?: EnrollmentSummary }> {
  try {
    const enrollment = await runCheckoutMutation<{
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
    }>(
      api.myFunctions.handleSuccessfulPayment,
      {
        courseId,
        sessionType,
        studentName,
        userEmail,
        userId,
        userPhone,
      },
      {
        courseIds: [courseId],
        operationType: "handleSuccessfulPayment",
        userEmail,
        userId,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
      },
    };
  } catch (error) {
    console.error(
      "Error handling single course enrollment (all retries exhausted):",
      {
        courseId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userEmail,
        userId,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleGuestUserSingleEnrollment(
  userEmail: string,
  courseId: Id<"courses">,
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollment?: EnrollmentSummary }> {
  try {
    const enrollment = await runCheckoutMutation<{
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
    }>(
      api.myFunctions.handleGuestUserSingleEnrollmentByEmail,
      {
        courseId,
        userEmail,
      },
      {
        courseIds: [courseId],
        operationType: "handleGuestUserSingleEnrollmentByEmail",
        userEmail,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
      },
    };
  } catch (error) {
    console.error(
      "Error handling guest user single course enrollment (all retries exhausted):",
      {
        courseId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userEmail,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleSupervisedTherapyEnrollment(
  userId: string,
  courseId: Id<"courses">,
  userEmail: string,
  userPhone: string,
  studentName: string,
  sessionType: "focus" | "flow" | "elevate",
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollment?: EnrollmentSummary }> {
  try {
    const enrollment = await runCheckoutMutation<{
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
      sessionType: "focus" | "flow" | "elevate";
    }>(
      api.myFunctions.handleSupervisedTherapyEnrollment,
      {
        courseId,
        sessionType,
        studentName,
        userEmail,
        userId,
        userPhone,
      },
      {
        courseIds: [courseId],
        operationType: "handleSupervisedTherapyEnrollment",
        userEmail,
        userId,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        sessionType: enrollment.sessionType,
      },
    };
  } catch (error) {
    console.error(
      "Error handling supervised therapy enrollment (all retries exhausted):",
      {
        courseId,
        error: error instanceof Error ? error.message : String(error),
        sessionType,
        stack: error instanceof Error ? error.stack : undefined,
        userEmail,
        userId,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleGuestUserSupervisedTherapyEnrollment(
  userEmail: string,
  userPhone: string,
  courseId: Id<"courses">,
  studentName: string,
  sessionType: "focus" | "flow" | "elevate",
  options: { convexUrl?: string } = {},
): Promise<CheckoutResult & { enrollment?: EnrollmentSummary }> {
  try {
    const enrollment = await runCheckoutMutation<{
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
      sessionType: "focus" | "flow" | "elevate";
    }>(
      api.myFunctions.handleGuestUserSupervisedTherapyEnrollment,
      {
        courseId,
        sessionType,
        studentName,
        userEmail,
        userPhone,
      },
      {
        courseIds: [courseId],
        operationType: "handleGuestUserSupervisedTherapyEnrollment",
        userEmail,
      },
      options.convexUrl,
    );

    return {
      success: true,
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        sessionType: enrollment.sessionType,
      },
    };
  } catch (error) {
    console.error(
      "Error handling guest user supervised therapy enrollment (all retries exhausted):",
      {
        courseId,
        error: error instanceof Error ? error.message : String(error),
        sessionType,
        stack: error instanceof Error ? error.stack : undefined,
        userEmail,
      },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
