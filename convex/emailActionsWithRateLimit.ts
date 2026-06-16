import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { checkConvexRateLimit, convexEmailRatelimit } from "./rateLimit";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

type EmailActionErrorCode = "EMAIL_DELIVERY_FAILED" | "RATE_LIMITED";

type EmailActionResult =
  | ConvexFailure<EmailActionErrorCode>
  | {
      readonly _tag: "Success";
      readonly success: true;
    };

const emailActionResultValidator = v.union(
  v.object({
    _tag: v.literal("Success"),
    success: v.literal(true),
  }),
  v.object({
    _tag: v.literal("Failure"),
    error: v.object({
      _tag: v.literal("ConvexResultError"),
      code: v.union(
        v.literal(convexResultErrorCode.EMAIL_DELIVERY_FAILED),
        v.literal(convexResultErrorCode.RATE_LIMITED),
      ),
      message: v.string(),
    }),
    success: v.literal(false),
  }),
);

function emailActionSuccess(): EmailActionResult {
  return convexSuccess({});
}

function emailRateLimitFailure(message: string): ConvexFailure<"RATE_LIMITED"> {
  return convexFailure({
    code: convexResultErrorCode.RATE_LIMITED,
    message,
  });
}

function emailDeliveryFailure(
  message: string,
): ConvexFailure<"EMAIL_DELIVERY_FAILED"> {
  return convexFailure({
    code: convexResultErrorCode.EMAIL_DELIVERY_FAILED,
    message,
  });
}

function emailActionErrorMessage(error: Error | object | string): string {
  return error instanceof Error ? error.message : String(error);
}

// Example: Rate-limited version of sendTestEmail
export const sendTestEmailWithRateLimit = action({
  args: {
    userEmail: v.string(),
  },
  returns: emailActionResultValidator,
  handler: async (ctx, args) => {
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
      await ctx.runAction(api.emailActions.sendTestEmail, {
        userEmail: args.userEmail,
      });

      console.log("Test email sent successfully with rate limiting");
    } catch (error) {
      console.error("Failed to send test email:", error);
      return emailDeliveryFailure(
        emailActionErrorMessage(error as Error | object | string),
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
  handler: async (ctx, args) => {
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
      await ctx.runAction(api.emailActions.sendTestSupervisedEmail, {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      });

      console.log(
        "Test supervised email sent successfully with rate limiting!",
      );
    } catch (error) {
      console.error("Test supervised email failed:", error);
      return emailDeliveryFailure(
        emailActionErrorMessage(error as Error | object | string),
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
  handler: async (ctx, args) => {
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
      await ctx.runAction(api.emailActions.sendEnrollmentConfirmation, {
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        courseName: args.courseName,
        enrollmentNumber: args.enrollmentNumber,
        startDate: args.startDate,
        endDate: args.endDate,
        startTime: args.startTime,
        endTime: args.endTime,
      });

      console.log(
        "Enrollment confirmation sent successfully with rate limiting!",
      );
    } catch (error) {
      console.error("Enrollment confirmation failed:", error);
      return emailDeliveryFailure(
        emailActionErrorMessage(error as Error | object | string),
      );
    }

    return emailActionSuccess();
  },
});
