import "server-only";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import type { CheckoutPricing } from "@/lib/domain/checkout";
import {
  BoundaryConfigurationError,
  BoundaryExternalServiceError,
  boundaryErrorFromThrowable,
  type BoundaryError,
  type BoundaryThrowable,
} from "@/lib/effect";
import { ConvexHttpClient } from "convex/browser";
import type { DefaultFunctionArgs, FunctionReference } from "convex/server";
import { Effect } from "effect";

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

type CartCheckoutResult = CheckoutResult & {
  enrollments?: EnrollmentSummary[];
};

type SingleEnrollmentCheckoutResult = CheckoutResult & {
  enrollment?: EnrollmentSummary;
};

type CartCheckoutSuccess = {
  enrollments: EnrollmentSummary[];
  success: true;
};

type SingleEnrollmentCheckoutSuccess = {
  enrollment: EnrollmentSummary;
  success: true;
};

export type EnrollmentSummary = {
  courseId?: string;
  courseName: string;
  enrollmentId: string;
  enrollmentNumber: string;
  isBogoFree?: boolean;
  sessionType?: string;
};

type CheckoutLineItem = {
  batchId?: Id<"courseBatches">;
  courseId: Id<"courses">;
};

type BogoSelection = {
  sourceBatchId?: Id<"courseBatches">;
  sourceCourseId: Id<"courses">;
  selectedFreeBatchId?: Id<"courseBatches">;
  selectedFreeCourseId: Id<"courses">;
};

type CheckoutSessionType = "focus" | "flow" | "elevate";

type CheckoutServerAuthorization = {
  signature: string;
  timestamp: number;
};

type CheckoutMutationOptions = {
  checkoutAuthorization?: CheckoutServerAuthorization;
  convexAuthToken?: string;
  convexUrl?: string;
};

type PaymentSuccessOptions = CheckoutMutationOptions & {
  checkoutAttemptId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentScreenshotUrl?: string;
};

type GuestCheckoutUserData = {
  email: string;
  name: string;
  phone: string;
};

type SingleCourseEnrollmentMutationResult = {
  courseName: string;
  enrollmentId: Id<"enrollments">;
  enrollmentNumber: string;
};

type SupervisedTherapyEnrollmentMutationResult =
  SingleCourseEnrollmentMutationResult & {
    sessionType: CheckoutSessionType;
  };

type ConvexTaggedFailure = {
  readonly _tag: "Failure";
  readonly error: {
    readonly code?: string;
    readonly message: string;
  };
  readonly success: false;
};

type ConvexTaggedSuccess<Payload extends object> = {
  readonly _tag: "Success";
  readonly success: true;
} & Payload;

type CartCheckoutMutationReturn =
  | ConvexTaggedSuccess<{ enrollments: EnrollmentSummary[] }>
  | EnrollmentSummary[];

type SingleEnrollmentMutationReturn<
  Result extends SingleCourseEnrollmentMutationResult,
> =
  | ConvexTaggedSuccess<
      {
        enrollment: Result;
      } & Partial<Result>
    >
  | Result;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isConvexTaggedFailure(value: unknown): value is ConvexTaggedFailure {
  if (!isRecord(value)) {
    return false;
  }

  const error = value.error;
  return (
    value._tag === "Failure" &&
    value.success === false &&
    isRecord(error) &&
    typeof error.message === "string"
  );
}

function convexTaggedFailureToBoundaryError(
  value: unknown,
): BoundaryExternalServiceError | null {
  if (isConvexTaggedFailure(value)) {
    return new BoundaryExternalServiceError({
      message: value.error.message,
    });
  }

  return null;
}

function normalizeCartCheckoutMutationReturn(
  result: CartCheckoutMutationReturn,
): EnrollmentSummary[] {
  if (Array.isArray(result)) {
    return result;
  }

  return result.enrollments;
}

function normalizeSingleEnrollmentMutationReturn<
  Result extends SingleCourseEnrollmentMutationResult,
>(result: SingleEnrollmentMutationReturn<Result>): Result {
  if ("_tag" in result) {
    return result.enrollment;
  }

  return result;
}

function resolveConvexUrl(
  convexUrl?: string,
): string | BoundaryConfigurationError {
  const resolvedConvexUrl = convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!resolvedConvexUrl) {
    return new BoundaryConfigurationError({
      message:
        "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot execute Convex mutation.",
    });
  }

  return resolvedConvexUrl;
}

function isRetryableError(error: BoundaryThrowable): boolean {
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

function throwableMessage(error: BoundaryThrowable): string {
  return error instanceof Error ? error.message : String(error);
}

function checkoutMutationBoundaryError(
  cause: BoundaryThrowable,
): BoundaryError {
  const error = boundaryErrorFromThrowable(cause);

  if (error instanceof BoundaryConfigurationError) {
    return error;
  }

  return new BoundaryExternalServiceError({
    ...(cause instanceof Error ? { cause } : {}),
    message:
      cause instanceof Error ? cause.message : "Checkout mutation failed.",
  });
}

function logCheckoutBoundaryError(
  message: string,
  error: BoundaryError,
  context: MutationContext,
) {
  console.error(message, {
    courseIds: context.courseIds,
    error: error.message,
    operationType: context.operationType,
    referrerClerkUserId: context.referrerClerkUserId,
    stack: error.cause?.stack,
    userEmail: context.userEmail,
    userId: context.userId,
  });
}

async function executeConvexMutationWithRetry<Args extends object, Return>(
  mutation: FunctionReference<"mutation", "public", DefaultFunctionArgs>,
  args: Args,
  context: MutationContext,
  options: CheckoutMutationOptions = {},
): Promise<Return> {
  const resolvedConvexUrl = resolveConvexUrl(options.convexUrl);
  if (resolvedConvexUrl instanceof BoundaryConfigurationError) {
    return Promise.reject(resolvedConvexUrl);
  }

  const convex = new ConvexHttpClient(resolvedConvexUrl);
  if (options.convexAuthToken) {
    convex.setAuth(options.convexAuthToken);
  }
  let lastError: BoundaryThrowable | null = null;
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
              new BoundaryExternalServiceError({
                message: `Convex mutation timed out after ${RETRY_CONFIG.timeoutMs}ms`,
              }),
            ),
          RETRY_CONFIG.timeoutMs,
        );
      });
      const result = await Promise.race([mutationPromise, timeoutPromise]);
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      const taggedFailure = convexTaggedFailureToBoundaryError(result);
      if (taggedFailure) {
        return Promise.reject(taggedFailure);
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

      const caught = error as BoundaryThrowable;
      lastError = caught;
      const errorMessage = throwableMessage(caught);
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
          retryable: isRetryableError(caught),
          userEmail: context.userEmail,
          userId: context.userId,
        },
      );

      if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError(caught)) {
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

        return Promise.reject(
          new BoundaryExternalServiceError({
            ...(caught instanceof Error ? { cause: caught } : {}),
            message: `Failed to execute Convex mutation after ${attempt + 1} attempts: ${errorMessage}`,
          }),
        );
      }

      const delay = calculateBackoffDelay(attempt);
      console.log(
        `Retrying Convex mutation in ${Math.round(delay)}ms (${context.operationType})`,
      );
      await sleep(delay);
    }
  }

  return Promise.reject(
    lastError instanceof Error
      ? lastError
      : new BoundaryExternalServiceError({
          message: "Unknown error occurred during Convex mutation",
        }),
  );
}

async function runCheckoutMutation<TResult>(
  mutation: FunctionReference<"mutation", "public", DefaultFunctionArgs>,
  args: DefaultFunctionArgs,
  context: MutationContext,
  options: CheckoutMutationOptions = {},
): Promise<TResult> {
  return executeConvexMutationWithRetry<DefaultFunctionArgs, TResult>(
    mutation,
    args,
    context,
    options,
  );
}

function runCheckoutMutationEffect<TResult>(
  mutation: FunctionReference<"mutation", "public", DefaultFunctionArgs>,
  args: DefaultFunctionArgs,
  context: MutationContext,
  options: CheckoutMutationOptions = {},
): Effect.Effect<TResult, BoundaryError> {
  return Effect.tryPromise({
    try: () => runCheckoutMutation<TResult>(mutation, args, context, options),
    catch: (cause) => checkoutMutationBoundaryError(cause as BoundaryThrowable),
  });
}

export function handlePaymentSuccessEffect(
  userId: string,
  lineItems: CheckoutLineItem[],
  userEmail: string,
  userPhone?: string,
  studentName?: string,
  sessionType?: CheckoutSessionType,
  bogoSelections?: BogoSelection[],
  referrerClerkUserId?: string,
  checkoutPricing?: CheckoutPricing,
  options: PaymentSuccessOptions = {},
): Effect.Effect<CartCheckoutSuccess, BoundaryError> {
  const courseIds = lineItems.map((item) => item.courseId);
  const context: MutationContext = {
    courseIds: courseIds.map((id) => id),
    operationType: "handleCartCheckout",
    referrerClerkUserId,
    userEmail,
    userId,
  };

  return Effect.gen(function* () {
    const mutationResult =
      yield* runCheckoutMutationEffect<CartCheckoutMutationReturn>(
        api.myFunctions.handleCartCheckout,
        {
          bogoSelections,
          checkoutAuthorization: options.checkoutAuthorization,
          checkoutAttemptId: options.checkoutAttemptId,
          checkoutPricing,
          courseIds,
          lineItems,
          razorpayOrderId: options.razorpayOrderId,
          razorpayPaymentId: options.razorpayPaymentId,
          paymentScreenshotUrl: options.paymentScreenshotUrl,
          referrerClerkUserId,
          sessionType,
          studentName,
          userEmail,
          userId,
          userPhone,
        },
        context,
        options,
      );
    const enrollments = normalizeCartCheckoutMutationReturn(mutationResult);

    return {
      enrollments,
      success: true as const,
    };
  });
}

export async function handlePaymentSuccess(
  userId: string,
  lineItems: CheckoutLineItem[],
  userEmail: string,
  userPhone?: string,
  studentName?: string,
  sessionType?: CheckoutSessionType,
  bogoSelections?: BogoSelection[],
  referrerClerkUserId?: string,
  checkoutPricing?: CheckoutPricing,
  options: PaymentSuccessOptions = {},
): Promise<CartCheckoutResult> {
  const courseIds = lineItems.map((item) => item.courseId);
  return Effect.runPromise(
    handlePaymentSuccessEffect(
      userId,
      lineItems,
      userEmail,
      userPhone,
      studentName,
      sessionType,
      bogoSelections,
      referrerClerkUserId,
      checkoutPricing,
      options,
    ).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling payment success (all retries exhausted):",
            error,
            {
              courseIds: courseIds.map((id) => id),
              operationType: "handleCartCheckout",
              referrerClerkUserId,
              userEmail,
              userId,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}

export function handleGuestUserPaymentSuccessEffect(
  userEmail: string,
  courseIds: Id<"courses">[],
  options: CheckoutMutationOptions = {},
): Effect.Effect<CartCheckoutSuccess, BoundaryError> {
  const context: MutationContext = {
    courseIds: courseIds.map((id) => id),
    operationType: "handleGuestUserCartCheckoutByEmail",
    userEmail,
  };

  return Effect.gen(function* () {
    const mutationResult =
      yield* runCheckoutMutationEffect<CartCheckoutMutationReturn>(
        api.myFunctions.handleGuestUserCartCheckoutByEmail,
        {
          courseIds,
          userEmail,
        },
        context,
        options,
      );
    const enrollments = normalizeCartCheckoutMutationReturn(mutationResult);

    return {
      enrollments,
      success: true as const,
    };
  });
}

export async function handleGuestUserPaymentSuccess(
  userEmail: string,
  courseIds: Id<"courses">[],
  options: CheckoutMutationOptions = {},
): Promise<CartCheckoutResult> {
  return Effect.runPromise(
    handleGuestUserPaymentSuccessEffect(userEmail, courseIds, options).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling guest user payment success (all retries exhausted):",
            error,
            {
              courseIds: courseIds.map((id) => id),
              operationType: "handleGuestUserCartCheckoutByEmail",
              userEmail,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}

export function handleGuestUserPaymentSuccessWithDataEffect(
  userData: GuestCheckoutUserData,
  lineItems: CheckoutLineItem[],
  sessionType?: CheckoutSessionType,
  bogoSelections?: BogoSelection[],
  checkoutPricing?: CheckoutPricing,
  options: CheckoutMutationOptions = {},
): Effect.Effect<CartCheckoutSuccess, BoundaryError> {
  const courseIds = lineItems.map((item) => item.courseId);
  const context: MutationContext = {
    courseIds: courseIds.map((id) => id),
    operationType: "handleGuestUserCartCheckoutWithData",
    userEmail: userData.email,
  };

  return Effect.gen(function* () {
    const mutationResult =
      yield* runCheckoutMutationEffect<CartCheckoutMutationReturn>(
        api.myFunctions.handleGuestUserCartCheckoutWithData,
        {
          bogoSelections,
          checkoutPricing,
          courseIds,
          lineItems,
          sessionType,
          userData,
        },
        context,
        options,
      );
    const enrollments = normalizeCartCheckoutMutationReturn(mutationResult);

    return {
      enrollments,
      success: true as const,
    };
  });
}

export async function handleGuestUserPaymentSuccessWithData(
  userData: GuestCheckoutUserData,
  lineItems: CheckoutLineItem[],
  sessionType?: CheckoutSessionType,
  bogoSelections?: BogoSelection[],
  checkoutPricing?: CheckoutPricing,
  options: CheckoutMutationOptions = {},
): Promise<CartCheckoutResult> {
  const courseIds = lineItems.map((item) => item.courseId);
  return Effect.runPromise(
    handleGuestUserPaymentSuccessWithDataEffect(
      userData,
      lineItems,
      sessionType,
      bogoSelections,
      checkoutPricing,
      options,
    ).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling guest user payment success with data (all retries exhausted):",
            error,
            {
              courseIds: courseIds.map((id) => id),
              operationType: "handleGuestUserCartCheckoutWithData",
              userEmail: userData.email,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}

export function handleGuestUserSingleEnrollmentEffect(
  userEmail: string,
  courseId: Id<"courses">,
  options: CheckoutMutationOptions = {},
): Effect.Effect<SingleEnrollmentCheckoutSuccess, BoundaryError> {
  const context: MutationContext = {
    courseIds: [courseId],
    operationType: "handleGuestUserSingleEnrollmentByEmail",
    userEmail,
  };

  return Effect.gen(function* () {
    const mutationResult = yield* runCheckoutMutationEffect<
      SingleEnrollmentMutationReturn<SingleCourseEnrollmentMutationResult>
    >(
      api.myFunctions.handleGuestUserSingleEnrollmentByEmail,
      {
        courseId,
        userEmail,
      },
      context,
      options,
    );
    const enrollment = normalizeSingleEnrollmentMutationReturn(mutationResult);

    return {
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
      },
      success: true as const,
    };
  });
}

export async function handleGuestUserSingleEnrollment(
  userEmail: string,
  courseId: Id<"courses">,
  options: CheckoutMutationOptions = {},
): Promise<SingleEnrollmentCheckoutResult> {
  return Effect.runPromise(
    handleGuestUserSingleEnrollmentEffect(userEmail, courseId, options).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling guest user single course enrollment (all retries exhausted):",
            error,
            {
              courseIds: [courseId],
              operationType: "handleGuestUserSingleEnrollmentByEmail",
              userEmail,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}

export function handleSupervisedTherapyEnrollmentEffect(
  userId: string,
  courseId: Id<"courses">,
  userEmail: string,
  userPhone: string,
  studentName: string,
  sessionType: CheckoutSessionType,
  options: CheckoutMutationOptions = {},
): Effect.Effect<SingleEnrollmentCheckoutSuccess, BoundaryError> {
  const context: MutationContext = {
    courseIds: [courseId],
    operationType: "handleSupervisedTherapyEnrollment",
    userEmail,
    userId,
  };

  return Effect.gen(function* () {
    const mutationResult = yield* runCheckoutMutationEffect<
      SingleEnrollmentMutationReturn<SupervisedTherapyEnrollmentMutationResult>
    >(
      api.myFunctions.handleSupervisedTherapyEnrollment,
      {
        courseId,
        sessionType,
        studentName,
        userEmail,
        userId,
        userPhone,
      },
      context,
      options,
    );
    const enrollment = normalizeSingleEnrollmentMutationReturn(mutationResult);

    return {
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        sessionType: enrollment.sessionType,
      },
      success: true as const,
    };
  });
}

export async function handleSupervisedTherapyEnrollment(
  userId: string,
  courseId: Id<"courses">,
  userEmail: string,
  userPhone: string,
  studentName: string,
  sessionType: CheckoutSessionType,
  options: CheckoutMutationOptions = {},
): Promise<SingleEnrollmentCheckoutResult> {
  return Effect.runPromise(
    handleSupervisedTherapyEnrollmentEffect(
      userId,
      courseId,
      userEmail,
      userPhone,
      studentName,
      sessionType,
      options,
    ).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling supervised therapy enrollment (all retries exhausted):",
            error,
            {
              courseIds: [courseId],
              operationType: "handleSupervisedTherapyEnrollment",
              userEmail,
              userId,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}

export function handleGuestUserSupervisedTherapyEnrollmentEffect(
  userEmail: string,
  userPhone: string,
  courseId: Id<"courses">,
  studentName: string,
  sessionType: CheckoutSessionType,
  options: CheckoutMutationOptions = {},
): Effect.Effect<SingleEnrollmentCheckoutSuccess, BoundaryError> {
  const context: MutationContext = {
    courseIds: [courseId],
    operationType: "handleGuestUserSupervisedTherapyEnrollment",
    userEmail,
  };

  return Effect.gen(function* () {
    const mutationResult = yield* runCheckoutMutationEffect<
      SingleEnrollmentMutationReturn<SupervisedTherapyEnrollmentMutationResult>
    >(
      api.myFunctions.handleGuestUserSupervisedTherapyEnrollment,
      {
        courseId,
        sessionType,
        studentName,
        userEmail,
        userPhone,
      },
      context,
      options,
    );
    const enrollment = normalizeSingleEnrollmentMutationReturn(mutationResult);

    return {
      enrollment: {
        courseName: enrollment.courseName,
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        sessionType: enrollment.sessionType,
      },
      success: true as const,
    };
  });
}

export async function handleGuestUserSupervisedTherapyEnrollment(
  userEmail: string,
  userPhone: string,
  courseId: Id<"courses">,
  studentName: string,
  sessionType: CheckoutSessionType,
  options: CheckoutMutationOptions = {},
): Promise<SingleEnrollmentCheckoutResult> {
  return Effect.runPromise(
    handleGuestUserSupervisedTherapyEnrollmentEffect(
      userEmail,
      userPhone,
      courseId,
      studentName,
      sessionType,
      options,
    ).pipe(
      Effect.match({
        onFailure: (error) => {
          logCheckoutBoundaryError(
            "Error handling guest user supervised therapy enrollment (all retries exhausted):",
            error,
            {
              courseIds: [courseId],
              operationType: "handleGuestUserSupervisedTherapyEnrollment",
              userEmail,
            },
          );

          return {
            error: error.message,
            success: false as const,
          };
        },
        onSuccess: (result) => result,
      }),
    ),
  );
}
