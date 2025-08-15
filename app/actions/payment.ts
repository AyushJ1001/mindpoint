"use server";

import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function handlePaymentSuccess(
  userId: string,
  courseIds: Id<"courses">[],
  userEmail: string,
  userPhone?: string,
  studentName?: string,
  sessionType?: "focus" | "flow" | "elevate",
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    courseId: string;
  }>;
  error?: string;
}> {
  try {
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle cart checkout
    const enrollments = await convex.mutation(
      api.myFunctions.handleCartCheckout,
      {
        userId,
        courseIds: courseIds,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
      },
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error("Error handling payment success:", error);
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
  }>;
  error?: string;
}> {
  try {
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle guest user cart checkout
    const enrollments = await convex.mutation(
      api.myFunctions.handleGuestUserCartCheckoutByEmail,
      {
        userEmail,
        courseIds: courseIds,
      },
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error("Error handling guest user payment success:", error);
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
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    enrollmentNumber: string;
    courseName: string;
    courseId: string;
  }>;
  error?: string;
}> {
  try {
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle guest user cart checkout with complete data
    const enrollments = await convex.mutation(
      api.myFunctions.handleGuestUserCartCheckoutWithData,
      {
        userData,
        courseIds: courseIds,
        sessionType: sessionType,
      },
    );

    return {
      success: true,
      enrollments,
    };
  } catch (error) {
    console.error("Error handling guest user payment success:", error);
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
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle single course enrollment
    const enrollment = await convex.mutation(
      api.myFunctions.handleSuccessfulPayment,
      {
        userId,
        courseId: courseId,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
      },
    );

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollment as string,
        enrollmentNumber: "", // This function doesn't return enrollmentNumber
        courseName: "", // This function doesn't return courseName
      },
    };
  } catch (error) {
    console.error("Error handling single course enrollment:", error);
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
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle guest user single course enrollment
    const enrollment = await convex.mutation(
      api.myFunctions.handleGuestUserSingleEnrollmentByEmail,
      {
        userEmail,
        courseId: courseId,
      },
    );

    return {
      success: true,
      enrollment: {
        enrollmentId: enrollment.enrollmentId as string,
        enrollmentNumber: enrollment.enrollmentNumber,
        courseName: enrollment.courseName,
      },
    };
  } catch (error) {
    console.error("Error handling guest user single course enrollment:", error);
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
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle supervised therapy enrollment
    const enrollment = await convex.mutation(
      api.myFunctions.handleSupervisedTherapyEnrollment,
      {
        userId,
        courseId: courseId,
        userEmail: userEmail,
        userPhone: userPhone,
        studentName: studentName,
        sessionType: sessionType,
      },
    );

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
    console.error("Error handling supervised therapy enrollment:", error);
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
    // Import the Convex client for server-side usage
    const { ConvexHttpClient } = await import("convex/browser");

    // Create a Convex client for server-side operations
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Call the mutation to handle guest user supervised therapy enrollment
    const enrollment = await convex.mutation(
      api.myFunctions.handleGuestUserSupervisedTherapyEnrollment,
      {
        userEmail,
        userPhone: userPhone,
        courseId: courseId,
        studentName: studentName,
        sessionType: sessionType,
      },
    );

    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    console.error(
      "Error handling guest user supervised therapy enrollment:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
