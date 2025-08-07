"use server";

import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function handlePaymentSuccess(
  userId: string,
  courseIds: Id<"courses">[],
  userEmail: string,
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

export async function handleSingleCourseEnrollment(
  userId: string,
  courseId: Id<"courses">,
  userEmail: string,
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
      },
    );

    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    console.error("Error handling single course enrollment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
