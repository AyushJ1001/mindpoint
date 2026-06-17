import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  buildEnrollmentPricingFields,
  checkoutPricingValidator,
  enrollmentLineItemValidator,
  getCheckoutPricingItem,
  validateCheckoutPricingItemResult,
  type CheckoutPricingItem,
  type EnrollmentLineItem,
} from "./_shared/checkout";
import {
  calculateInternshipEndDate,
  extractInternshipPlanFromDuration,
  generateEnrollmentNumber,
  roundCurrency,
} from "./_shared/enrollment";
import {
  addUserToEnrollmentTarget,
  buildScheduleSnapshot,
  ensureEnrollmentCapacity,
  ensureEnrollmentCapacityResult,
  resolveEnrollmentBatch,
  resolveEnrollmentBatchResult,
  isEnrollmentCapacityFailure,
  isEnrollmentScheduleFailure,
  type CourseDoc,
  type EnrollmentBatchResolution,
} from "./_shared/enrollmentSchedule";
import { calculatePointsEarned } from "./_shared/mindPoints";
import type { GoogleSheetsActionResult } from "./_shared/enrollmentSheet";
import {
  convexFailure,
  convexResultErrorCode,
  convexResultErrorValidator,
  convexSuccess,
  type ConvexFailure,
  type ConvexSerializable,
} from "./_shared/result";
import { PublicCourseDocumentValue, PublicEnrollmentFields } from "./schema";
import { pickPublicCourse } from "./_publicCourse";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Helper function to award Mind Points after successful payment
// Returns the number of points awarded (0 when no award occurs)
// Only awards points for authenticated users (not guest users) and paid purchases (not BOGO free items)
async function awardMindPoints(
  ctx: MutationCtx,
  clerkUserId: string,
  course: Doc<"courses">,
  enrollmentId: Id<"enrollments">,
  isBogoFree?: boolean,
  amountPaid?: number,
): Promise<number> {
  // Don't award points for guest users or BOGO free items
  const paidAmount = roundCurrency(amountPaid ?? course.price);

  if (isBogoFree || paidAmount <= 0) {
    return 0;
  }

  try {
    const pointsEarned = calculatePointsEarned(course);
    if (pointsEarned > 0) {
      await ctx.runMutation(internal.mindPoints.awardPoints, {
        clerkUserId,
        points: pointsEarned,
        description: `Earned ${pointsEarned} points for purchasing ${course.name}`,
        enrollmentId,
      });
    }
    return pointsEarned;
  } catch (error) {
    // Log error but don't fail the enrollment process
    console.error("Error awarding Mind Points:", error);
    return 0;
  }
}

// Helper function to add enrollment to Google Sheets
async function addEnrollmentToGoogleSheets(
  ctx: MutationCtx,
  enrollmentData: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    courseId: string;
    courseName?: string;
    enrollmentNumber: string;
    isGuestUser?: boolean;
    sessionType?: string;
    courseType?: string;
    internshipPlan?: string;
    sessions?: number;
    isBogoFree?: boolean;
    bogoSourceCourseId?: string;
    bogoOfferName?: string;
  },
) {
  try {
    // Get Google Sheets configuration from environment variables
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Enrollments";

    if (!spreadsheetId) {
      console.warn(
        "Google Sheets spreadsheet ID not configured, skipping sheet update",
      );
      return;
    }

    // Strip BOGO-specific fields that aren't in the Google Sheets action schema
    // Convex validators are strict - extra fields cause validation errors
    const {
      isBogoFree: _isBogoFree,
      bogoSourceCourseId: _bogoSourceCourseId,
      bogoOfferName: _bogoOfferName,
      ...sheetsData
    } = enrollmentData;

    // Schedule the Google Sheets action
    await ctx.scheduler.runAfter(0, api.googleSheets.addEnrollmentToSheet, {
      enrollmentData: {
        ...sheetsData,
        enrollmentDate: new Date().toISOString(),
      },
      spreadsheetId,
      sheetName,
    });
  } catch (error) {
    console.error("Error scheduling Google Sheets update:", error);
    // Don't throw error to avoid breaking the enrollment process
  }
}

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

interface EnrollmentSummary
  extends Record<string, ConvexSerializable | undefined> {
  enrollmentId: Id<"enrollments">;
  enrollmentNumber: string;
  courseName: string;
  courseId: Id<"courses">;
  batchId?: Id<"courseBatches">;
  batchLabel?: string;
  courseType?: CourseDoc["type"];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  internshipPlan?: "120" | "240";
  sessions?: number;
  sessionType?: "focus" | "flow" | "elevate";
  isBogoFree?: boolean;
  bogoOfferName?: string;
}

type EnrollmentMutationFailure = ConvexFailure<
  | "CHECKOUT_ATTEMPT_NOT_FOUND"
  | "CONFLICT"
  | "COUPON_ALREADY_USED"
  | "FORBIDDEN"
  | "INVALID_COUPON_CODE"
  | "INVALID_POINTS_REQUIREMENT"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
>;

type PreparedEnrollmentLineItem = {
  batch: EnrollmentBatchResolution["batch"];
  batchResolution: EnrollmentBatchResolution;
  course: CourseDoc;
  courseDisplayName: string;
  internshipPlan?: "120" | "240";
  lineItem: EnrollmentLineItem;
  pricingItem?: CheckoutPricingItem;
};

function enrollmentMutationFailure(
  message: string,
  code: EnrollmentMutationFailure["error"]["code"] = convexResultErrorCode.VALIDATION_ERROR,
  details?: EnrollmentMutationFailure["error"]["details"],
): EnrollmentMutationFailure {
  return convexFailure({
    code,
    ...(details !== undefined ? { details } : {}),
    message,
  });
}

async function scheduleEnrollmentConfirmationForSummary(
  ctx: MutationCtx,
  args: {
    recipientEmail: string;
    userName: string;
    userPhone?: string;
    enrollment: EnrollmentSummary;
    course: CourseDoc;
    sessionType?: "focus" | "flow" | "elevate";
  },
) {
  const startDate =
    args.enrollment.startDate ??
    args.course.startDate ??
    new Date().toISOString().split("T")[0];
  const endDate = args.enrollment.endDate ?? args.course.endDate ?? startDate;
  const startTime =
    args.enrollment.startTime ?? args.course.startTime ?? "00:00";
  const endTime = args.enrollment.endTime ?? args.course.endTime ?? "23:59";

  if (args.course.type === "supervised" && args.sessionType) {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendSupervisedTherapyWelcomeEmail,
      {
        userEmail: args.recipientEmail,
        studentName: args.userName,
        sessionType: args.sessionType,
      },
    );
    return;
  }

  if (args.course.type === "therapy") {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendTherapyEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        therapyType: args.course.name,
        sessionCount: args.enrollment.sessions || args.course.sessions || 1,
        enrollmentNumber: args.enrollment.enrollmentNumber,
      },
    );
    return;
  }

  if (args.course.type === "internship") {
    const internshipPlan = args.course.usesBatches
      ? undefined
      : args.enrollment.internshipPlan ||
        extractInternshipPlanFromDuration(args.course.duration) ||
        "120";
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendInternshipEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        courseName: args.enrollment.courseName,
        enrollmentNumber: args.enrollment.enrollmentNumber,
        startDate,
        endDate:
          internshipPlan === "120" || internshipPlan === "240"
            ? calculateInternshipEndDate(startDate, internshipPlan)
            : endDate,
        startTime,
        endTime,
        internshipPlan,
      },
    );
    return;
  }

  if (
    args.course.type === "certificate" ||
    args.course.type === "resume-studio"
  ) {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendCertificateEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        courseName: args.enrollment.courseName,
        enrollmentNumber: args.enrollment.enrollmentNumber,
        startDate,
        endDate,
        startTime,
        endTime,
      },
    );
    return;
  }

  if (args.course.type === "diploma") {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendDiplomaEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        courseName: args.enrollment.courseName,
        enrollmentNumber: args.enrollment.enrollmentNumber,
        startDate,
        endDate,
        startTime,
        endTime,
      },
    );
    return;
  }

  if (args.course.type === "pre-recorded") {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendPreRecordedEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        courseName: args.enrollment.courseName,
        enrollmentNumber: args.enrollment.enrollmentNumber,
      },
    );
    return;
  }

  if (args.course.type === "masterclass") {
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendMasterclassEnrollmentConfirmation,
      {
        userEmail: args.recipientEmail,
        userName: args.userName,
        userPhone: args.userPhone,
        courseName: args.enrollment.courseName,
        enrollmentNumber: args.enrollment.enrollmentNumber,
        startDate,
        endDate,
        startTime,
        endTime,
      },
    );
    return;
  }

  await ctx.scheduler.runAfter(0, api.emailActions.sendEnrollmentConfirmation, {
    userEmail: args.recipientEmail,
    userPhone: args.userPhone,
    courseName: args.enrollment.courseName,
    enrollmentNumber: args.enrollment.enrollmentNumber,
    startDate,
    endDate,
    startTime,
    endTime,
  });
}

function getEnrollmentEmailSchedule(
  course: CourseDoc,
  enrollment?: Pick<
    EnrollmentSummary,
    "startDate" | "endDate" | "startTime" | "endTime"
  > | null,
) {
  const startDate =
    enrollment?.startDate ??
    course.startDate ??
    new Date().toISOString().split("T")[0];
  const endDate = enrollment?.endDate ?? course.endDate ?? startDate;
  const startTime = enrollment?.startTime ?? course.startTime ?? "00:00";
  const endTime = enrollment?.endTime ?? course.endTime ?? "23:59";

  return {
    startDate,
    endDate,
    startTime,
    endTime,
  };
}

function isBogoActive(bogo?: CourseDoc["bogo"] | null): boolean {
  if (!bogo?.enabled) {
    return false;
  }

  const now = new Date();

  if (bogo.startDate) {
    const start = new Date(bogo.startDate);
    if (Number.isNaN(start.getTime()) || now < start) {
      return false;
    }
  }

  if (bogo.endDate) {
    const end = new Date(bogo.endDate);
    if (Number.isNaN(end.getTime()) || now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that a BOGO selection is legitimate by checking:
 * 1. The source course has an active BOGO offer
 * 2. The selected free course exists
 * 3. The selected free course is of the same type as the source course
 */
function validateBogoSelection(
  sourceCourse: CourseDoc,
  selectedFreeCourse: CourseDoc | null,
  bogoSelection: {
    sourceCourseId: string;
    sourceBatchId?: string;
    selectedFreeCourseId: string;
    selectedFreeBatchId?: string;
  },
): { isValid: boolean; error?: string } {
  // Check if source course has an active BOGO
  if (!sourceCourse.bogo || !isBogoActive(sourceCourse.bogo)) {
    return {
      isValid: false,
      error: `Source course ${sourceCourse.name} does not have an active BOGO offer`,
    };
  }

  // Check if selected free course exists
  if (!selectedFreeCourse) {
    return {
      isValid: false,
      error: `Selected free course with ID ${bogoSelection.selectedFreeCourseId} not found`,
    };
  }

  // Note: Free course doesn't need to have its own BOGO offer - it's being given away for free

  // Validate that both courses are of the same type
  if (sourceCourse.type !== selectedFreeCourse.type) {
    return {
      isValid: false,
      error: `Course type mismatch: source course "${sourceCourse.name}" is of type "${sourceCourse.type}" but selected free course "${selectedFreeCourse.name}" is of type "${selectedFreeCourse.type}". BOGO courses must be of the same type.`,
    };
  }

  // Prevent selecting the same course as free
  if (sourceCourse._id === selectedFreeCourse._id) {
    return {
      isValid: false,
      error: "Selected free course cannot be the same as the source course",
    };
  }

  if (selectedFreeCourse.usesBatches && !bogoSelection.selectedFreeBatchId) {
    return {
      isValid: false,
      error: `Selected free course "${selectedFreeCourse.name}" requires a batch selection.`,
    };
  }

  return { isValid: true };
}

async function grantBogoEnrollments(
  ctx: MutationCtx,
  sourceCourse: CourseDoc,
  userContext: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    sessionType?: "focus" | "flow" | "elevate";
    isGuestUser?: boolean;
  },
  bogoSelection?: {
    sourceCourseId: Id<"courses">;
    sourceBatchId?: Id<"courseBatches">;
    selectedFreeCourseId?: Id<"courses">;
    selectedFreeBatchId?: Id<"courseBatches">;
  },
): Promise<EnrollmentSummary[]> {
  if (!isBogoActive(sourceCourse.bogo)) {
    return [];
  }

  // If there's a BOGO selection provided, use that instead of the predefined free course
  if (bogoSelection?.selectedFreeCourseId) {
    const selectedFreeCourseId = bogoSelection.selectedFreeCourseId;
    const freeCourse = await ctx.db.get(selectedFreeCourseId);

    if (!freeCourse) {
      console.warn(
        "BOGO selection references missing free course",
        bogoSelection.selectedFreeCourseId,
        "for source course",
        sourceCourse._id,
      );
      return [];
    }

    // Validate the BOGO selection
    const validation = validateBogoSelection(sourceCourse, freeCourse, {
      ...bogoSelection,
      selectedFreeCourseId,
    });

    if (!validation.isValid) {
      console.warn(
        `Invalid BOGO selection for course ${sourceCourse.name}: ${validation.error}. Attempting fallback to predefined free course.`,
      );

      // Attempt fallback to predefined free course
      const fallbackResult = await attemptBogoFallback(
        ctx,
        sourceCourse,
        userContext,
      );
      if (fallbackResult.length > 0) {
        console.log(
          `Successfully fell back to predefined free course for ${sourceCourse.name}`,
        );
        return fallbackResult;
      } else {
        console.error(
          `BOGO enrollment failed for ${sourceCourse.name}: both user selection and predefined fallback failed`,
        );
        return [];
      }
    }

    return await createBogoEnrollment(
      ctx,
      sourceCourse,
      freeCourse,
      userContext,
    );
  }

  // Use predefined free course if no selection is provided
  return await attemptBogoFallback(ctx, sourceCourse, userContext);
}

// Helper function to attempt BOGO fallback to predefined free course
// Note: This function is deprecated since freeCourseId field has been removed from schema
// BOGO now requires user selection via the BOGO modal
async function attemptBogoFallback(
  ctx: MutationCtx,
  sourceCourse: CourseDoc,
  userContext: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    sessionType?: "focus" | "flow" | "elevate";
    isGuestUser?: boolean;
  },
): Promise<EnrollmentSummary[]> {
  // If BOGO isn't active, do nothing
  if (!isBogoActive(sourceCourse.bogo)) {
    return [];
  }

  // Gather candidate courses of the same type, excluding the source course
  // Optimized to use index instead of scanning all courses
  const candidates: Array<CourseDoc> = [];
  if (sourceCourse.type) {
    for await (const c of ctx.db
      .query("courses")
      .withIndex("by_type", (q) => q.eq("type", sourceCourse.type!))) {
      if (!c) continue;
      if (c._id === sourceCourse._id) continue;
      const capacity = c.capacity ?? 0;
      const enrolled = (c.enrolledUsers ?? []).length;
      const seatsLeft = Math.max(0, capacity - enrolled);
      if (capacity > 0 && seatsLeft === 0) continue;
      candidates.push(c);
    }
  }

  if (candidates.length === 0) {
    console.warn(
      "BOGO fallback: no suitable same-type free course candidates found",
      sourceCourse._id,
    );
    return [];
  }

  // Choose by earliest start date, then lower price
  candidates.sort((a, b) => {
    const aParsed = Date.parse(a.startDate ?? "");
    const bParsed = Date.parse(b.startDate ?? "");
    const aStart = Number.isNaN(aParsed) ? Number.POSITIVE_INFINITY : aParsed;
    const bStart = Number.isNaN(bParsed) ? Number.POSITIVE_INFINITY : bParsed;
    if (aStart !== bStart) return aStart - bStart;
    const aPrice = a.price ?? 0;
    const bPrice = b.price ?? 0;
    return aPrice - bPrice;
  });

  const freeCourse = candidates[0];
  return await createBogoEnrollment(ctx, sourceCourse, freeCourse, userContext);
}

async function createBogoEnrollment(
  ctx: MutationCtx,
  sourceCourse: CourseDoc,
  freeCourse: CourseDoc,
  userContext: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    sessionType?: "focus" | "flow" | "elevate";
    isGuestUser?: boolean;
  },
  bogoSelection?: {
    sourceCourseId?: Id<"courses">;
    sourceBatchId?: Id<"courseBatches">;
    selectedFreeCourseId?: Id<"courses">;
    selectedFreeBatchId?: Id<"courseBatches">;
  },
): Promise<EnrollmentSummary[]> {
  // Validate that the source course has an active BOGO
  if (!sourceCourse.bogo || !isBogoActive(sourceCourse.bogo)) {
    console.warn(
      `Attempted to create BOGO enrollment for course ${sourceCourse.name} without active BOGO offer`,
    );
    return [];
  }

  // Note: Free course doesn't need to have its own BOGO offer - it's being given away for free

  // Validate that both courses are of the same type
  if (sourceCourse.type !== freeCourse.type) {
    console.warn(
      `BOGO type mismatch: source course "${sourceCourse.name}" is of type "${sourceCourse.type}" but free course "${freeCourse.name}" is of type "${freeCourse.type}". BOGO courses must be of the same type.`,
    );
    return [];
  }
  const batchResolution = await resolveEnrollmentBatch(
    ctx,
    freeCourse,
    bogoSelection?.selectedFreeBatchId,
    { allowDefaultBatch: true },
  );
  const batch = batchResolution.batch;
  const startDate = batchResolution.startDate;
  const endDateForSchedule = batchResolution.endDate;
  const startTime = batchResolution.startTime;
  const endTime = batchResolution.endTime;

  await ensureEnrollmentCapacity(ctx, freeCourse, userContext.userId, batch);

  // Idempotency: Check if a BOGO enrollment already exists for this user & course
  // Optimized to use index for userId, then filter by courseId
  const existingEnrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_userId", (q) => q.eq("userId", userContext.userId))
    .filter((q) => q.eq(q.field("courseId"), freeCourse._id))
    .collect();
  const existingBogo = existingEnrollments.find((e) => e.isBogoFree === true);

  if (existingBogo) {
    console.warn("BOGO enrollment already exists; ensuring roster only", {
      userId: userContext.userId,
      courseId: freeCourse._id,
      enrollmentId: existingBogo._id,
    });
    // Ensure enrolledUsers contains user
    const latestFree = await ctx.db.get(freeCourse._id);
    if (latestFree) {
      const latestUsers = latestFree.enrolledUsers ?? [];
      if (!latestUsers.includes(userContext.userId)) {
        await ctx.db.patch(latestFree._id, {
          enrolledUsers: [...latestUsers, userContext.userId],
        });
      }
    }
    // Build summary using existing enrollment
    return [
      {
        enrollmentId: existingBogo._id as Id<"enrollments">,
        enrollmentNumber: existingBogo.enrollmentNumber,
        courseName: freeCourse.name,
        courseId: freeCourse._id as Id<"courses">,
        batchId: existingBogo.batchId,
        batchLabel: existingBogo.batchLabel,
        courseType: freeCourse.type,
        startDate,
        endDate: existingBogo.batchEndDate ?? startDate,
        startTime,
        endTime,
        internshipPlan: existingBogo.internshipPlan,
        sessions: freeCourse.sessions,
        sessionType:
          freeCourse.type === "supervised"
            ? userContext.sessionType
            : undefined,
        isBogoFree: true,
        bogoOfferName: sourceCourse.name,
      },
    ];
  }

  const enrollmentNumber =
    freeCourse.type === "therapy" || freeCourse.type === "supervised"
      ? "N/A"
      : generateEnrollmentNumber(freeCourse.code, startDate);
  const legacyFreeInternshipPlan =
    freeCourse.usesBatches || freeCourse.type !== "internship"
      ? undefined
      : (extractInternshipPlanFromDuration(freeCourse.duration) ?? undefined);

  const enrollmentId = await ctx.db.insert("enrollments", {
    userId: userContext.userId,
    userName: userContext.userName || userContext.userEmail,
    userEmail: userContext.userEmail,
    userPhone: userContext.userPhone,
    courseId: freeCourse._id as Id<"courses">,
    courseName: freeCourse.name,
    enrollmentNumber,
    batchId: batch?._id,
    batchLabel: batchResolution.batchLabel,
    batchStartDate: batchResolution.batchStartDate,
    batchEndDate: batchResolution.batchEndDate,
    batchStartTime: batchResolution.batchStartTime,
    batchEndTime: batchResolution.batchEndTime,
    batchDaysOfWeek: batchResolution.batchDaysOfWeek,
    sessionType:
      freeCourse.type === "supervised" ? userContext.sessionType : undefined,
    courseType: freeCourse.type,
    internshipPlan: legacyFreeInternshipPlan,
    sessions: freeCourse.sessions,
    isGuestUser: userContext.isGuestUser,
    isBogoFree: true,
    bogoSourceCourseId: sourceCourse._id as Id<"courses">,
    bogoOfferName: sourceCourse.name,
    // BOGO value is tracked via the zero-paid enrollment plus listedPrice/isBogoFree;
    // we intentionally leave redemptionDiscountAmount unset because no coupon/points were redeemed.
    listedPrice: roundCurrency(freeCourse.price),
    checkoutPrice: 0,
    amountPaid: 0,
    registrationSource: userContext.isGuestUser ? "guest_checkout" : "checkout",
  });

  await addEnrollmentToGoogleSheets(ctx, {
    userId: userContext.userId,
    userName: userContext.userName || userContext.userEmail,
    userEmail: userContext.userEmail,
    userPhone: userContext.userPhone,
    courseId: String(freeCourse._id),
    courseName: freeCourse.name,
    enrollmentNumber,
    sessionType:
      freeCourse.type === "supervised" ? userContext.sessionType : undefined,
    courseType: freeCourse.type,
    internshipPlan: legacyFreeInternshipPlan,
    sessions: freeCourse.sessions,
    isGuestUser: userContext.isGuestUser,
    isBogoFree: true,
    bogoSourceCourseId: String(sourceCourse._id),
    bogoOfferName: sourceCourse.name,
  });

  await addUserToEnrollmentTarget(ctx, freeCourse, userContext.userId, batch);

  return [
    {
      enrollmentId,
      enrollmentNumber,
      courseName: freeCourse.name,
      courseId: freeCourse._id as Id<"courses">,
      batchId: batch?._id,
      batchLabel: batchResolution.batchLabel,
      courseType: freeCourse.type,
      startDate,
      endDate: endDateForSchedule,
      startTime,
      endTime,
      internshipPlan: legacyFreeInternshipPlan,
      sessions: freeCourse.sessions,
      sessionType:
        freeCourse.type === "supervised" ? userContext.sessionType : undefined,
      isBogoFree: true,
      bogoOfferName: sourceCourse.name,
    },
  ];
}

// Handle successful payment and create enrollment
export const handleSuccessfulPayment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
    checkoutPricing: v.optional(checkoutPricingValidator),
  },

  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return enrollmentMutationFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
        { courseId: args.courseId },
      );
    }
    const batchResolution = await resolveEnrollmentBatchResult(
      ctx,
      course,
      args.batchId,
    );
    if (isEnrollmentScheduleFailure(batchResolution)) {
      return batchResolution;
    }
    const batch = batchResolution.batch;
    const capacityResult = await ensureEnrollmentCapacityResult(
      ctx,
      course,
      args.userId,
      batch,
    );
    if (isEnrollmentCapacityFailure(capacityResult)) {
      return capacityResult;
    }

    // Generate enrollment number only for non-therapy and non-supervised courses
    let enrollmentNumber: string;
    if (course.type === "therapy" || course.type === "supervised") {
      enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      console.log(
        "Course type is therapy or supervised - no enrollment number generated",
      );
    } else {
      console.log("Course code:", course.code);
      console.log("Course start date:", course.startDate);
      console.log("Course type:", course.type);

      enrollmentNumber = generateEnrollmentNumber(
        course.code,
        batchResolution.startDate,
      );

      console.log("Generated enrollment number:", enrollmentNumber);
    }

    // Extract internship plan from course duration
    const internshipPlan =
      course.usesBatches || course.type !== "internship"
        ? undefined
        : args.internshipPlan ||
          extractInternshipPlanFromDuration(course.duration) ||
          undefined;
    const pricingItem = getCheckoutPricingItem(
      args.checkoutPricing,
      args.courseId,
      args.batchId,
    );
    const pricingFailure = await validateCheckoutPricingItemResult(
      ctx,
      {
        userId: args.userId,
        course,
        pricingItem,
      },
      {
        cartCourses: [course],
        remainingAdminCouponDiscountByCode: new Map<string, number>(),
      },
    );
    if (pricingFailure) {
      return pricingFailure;
    }

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName || args.userEmail,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      batchId: batch?._id,
      batchLabel: batchResolution.batchLabel,
      batchStartDate: batchResolution.batchStartDate,
      batchEndDate: batchResolution.batchEndDate,
      batchStartTime: batchResolution.batchStartTime,
      batchEndTime: batchResolution.batchEndTime,
      batchDaysOfWeek: batchResolution.batchDaysOfWeek,
      sessionType: args.sessionType, // Store session type if provided
      courseType: course.type, // Store course type
      internshipPlan,
      sessions: course.sessions, // Store number of sessions for therapy courses
      ...buildEnrollmentPricingFields(course, pricingItem),
      registrationSource: "checkout",
    });

    // Add enrollment to Google Sheets
    await addEnrollmentToGoogleSheets(ctx, {
      userId: args.userId,
      userName: args.studentName || args.userEmail,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType,
      courseType: course.type,
      internshipPlan,
      sessions: course.sessions,
    });

    await addUserToEnrollmentTarget(ctx, course, args.userId, batch);

    // Award Mind Points for authenticated users only (not guest users)
    // Check if user is authenticated by checking if userId is a Clerk ID (not an email)
    // For authenticated users, userId is the Clerk user ID; for guests, it's the email
    const isAuthenticatedUser = !args.userId.includes("@");
    if (isAuthenticatedUser) {
      await awardMindPoints(
        ctx,
        args.userId,
        course,
        enrollmentId,
        false,
        pricingItem?.amountPaid ?? course.price,
      );
    }

    const userName = args.studentName || args.userEmail;

    const bogoEnrollments = await grantBogoEnrollments(
      ctx,
      course,
      {
        userId: args.userId,
        userName: userName,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        sessionType: args.sessionType,
        isGuestUser: false,
      },
      {
        sourceCourseId: args.courseId,
        sourceBatchId: args.batchId,
      },
    );

    // Send appropriate email based on course type
    console.log("Checking email conditions:");
    console.log("- Course type is supervised:", course.type === "supervised");
    console.log("- Session type exists:", !!args.sessionType);
    console.log("- Student name exists:", !!args.studentName);
    console.log(
      "- All conditions met:",
      course.type === "supervised" && args.sessionType && args.studentName,
    );

    if (course.type === "supervised" && args.sessionType && args.studentName) {
      console.log("Sending supervised therapy welcome email...");
      // Schedule supervised therapy welcome email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendSupervisedTherapyWelcomeEmail,
        {
          userEmail: args.userEmail,
          studentName: args.studentName,
          sessionType: args.sessionType,
        },
      );
      console.log("Supervised therapy welcome email scheduled successfully");
    } else if (course.type === "supervised") {
      console.log(
        "WARNING: Supervised course but missing required parameters:",
      );
      console.log("- Session type missing:", !args.sessionType);
      console.log("- Student name missing:", !args.studentName);
      console.log("Falling back to generic course email...");
    } else if (course.type === "internship") {
      const hasLegacyPlan =
        internshipPlan === "120" || internshipPlan === "240";

      // Schedule internship enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendInternshipEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: batchResolution.startDate,
          endDate: hasLegacyPlan
            ? calculateInternshipEndDate(
                batchResolution.startDate,
                internshipPlan,
              )
            : batchResolution.endDate,
          startTime: batchResolution.startTime,
          endTime: batchResolution.endTime,
          internshipPlan: hasLegacyPlan ? internshipPlan : undefined,
        },
      );
    } else if (course.type === "certificate") {
      // Schedule certificate enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCertificateEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: batchResolution.startDate,
          endDate: batchResolution.endDate,
          startTime: batchResolution.startTime,
          endTime: batchResolution.endTime,
        },
      );
    } else if (course.type === "diploma") {
      // Schedule diploma enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendDiplomaEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: batchResolution.startDate,
          endDate: batchResolution.endDate,
          startTime: batchResolution.startTime,
          endTime: batchResolution.endTime,
        },
      );
    } else if (course.type === "pre-recorded") {
      // Schedule pre-recorded enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendPreRecordedEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else if (course.type === "masterclass") {
      // Schedule masterclass enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendMasterclassEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: batchResolution.startDate,
          endDate: batchResolution.endDate,
          startTime: batchResolution.startTime,
          endTime: batchResolution.endTime,
        },
      );
    } else if (course.type === "therapy") {
      // Schedule therapy enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          therapyType: course.name,
          sessionCount: course.sessions || 1,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else {
      // Schedule legacy enrollment confirmation email for other types
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: batchResolution.startDate,
          endDate: batchResolution.endDate,
          startTime: batchResolution.startTime,
          endTime: batchResolution.endTime,
        },
      );
    }

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;
        const bonusSchedule = getEnrollmentEmailSchedule(bonusCourse, bonus);

        if (
          bonusCourse.type === "supervised" &&
          args.sessionType &&
          args.studentName
        ) {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendSupervisedTherapyWelcomeEmail,
            {
              userEmail: args.userEmail,
              studentName: args.studentName,
              sessionType: args.sessionType,
            },
          );
        } else if (bonusCourse.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              therapyType: bonusCourse.name,
              sessionCount: bonusCourse.sessions || 1,
              enrollmentNumber: bonus.enrollmentNumber,
            },
          );
        } else if (bonusCourse.type === "internship") {
          const internshipPlan = bonusCourse.usesBatches
            ? undefined
            : extractInternshipPlanFromDuration(bonusCourse.duration) ||
              undefined;
          const hasPlan = internshipPlan === "120" || internshipPlan === "240";
          const calculatedEndDate = hasPlan
            ? calculateInternshipEndDate(
                bonusSchedule.startDate,
                internshipPlan as "120" | "240",
              )
            : bonusSchedule.endDate;

          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusSchedule.startDate,
              endDate: calculatedEndDate,
              startTime: bonusSchedule.startTime,
              endTime: bonusSchedule.endTime,
              internshipPlan: hasPlan ? internshipPlan : undefined,
            },
          );
        } else {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusSchedule.startDate,
              endDate: bonusSchedule.endDate,
              startTime: bonusSchedule.startTime,
              endTime: bonusSchedule.endTime,
            },
          );
        }
      }
    }

    const enrollment = {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
    };

    return convexSuccess({
      ...enrollment,
      enrollment,
    });
  },
});

// Handle multiple course enrollments for cart checkout
export const handleCartCheckout = mutation({
  args: {
    userId: v.string(),
    courseIds: v.optional(v.array(v.id("courses"))),
    lineItems: v.optional(v.array(enrollmentLineItemValidator)),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    referrerClerkUserId: v.optional(v.string()),
    bogoSelections: v.optional(
      v.array(
        v.object({
          sourceCourseId: v.id("courses"),
          sourceBatchId: v.optional(v.id("courseBatches")),
          selectedFreeCourseId: v.id("courses"),
          selectedFreeBatchId: v.optional(v.id("courseBatches")),
        }),
      ),
    ),
    checkoutPricing: v.optional(checkoutPricingValidator),
    checkoutAttemptId: v.optional(v.id("checkoutAttempts")),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const lineItems: EnrollmentLineItem[] =
      args.lineItems && args.lineItems.length > 0
        ? args.lineItems
        : (args.courseIds ?? []).map((courseId) => ({ courseId }));

    if (lineItems.length === 0) {
      return enrollmentMutationFailure(
        "Checkout requires at least one course.",
      );
    }

    const enrollments: EnrollmentSummary[] = [];
    const supervisedEnrollments: EnrollmentSummary[] = [];
    const worksheetEnrollments: EnrollmentSummary[] = [];
    const preparedLineItems: PreparedEnrollmentLineItem[] = [];
    const processedBogoSourceCourses = new Set<string>();
    let totalPointsEarnedForOrder = 0;
    let firstPaidEnrollmentId: Id<"enrollments"> | null = null;
    const paymentReference = args.razorpayPaymentId?.trim();
    let checkoutAttempt: Doc<"checkoutAttempts"> | null = null;
    const consumedAdminCouponCodes = new Set<string>();
    const remainingAdminCouponDiscountByCode = new Map<string, number>();

    if (args.checkoutAttemptId) {
      const attempt = await ctx.db.get(args.checkoutAttemptId);
      if (!attempt) {
        return enrollmentMutationFailure(
          "Checkout attempt not found.",
          convexResultErrorCode.CHECKOUT_ATTEMPT_NOT_FOUND,
          { checkoutAttemptId: args.checkoutAttemptId },
        );
      }

      if (attempt.status === "finalized") {
        const existingEnrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_checkoutAttemptId", (q) =>
            q.eq("checkoutAttemptId", args.checkoutAttemptId),
          )
          .collect();
        return convexSuccess({ enrollments: existingEnrollments });
      }

      if (paymentReference) {
        const duplicatePayment = await ctx.db
          .query("enrollments")
          .withIndex("by_razorpayPaymentId", (q) =>
            q.eq("razorpayPaymentId", paymentReference),
          )
          .first();
        if (
          duplicatePayment &&
          duplicatePayment.checkoutAttemptId !== args.checkoutAttemptId
        ) {
          return enrollmentMutationFailure(
            "This payment reference has already been used.",
            convexResultErrorCode.CONFLICT,
            {
              checkoutAttemptId: args.checkoutAttemptId,
              duplicateEnrollmentId: duplicatePayment._id,
              razorpayPaymentId: paymentReference,
            },
          );
        }
      }

      checkoutAttempt = attempt;
    }

    for (const lineItem of lineItems) {
      const course = await ctx.db.get(lineItem.courseId);
      if (!course) {
        return enrollmentMutationFailure(
          `Course with ID ${lineItem.courseId} not found`,
          convexResultErrorCode.NOT_FOUND,
          { courseId: lineItem.courseId },
        );
      }
      const batchResolution = await resolveEnrollmentBatchResult(
        ctx,
        course,
        lineItem.batchId,
      );
      if (isEnrollmentScheduleFailure(batchResolution)) {
        return batchResolution;
      }
      const batch = batchResolution.batch;
      const capacityResult = await ensureEnrollmentCapacityResult(
        ctx,
        course,
        args.userId,
        batch,
      );
      if (isEnrollmentCapacityFailure(capacityResult)) {
        return capacityResult;
      }
      const pricingItem = getCheckoutPricingItem(
        args.checkoutPricing,
        lineItem.courseId,
        lineItem.batchId,
      );

      preparedLineItems.push({
        batch,
        batchResolution,
        course,
        courseDisplayName: batchResolution.batchLabel
          ? `${course.name} (${batchResolution.batchLabel})`
          : course.name,
        internshipPlan:
          course.usesBatches || course.type !== "internship"
            ? undefined
            : extractInternshipPlanFromDuration(course.duration) || undefined,
        lineItem,
        pricingItem,
      });
    }

    const checkoutCartCourses = preparedLineItems.map((item) => item.course);
    const preflightAdminCouponDiscountByCode = new Map<string, number>();

    for (const { course, pricingItem } of preparedLineItems) {
      const pricingFailure = await validateCheckoutPricingItemResult(
        ctx,
        {
          userId: args.userId,
          course,
          pricingItem,
        },
        {
          cartCourses: checkoutCartCourses,
          consumeCoupon: false,
          remainingAdminCouponDiscountByCode:
            preflightAdminCouponDiscountByCode,
        },
      );
      if (pricingFailure) {
        return pricingFailure;
      }
    }

    if (args.checkoutAttemptId && checkoutAttempt) {
      await ctx.db.patch(args.checkoutAttemptId, {
        razorpayOrderId:
          args.razorpayOrderId ?? checkoutAttempt.razorpayOrderId,
        razorpayPaymentId:
          paymentReference ?? checkoutAttempt.razorpayPaymentId,
        status: "payment_captured",
        updatedAt: Date.now(),
      });
    }

    for (const {
      batch,
      batchResolution,
      course,
      courseDisplayName,
      internshipPlan,
      lineItem,
      pricingItem,
    } of preparedLineItems) {
      let enrollmentNumber: string;
      if (
        course.type === "therapy" ||
        course.type === "supervised" ||
        course.type === "worksheet"
      ) {
        enrollmentNumber = "N/A";
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          batchResolution.startDate,
        );
      }

      const couponConsumptionFailure = await validateCheckoutPricingItemResult(
        ctx,
        {
          userId: args.userId,
          course,
          pricingItem,
        },
        {
          cartCourses: checkoutCartCourses,
          consumedAdminCouponCodes,
          remainingAdminCouponDiscountByCode,
        },
      );
      if (couponConsumptionFailure) {
        throw new Error(couponConsumptionFailure.error.message);
      }

      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userId,
        courseId: lineItem.courseId,
        courseName: courseDisplayName,
        userName: args.studentName || args.userEmail,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        enrollmentNumber: enrollmentNumber,
        batchId: batch?._id,
        batchLabel: batchResolution.batchLabel,
        batchStartDate: batchResolution.batchStartDate,
        batchEndDate: batchResolution.batchEndDate,
        batchStartTime: batchResolution.batchStartTime,
        batchEndTime: batchResolution.batchEndTime,
        batchDaysOfWeek: batchResolution.batchDaysOfWeek,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
        ...buildEnrollmentPricingFields(course, pricingItem),
        registrationSource: "checkout",
        checkoutAttemptId: args.checkoutAttemptId,
        razorpayOrderId: args.razorpayOrderId,
        razorpayPaymentId: paymentReference,
        referrerClerkUserId: args.referrerClerkUserId,
      });

      await addEnrollmentToGoogleSheets(ctx, {
        userId: args.userId,
        userName: args.studentName || args.userEmail,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        courseId: lineItem.courseId,
        courseName: courseDisplayName,
        enrollmentNumber: enrollmentNumber,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
      });

      await addUserToEnrollmentTarget(ctx, course, args.userId, batch);

      const isAuthenticatedUser = !args.userId.includes("@");
      if (isAuthenticatedUser) {
        const pointsAwarded = await awardMindPoints(
          ctx,
          args.userId,
          course,
          enrollmentId,
          false,
          pricingItem?.amountPaid ?? course.price,
        );
        if (pointsAwarded > 0) {
          totalPointsEarnedForOrder += pointsAwarded;
          if (!firstPaidEnrollmentId) {
            firstPaidEnrollmentId = enrollmentId;
          }
        }
      }

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: courseDisplayName,
        courseId: lineItem.courseId,
        batchId: batch?._id,
        batchLabel: batchResolution.batchLabel,
        courseType: course.type,
        startDate: batchResolution.startDate,
        endDate: batchResolution.endDate,
        startTime: batchResolution.startTime,
        endTime: batchResolution.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
        sessionType: args.sessionType,
        isBogoFree: false,
      };

      if (course.type === "supervised") {
        supervisedEnrollments.push(enrollmentData);
      } else if (course.type === "worksheet") {
        worksheetEnrollments.push(enrollmentData);
      } else {
        enrollments.push(enrollmentData);
      }

      const bogoSelection = args.bogoSelections?.find(
        (selection) =>
          String(selection.sourceCourseId) === String(lineItem.courseId) &&
          (!selection.sourceBatchId ||
            String(selection.sourceBatchId) === String(lineItem.batchId)),
      );

      let bogoEnrollments: EnrollmentSummary[] = [];
      const sourceLineKey = `${lineItem.courseId}:${lineItem.batchId ?? "course"}`;

      const shouldProcessBogo =
        !processedBogoSourceCourses.has(sourceLineKey) &&
        (bogoSelection ||
          ((args.bogoSelections === undefined ||
            args.bogoSelections === null ||
            args.bogoSelections.length === 0) &&
            isBogoActive(course.bogo)));

      if (shouldProcessBogo) {
        processedBogoSourceCourses.add(sourceLineKey);

        if (bogoSelection) {
          const freeCourse = await ctx.db.get(
            bogoSelection.selectedFreeCourseId,
          );
          const validation = validateBogoSelection(
            course,
            freeCourse,
            bogoSelection,
          );

          if (!validation.isValid) {
            console.warn(
              `Invalid BOGO selection for course ${course.name}: ${validation.error}. Attempting fallback to predefined free course.`,
            );
            bogoEnrollments = await grantBogoEnrollments(
              ctx,
              course,
              {
                userId: args.userId,
                userName: args.studentName || args.userEmail,
                userEmail: args.userEmail,
                userPhone: args.userPhone,
                sessionType: args.sessionType,
                isGuestUser: false,
              },
              bogoSelection,
            );
          } else {
            bogoEnrollments = await grantBogoEnrollments(
              ctx,
              course,
              {
                userId: args.userId,
                userName: args.studentName || args.userEmail,
                userEmail: args.userEmail,
                userPhone: args.userPhone,
                sessionType: args.sessionType,
                isGuestUser: false,
              },
              bogoSelection,
            );
          }
        } else {
          bogoEnrollments = await grantBogoEnrollments(
            ctx,
            course,
            {
              userId: args.userId,
              userName: args.studentName || args.userEmail,
              userEmail: args.userEmail,
              userPhone: args.userPhone,
              sessionType: args.sessionType,
              isGuestUser: false,
            },
            {
              sourceCourseId: lineItem.courseId,
              sourceBatchId: lineItem.batchId,
            },
          );
        }
      }

      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (bonusCourse?.type === "supervised") {
          supervisedEnrollments.push(bonus);
        } else if (bonusCourse?.type === "worksheet") {
          worksheetEnrollments.push(bonus);
        } else {
          enrollments.push(bonus);
        }
      }
    }

    const shouldConsiderReferral =
      !!args.referrerClerkUserId &&
      !args.userId.includes("@") &&
      args.referrerClerkUserId !== args.userId &&
      totalPointsEarnedForOrder > 0;

    if (shouldConsiderReferral) {
      try {
        const existingReward = await ctx.db
          .query("referralRewards")
          .withIndex("by_referredClerkUserId", (q) =>
            q.eq("referredClerkUserId", args.userId),
          )
          .first();

        if (!existingReward) {
          const referralRecordId = await ctx.db.insert("referralRewards", {
            referrerClerkUserId: args.referrerClerkUserId!,
            referredClerkUserId: args.userId,
            awardedPoints: totalPointsEarnedForOrder,
            createdAt: Date.now(),
            firstEnrollmentId: firstPaidEnrollmentId ?? undefined,
          });

          await ctx.runMutation(internal.mindPoints.awardPoints, {
            clerkUserId: args.referrerClerkUserId!,
            points: totalPointsEarnedForOrder,
            description: `Referral bonus: your friend earned ${totalPointsEarnedForOrder} Mind Points`,
            enrollmentId: firstPaidEnrollmentId ?? undefined,
          });

          console.log("Referral reward granted", {
            referralRecordId,
            referrer: args.referrerClerkUserId,
            referred: args.userId,
            points: totalPointsEarnedForOrder,
          });
        }
      } catch (error) {
        console.error("Error processing referral reward:", error);
      }
    }

    if (worksheetEnrollments.length > 0) {
      const worksheets = await Promise.all(
        worksheetEnrollments.map(async (enrollment) => {
          const course = await ctx.db.get(enrollment.courseId);
          if (!course || !course.fileUrl) {
            console.warn(
              `Worksheet ${enrollment.courseName} missing fileUrl, skipping`,
            );
            return null;
          }
          return {
            name: enrollment.courseName,
            fileUrl: course.fileUrl,
          };
        }),
      );

      // Filter out any null entries
      const validWorksheets = worksheets.filter(
        (w): w is { name: string; fileUrl: string } => w !== null,
      );

      if (validWorksheets.length > 0) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendWorksheetPurchaseConfirmation,
          {
            userEmail: args.userEmail,
            userName: args.studentName || args.userEmail,
            userPhone: args.userPhone,
            worksheets: validWorksheets,
          },
        );
      }
    }

    if (supervisedEnrollments.length > 0) {
      for (const enrollment of supervisedEnrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;
        await scheduleEnrollmentConfirmationForSummary(ctx, {
          recipientEmail: args.userEmail,
          userName: args.studentName || args.userEmail,
          userPhone: args.userPhone,
          enrollment,
          course,
          sessionType: args.sessionType,
        });
      }
    }

    if (enrollments.length > 0) {
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;
        await scheduleEnrollmentConfirmationForSummary(ctx, {
          recipientEmail: args.userEmail,
          userName: args.studentName || args.userEmail,
          userPhone: args.userPhone,
          enrollment,
          course,
          sessionType: args.sessionType,
        });
      }
    }

    if (args.checkoutAttemptId) {
      await ctx.db.patch(args.checkoutAttemptId, {
        status: "finalized",
        finalizedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return convexSuccess({
      enrollments: [
        ...enrollments,
        ...supervisedEnrollments,
        ...worksheetEnrollments,
      ],
    });
  },
});

export const getUserEnrollments = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("enrollments"),
      _creationTime: v.number(),
      ...PublicEnrollmentFields,
      course: v.union(PublicCourseDocumentValue, v.null()),
    }),
  ),

  handler: async (ctx, args) => {
    const toPublicEnrollment = (enrollment: Doc<"enrollments">) => {
      const {
        cancelledByAdminId: _cancelledByAdminId,
        transferredByAdminId: _transferredByAdminId,
        ...publicFields
      } = enrollment;

      return publicFields;
    };

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    // Authenticated enrollments store the Clerk user ID, which Clerk also
    // exposes as the JWT `sub` claim used by Convex auth.
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .take(limit);

    // Batch fetch all courses at once to avoid N+1 queries
    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await Promise.all(
      courseIds.map((courseId) => ctx.db.get(courseId)),
    );

    // Create a map for O(1) lookup
    const courseMap = new Map(
      courses
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => [c._id, c]),
    );

    // Combine enrollments with courses
    const enrollmentsWithCourses = enrollments.map((enrollment) => {
      const course = courseMap.get(enrollment.courseId);

      return {
        ...toPublicEnrollment(enrollment),
        course: course ? pickPublicCourse(course) : null,
      };
    });

    return enrollmentsWithCourses;
  },
});

// Get enrollment by enrollment number
// Optimized to use index
export const getEnrollmentByNumber = query({
  args: {
    enrollmentNumber: v.string(),
  },

  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_enrollmentNumber", (q) =>
        q.eq("enrollmentNumber", args.enrollmentNumber),
      )
      .first();

    if (!enrollment) {
      return null;
    }

    const course = await ctx.db.get(enrollment.courseId);
    return {
      ...enrollment,
      course: course,
    };
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

// Create a guest user
export const createGuestUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  returns: v.id("guestUsers"),
  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    const existingUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user with new information
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
      });
      return existingUser._id;
    }

    // Create new guest user
    return await ctx.db.insert("guestUsers", {
      name: args.name,
      email: args.email,
      phone: args.phone,
    });
  },
});

// Handle guest user cart checkout using email
export const handleGuestUserCartCheckoutByEmail = mutation({
  args: {
    userEmail: v.string(),
    courseIds: v.array(v.id("courses")),
  },

  handler: async (ctx, args) => {
    if (args.courseIds.length === 0) {
      return enrollmentMutationFailure(
        "Checkout requires at least one course.",
      );
    }

    const courses: CourseDoc[] = [];
    for (const courseId of args.courseIds) {
      const course = await ctx.db.get(courseId);
      if (!course) {
        return enrollmentMutationFailure(
          `Course with ID ${courseId} not found`,
          convexResultErrorCode.NOT_FOUND,
          { courseId },
        );
      }
      courses.push(course);
    }

    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: "Guest User", // Will be updated when we have the actual name
        email: args.userEmail,
        phone: "", // Will be updated when we have the actual phone
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    const enrollments: EnrollmentSummary[] = [];

    for (const course of courses) {
      const courseId = course._id;
      const schedule = buildScheduleSnapshot(course, null);

      // Allow multiple enrollments per user for all course types

      // Generate enrollment number only for non-therapy and non-supervised courses
      let enrollmentNumber: string;
      if (course.type === "therapy" || course.type === "supervised") {
        enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          schedule.startDate,
        );
      }

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userEmail, // Use email as userId for guest users
        userName: guestUser.name,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        courseType: course.type, // Store course type
        sessions: course.sessions, // Store number of sessions for therapy courses
      });

      // Add enrollment to Google Sheets
      await addEnrollmentToGoogleSheets(ctx, {
        userId: args.userEmail,
        userName: guestUser.name,
        userEmail: args.userEmail,
        userPhone: guestUser.phone,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        courseType: course.type,
        sessions: course.sessions,
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userEmail],
      });

      enrollments.push({
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        courseType: course.type,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: undefined, // No session type for this function
      });

      const bogoEnrollments = await grantBogoEnrollments(ctx, course, {
        userId: args.userEmail,
        userName: guestUser.name,
        userEmail: args.userEmail,
        userPhone: guestUser.phone,
        sessionType: undefined,
        isGuestUser: true,
      });

      for (const bonus of bogoEnrollments) {
        enrollments.push(bonus);
      }
    }

    // Send email based on enrollment status
    if (enrollments.length > 0) {
      console.log(
        "Sending course-specific emails for each guest enrollment...",
      );
      // Send course-specific emails for each enrollment
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;
        const schedule = getEnrollmentEmailSchedule(course, enrollment);

        const userName = guestUser.name;
        const enrollmentNumber = enrollment.enrollmentNumber;

        if (course.type === "internship") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              internshipPlan: enrollment.internshipPlan,
            },
          );
        } else if (course.type === "certificate") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendCertificateEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          );
        } else if (course.type === "diploma") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendDiplomaEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          );
        } else if (course.type === "pre-recorded") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendPreRecordedEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
            },
          );
        } else if (course.type === "masterclass") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendMasterclassEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          );
        } else if (course.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              therapyType: course.name,
              sessionCount: course.sessions || 1,
              enrollmentNumber: enrollmentNumber,
            },
          );
        } else {
          // Fallback to generic enrollment confirmation for other types
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          );
        }
      }
      console.log(
        "Course-specific emails for guest user scheduled successfully",
      );
    }

    return convexSuccess({ enrollments });
  },
});

// Handle guest user cart checkout with complete user data
export const handleGuestUserCartCheckoutWithData = mutation({
  args: {
    userData: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    courseIds: v.optional(v.array(v.id("courses"))),
    lineItems: v.optional(v.array(enrollmentLineItemValidator)),
    internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    bogoSelections: v.optional(
      v.array(
        v.object({
          sourceCourseId: v.id("courses"),
          sourceBatchId: v.optional(v.id("courseBatches")),
          selectedFreeCourseId: v.id("courses"),
          selectedFreeBatchId: v.optional(v.id("courseBatches")),
        }),
      ),
    ),
    checkoutPricing: v.optional(checkoutPricingValidator),
  },

  handler: async (ctx, args) => {
    if (!args.checkoutPricing) {
      console.warn(
        "Guest cart checkout missing checkoutPricing; enrollment pricing will fall back to course prices",
      );
    }

    const lineItems: EnrollmentLineItem[] =
      args.lineItems && args.lineItems.length > 0
        ? args.lineItems
        : (args.courseIds ?? []).map((courseId) => ({ courseId }));

    if (lineItems.length === 0) {
      return enrollmentMutationFailure(
        "Checkout requires at least one course.",
      );
    }

    const enrollments: EnrollmentSummary[] = [];
    const supervisedEnrollments: EnrollmentSummary[] = [];
    const worksheetEnrollments: EnrollmentSummary[] = [];
    const preparedLineItems: PreparedEnrollmentLineItem[] = [];
    const processedBogoSourceCourses = new Set<string>();
    const consumedAdminCouponCodes = new Set<string>();
    const remainingAdminCouponDiscountByCode = new Map<string, number>();

    for (const lineItem of lineItems) {
      const course = await ctx.db.get(lineItem.courseId);
      if (!course) {
        return enrollmentMutationFailure(
          `Course with ID ${lineItem.courseId} not found`,
          convexResultErrorCode.NOT_FOUND,
          { courseId: lineItem.courseId },
        );
      }
      const batchResolution = await resolveEnrollmentBatchResult(
        ctx,
        course,
        lineItem.batchId,
      );
      if (isEnrollmentScheduleFailure(batchResolution)) {
        return batchResolution;
      }
      const batch = batchResolution.batch;
      const capacityResult = await ensureEnrollmentCapacityResult(
        ctx,
        course,
        args.userData.email,
        batch,
      );
      if (isEnrollmentCapacityFailure(capacityResult)) {
        return capacityResult;
      }

      const pricingItem = getCheckoutPricingItem(
        args.checkoutPricing,
        lineItem.courseId,
        lineItem.batchId,
      );

      preparedLineItems.push({
        batch,
        batchResolution,
        course,
        courseDisplayName: batchResolution.batchLabel
          ? `${course.name} (${batchResolution.batchLabel})`
          : course.name,
        internshipPlan:
          course.usesBatches || course.type !== "internship"
            ? undefined
            : args.internshipPlan ||
              extractInternshipPlanFromDuration(course.duration) ||
              undefined,
        lineItem,
        pricingItem,
      });
    }

    const checkoutCartCourses = preparedLineItems.map((item) => item.course);
    const preflightAdminCouponDiscountByCode = new Map<string, number>();

    for (const { course, pricingItem } of preparedLineItems) {
      const pricingFailure = await validateCheckoutPricingItemResult(
        ctx,
        {
          userId: args.userData.email,
          course,
          pricingItem,
        },
        {
          cartCourses: checkoutCartCourses,
          consumeCoupon: false,
          remainingAdminCouponDiscountByCode:
            preflightAdminCouponDiscountByCode,
        },
      );
      if (pricingFailure) {
        return pricingFailure;
      }
    }

    // Check if guest user already exists with this email after preflight passes.
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userData.email))
      .first();

    if (guestUser) {
      await ctx.db.patch(guestUser._id, {
        name: args.userData.name,
        phone: args.userData.phone,
      });
    } else {
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: args.userData.name,
        email: args.userData.email,
        phone: args.userData.phone,
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    for (const {
      batch,
      batchResolution,
      course,
      courseDisplayName,
      internshipPlan,
      lineItem,
      pricingItem,
    } of preparedLineItems) {
      let enrollmentNumber: string;
      if (
        course.type === "therapy" ||
        course.type === "supervised" ||
        course.type === "worksheet"
      ) {
        enrollmentNumber = "N/A";
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          batchResolution.startDate,
        );
      }

      const couponConsumptionFailure = await validateCheckoutPricingItemResult(
        ctx,
        {
          userId: args.userData.email,
          course,
          pricingItem,
        },
        {
          cartCourses: checkoutCartCourses,
          consumedAdminCouponCodes,
          remainingAdminCouponDiscountByCode,
        },
      );
      if (couponConsumptionFailure) {
        throw new Error(couponConsumptionFailure.error.message);
      }

      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userData.email,
        userName: args.userData.name,
        userEmail: args.userData.email,
        userPhone: args.userData.phone,
        courseId: lineItem.courseId,
        courseName: courseDisplayName,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        batchId: batch?._id,
        batchLabel: batchResolution.batchLabel,
        batchStartDate: batchResolution.batchStartDate,
        batchEndDate: batchResolution.batchEndDate,
        batchStartTime: batchResolution.batchStartTime,
        batchEndTime: batchResolution.batchEndTime,
        batchDaysOfWeek: batchResolution.batchDaysOfWeek,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
        ...buildEnrollmentPricingFields(course, pricingItem),
        registrationSource: "guest_checkout",
      });

      await addEnrollmentToGoogleSheets(ctx, {
        userId: args.userData.email,
        userName: args.userData.name,
        userEmail: args.userData.email,
        userPhone: args.userData.phone,
        courseId: lineItem.courseId,
        courseName: courseDisplayName,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
      });

      await addUserToEnrollmentTarget(ctx, course, args.userData.email, batch);

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: courseDisplayName,
        courseId: lineItem.courseId,
        batchId: batch?._id,
        batchLabel: batchResolution.batchLabel,
        courseType: course.type,
        startDate: batchResolution.startDate,
        endDate: batchResolution.endDate,
        startTime: batchResolution.startTime,
        endTime: batchResolution.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
        sessionType: args.sessionType,
        isBogoFree: false,
      };

      if (course.type === "supervised") {
        supervisedEnrollments.push(enrollmentData);
      } else if (course.type === "worksheet") {
        worksheetEnrollments.push(enrollmentData);
      } else {
        enrollments.push(enrollmentData);
      }

      const bogoSelection = args.bogoSelections?.find(
        (selection) =>
          String(selection.sourceCourseId) === String(lineItem.courseId) &&
          (!selection.sourceBatchId ||
            String(selection.sourceBatchId) === String(lineItem.batchId)),
      );

      let bogoEnrollments: EnrollmentSummary[] = [];
      const sourceLineKey = `${lineItem.courseId}:${lineItem.batchId ?? "course"}`;

      const shouldProcessBogo =
        !processedBogoSourceCourses.has(sourceLineKey) &&
        (bogoSelection ||
          ((args.bogoSelections === undefined ||
            args.bogoSelections === null ||
            args.bogoSelections.length === 0) &&
            isBogoActive(course.bogo)));

      if (shouldProcessBogo) {
        processedBogoSourceCourses.add(sourceLineKey);

        if (bogoSelection) {
          const freeCourse = await ctx.db.get(
            bogoSelection.selectedFreeCourseId,
          );
          const validation = validateBogoSelection(
            course,
            freeCourse,
            bogoSelection,
          );

          if (!validation.isValid) {
            console.warn(
              `Invalid BOGO selection for course ${course.name}: ${validation.error}. Attempting fallback to predefined free course.`,
            );
            bogoEnrollments = await grantBogoEnrollments(
              ctx,
              course,
              {
                userId: args.userData.email,
                userName: args.userData.name,
                userEmail: args.userData.email,
                userPhone: args.userData.phone,
                sessionType: args.sessionType,
                isGuestUser: true,
              },
              bogoSelection,
            );
          } else {
            bogoEnrollments = await grantBogoEnrollments(
              ctx,
              course,
              {
                userId: args.userData.email,
                userName: args.userData.name,
                userEmail: args.userData.email,
                userPhone: args.userData.phone,
                sessionType: args.sessionType,
                isGuestUser: true,
              },
              bogoSelection,
            );
          }
        } else {
          bogoEnrollments = await grantBogoEnrollments(
            ctx,
            course,
            {
              userId: args.userData.email,
              userName: args.userData.name,
              userEmail: args.userData.email,
              userPhone: args.userData.phone,
              sessionType: args.sessionType,
              isGuestUser: true,
            },
            {
              sourceCourseId: lineItem.courseId,
              sourceBatchId: lineItem.batchId,
            },
          );
        }
      }

      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (bonusCourse?.type === "supervised") {
          supervisedEnrollments.push(bonus);
        } else if (bonusCourse?.type === "worksheet") {
          worksheetEnrollments.push(bonus);
        } else {
          enrollments.push(bonus);
        }
      }
    }

    if (worksheetEnrollments.length > 0) {
      const worksheets = await Promise.all(
        worksheetEnrollments.map(async (enrollment) => {
          const course = await ctx.db.get(enrollment.courseId);
          if (!course || !course.fileUrl) {
            console.warn(
              `Worksheet ${enrollment.courseName} missing fileUrl, skipping`,
            );
            return null;
          }
          return {
            name: enrollment.courseName,
            fileUrl: course.fileUrl,
          };
        }),
      );

      // Filter out any null entries
      const validWorksheets = worksheets.filter(
        (w): w is { name: string; fileUrl: string } => w !== null,
      );

      if (validWorksheets.length > 0) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendWorksheetPurchaseConfirmation,
          {
            userEmail: args.userData.email,
            userName: args.userData.name,
            userPhone: args.userData.phone,
            worksheets: validWorksheets,
          },
        );
      }
    }

    if (supervisedEnrollments.length > 0) {
      for (const enrollment of supervisedEnrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;
        await scheduleEnrollmentConfirmationForSummary(ctx, {
          recipientEmail: args.userData.email,
          userName: args.userData.name,
          userPhone: args.userData.phone,
          enrollment,
          course,
          sessionType: args.sessionType,
        });
      }
    }

    if (enrollments.length > 0) {
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;
        await scheduleEnrollmentConfirmationForSummary(ctx, {
          recipientEmail: args.userData.email,
          userName: args.userData.name,
          userPhone: args.userData.phone,
          enrollment,
          course,
          sessionType: args.sessionType,
        });
      }
    }

    return convexSuccess({
      enrollments: [
        ...enrollments,
        ...supervisedEnrollments,
        ...worksheetEnrollments,
      ],
    });
  },
});

// Handle single course enrollment for guest user using email
export const handleGuestUserSingleEnrollmentByEmail = mutation({
  args: {
    userEmail: v.string(),
    courseId: v.id("courses"),
  },

  handler: async (ctx, args) => {
    // Get the course details before guest writes.
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return enrollmentMutationFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
        { courseId: args.courseId },
      );
    }

    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: "Guest User", // Will be updated when we have the actual name
        email: args.userEmail,
        phone: "", // Will be updated when we have the actual phone
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    const schedule = buildScheduleSnapshot(course, null);

    // Allow multiple enrollments per user for all course types

    // Generate enrollment number only for non-therapy and non-supervised courses
    let enrollmentNumber: string;
    if (course.type === "therapy" || course.type === "supervised") {
      enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
    } else {
      enrollmentNumber = generateEnrollmentNumber(
        course.code,
        schedule.startDate,
      );
    }

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userEmail, // Use email as userId for guest users
      userName: guestUser.name,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      courseType: course.type, // Store course type
      sessions: course.sessions, // Store number of sessions for therapy courses
    });

    // Add enrollment to Google Sheets
    await addEnrollmentToGoogleSheets(ctx, {
      userId: args.userEmail,
      userName: guestUser.name,
      userEmail: args.userEmail,
      userPhone: guestUser.phone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      courseType: course.type,
      sessions: course.sessions,
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userEmail],
    });

    const bogoEnrollments = await grantBogoEnrollments(ctx, course, {
      userId: args.userEmail,
      userName: guestUser.name,
      userEmail: args.userEmail,
      userPhone: guestUser.phone,
      sessionType: undefined,
      isGuestUser: true,
    });

    // Schedule appropriate email based on course type
    if (course.type === "therapy") {
      // Send therapy-specific email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: guestUser.name,
          userPhone: guestUser.phone,
          therapyType: course.name,
          sessionCount: course.sessions || 1,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else {
      // Send generic enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        },
      );
    }

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;
        const bonusSchedule = getEnrollmentEmailSchedule(bonusCourse, bonus);

        if (bonusCourse.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: guestUser.name,
              userPhone: guestUser.phone,
              therapyType: bonusCourse.name,
              sessionCount: bonusCourse.sessions || 1,
              enrollmentNumber: bonus.enrollmentNumber,
            },
          );
        } else if (bonusCourse.type === "supervised") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendSupervisedTherapyWelcomeEmail,
            {
              userEmail: args.userEmail,
              studentName: guestUser.name,
              sessionType: "focus",
            },
          );
        } else {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusSchedule.startDate,
              endDate: bonusSchedule.endDate,
              startTime: bonusSchedule.startTime,
              endTime: bonusSchedule.endTime,
            },
          );
        }
      }
    }

    const enrollment = {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
    };

    return convexSuccess({
      ...enrollment,
      enrollment,
    });
  },
});

// Handle supervised therapy enrollment
export const handleSupervisedTherapyEnrollment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },

  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return enrollmentMutationFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
        { courseId: args.courseId },
      );
    }
    const schedule = buildScheduleSnapshot(course, null);

    // Generate enrollment number only for non-therapy and non-supervised courses
    let enrollmentNumber: string;
    if (course.type === "therapy" || course.type === "supervised") {
      enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      console.log(
        "Course is therapy or supervised - using N/A for enrollment number",
      );
    } else {
      console.log("Course code:", course.code, "Type:", typeof course.code);
      console.log(
        "Course start date:",
        course.startDate,
        "Type:",
        typeof course.startDate,
      );
      enrollmentNumber = generateEnrollmentNumber(
        course.code,
        schedule.startDate,
      );
      console.log("Generated enrollment number:", enrollmentNumber);
    }

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store the session type
      courseType: course.type, // Store course type
    });

    // Add enrollment to Google Sheets
    await addEnrollmentToGoogleSheets(ctx, {
      userId: args.userId,
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType,
      courseType: course.type,
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });

    const bogoEnrollments = await grantBogoEnrollments(ctx, course, {
      userId: args.userId,
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      sessionType: args.sessionType,
      isGuestUser: false,
    });

    // Schedule the new supervised therapy welcome email
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendSupervisedTherapyWelcomeEmail,
      {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      },
    );

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;
        const bonusSchedule = getEnrollmentEmailSchedule(bonusCourse, bonus);

        if (bonusCourse.type === "supervised") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendSupervisedTherapyWelcomeEmail,
            {
              userEmail: args.userEmail,
              studentName: args.studentName,
              sessionType: args.sessionType,
            },
          );
        } else if (bonusCourse.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: args.studentName,
              userPhone: args.userPhone,
              therapyType: bonusCourse.name,
              sessionCount: bonusCourse.sessions || 1,
              enrollmentNumber: bonus.enrollmentNumber,
            },
          );
        } else {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusSchedule.startDate,
              endDate: bonusSchedule.endDate,
              startTime: bonusSchedule.startTime,
              endTime: bonusSchedule.endTime,
            },
          );
        }
      }
    }

    const enrollment = {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };

    return convexSuccess({
      ...enrollment,
      enrollment,
    });
  },
});

// Handle guest user supervised therapy enrollment
export const handleGuestUserSupervisedTherapyEnrollment = mutation({
  args: {
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    courseId: v.id("courses"),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },

  handler: async (ctx, args) => {
    // Get the course details before guest writes.
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return enrollmentMutationFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
        { courseId: args.courseId },
      );
    }

    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: args.studentName,
        email: args.userEmail,
        phone: args.userPhone || "", // Use provided phone or empty string
      });
      guestUser = await ctx.db.get(guestUserId);
    } else {
      // Update existing guest user with the student name and phone
      await ctx.db.patch(guestUser._id, {
        name: args.studentName,
        phone: args.userPhone || guestUser.phone,
      });
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    const schedule = buildScheduleSnapshot(course, null);

    // Note: Removed already enrolled check for supervised courses
    // Users should be able to enroll multiple times for supervised sessions

    // Generate enrollment number only for non-therapy and non-supervised courses
    let enrollmentNumber: string;
    if (course.type === "therapy" || course.type === "supervised") {
      enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      console.log(
        "Course is therapy or supervised - using N/A for enrollment number",
      );
    } else {
      console.log("Course code:", course.code, "Type:", typeof course.code);
      console.log(
        "Course start date:",
        course.startDate,
        "Type:",
        typeof course.startDate,
      );
      enrollmentNumber = generateEnrollmentNumber(
        course.code,
        schedule.startDate,
      );
      console.log("Generated enrollment number:", enrollmentNumber);
    }

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userEmail, // Use email as userId for guest users
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      sessionType: args.sessionType, // Store the session type
      courseType: course.type, // Store course type
    });

    // Add enrollment to Google Sheets
    await addEnrollmentToGoogleSheets(ctx, {
      userId: args.userEmail,
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      sessionType: args.sessionType,
      courseType: course.type,
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userEmail],
    });

    const bogoEnrollments = await grantBogoEnrollments(ctx, course, {
      userId: args.userEmail,
      userName: args.studentName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      sessionType: args.sessionType,
      isGuestUser: true,
    });

    // Schedule the new supervised therapy welcome email
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendSupervisedTherapyWelcomeEmail,
      {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      },
    );

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;
        const bonusSchedule = getEnrollmentEmailSchedule(bonusCourse, bonus);

        if (bonusCourse.type === "supervised") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendSupervisedTherapyWelcomeEmail,
            {
              userEmail: args.userEmail,
              studentName: args.studentName,
              sessionType: args.sessionType,
            },
          );
        } else if (bonusCourse.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: args.studentName,
              userPhone: args.userPhone,
              therapyType: bonusCourse.name,
              sessionCount: bonusCourse.sessions || 1,
              enrollmentNumber: bonus.enrollmentNumber,
            },
          );
        } else {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusSchedule.startDate,
              endDate: bonusSchedule.endDate,
              startTime: bonusSchedule.startTime,
              endTime: bonusSchedule.endTime,
            },
          );
        }
      }
    }

    const enrollment = {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };

    return convexSuccess({
      ...enrollment,
      enrollment,
    });
  },
});

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

// Setup Google Sheets for enrollments
export const setupEnrollmentGoogleSheet = action({
  args: {
    spreadsheetId: v.string(),
    sheetName: v.optional(v.string()),
  },
  returns: googleSheetsActionResultValidator,
  handler: async (ctx, args): Promise<GoogleSheetsActionResult> => {
    const sheetName = args.sheetName || "Enrollments";

    const result: GoogleSheetsActionResult = await ctx.runAction(
      api.googleSheets.setupEnrollmentSheet,
      {
        spreadsheetId: args.spreadsheetId,
        sheetName: sheetName,
      },
    );
    if (result._tag === "Success") {
      console.log(
        `Successfully set up Google Sheets for enrollments: ${args.spreadsheetId}/${sheetName}`,
      );
    }

    return result;
  },
});

// ==========================================
// User Profile Functions (for WhatsApp number collection)
// ==========================================

// Get user profile by Clerk user ID
export const getUserProfile = query({
  args: {
    clerkUserId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("userProfiles"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      whatsappNumber: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    return profile;
  },
});

// Save or update user WhatsApp number
export const saveUserWhatsappNumber = mutation({
  args: {
    clerkUserId: v.string(),
    whatsappNumber: v.string(),
  },
  returns: v.id("userProfiles"),
  handler: async (ctx, args) => {
    // Check if user profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existingProfile) {
      // Update existing profile with new WhatsApp number
      await ctx.db.patch(existingProfile._id, {
        whatsappNumber: args.whatsappNumber,
      });
      return existingProfile._id;
    }

    // Create new user profile
    return await ctx.db.insert("userProfiles", {
      clerkUserId: args.clerkUserId,
      whatsappNumber: args.whatsappNumber,
    });
  },
});

// Get referral rewards for a referrer (people who used their referral link)
export const getReferralRewards = query({
  args: {
    referrerClerkUserId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("referralRewards"),
      _creationTime: v.number(),
      referrerClerkUserId: v.string(),
      referredClerkUserId: v.string(),
      awardedPoints: v.number(),
      createdAt: v.number(),
      firstEnrollmentId: v.optional(v.id("enrollments")),
      referredUserName: v.optional(v.string()),
      referredUserEmail: v.optional(v.string()),
      firstCourseName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const rewards = await ctx.db
      .query("referralRewards")
      .withIndex("by_referrerClerkUserId", (q) =>
        q.eq("referrerClerkUserId", args.referrerClerkUserId),
      )
      .order("desc")
      .collect();

    // Batch fetch all enrollments first to avoid N+1 queries
    const enrollmentIds = rewards
      .map((r) => r.firstEnrollmentId)
      .filter((id): id is Id<"enrollments"> => id !== undefined);

    const enrollments = await Promise.all(
      enrollmentIds.map((id) => ctx.db.get(id)),
    );

    // Create a map for O(1) lookup
    const enrollmentMap = new Map(
      enrollments
        .filter((e): e is NonNullable<typeof e> => e !== null)
        .map((e) => [e._id, e]),
    );

    // Enrich with user info from pre-fetched enrollments
    const enrichedRewards = rewards.map((reward) => {
      let referredUserName: string | undefined;
      let referredUserEmail: string | undefined;
      let firstCourseName: string | undefined;

      if (reward.firstEnrollmentId) {
        const enrollment = enrollmentMap.get(reward.firstEnrollmentId);
        if (enrollment) {
          referredUserName = enrollment.userName;
          referredUserEmail = enrollment.userEmail;
          firstCourseName = enrollment.courseName;
        }
      }

      return {
        ...reward,
        referredUserName,
        referredUserEmail,
        firstCourseName,
      };
    });

    return enrichedRewards;
  },
});
