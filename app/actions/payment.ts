"use server";

import { auth } from "@clerk/nextjs/server";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import {
  handleGuestUserPaymentSuccess as handleGuestUserPaymentSuccessService,
  handleGuestUserPaymentSuccessWithData as handleGuestUserPaymentSuccessWithDataService,
  handleGuestUserSingleEnrollment as handleGuestUserSingleEnrollmentService,
  handleGuestUserSupervisedTherapyEnrollment as handleGuestUserSupervisedTherapyEnrollmentService,
  handlePaymentSuccess as handlePaymentSuccessService,
  handleSingleCourseEnrollment as handleSingleCourseEnrollmentService,
  handleSupervisedTherapyEnrollment as handleSupervisedTherapyEnrollmentService,
} from "@/lib/services/checkout";

type CheckoutActionFailure = {
  error: string;
  success: false;
};

type AuthenticatedCheckoutContext = {
  convexAuthToken: string;
  userEmail?: string;
  userId: string;
};

type HandlePaymentSuccessArgs = Parameters<typeof handlePaymentSuccessService>;
type HandlePaymentSuccessClientArgs = [
  lineItems: HandlePaymentSuccessArgs[1],
  userEmail: HandlePaymentSuccessArgs[2],
  userPhone?: HandlePaymentSuccessArgs[3],
  studentName?: HandlePaymentSuccessArgs[4],
  sessionType?: HandlePaymentSuccessArgs[5],
  bogoSelections?: HandlePaymentSuccessArgs[6],
  referrerClerkUserId?: HandlePaymentSuccessArgs[7],
  checkoutPricing?: HandlePaymentSuccessArgs[8],
  options?: HandlePaymentSuccessArgs[9],
];

type HandleSingleCourseEnrollmentArgs = Parameters<
  typeof handleSingleCourseEnrollmentService
>;
type HandleSingleCourseEnrollmentClientArgs = [
  courseId: HandleSingleCourseEnrollmentArgs[1],
  batchId: HandleSingleCourseEnrollmentArgs[2],
  userEmail: HandleSingleCourseEnrollmentArgs[3],
  userPhone?: HandleSingleCourseEnrollmentArgs[4],
  studentName?: HandleSingleCourseEnrollmentArgs[5],
  sessionType?: HandleSingleCourseEnrollmentArgs[6],
  options?: HandleSingleCourseEnrollmentArgs[7],
];

type HandleSupervisedTherapyEnrollmentArgs = Parameters<
  typeof handleSupervisedTherapyEnrollmentService
>;
type HandleSupervisedTherapyEnrollmentClientArgs = [
  courseId: HandleSupervisedTherapyEnrollmentArgs[1],
  userEmail: HandleSupervisedTherapyEnrollmentArgs[2],
  userPhone: HandleSupervisedTherapyEnrollmentArgs[3],
  studentName: HandleSupervisedTherapyEnrollmentArgs[4],
  sessionType: HandleSupervisedTherapyEnrollmentArgs[5],
  options?: HandleSupervisedTherapyEnrollmentArgs[6],
];

function checkoutActionFailure(error: string): CheckoutActionFailure {
  return { error, success: false };
}

async function getAuthenticatedCheckoutContext(): Promise<
  AuthenticatedCheckoutContext | CheckoutActionFailure
> {
  if (!isClerkServerConfigured()) {
    return checkoutActionFailure("Checkout authentication is not configured.");
  }

  try {
    const { userId, sessionClaims, getToken } = await auth();
    if (!userId) {
      return checkoutActionFailure("Sign in before checkout.");
    }

    const convexAuthToken = await getToken({ template: "convex" });
    if (!convexAuthToken) {
      return checkoutActionFailure(
        "Checkout authentication token is unavailable.",
      );
    }

    return {
      convexAuthToken,
      userEmail: await resolveAuthEmail(sessionClaims),
      userId,
    };
  } catch {
    return checkoutActionFailure(
      "Checkout authentication service is unavailable.",
    );
  }
}

export async function handlePaymentSuccess(
  ...args: HandlePaymentSuccessClientArgs
) {
  const authContext = await getAuthenticatedCheckoutContext();
  if ("success" in authContext) {
    return authContext;
  }

  const [
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

  return handlePaymentSuccessService(
    authContext.userId,
    lineItems,
    authContext.userEmail || userEmail,
    userPhone,
    studentName,
    sessionType,
    bogoSelections,
    referrerClerkUserId,
    checkoutPricing,
    { ...options, convexAuthToken: authContext.convexAuthToken },
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

export async function handleSingleCourseEnrollment(
  ...args: HandleSingleCourseEnrollmentClientArgs
) {
  const authContext = await getAuthenticatedCheckoutContext();
  if ("success" in authContext) {
    return authContext;
  }

  const [
    courseId,
    batchId,
    userEmail,
    userPhone,
    studentName,
    sessionType,
    options = {},
  ] = args;

  return handleSingleCourseEnrollmentService(
    authContext.userId,
    courseId,
    batchId,
    authContext.userEmail || userEmail,
    userPhone,
    studentName,
    sessionType,
    { ...options, convexAuthToken: authContext.convexAuthToken },
  );
}

export async function handleGuestUserSingleEnrollment(
  ...args: Parameters<typeof handleGuestUserSingleEnrollmentService>
) {
  return handleGuestUserSingleEnrollmentService(...args);
}

export async function handleSupervisedTherapyEnrollment(
  ...args: HandleSupervisedTherapyEnrollmentClientArgs
) {
  const authContext = await getAuthenticatedCheckoutContext();
  if ("success" in authContext) {
    return authContext;
  }

  const [
    courseId,
    userEmail,
    userPhone,
    studentName,
    sessionType,
    options = {},
  ] = args;

  return handleSupervisedTherapyEnrollmentService(
    authContext.userId,
    courseId,
    authContext.userEmail || userEmail,
    userPhone,
    studentName,
    sessionType,
    { ...options, convexAuthToken: authContext.convexAuthToken },
  );
}

export async function handleGuestUserSupervisedTherapyEnrollment(
  ...args: Parameters<typeof handleGuestUserSupervisedTherapyEnrollmentService>
) {
  return handleGuestUserSupervisedTherapyEnrollmentService(...args);
}
