"use server";

import { auth } from "@clerk/nextjs/server";
import { createHmac } from "crypto";
import {
  handleGuestUserPaymentSuccess as handleGuestUserPaymentSuccessService,
  handleGuestUserPaymentSuccessWithData as handleGuestUserPaymentSuccessWithDataService,
  handleGuestUserSingleEnrollment as handleGuestUserSingleEnrollmentService,
  handleGuestUserSupervisedTherapyEnrollment as handleGuestUserSupervisedTherapyEnrollmentService,
  handlePaymentSuccess as handlePaymentSuccessService,
  handleSupervisedTherapyEnrollment as handleSupervisedTherapyEnrollmentService,
} from "@/lib/services/checkout";

function createCheckoutAuthorization(
  checkoutAttemptId: string,
  userId: string,
  serverSecret: string,
) {
  const timestamp = Date.now();
  const signature = createHmac("sha256", serverSecret)
    .update(`${checkoutAttemptId}:${userId}:${timestamp}`)
    .digest("hex");

  return { signature, timestamp };
}

export async function handlePaymentSuccess(
  ...args: Parameters<typeof handlePaymentSuccessService>
) {
  const [
    checkoutUserId,
    lineItems,
    userEmail,
    userPhone,
    studentName,
    sessionType,
    bogoSelections,
    referrerClerkUserId,
    checkoutPricing,
    options = {},
  ] = args;
  const { getToken, userId } = await auth();

  if (!userId || userId !== checkoutUserId) {
    return {
      error: "Sign in with the checkout account before completing enrollment.",
      success: false as const,
    };
  }

  let convexAuthToken: string | null = null;
  try {
    convexAuthToken = await getToken({ template: "convex" });
  } catch (error) {
    console.warn("Unable to create Convex auth token for checkout.", error);
  }

  const checkoutServerSecret = process.env.CHECKOUT_SERVER_SECRET;
  const checkoutAuthorization =
    checkoutServerSecret && options.checkoutAttemptId
      ? createCheckoutAuthorization(
          options.checkoutAttemptId,
          checkoutUserId,
          checkoutServerSecret,
        )
      : undefined;

  if (!convexAuthToken) {
    if (checkoutAuthorization) {
      console.warn(
        "Convex auth token unavailable for checkout; relying on signed checkout authorization.",
      );
    } else {
      console.error(
        "Convex auth token unavailable and no signed checkout authorization could be created. Checkout will fail.",
        {
          hasCheckoutAttemptId: Boolean(options.checkoutAttemptId),
          hasServerSecret: Boolean(checkoutServerSecret),
        },
      );
    }
  }

  return handlePaymentSuccessService(
    checkoutUserId,
    lineItems,
    userEmail,
    userPhone,
    studentName,
    sessionType,
    bogoSelections,
    referrerClerkUserId,
    checkoutPricing,
    {
      ...options,
      checkoutAuthorization,
      convexAuthToken: convexAuthToken ?? undefined,
    },
  );
}

export async function handleGuestUserPaymentSuccess(
  ...args: Parameters<typeof handleGuestUserPaymentSuccessService>
) {
  return handleGuestUserPaymentSuccessService(...args);
}

export async function handleGuestUserPaymentSuccessWithData(
  ...args: Parameters<typeof handleGuestUserPaymentSuccessWithDataService>
) {
  return handleGuestUserPaymentSuccessWithDataService(...args);
}

export async function handleGuestUserSingleEnrollment(
  ...args: Parameters<typeof handleGuestUserSingleEnrollmentService>
) {
  return handleGuestUserSingleEnrollmentService(...args);
}

export async function handleSupervisedTherapyEnrollment(
  ...args: Parameters<typeof handleSupervisedTherapyEnrollmentService>
) {
  return handleSupervisedTherapyEnrollmentService(...args);
}

export async function handleGuestUserSupervisedTherapyEnrollment(
  ...args: Parameters<typeof handleGuestUserSupervisedTherapyEnrollmentService>
) {
  return handleGuestUserSupervisedTherapyEnrollmentService(...args);
}
