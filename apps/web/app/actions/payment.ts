"use server";

import {
  handleGuestUserPaymentSuccess as handleGuestUserPaymentSuccessService,
  handleGuestUserPaymentSuccessWithData as handleGuestUserPaymentSuccessWithDataService,
  handleGuestUserSingleEnrollment as handleGuestUserSingleEnrollmentService,
  handleGuestUserSupervisedTherapyEnrollment as handleGuestUserSupervisedTherapyEnrollmentService,
  handlePaymentSuccess as handlePaymentSuccessService,
  handleSingleCourseEnrollment as handleSingleCourseEnrollmentService,
  handleSupervisedTherapyEnrollment as handleSupervisedTherapyEnrollmentService,
} from "@mindpoint/services/checkout";

export async function handlePaymentSuccess(
  ...args: Parameters<typeof handlePaymentSuccessService>
) {
  return handlePaymentSuccessService(...args);
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
