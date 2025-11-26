"use server";

import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { executeConvexMutationWithRetry } from "@/lib/convex-client-utils";

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
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    courseId: string;
    isBogoFree?: boolean;
  }>;
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollments = (await executeConvexMutationWithRetry(
      api.myFunctions.handleCartCheckout,
      {
        userId,
        courseIds: courseIds,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
        bogoSelections: bogoSelections,
      },
      {
        userId,
        userEmail,
        courseIds: courseIds.map((id) => id),
        operationType: "handleCartCheckout",
      },
    )) as Array<{
      enrollmentId: string;
      enrollmentNumber: string;
      courseName: string;
      courseId: string;
      isBogoFree?: boolean;
    }>;

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error("Error handling payment success (all retries exhausted):", {
      error: error instanceof Error ? error.message : String(error),
      userId,
      userEmail,
      courseIds: courseIds.map((id) => id),
      stack: error instanceof Error ? error.stack : undefined,
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
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    courseId: string;
    isBogoFree?: boolean;
  }>;
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollments = (await executeConvexMutationWithRetry(
      api.myFunctions.handleGuestUserCartCheckoutByEmail,
      {
        userEmail,
        courseIds: courseIds,
      },
      {
        userEmail,
        courseIds: courseIds.map((id) => id),
        operationType: "handleGuestUserCartCheckoutByEmail",
      },
    )) as Array<{
      enrollmentId: string;
      enrollmentNumber: string;
      courseName: string;
      courseId: string;
      isBogoFree?: boolean;
    }>;

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error(
      "Error handling guest user payment success (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userEmail,
        courseIds: courseIds.map((id) => id),
        stack: error instanceof Error ? error.stack : undefined,
      },
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function handleGuestUserPaymentSuccessWithData(
  userData: { name: string; email: string; phone: string },
  courseIds: Id<"courses">[],
  sessionType?: "focus" | "flow" | "elevate",
  bogoSelections?: Array<{
    sourceCourseId: Id<"courses">;
    selectedFreeCourseId: Id<"courses">;
  }>,
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    courseId: string;
    isBogoFree?: boolean;
  }>;
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollments = (await executeConvexMutationWithRetry(
      api.myFunctions.handleGuestUserCartCheckoutWithData,
      {
        userData,
        courseIds: courseIds,
        sessionType: sessionType,
        bogoSelections: bogoSelections,
      },
      {
        userEmail: userData.email,
        courseIds: courseIds.map((id) => id),
        operationType: "handleGuestUserCartCheckoutWithData",
      },
    )) as Array<{
      enrollmentId: string;
      enrollmentNumber: string;
      courseName: string;
      courseId: string;
      isBogoFree?: boolean;
    }>;

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error(
      "Error handling guest user payment success with data (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userEmail: userData.email,
        courseIds: courseIds.map((id) => id),
        stack: error instanceof Error ? error.stack : undefined,
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
): Promise<{
  success: boolean;
  enrollment?: {
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
  };
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollmentId = (await executeConvexMutationWithRetry(
      api.myFunctions.handleSuccessfulPayment,
      {
        userId,
        courseId: courseId,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
      },
      {
        userId,
        userEmail,
        courseIds: [courseId],
        operationType: "handleSuccessfulPayment",
      },
    )) as string;

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollmentId,
        enrollmentNumber: "", // This function doesn't return enrollmentNumber
        courseName: "", // This function doesn't return courseName
      },
    };
  } catch (error) {
    console.error(
      "Error handling single course enrollment (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        userEmail,
        courseId,
        stack: error instanceof Error ? error.stack : undefined,
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
): Promise<{
  success: boolean;
  enrollment?: {
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
  };
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollment = (await executeConvexMutationWithRetry(
      api.myFunctions.handleGuestUserSingleEnrollmentByEmail,
      {
        userEmail,
        courseId: courseId,
      },
      {
        userEmail,
        courseIds: [courseId],
        operationType: "handleGuestUserSingleEnrollmentByEmail",
      },
    )) as {
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
    };

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        courseName: enrollment.courseName,
      },
    };
  } catch (error) {
    console.error(
      "Error handling guest user single course enrollment (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userEmail,
        courseId,
        stack: error instanceof Error ? error.stack : undefined,
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
): Promise<{
  success: boolean;
  enrollment?: {
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    sessionType: string;
  };
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollment = (await executeConvexMutationWithRetry(
      api.myFunctions.handleSupervisedTherapyEnrollment,
      {
        userId,
        courseId: courseId,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
      },
      {
        userId,
        userEmail,
        courseIds: [courseId],
        operationType: "handleSupervisedTherapyEnrollment",
      },
    )) as {
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
      sessionType: "focus" | "flow" | "elevate";
    };

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        courseName: enrollment.courseName,
        sessionType: enrollment.sessionType,
      },
    };
  } catch (error) {
    console.error(
      "Error handling supervised therapy enrollment (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        userEmail,
        courseId,
        sessionType,
        stack: error instanceof Error ? error.stack : undefined,
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
): Promise<{
  success: boolean;
  enrollment?: {
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    sessionType: string;
  };
  error?: string;
}> {
  try {
    // Call the mutation with retry logic to handle transient failures
    const enrollment = (await executeConvexMutationWithRetry(
      api.myFunctions.handleGuestUserSupervisedTherapyEnrollment,
      {
        userEmail,
        userPhone: userPhone,
        courseId: courseId,
        studentName: studentName,
        sessionType: sessionType,
      },
      {
        userEmail,
        courseIds: [courseId],
        operationType: "handleGuestUserSupervisedTherapyEnrollment",
      },
    )) as {
      enrollmentId: Id<"enrollments">;
      enrollmentNumber: string;
      courseName: string;
      sessionType: "focus" | "flow" | "elevate";
    };

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        courseName: enrollment.courseName,
        sessionType: enrollment.sessionType,
      },
    };
  } catch (error) {
    console.error(
      "Error handling guest user supervised therapy enrollment (all retries exhausted):",
      {
        error: error instanceof Error ? error.message : String(error),
        userEmail,
        courseId,
        sessionType,
        stack: error instanceof Error ? error.stack : undefined,
      },
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
