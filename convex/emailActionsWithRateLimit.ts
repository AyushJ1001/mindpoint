import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { checkConvexRateLimit, convexEmailRatelimit } from "./rateLimit";
import {
  emailActionResultValidator,
  emailActionSuccess,
  emailDeliveryFailureFromThrowable,
  emailRateLimitFailure,
  isEmailActionFailure,
  type EmailActionResult,
} from "./_shared/emailActionResult";

// Example: Rate-limited version of sendTestEmail
export const sendTestEmailWithRateLimit = action({
  args: {
    userEmail: v.string(),
  },
  returns: emailActionResultValidator,
  handler: async (ctx, args): Promise<EmailActionResult> => {
    // Use email as identifier for rate limiting
    const identifier = `email:${args.userEmail}`;

    // Check rate limit before sending email
    const rateLimitResult = await checkConvexRateLimit(
      identifier,
      convexEmailRatelimit,
    );

    if (!rateLimitResult.success) {
      return emailRateLimitFailure(
        `Email rate limit exceeded for ${args.userEmail}. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      );
    }

    try {
      console.log("Attempting to send test email to:", args.userEmail);

      // Call the original email function
      const result: EmailActionResult = await ctx.runAction(
        api.emailActions.sendTestEmail,
        {
          userEmail: args.userEmail,
        },
      );
      if (isEmailActionFailure(result)) {
        return result;
      }

      console.log("Test email sent successfully with rate limiting");
    } catch (error) {
      console.error("Failed to send test email:", error);
      return emailDeliveryFailureFromThrowable(
        error as Error | object | string,
      );
    }

    return emailActionSuccess();
  },
});

// Example: Rate-limited version of sendTestSupervisedEmail
export const sendTestSupervisedEmailWithRateLimit = action({
  args: {
    userEmail: v.string(),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },
  returns: emailActionResultValidator,
  handler: async (ctx, args): Promise<EmailActionResult> => {
    // Use email as identifier for rate limiting
    const identifier = `supervised:${args.userEmail}`;

    // Check rate limit before sending email
    const rateLimitResult = await checkConvexRateLimit(
      identifier,
      convexEmailRatelimit,
    );

    if (!rateLimitResult.success) {
      return emailRateLimitFailure(
        `Supervised email rate limit exceeded for ${args.userEmail}. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      );
    }

    try {
      console.log("Testing supervised email with rate limiting...");

      // Call the original supervised email function
      const result: EmailActionResult = await ctx.runAction(
        api.emailActions.sendTestSupervisedEmail,
        {
          userEmail: args.userEmail,
          studentName: args.studentName,
          sessionType: args.sessionType,
        },
      );
      if (isEmailActionFailure(result)) {
        return result;
      }

      console.log(
        "Test supervised email sent successfully with rate limiting!",
      );
    } catch (error) {
      console.error("Test supervised email failed:", error);
      return emailDeliveryFailureFromThrowable(
        error as Error | object | string,
      );
    }

    return emailActionSuccess();
  },
});

// Example: Rate-limited enrollment confirmation
export const sendEnrollmentConfirmationWithRateLimit = action({
  args: {
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    courseName: v.string(),
    enrollmentNumber: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  returns: emailActionResultValidator,
  handler: async (ctx, args): Promise<EmailActionResult> => {
    // Use email as identifier for rate limiting
    const identifier = `enrollment:${args.userEmail}`;

    // Check rate limit before sending enrollment email
    const rateLimitResult = await checkConvexRateLimit(
      identifier,
      convexEmailRatelimit,
    );

    if (!rateLimitResult.success) {
      return emailRateLimitFailure(
        `Enrollment email rate limit exceeded for ${args.userEmail}. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      );
    }

    try {
      console.log("Sending enrollment confirmation with rate limiting...");

      // Call the original enrollment confirmation function
      const result: EmailActionResult = await ctx.runAction(
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userPhone: args.userPhone,
          courseName: args.courseName,
          enrollmentNumber: args.enrollmentNumber,
          startDate: args.startDate,
          endDate: args.endDate,
          startTime: args.startTime,
          endTime: args.endTime,
        },
      );
      if (isEmailActionFailure(result)) {
        return result;
      }

      console.log(
        "Enrollment confirmation sent successfully with rate limiting!",
      );
    } catch (error) {
      console.error("Enrollment confirmation failed:", error);
      return emailDeliveryFailureFromThrowable(
        error as Error | object | string,
      );
    }

    return emailActionSuccess();
  },
});
