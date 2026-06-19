"use server";

import { auth } from "@clerk/nextjs/server";
import {
  handleGuestUserPaymentSuccess as handleGuestUserPaymentSuccessService,
  handleGuestUserPaymentSuccessWithData as handleGuestUserPaymentSuccessWithDataService,
  handleGuestUserSingleEnrollment as handleGuestUserSingleEnrollmentService,
  handleGuestUserSupervisedTherapyEnrollment as handleGuestUserSupervisedTherapyEnrollmentService,
  handlePaymentSuccess as handlePaymentSuccessService,
  handleSingleCourseEnrollment as handleSingleCourseEnrollmentService,
  handleSupervisedTherapyEnrollment as handleSupervisedTherapyEnrollmentService,
} from "@/lib/services/checkout";

export async function handlePaymentSuccess(
  ...args: Parameters<typeof handlePaymentSuccessService>
) {
  const [checkoutUserId] = args;
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

  const options = args[9] ?? {};
  const checkoutArgs = [...args] as Parameters<
    typeof handlePaymentSuccessService
  >;
  checkoutArgs[9] = {
    ...options,
    checkoutServerSecret: process.env.CHECKOUT_SERVER_SECRET,
    convexAuthToken: convexAuthToken ?? undefined,
  };

  return handlePaymentSuccessService(...checkoutArgs);
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

export async function handleSingleCourseEnrollment(
  ...args: Parameters<typeof handleSingleCourseEnrollmentService>
) {
  return handleSingleCourseEnrollmentService(...args);
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
