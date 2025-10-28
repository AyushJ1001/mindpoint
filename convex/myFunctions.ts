import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Helper function to extract internship plan from duration field
function extractInternshipPlanFromDuration(
  duration?: string,
): "120" | "240" | null {
  if (!duration) return null;

  // Look for patterns like "120 hours", "240 hours", "2 weeks", "4 weeks", etc.
  const durationLower = duration.toLowerCase().trim();

  // Check for hour patterns
  if (durationLower.includes("120") || durationLower.includes("2 week")) {
    return "120";
  }
  if (durationLower.includes("240") || durationLower.includes("4 week")) {
    return "240";
  }

  // Check for week patterns
  const weekMatch = durationLower.match(/(\d+)\s*week/);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1]);
    if (weeks <= 2) return "120";
    if (weeks >= 4) return "240";
  }

  // Check for hour patterns
  const hourMatch = durationLower.match(/(\d+)\s*hour/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    if (hours <= 120) return "120";
    if (hours >= 240) return "240";
  }

  return null;
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
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

    if (!spreadsheetId) {
      console.warn(
        "Google Sheets spreadsheet ID not configured, skipping sheet update",
      );
      return;
    }

    // Schedule the Google Sheets action
    await ctx.scheduler.runAfter(0, api.googleSheets.addEnrollmentToSheet, {
      enrollmentData: {
        ...enrollmentData,
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

// Generate a unique enrollment number
function generateEnrollmentNumber(
  courseCode: string,
  startDate: string,
): string {
  // Parse the start date to get month and year
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

  // Format: COURSECODE-MMYY-RANDOM
  return `TMP-${courseCode}-${month}${year}-${randomNumber}`;
}

// Calculate end date based on internship plan
function calculateInternshipEndDate(
  startDate: string,
  internshipPlan: "120" | "240",
): string {
  const start = new Date(startDate);
  const weeks = internshipPlan === "120" ? 2 : 4; // 2 weeks for 120 hours, 4 weeks for 240 hours

  const endDate = new Date(start);
  endDate.setDate(start.getDate() + weeks * 7); // Add weeks * 7 days

  return endDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

type CourseDoc = Doc<"courses">;

interface EnrollmentSummary {
  enrollmentId: Id<"enrollments">;
  enrollmentNumber: string;
  courseName: string;
  courseId: Id<"courses">;
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
  bogoSelection: { sourceCourseId: string; selectedFreeCourseId: string },
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

  // Capacity check on the free course if capacity is enforced
  const capacity = selectedFreeCourse.capacity ?? 0;
  const enrolled = (selectedFreeCourse.enrolledUsers ?? []).length;
  const seatsLeft = Math.max(0, capacity - enrolled);
  if (capacity > 0 && seatsLeft === 0) {
    return {
      isValid: false,
      error: `Selected free course \"${selectedFreeCourse.name}\" is out of stock`,
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
    selectedFreeCourseId: Id<"courses">;
  },
): Promise<EnrollmentSummary[]> {
  if (!isBogoActive(sourceCourse.bogo)) {
    return [];
  }

  // If there's a BOGO selection provided, use that instead of the predefined free course
  if (bogoSelection) {
    const freeCourse = await ctx.db.get(bogoSelection.selectedFreeCourseId);

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
    const validation = validateBogoSelection(
      sourceCourse,
      freeCourse,
      bogoSelection,
    );

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
  // Note: We don't have a direct index by type here, so we scan and filter.
  // Consider adding an index if this becomes hot.
  const candidates: Array<CourseDoc> = [];
  for await (const c of ctx.db.query("courses")) {
    if (!c) continue;
    if (c._id === sourceCourse._id) continue;
    if (c.type !== sourceCourse.type) continue;
    const capacity = c.capacity ?? 0;
    const enrolled = (c.enrolledUsers ?? []).length;
    const seatsLeft = Math.max(0, capacity - enrolled);
    if (capacity > 0 && seatsLeft === 0) continue;
    candidates.push(c);
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
  const internshipPlan =
    extractInternshipPlanFromDuration(freeCourse.duration) || undefined;

  // Idempotency: Check if a BOGO enrollment already exists for this user & course
  const existingEnrollment = await ctx.db
    .query("enrollments")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), userContext.userId),
        q.eq(q.field("courseId"), freeCourse._id),
      ),
    )
    .collect();
  const existingBogo = existingEnrollment.find((e) => e.isBogoFree === true);

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
    let computedEndDate = freeCourse.endDate;
    if (
      freeCourse.type === "internship" &&
      (internshipPlan === "120" || internshipPlan === "240")
    ) {
      computedEndDate = calculateInternshipEndDate(
        freeCourse.startDate,
        internshipPlan,
      );
    }
    return [
      {
        enrollmentId: existingBogo._id as Id<"enrollments">,
        enrollmentNumber: existingBogo.enrollmentNumber,
        courseName: freeCourse.name,
        courseId: freeCourse._id as Id<"courses">,
        courseType: freeCourse.type,
        startDate: freeCourse.startDate,
        endDate: computedEndDate,
        startTime: freeCourse.startTime,
        endTime: freeCourse.endTime,
        internshipPlan,
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
      : generateEnrollmentNumber(freeCourse.code, freeCourse.startDate);

  const enrollmentId = await ctx.db.insert("enrollments", {
    userId: userContext.userId,
    userName: userContext.userName || userContext.userEmail,
    userEmail: userContext.userEmail,
    userPhone: userContext.userPhone,
    courseId: freeCourse._id as Id<"courses">,
    courseName: freeCourse.name,
    enrollmentNumber,
    sessionType:
      freeCourse.type === "supervised" ? userContext.sessionType : undefined,
    courseType: freeCourse.type,
    internshipPlan,
    sessions: freeCourse.sessions,
    isGuestUser: userContext.isGuestUser,
    isBogoFree: true,
    bogoSourceCourseId: sourceCourse._id as Id<"courses">,
    bogoOfferName: sourceCourse.name,
  });

  await addEnrollmentToGoogleSheets(ctx, {
    userId: userContext.userId,
    userName: userContext.userName || userContext.userEmail,
    userEmail: userContext.userEmail,
    userPhone: userContext.userPhone,
    courseId: freeCourse._id as unknown as string,
    courseName: freeCourse.name,
    enrollmentNumber,
    sessionType:
      freeCourse.type === "supervised" ? userContext.sessionType : undefined,
    courseType: freeCourse.type,
    internshipPlan,
    sessions: freeCourse.sessions,
    isGuestUser: userContext.isGuestUser,
    isBogoFree: true,
    bogoSourceCourseId: sourceCourse._id as unknown as string,
    bogoOfferName: sourceCourse.name,
  });

  // Robust roster patch: re-read, set-union, verify, retry once if needed
  const latest = await ctx.db.get(freeCourse._id);
  const latestUsers = latest?.enrolledUsers ?? [];
  if (!latestUsers.includes(userContext.userId)) {
    await ctx.db.patch(freeCourse._id, {
      enrolledUsers: [...latestUsers, userContext.userId],
    });
    const verify = await ctx.db.get(freeCourse._id);
    const verifyUsers = verify?.enrolledUsers ?? [];
    if (!verifyUsers.includes(userContext.userId)) {
      console.warn("Retrying enrolledUsers patch for BOGO", {
        userId: userContext.userId,
        courseId: freeCourse._id,
      });
      await ctx.db.patch(freeCourse._id, {
        enrolledUsers: [...verifyUsers, userContext.userId],
      });
    }
  }

  let computedEndDate = freeCourse.endDate;
  if (
    freeCourse.type === "internship" &&
    (internshipPlan === "120" || internshipPlan === "240")
  ) {
    computedEndDate = calculateInternshipEndDate(
      freeCourse.startDate,
      internshipPlan,
    );
  }

  return [
    {
      enrollmentId,
      enrollmentNumber,
      courseName: freeCourse.name,
      courseId: freeCourse._id as Id<"courses">,
      courseType: freeCourse.type,
      startDate: freeCourse.startDate,
      endDate: computedEndDate,
      startTime: freeCourse.startTime,
      endTime: freeCourse.endTime,
      internshipPlan,
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
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },

  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
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
        course.startDate,
      );

      console.log("Generated enrollment number:", enrollmentNumber);
    }

    // Extract internship plan from course duration
    const internshipPlan =
      extractInternshipPlanFromDuration(course.duration) || undefined;

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName || args.userEmail,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store session type if provided
      courseType: course.type, // Store course type
      internshipPlan: internshipPlan, // Store internship plan if provided
      sessions: course.sessions, // Store number of sessions for therapy courses
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
      internshipPlan: internshipPlan,
      sessions: course.sessions,
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });

    const userName = args.studentName || args.userEmail;

    const bogoEnrollments = await grantBogoEnrollments(ctx, course, {
      userId: args.userId,
      userName: userName,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      sessionType: args.sessionType,
      isGuestUser: false,
    });

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
    } else if (course.type === "internship" && internshipPlan) {
      // Calculate end date based on internship plan
      const calculatedEndDate = calculateInternshipEndDate(
        course.startDate,
        internshipPlan,
      );

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
          startDate: course.startDate,
          endDate: calculatedEndDate,
          startTime: course.startTime,
          endTime: course.endTime,
          internshipPlan: internshipPlan,
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
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
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
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
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
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
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
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    }

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;

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
          const internshipPlan =
            extractInternshipPlanFromDuration(bonusCourse.duration) ||
            undefined;
          const hasPlan = internshipPlan === "120" || internshipPlan === "240";
          const calculatedEndDate = hasPlan
            ? calculateInternshipEndDate(
                bonusCourse.startDate,
                internshipPlan as "120" | "240",
              )
            : bonusCourse.endDate;

          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              courseName: bonusCourse.name,
              enrollmentNumber: bonus.enrollmentNumber,
              startDate: bonusCourse.startDate,
              endDate: calculatedEndDate,
              startTime: bonusCourse.startTime,
              endTime: bonusCourse.endTime,
              internshipPlan: hasPlan ? internshipPlan : "120",
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
              startDate: bonusCourse.startDate,
              endDate: bonusCourse.endDate,
              startTime: bonusCourse.startTime,
              endTime: bonusCourse.endTime,
            },
          );
        }
      }
    }

    return enrollmentId;
  },
});

// Handle multiple course enrollments for cart checkout
export const handleCartCheckout = mutation({
  args: {
    userId: v.string(),
    courseIds: v.array(v.id("courses")),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    bogoSelections: v.optional(
      v.array(
        v.object({
          sourceCourseId: v.id("courses"),
          selectedFreeCourseId: v.id("courses"),
        }),
      ),
    ),
  },

  handler: async (ctx, args) => {
    const enrollments = [];
    const supervisedEnrollments = [];
    const processedBogoSourceCourses = new Set<string>(); // Track processed BOGO source courses

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Allow multiple enrollments per user for all course types

      // Generate enrollment number only for non-therapy and non-supervised courses
      let enrollmentNumber: string;
      if (course.type === "therapy" || course.type === "supervised") {
        enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          course.startDate,
        );
      }

      // Extract internship plan from course duration
      const internshipPlan =
        extractInternshipPlanFromDuration(course.duration) || undefined;

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userId,
        courseId: courseId,
        courseName: course.name,
        userName: args.studentName || args.userEmail,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        enrollmentNumber: enrollmentNumber,
        sessionType: args.sessionType, // Store session type if provided
        courseType: course.type, // Store course type
        internshipPlan: internshipPlan, // Store internship plan if provided
        sessions: course.sessions, // Store number of sessions for therapy courses
      });

      // Add enrollment to Google Sheets
      await addEnrollmentToGoogleSheets(ctx, {
        userId: args.userId,
        userName: args.studentName || args.userEmail,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userId],
      });

      // Calculate end date for internship courses
      let endDate = course.endDate;
      if (course.type === "internship" && internshipPlan) {
        endDate = calculateInternshipEndDate(course.startDate, internshipPlan);
      }

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        courseType: course.type,
        startDate: course.startDate,
        endDate: endDate,
        startTime: course.startTime,
        endTime: course.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: args.sessionType, // Include session type for supervised courses
      };

      // Check if this is a supervised therapy course
      console.log("Course name:", course.name);
      console.log("Course type:", course.type);
      console.log(
        "Checking if course is supervised:",
        course.type === "supervised",
      );
      console.log("Session type provided:", !!args.sessionType);
      console.log("Student name provided:", !!args.studentName);

      if (course.type === "supervised") {
        console.log("Adding to supervised enrollments");
        supervisedEnrollments.push(enrollmentData);
      } else {
        console.log("Adding to regular enrollments");
        enrollments.push(enrollmentData);
      }

      // Check if this course has a BOGO selection and hasn't been processed yet
      const bogoSelection = args.bogoSelections?.find(
        (selection) => selection.sourceCourseId === courseId,
      );

      let bogoEnrollments: EnrollmentSummary[] = [];

      // Only process BOGO if this source course hasn't been processed yet
      // Differentiate between undefined/null/empty array (use predefined BOGO) and array with selections (use specific selections)
      const shouldProcessBogo =
        !processedBogoSourceCourses.has(courseId) &&
        (bogoSelection || // User made a specific BOGO selection
          ((args.bogoSelections === undefined ||
            args.bogoSelections === null ||
            args.bogoSelections.length === 0) &&
            isBogoActive(course.bogo))); // No selections provided but course has active BOGO

      if (shouldProcessBogo) {
        processedBogoSourceCourses.add(courseId); // Mark as processed

        if (bogoSelection) {
          // Validate BOGO selection before proceeding
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
            // Fall back to the original BOGO logic for courses with predefined free courses
            bogoEnrollments = await grantBogoEnrollments(ctx, course, {
              userId: args.userId,
              userName: args.studentName || args.userEmail,
              userEmail: args.userEmail,
              userPhone: args.userPhone,
              sessionType: args.sessionType,
              isGuestUser: false,
            });
          } else {
            // Use the selected free course with the updated grantBogoEnrollments function
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
          // Use the original BOGO logic for courses with predefined free courses
          bogoEnrollments = await grantBogoEnrollments(ctx, course, {
            userId: args.userId,
            userName: args.studentName || args.userEmail,
            userEmail: args.userEmail,
            userPhone: args.userPhone,
            sessionType: args.sessionType,
            isGuestUser: false,
          });
        }
      } else if (processedBogoSourceCourses.has(courseId)) {
        console.log(
          `Skipping BOGO enrollment for course ${course.name} - already processed in this checkout`,
        );
      }

      for (const bonus of bogoEnrollments) {
        // Fetch the course to get the actual course type, as bonus.courseType might be undefined
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (bonusCourse?.type === "supervised") {
          supervisedEnrollments.push(bonus);
        } else {
          enrollments.push(bonus);
        }
      }
    }

    // Send appropriate emails based on course types
    // For supervised courses: Send separate welcome email with checklist PDFs attached
    // For other courses: Send regular cart checkout confirmation
    console.log("Email sending logic:");
    console.log(
      "- Supervised enrollments count:",
      supervisedEnrollments.length,
    );
    console.log("- Session type exists:", !!args.sessionType);
    console.log("- Student name exists:", !!args.studentName);
    console.log("- Regular enrollments count:", enrollments.length);

    if (supervisedEnrollments.length > 0) {
      console.log("Sending supervised therapy welcome emails...");
      // Send supervised therapy welcome email for each supervised course
      // This email includes the 4 required checklist PDFs as attachments
      for (const enrollment of supervisedEnrollments) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: args.userEmail,
            studentName: args.studentName || args.userEmail,
            sessionType: args.sessionType || "focus", // Default to focus if not provided
          },
        );
      }
      console.log("Supervised therapy welcome emails scheduled successfully");
    }

    if (enrollments.length > 0) {
      console.log("Sending course-specific emails for each enrollment...");
      // Send course-specific emails for each enrollment
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;

        const userName = args.studentName || args.userEmail;
        const enrollmentNumber = enrollment.enrollmentNumber;

        if (course.type === "internship" && enrollment.internshipPlan) {
          // Calculate end date based on internship plan
          const calculatedEndDate = calculateInternshipEndDate(
            course.startDate,
            enrollment.internshipPlan,
          );

          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: calculatedEndDate,
              startTime: course.startTime,
              endTime: course.endTime,
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
              userPhone: args.userPhone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "diploma") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendDiplomaEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "pre-recorded") {
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
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendMasterclassEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: args.userPhone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "therapy") {
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
          // Fallback to generic enrollment confirmation for other types
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        }
      }
      console.log("Course-specific emails scheduled successfully");
    }

    return [...enrollments, ...supervisedEnrollments];
  },
});

// Get enrollments for a specific user
export const getUserEnrollments = query({
  args: {
    userId: v.string(),
  },

  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        return {
          ...enrollment,
          course: course,
        };
      }),
    );

    return enrollmentsWithCourses;
  },
});

// Get enrollment by enrollment number
export const getEnrollmentByNumber = query({
  args: {
    enrollmentNumber: v.string(),
  },

  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("enrollmentNumber"), args.enrollmentNumber))
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

    const enrollments = [];

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Allow multiple enrollments per user for all course types

      // Generate enrollment number only for non-therapy and non-supervised courses
      let enrollmentNumber: string;
      if (course.type === "therapy" || course.type === "supervised") {
        enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          course.startDate,
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
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
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

        const userName = guestUser.name;
        const enrollmentNumber = enrollment.enrollmentNumber;

        if (course.type === "internship") {
          // For guest users, we don't have internship plan info, so use default
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userEmail,
              userName: userName,
              userPhone: guestUser.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
              internshipPlan: "120", // Default to 120 hours
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
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
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
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
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
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
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
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        }
      }
      console.log(
        "Course-specific emails for guest user scheduled successfully",
      );
    }

    return enrollments;
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
    courseIds: v.array(v.id("courses")),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    bogoSelections: v.optional(
      v.array(
        v.object({
          sourceCourseId: v.id("courses"),
          selectedFreeCourseId: v.id("courses"),
        }),
      ),
    ),
  },

  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userData.email))
      .first();

    if (guestUser) {
      // Update existing guest user with new information
      await ctx.db.patch(guestUser._id, {
        name: args.userData.name,
        phone: args.userData.phone,
      });
    } else {
      // Create a new guest user
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

    const enrollments = [];
    const supervisedEnrollments = [];
    const processedBogoSourceCourses = new Set<string>(); // Track processed BOGO source courses

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Allow multiple enrollments per user for all course types

      // Generate enrollment number only for non-therapy and non-supervised courses
      let enrollmentNumber: string;
      if (course.type === "therapy" || course.type === "supervised") {
        enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
      } else {
        enrollmentNumber = generateEnrollmentNumber(
          course.code,
          course.startDate,
        );
      }

      // Extract internship plan from course duration
      const internshipPlan =
        extractInternshipPlanFromDuration(course.duration) || undefined;

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userData.email, // Use email as userId for guest users
        userName: args.userData.name,
        userEmail: args.userData.email,
        userPhone: args.userData.phone,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        sessionType: args.sessionType, // Store session type if provided
        courseType: course.type, // Store course type
        internshipPlan: internshipPlan, // Store internship plan if provided
        sessions: course.sessions, // Store number of sessions for therapy courses
      });

      // Add enrollment to Google Sheets
      await addEnrollmentToGoogleSheets(ctx, {
        userId: args.userData.email,
        userName: args.userData.name,
        userEmail: args.userData.email,
        userPhone: args.userData.phone,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        sessionType: args.sessionType,
        courseType: course.type,
        internshipPlan: internshipPlan,
        sessions: course.sessions,
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userData.email],
      });

      // Calculate end date for internship courses
      let endDate = course.endDate;
      if (course.type === "internship" && internshipPlan) {
        endDate = calculateInternshipEndDate(course.startDate, internshipPlan);
      }

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        courseType: course.type,
        startDate: course.startDate,
        endDate: endDate,
        startTime: course.startTime,
        endTime: course.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: args.sessionType, // Include session type for supervised courses
      };

      // Check if this is a supervised therapy course
      if (course.type === "supervised") {
        supervisedEnrollments.push(enrollmentData);
      } else {
        enrollments.push(enrollmentData);
      }

      // Check if this course has a BOGO selection and hasn't been processed yet
      const bogoSelection = args.bogoSelections?.find(
        (selection) => selection.sourceCourseId === courseId,
      );

      let bogoEnrollments: EnrollmentSummary[] = [];

      // Only process BOGO if this source course hasn't been processed yet
      // Differentiate between undefined/null/empty array (use predefined BOGO) and array with selections (use specific selections)
      const shouldProcessBogo =
        !processedBogoSourceCourses.has(courseId) &&
        (bogoSelection || // User made a specific BOGO selection
          ((args.bogoSelections === undefined ||
            args.bogoSelections === null ||
            args.bogoSelections.length === 0) &&
            isBogoActive(course.bogo))); // No selections provided but course has active BOGO

      if (shouldProcessBogo) {
        processedBogoSourceCourses.add(courseId); // Mark as processed

        if (bogoSelection) {
          // Validate BOGO selection before proceeding
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
            // Fall back to the original BOGO logic for courses with predefined free courses
            bogoEnrollments = await grantBogoEnrollments(ctx, course, {
              userId: args.userData.email,
              userName: args.userData.name,
              userEmail: args.userData.email,
              userPhone: args.userData.phone,
              sessionType: args.sessionType,
              isGuestUser: true,
            });
          } else {
            // Use the selected free course with the updated grantBogoEnrollments function
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
          // Use the original BOGO logic for courses with predefined free courses
          bogoEnrollments = await grantBogoEnrollments(ctx, course, {
            userId: args.userData.email,
            userName: args.userData.name,
            userEmail: args.userData.email,
            userPhone: args.userData.phone,
            sessionType: args.sessionType,
            isGuestUser: true,
          });
        }
      } else if (processedBogoSourceCourses.has(courseId)) {
        console.log(
          `Skipping BOGO enrollment for course ${course.name} - already processed in this checkout`,
        );
      }

      for (const bonus of bogoEnrollments) {
        // Fetch the course to get the actual course type, as bonus.courseType might be undefined
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (bonusCourse?.type === "supervised") {
          supervisedEnrollments.push(bonus);
        } else {
          enrollments.push(bonus);
        }
      }
    }

    // Send appropriate emails based on course types
    // For supervised courses: Send separate welcome email with checklist PDFs attached
    // For other courses: Send regular cart checkout confirmation
    if (supervisedEnrollments.length > 0) {
      // Send supervised therapy welcome email for each supervised course
      // This email includes the 4 required checklist PDFs as attachments
      for (const enrollment of supervisedEnrollments) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: args.userData.email,
            studentName: args.userData.name,
            sessionType: args.sessionType || "focus", // Default to focus if not provided
          },
        );
      }
    }

    if (enrollments.length > 0) {
      console.log(
        "Sending course-specific emails for each guest enrollment...",
      );
      // Send course-specific emails for each enrollment
      for (const enrollment of enrollments) {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) continue;

        const userName = args.userData.name;
        const enrollmentNumber = enrollment.enrollmentNumber;

        if (course.type === "internship" && enrollment.internshipPlan) {
          // Calculate end date based on internship plan
          const calculatedEndDate = calculateInternshipEndDate(
            course.startDate,
            enrollment.internshipPlan,
          );

          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendInternshipEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: calculatedEndDate,
              startTime: course.startTime,
              endTime: course.endTime,
              internshipPlan: enrollment.internshipPlan,
            },
          );
        } else if (course.type === "certificate") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendCertificateEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "diploma") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendDiplomaEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "pre-recorded") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendPreRecordedEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
            },
          );
        } else if (course.type === "masterclass") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendMasterclassEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        } else if (course.type === "therapy") {
          await ctx.scheduler.runAfter(
            0,
            api.emailActions.sendTherapyEnrollmentConfirmation,
            {
              userEmail: args.userData.email,
              userName: userName,
              userPhone: args.userData.phone,
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
              userEmail: args.userData.email,
              courseName: course.name,
              enrollmentNumber: enrollmentNumber,
              startDate: course.startDate,
              endDate: course.endDate,
              startTime: course.startTime,
              endTime: course.endTime,
            },
          );
        }
      }
      console.log(
        "Course-specific emails for guest user scheduled successfully",
      );
    }

    return [...enrollments, ...supervisedEnrollments];
  },
});

// Handle single course enrollment for guest user using email
export const handleGuestUserSingleEnrollmentByEmail = mutation({
  args: {
    userEmail: v.string(),
    courseId: v.id("courses"),
  },

  handler: async (ctx, args) => {
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

    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Allow multiple enrollments per user for all course types

    // Generate enrollment number only for non-therapy and non-supervised courses
    let enrollmentNumber: string;
    if (course.type === "therapy" || course.type === "supervised") {
      enrollmentNumber = "N/A"; // No enrollment number for therapy or supervised courses
    } else {
      enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
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
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    }

    if (bogoEnrollments.length > 0) {
      for (const bonus of bogoEnrollments) {
        const bonusCourse = await ctx.db.get(bonus.courseId);
        if (!bonusCourse) continue;

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
              startDate: bonusCourse.startDate,
              endDate: bonusCourse.endDate,
              startTime: bonusCourse.startTime,
              endTime: bonusCourse.endTime,
            },
          );
        }
      }
    }

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
    };
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
      throw new Error("Course not found");
    }

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
        course.startDate,
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
              startDate: bonusCourse.startDate,
              endDate: bonusCourse.endDate,
              startTime: bonusCourse.startTime,
              endTime: bonusCourse.endTime,
            },
          );
        }
      }
    }

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };
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

    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

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
        course.startDate,
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
              startDate: bonusCourse.startDate,
              endDate: bonusCourse.endDate,
              startTime: bonusCourse.startTime,
              endTime: bonusCourse.endTime,
            },
          );
        }
      }
    }

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };
  },
});

// Setup Google Sheets for enrollments
export const setupEnrollmentGoogleSheet = action({
  args: {
    spreadsheetId: v.string(),
    sheetName: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const sheetName = args.sheetName || "Sheet1";

      await ctx.runAction(api.googleSheets.setupEnrollmentSheet, {
        spreadsheetId: args.spreadsheetId,
        sheetName: sheetName,
      });

      console.log(
        `Successfully set up Google Sheets for enrollments: ${args.spreadsheetId}/${sheetName}`,
      );
      return null;
    } catch (error) {
      console.error("Error setting up Google Sheets:", error);
      throw error;
    }
  },
});
