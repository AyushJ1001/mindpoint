"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import {
  appendEnrollmentToSheet,
  setupEnrollmentSheetDocument,
} from "./_shared/enrollmentSheet";
import {
  getGoogleSheetsClientResult,
  isGoogleSheetsFailure,
} from "./_shared/googleSheetsClient";
import { convexResultErrorValidator } from "./_shared/result";

const googleSheetsActionResultValidator = v.union(
  v.object({
    _tag: v.literal("Success"),
    success: v.literal(true),
  }),
  v.object({
    _tag: v.literal("Failure"),
    error: convexResultErrorValidator,
    success: v.literal(false),
  }),
);

const enrollmentDataValidator = v.object({
  userId: v.string(),
  userName: v.optional(v.string()),
  userEmail: v.optional(v.string()),
  userPhone: v.optional(v.string()),
  courseId: v.string(),
  courseName: v.optional(v.string()),
  enrollmentNumber: v.string(),
  isGuestUser: v.optional(v.boolean()),
  sessionType: v.optional(v.string()),
  courseType: v.optional(v.string()),
  internshipPlan: v.optional(v.string()),
  sessions: v.optional(v.number()),
  enrollmentDate: v.string(),
});

export const addEnrollmentToSheet = internalAction({
  args: {
    enrollmentData: enrollmentDataValidator,
    spreadsheetId: v.string(),
    sheetName: v.string(),
  },
  returns: googleSheetsActionResultValidator,
  handler: async (_ctx, args) => {
    const sheets = getGoogleSheetsClientResult();
    if (isGoogleSheetsFailure(sheets)) {
      return sheets;
    }

    return await appendEnrollmentToSheet({
      enrollmentData: args.enrollmentData,
      spreadsheetId: args.spreadsheetId,
      sheetName: args.sheetName,
      sheets,
    });
  },
});

export const setupEnrollmentSheet = internalAction({
  args: {
    spreadsheetId: v.string(),
    sheetName: v.string(),
  },
  returns: googleSheetsActionResultValidator,
  handler: async (_ctx, args) => {
    const sheets = getGoogleSheetsClientResult();
    if (isGoogleSheetsFailure(sheets)) {
      return sheets;
    }

    return await setupEnrollmentSheetDocument({
      spreadsheetId: args.spreadsheetId,
      sheetName: args.sheetName,
      sheets,
    });
  },
});
