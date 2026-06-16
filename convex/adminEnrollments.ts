import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { EnrollmentStatus } from "./schema";
import { requireAdmin } from "./adminAuth";
import { normalizeEnrollmentStatus } from "./adminUtils";
import { createAdminAuditLog } from "./adminAudit";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  calculateInternshipEndDate,
  extractInternshipPlanFromDuration,
  generateEnrollmentNumber,
  roundCurrency,
  type InternshipPlan,
} from "./_shared/enrollment";
import { calculatePointsEarned } from "./_shared/mindPoints";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
  type ConvexResultErrorCode,
} from "./_shared/result";

type AdminEnrollmentFailure = ConvexFailure<ConvexResultErrorCode>;

function adminEnrollmentFailure(
  message: string,
  code: ConvexResultErrorCode = convexResultErrorCode.VALIDATION_ERROR,
): AdminEnrollmentFailure {
  return convexFailure({ code, message });
}

async function generateUniqueEnrollmentNumber(
  ctx: MutationCtx,
  courseCode: string,
  startDate: string,
): Promise<AdminEnrollmentFailure | string> {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const enrollmentNumber = generateEnrollmentNumber(courseCode, startDate);
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_enrollmentNumber", (q) =>
        q.eq("enrollmentNumber", enrollmentNumber),
      )
      .first();

    if (!existing) {
      return enrollmentNumber;
    }
  }

  return adminEnrollmentFailure(
    "Enrollment number collision. Please retry.",
    convexResultErrorCode.CONFLICT,
  );
}

type GuestCheckoutResult = Array<{
  courseId?: Id<"courses"> | string;
  enrollmentId: Id<"enrollments">;
}>;

type GuestCheckoutMutationResult =
  | AdminEnrollmentFailure
  | GuestCheckoutResult
  | {
      _tag: "Success";
      enrollments: GuestCheckoutResult;
      success: true;
    };

type SuccessfulPaymentResult = {
  enrollmentId: Id<"enrollments">;
};

type SuccessfulPaymentMutationResult =
  | AdminEnrollmentFailure
  | SuccessfulPaymentResult
  | {
      _tag: "Success";
      enrollment?: SuccessfulPaymentResult;
      enrollmentId?: Id<"enrollments">;
      success: true;
    };

function isAdminEnrollmentFailure(
  result: GuestCheckoutMutationResult | SuccessfulPaymentMutationResult,
): result is AdminEnrollmentFailure {
  return (
    !Array.isArray(result) && "_tag" in result && result._tag === "Failure"
  );
}

function normalizeGuestCheckoutResult(
  result: GuestCheckoutMutationResult,
): AdminEnrollmentFailure | GuestCheckoutResult {
  if (Array.isArray(result)) {
    return result;
  }

  if (isAdminEnrollmentFailure(result)) {
    return result;
  }

  return result.enrollments;
}

function normalizeSuccessfulPaymentResult(
  result: SuccessfulPaymentMutationResult,
): AdminEnrollmentFailure | SuccessfulPaymentResult {
  if (isAdminEnrollmentFailure(result)) {
    return result;
  }

  if ("_tag" in result) {
    if (result.enrollment) {
      return result.enrollment;
    }
    if (result.enrollmentId) {
      return { enrollmentId: result.enrollmentId };
    }
    return adminEnrollmentFailure(
      "handleSuccessfulPayment returned a success result without an enrollment ID.",
      convexResultErrorCode.CONFLICT,
    );
  }

  return result;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isAuthenticatedUserId(userId: string): boolean {
  return userId.startsWith("user_");
}

const adminEnrollmentPricingValidator = v.object({
  listedPrice: v.optional(v.number()),
  checkoutPrice: v.optional(v.number()),
  amountPaid: v.optional(v.number()),
  redemptionDiscountAmount: v.optional(v.number()),
  couponCode: v.optional(v.string()),
  mindPointsRedeemed: v.optional(v.number()),
});

const paidRecoveryCourseValidator = v.object({
  courseId: v.id("courses"),
  batchId: v.optional(v.id("courseBatches")),
  listedPrice: v.number(),
  checkoutPrice: v.number(),
  amountPaid: v.number(),
});

type AdminCheckoutPricingItem = {
  amountPaid: number;
  checkoutPrice: number;
  couponCode?: string;
  courseId: Id<"courses">;
  listedPrice: number;
  mindPointsRedeemed?: number;
  redemptionDiscountAmount?: number;
};

function buildAdminCheckoutPricingItem(
  course: Doc<"courses">,
  courseId: Id<"courses">,
  pricing?: {
    listedPrice?: number;
    checkoutPrice?: number;
    amountPaid?: number;
    redemptionDiscountAmount?: number;
    couponCode?: string;
    mindPointsRedeemed?: number;
  },
): AdminCheckoutPricingItem | AdminEnrollmentFailure {
  const listedPrice = roundCurrency(pricing?.listedPrice ?? course.price);
  const checkoutPrice = roundCurrency(pricing?.checkoutPrice ?? listedPrice);
  const amountPaid = roundCurrency(pricing?.amountPaid ?? checkoutPrice);
  if (amountPaid > checkoutPrice) {
    return adminEnrollmentFailure("Amount paid cannot exceed checkout price.");
  }

  const redemptionDiscountAmount = roundCurrency(
    Math.max(0, checkoutPrice - amountPaid),
  );
  const couponCode = pricing?.couponCode?.trim() || undefined;
  const mindPointsRedeemed = roundCurrency(pricing?.mindPointsRedeemed);

  return {
    courseId,
    listedPrice,
    checkoutPrice,
    amountPaid,
    redemptionDiscountAmount:
      redemptionDiscountAmount > 0 ? redemptionDiscountAmount : undefined,
    couponCode,
    mindPointsRedeemed: mindPointsRedeemed > 0 ? mindPointsRedeemed : undefined,
  };
}

async function removeUserFromCourseIfNoActiveEnrollment(
  ctx: MutationCtx,
  args: { userId: string; courseId: Id<"courses"> },
) {
  const activeEnrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_courseId_and_status_and_userId", (q) =>
      q
        .eq("courseId", args.courseId)
        .eq("status", "active")
        .eq("userId", args.userId),
    )
    .first();

  if (!activeEnrollment) {
    const course = await ctx.db.get(args.courseId);
    if (!course) return;

    const filteredUsers = (course.enrolledUsers ?? []).filter(
      (user: string) => user !== args.userId,
    );

    await ctx.db.patch(args.courseId, { enrolledUsers: filteredUsers });
  }
}

async function removeUserFromBatchIfNoActiveEnrollment(
  ctx: MutationCtx,
  args: {
    batchId: Id<"courseBatches">;
    enrollmentIdToIgnore: Id<"enrollments">;
    userId: string;
  },
) {
  const activeEnrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_batchId_and_status", (q) =>
      q.eq("batchId", args.batchId).eq("status", "active"),
    )
    .collect();

  const hasOtherActiveEnrollment = activeEnrollments.some(
    (row) =>
      String(row._id) !== String(args.enrollmentIdToIgnore) &&
      row.userId === args.userId,
  );

  if (hasOtherActiveEnrollment) {
    return;
  }

  const batch = await ctx.db.get(args.batchId);
  if (!batch) {
    return;
  }

  await ctx.db.patch(args.batchId, {
    enrolledUsers: (batch.enrolledUsers ?? []).filter(
      (user) => user !== args.userId,
    ),
  });
}

function getBatchSnapshot(batch: Doc<"courseBatches">) {
  return {
    batchDaysOfWeek: batch.daysOfWeek,
    batchEndDate: batch.endDate,
    batchEndTime: batch.endTime,
    batchId: batch._id,
    batchLabel: batch.label,
    batchStartDate: batch.startDate,
    batchStartTime: batch.startTime,
  };
}

export const listEnrollments = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(EnrollmentStatus),
    userId: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 250, 500);
    const scanLimit = Math.min(Math.max(limit * 5, 500), 2000);
    const effectiveScanLimit = args.search
      ? Math.min(Math.max(limit * 12, 1500), 5000)
      : scanLimit;
    const enrollments: Doc<"enrollments">[] = [];
    const seenEnrollmentIds = new Set<string>();
    const appendRows = (rows: Doc<"enrollments">[]) => {
      for (const row of rows) {
        const rowKey = String(row._id);
        if (seenEnrollmentIds.has(rowKey)) {
          continue;
        }
        seenEnrollmentIds.add(rowKey);
        enrollments.push(row);
      }
    };
    const remainingSlots = () =>
      Math.max(0, effectiveScanLimit - enrollments.length);

    if (args.userId && args.courseId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId_and_status_and_userId", (q) =>
            q
              .eq("courseId", args.courseId!)
              .eq("status", args.status!)
              .eq("userId", args.userId!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_userId_and_courseId", (q) =>
                q.eq("userId", args.userId!).eq("courseId", args.courseId!),
              )
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.userId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId_and_status", (q) =>
            q.eq("userId", args.userId!).eq("status", args.status!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.courseId && args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId_and_status", (q) =>
            q.eq("courseId", args.courseId!).eq("status", args.status!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          (
            await ctx.db
              .query("enrollments")
              .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
              .order("desc")
              .take(remainingSlots())
          ).filter((row) => row.status === undefined),
        );
      }
    } else if (args.userId && args.courseId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId_and_courseId", (q) =>
            q.eq("userId", args.userId!).eq("courseId", args.courseId!),
          )
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.userId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.courseId) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
          .order("desc")
          .take(effectiveScanLimit),
      );
    } else if (args.status) {
      appendRows(
        await ctx.db
          .query("enrollments")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(effectiveScanLimit),
      );

      if (args.status === "active" && remainingSlots() > 0) {
        appendRows(
          await ctx.db
            .query("enrollments")
            .withIndex("by_status", (q) => q.eq("status", undefined))
            .order("desc")
            .take(remainingSlots()),
        );
      }
    } else {
      appendRows(
        await ctx.db
          .query("enrollments")
          .order("desc")
          .take(effectiveScanLimit),
      );
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      const matchingRows = enrollments.filter((row) => {
        const fields = [
          row.userId,
          row.userName ?? "",
          row.userEmail ?? "",
          row.userPhone ?? "",
          row.courseName ?? "",
          row.enrollmentNumber,
          row.couponCode ?? "",
          row.bundleCampaignName ?? "",
        ];

        return fields.some((field) => field.toLowerCase().includes(search));
      });
      enrollments.length = 0;
      enrollments.push(...matchingRows);
    }

    const courseIds = Array.from(
      new Set(enrollments.map((row) => row.courseId)),
    );
    const courses = await Promise.all(
      courseIds.map((courseId) => ctx.db.get(courseId)),
    );
    const courseMap = new Map(
      courses
        .filter(
          (course): course is NonNullable<typeof course> => course !== null,
        )
        .map((course) => [course._id, course]),
    );

    return enrollments.slice(0, limit).map((enrollment) => ({
      ...enrollment,
      status: normalizeEnrollmentStatus(enrollment.status),
      course: courseMap.get(enrollment.courseId) ?? null,
    }));
  },
});

export const getEnrollmentDetail = query({
  args: {
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return null;
    }

    const [course, userProfile, mindPoints, relatedEnrollments] =
      await Promise.all([
        ctx.db.get(enrollment.courseId),
        isAuthenticatedUserId(enrollment.userId)
          ? ctx.db
              .query("userProfiles")
              .withIndex("by_clerkUserId", (q) =>
                q.eq("clerkUserId", enrollment.userId),
              )
              .first()
          : null,
        isAuthenticatedUserId(enrollment.userId)
          ? ctx.db
              .query("mindPoints")
              .withIndex("by_clerkUserId", (q) =>
                q.eq("clerkUserId", enrollment.userId),
              )
              .first()
          : null,
        ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", enrollment.userId))
          .order("desc")
          .take(25),
      ]);

    return {
      ...enrollment,
      status: normalizeEnrollmentStatus(enrollment.status),
      course,
      userProfile,
      mindPoints,
      relatedEnrollments: relatedEnrollments.map((row) => ({
        ...row,
        status: normalizeEnrollmentStatus(row.status),
      })),
    };
  },
});

export const createManualEnrollment = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    courseId: v.id("courses"),
    isGuestUser: v.optional(v.boolean()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    batchId: v.optional(v.id("courseBatches")),
    internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
    pricing: v.optional(adminEnrollmentPricingValidator),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      return adminEnrollmentFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    if (course.usesBatches && !args.batchId) {
      return adminEnrollmentFailure(
        "Select a batch before creating this enrollment.",
      );
    }

    if (args.isGuestUser && isAuthenticatedUserId(args.userId)) {
      return adminEnrollmentFailure(
        "A Clerk user ID cannot be enrolled as a guest user.",
      );
    }

    if (args.isGuestUser === false && args.userId.includes("@")) {
      return adminEnrollmentFailure(
        "An email-based user ID must be enrolled as a guest user.",
      );
    }

    if (
      args.userId.includes("@") &&
      normalizeEmail(args.userId) !== normalizeEmail(args.userEmail)
    ) {
      return adminEnrollmentFailure(
        "When using an email as the user ID, the user email must match exactly.",
      );
    }

    const isGuestUser = args.isGuestUser ?? !isAuthenticatedUserId(args.userId);
    const pricingItem = buildAdminCheckoutPricingItem(
      course,
      args.courseId,
      args.pricing,
    );
    if ("_tag" in pricingItem) {
      return pricingItem;
    }

    let enrollmentId: Id<"enrollments"> | null = null;

    if (isGuestUser) {
      const checkoutResult: GuestCheckoutMutationResult = await ctx.runMutation(
        api.myFunctions.handleGuestUserCartCheckoutWithData,
        {
          userData: {
            name: args.userName || args.userEmail,
            email: args.userEmail,
            phone: args.userPhone || "",
          },
          lineItems: [{ courseId: args.courseId, batchId: args.batchId }],
          sessionType: args.sessionType,
          internshipPlan: course.usesBatches ? undefined : args.internshipPlan,
          checkoutPricing: {
            totalAmountPaid: pricingItem.amountPaid,
            items: [pricingItem],
          },
        },
      );
      const enrollments = normalizeGuestCheckoutResult(checkoutResult);
      if (isAdminEnrollmentFailure(enrollments)) {
        return enrollments;
      }

      if (enrollments.length === 0) {
        return adminEnrollmentFailure(
          `handleGuestUserCartCheckoutWithData returned no enrollments for course ${args.courseId}.`,
          convexResultErrorCode.CONFLICT,
        );
      }

      const matching = enrollments.find(
        (row) => String(row.courseId) === String(args.courseId),
      );
      if (!matching) {
        return adminEnrollmentFailure(
          `handleGuestUserCartCheckoutWithData returned enrollments for [${enrollments
            .map((row) => String(row.courseId))
            .join(", ")}], but none matched course ${args.courseId}.`,
          convexResultErrorCode.CONFLICT,
        );
      }
      enrollmentId = matching.enrollmentId;
    } else {
      try {
        const checkoutResult: SuccessfulPaymentMutationResult =
          await ctx.runMutation(api.myFunctions.handleSuccessfulPayment, {
            userId: args.userId,
            userEmail: args.userEmail,
            userPhone: args.userPhone,
            studentName: args.userName,
            courseId: args.courseId,
            batchId: args.batchId,
            sessionType: args.sessionType,
            internshipPlan: course.usesBatches
              ? undefined
              : args.internshipPlan,
            checkoutPricing: {
              totalAmountPaid: pricingItem.amountPaid,
              items: [pricingItem],
            },
          });
        const created = normalizeSuccessfulPaymentResult(checkoutResult);
        if (isAdminEnrollmentFailure(created)) {
          return created;
        }
        enrollmentId = created.enrollmentId;
      } catch (innerError) {
        return adminEnrollmentFailure(
          `handleSuccessfulPayment failed: ${
            innerError instanceof Error
              ? innerError.message
              : String(innerError)
          }`,
          convexResultErrorCode.CONFLICT,
        );
      }
    }

    if (!enrollmentId) {
      return adminEnrollmentFailure(
        "Failed to create enrollment",
        convexResultErrorCode.CONFLICT,
      );
    }

    try {
      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "enrollment.create_manual",
        entityType: "enrollment",
        entityId: String(enrollmentId),
        after: { enrollmentId: String(enrollmentId) },
        metadata: {
          source: "admin",
          isGuestUser,
          pricing: pricingItem,
        },
      });
    } catch (error) {
      return adminEnrollmentFailure(
        `Enrollment ${enrollmentId} was created, but audit logging failed. Confirm the record before retrying: ${
          error instanceof Error ? error.message : String(error)
        }`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const createdEnrollment = await ctx.db.get(enrollmentId);
    if (!createdEnrollment) {
      return adminEnrollmentFailure(
        `Enrollment ${enrollmentId} was created, but it could not be reloaded. Confirm the record before retrying.`,
        convexResultErrorCode.NOT_FOUND,
      );
    }

    await ctx.db.patch(enrollmentId, {
      registrationSource: "admin_manual",
    });

    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment) {
      return adminEnrollmentFailure(
        "Enrollment could not be reloaded.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    return convexSuccess({ enrollment });
  },
});

export const recoverPaidOrder = mutation({
  args: {
    recoveryReason: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    amountPaid: v.number(),
    paymentCapturedAt: v.optional(v.number()),
    buyerUserId: v.string(),
    buyerEmail: v.string(),
    buyerName: v.optional(v.string()),
    buyerPhone: v.optional(v.string()),
    referrerClerkUserId: v.optional(v.string()),
    courses: v.array(paidRecoveryCourseValidator),
    backfillBuyerMindPoints: v.boolean(),
    backfillReferralReward: v.boolean(),
    overrideAvailability: v.boolean(),
    overrideReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const reason = args.recoveryReason.trim();
    const overrideReason = args.overrideReason?.trim();

    if (!reason) {
      return adminEnrollmentFailure("Recovery reason is required.");
    }
    if (!args.razorpayPaymentId.trim()) {
      return adminEnrollmentFailure("Payment reference is required.");
    }
    if (!args.buyerUserId.trim() || !args.buyerEmail.trim()) {
      return adminEnrollmentFailure("Buyer user ID and email are required.");
    }
    if (args.courses.length === 0) {
      return adminEnrollmentFailure("At least one course is required.");
    }
    if (args.overrideAvailability && !overrideReason) {
      return adminEnrollmentFailure("Override reason is required.");
    }

    const duplicate = await ctx.db
      .query("enrollments")
      .withIndex("by_razorpayPaymentId", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId.trim()),
      )
      .first();
    if (duplicate) {
      return adminEnrollmentFailure(
        "This payment reference is already recovered.",
        convexResultErrorCode.CONFLICT,
      );
    }

    const enrollmentIds: Id<"enrollments">[] = [];
    let buyerPointsAwarded = 0;
    let firstEnrollmentId: Id<"enrollments"> | undefined;

    for (const item of args.courses) {
      const course = await ctx.db.get(item.courseId);
      if (!course) {
        return adminEnrollmentFailure(
          `Course ${item.courseId} not found.`,
          convexResultErrorCode.NOT_FOUND,
        );
      }
      const batch = item.batchId ? await ctx.db.get(item.batchId) : null;
      if (item.batchId && (!batch || batch.courseId !== item.courseId)) {
        return adminEnrollmentFailure(
          `Batch ${item.batchId} does not belong to the course.`,
        );
      }

      const capacity = batch?.capacity ?? course.capacity ?? 0;
      const enrolledCount = (batch?.enrolledUsers ?? course.enrolledUsers ?? [])
        .length;
      if (
        !args.overrideAvailability &&
        capacity > 0 &&
        enrolledCount >= capacity
      ) {
        return adminEnrollmentFailure(
          `${batch ? `Batch "${batch.label}"` : `Course "${course.name}"`} is full. Enable override to recover into it.`,
          convexResultErrorCode.CONFLICT,
        );
      }

      const schedule = batch
        ? getBatchSnapshot(batch)
        : {
            batchDaysOfWeek: undefined,
            batchEndDate: undefined,
            batchEndTime: undefined,
            batchId: undefined,
            batchLabel: undefined,
            batchStartDate: undefined,
            batchStartTime: undefined,
          };
      const startDate =
        schedule.batchStartDate ??
        course.startDate ??
        new Date().toISOString().split("T")[0];
      const enrollmentNumber =
        course.type === "therapy" ||
        course.type === "supervised" ||
        course.type === "worksheet"
          ? "N/A"
          : await generateUniqueEnrollmentNumber(ctx, course.code, startDate);
      if (typeof enrollmentNumber !== "string") {
        return enrollmentNumber;
      }

      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.buyerUserId.trim(),
        userName: args.buyerName?.trim() || args.buyerEmail.trim(),
        userEmail: args.buyerEmail.trim(),
        userPhone: args.buyerPhone?.trim() || undefined,
        courseId: item.courseId,
        courseName: batch ? `${course.name} (${batch.label})` : course.name,
        enrollmentNumber,
        courseType: course.type,
        internshipPlan:
          course.type === "internship" && !course.usesBatches
            ? (extractInternshipPlanFromDuration(course.duration) ?? undefined)
            : undefined,
        sessions: course.sessions,
        ...schedule,
        listedPrice: roundCurrency(item.listedPrice),
        checkoutPrice: roundCurrency(item.checkoutPrice),
        amountPaid: roundCurrency(item.amountPaid),
        redemptionDiscountAmount: Math.max(
          0,
          roundCurrency(item.checkoutPrice) - roundCurrency(item.amountPaid),
        ),
        registrationSource: "admin_paid_recovery",
        status: "active",
        razorpayOrderId: args.razorpayOrderId.trim(),
        razorpayPaymentId: args.razorpayPaymentId.trim(),
        referrerClerkUserId: args.referrerClerkUserId?.trim() || undefined,
      });

      enrollmentIds.push(enrollmentId);
      firstEnrollmentId = firstEnrollmentId ?? enrollmentId;

      if (batch) {
        const users = batch.enrolledUsers ?? [];
        if (!users.includes(args.buyerUserId.trim())) {
          await ctx.db.patch(batch._id, {
            enrolledUsers: [...users, args.buyerUserId.trim()],
          });
        }
      } else {
        const users = course.enrolledUsers ?? [];
        if (!users.includes(args.buyerUserId.trim())) {
          await ctx.db.patch(course._id, {
            enrolledUsers: [...users, args.buyerUserId.trim()],
          });
        }
      }

      if (
        args.backfillBuyerMindPoints &&
        isAuthenticatedUserId(args.buyerUserId)
      ) {
        const points = calculatePointsEarned(course);
        if (points > 0 && roundCurrency(item.amountPaid) > 0) {
          await ctx.runMutation(internal.mindPoints.awardPoints, {
            clerkUserId: args.buyerUserId.trim(),
            points,
            description: `Recovered paid order: ${course.name}`,
            enrollmentId,
          });
          buyerPointsAwarded += points;
        }
      }
    }

    if (
      args.backfillReferralReward &&
      args.referrerClerkUserId &&
      isAuthenticatedUserId(args.buyerUserId) &&
      args.referrerClerkUserId !== args.buyerUserId &&
      buyerPointsAwarded > 0
    ) {
      const existingReward = await ctx.db
        .query("referralRewards")
        .withIndex("by_referredClerkUserId", (q) =>
          q.eq("referredClerkUserId", args.buyerUserId.trim()),
        )
        .first();
      if (!existingReward) {
        await ctx.db.insert("referralRewards", {
          referrerClerkUserId: args.referrerClerkUserId.trim(),
          referredClerkUserId: args.buyerUserId.trim(),
          awardedPoints: buyerPointsAwarded,
          createdAt: Date.now(),
          firstEnrollmentId,
        });
        await ctx.runMutation(internal.mindPoints.awardPoints, {
          clerkUserId: args.referrerClerkUserId.trim(),
          points: buyerPointsAwarded,
          description: `Recovered referral reward for ${args.buyerEmail.trim()}`,
          enrollmentId: firstEnrollmentId,
        });
      }
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.recover_paid_order",
      entityType: "manual_payment",
      entityId: args.razorpayPaymentId.trim(),
      after: { enrollmentIds: enrollmentIds.map(String) },
      metadata: {
        recoveryReason: reason,
        overrideAvailability: args.overrideAvailability,
        overrideReason,
        amountPaid: roundCurrency(args.amountPaid),
        buyerUserId: args.buyerUserId.trim(),
        buyerEmail: args.buyerEmail.trim(),
        referrerClerkUserId: args.referrerClerkUserId?.trim() || undefined,
        buyerPointsAwarded,
      },
    });

    return convexSuccess({
      enrollmentIds,
      buyerPointsAwarded,
    });
  },
});

export const updateEnrollmentPricing = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    listedPrice: v.number(),
    checkoutPrice: v.number(),
    amountPaid: v.number(),
    redemptionDiscountAmount: v.optional(v.number()),
    couponCode: v.optional(v.string()),
    mindPointsRedeemed: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return adminEnrollmentFailure(
        "Enrollment not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const listedPrice = roundCurrency(args.listedPrice);
    const checkoutPrice = roundCurrency(args.checkoutPrice);
    const amountPaid = roundCurrency(args.amountPaid);
    if (amountPaid > checkoutPrice) {
      return adminEnrollmentFailure(
        "Amount paid cannot exceed checkout price.",
      );
    }

    const redemptionDiscountAmount = roundCurrency(
      Math.max(0, checkoutPrice - amountPaid),
    );
    const mindPointsRedeemed = roundCurrency(args.mindPointsRedeemed);
    const couponCode = args.couponCode?.trim() || undefined;

    await ctx.db.patch(args.enrollmentId, {
      listedPrice,
      checkoutPrice,
      amountPaid,
      redemptionDiscountAmount:
        redemptionDiscountAmount > 0 ? redemptionDiscountAmount : undefined,
      couponCode,
      mindPointsRedeemed:
        mindPointsRedeemed > 0 ? mindPointsRedeemed : undefined,
    });

    const updated = await ctx.db.get(args.enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.update_pricing",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      before: enrollment,
      after: updated,
      metadata: {
        reason: args.reason?.trim() || undefined,
      },
    });

    if (!updated) {
      return adminEnrollmentFailure(
        "Enrollment could not be reloaded.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    return convexSuccess({ enrollment: updated });
  },
});

export const cancelEnrollment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return adminEnrollmentFailure(
        "Enrollment not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const currentStatus = normalizeEnrollmentStatus(enrollment.status);
    if (currentStatus === "cancelled" || currentStatus === "transferred") {
      return convexSuccess({ enrollment });
    }

    const now = Date.now();

    await ctx.db.patch(args.enrollmentId, {
      status: "cancelled",
      statusReason: args.reason,
      cancelledAt: now,
      cancelledByAdminId: admin.userId,
    });

    await removeUserFromCourseIfNoActiveEnrollment(ctx, {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
    });

    const updated = await ctx.db.get(args.enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.cancel",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      before: enrollment,
      after: updated,
      metadata: { reason: args.reason },
    });

    if (!updated) {
      return adminEnrollmentFailure(
        "Enrollment could not be reloaded.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    return convexSuccess({ enrollment: updated });
  },
});

export const resendEnrollmentConfirmationEmail = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return adminEnrollmentFailure(
        "Enrollment not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const currentStatus = normalizeEnrollmentStatus(enrollment.status);
    if (currentStatus !== "active") {
      return adminEnrollmentFailure(
        `Cannot resend confirmation for a ${currentStatus} enrollment.`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const now = Date.now();
    const lastSentAt = enrollment.lastConfirmationSentAt ?? 0;
    if (now - lastSentAt < RESEND_COOLDOWN_MS) {
      return adminEnrollmentFailure(
        `A confirmation email was already sent ${Math.round(
          (now - lastSentAt) / 1000,
        )}s ago. Please wait before resending.`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const course = await ctx.db.get(enrollment.courseId);
    if (!course) {
      return adminEnrollmentFailure(
        "Course not found for this enrollment",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const recipientEmail =
      enrollment.userEmail ||
      (enrollment.userId.includes("@") ? enrollment.userId : null);

    if (!recipientEmail) {
      return adminEnrollmentFailure(
        "Cannot send email: enrollment has no recipient email",
      );
    }

    const userName = enrollment.userName || recipientEmail;
    const courseName = enrollment.courseName || course.name;
    const courseType = course.type || enrollment.courseType;
    const startDate =
      enrollment.batchStartDate ??
      course.startDate ??
      new Date().toISOString().split("T")[0];
    const endDate = enrollment.batchEndDate ?? course.endDate ?? startDate;
    const startTime = enrollment.batchStartTime ?? course.startTime ?? "00:00";
    const endTime = enrollment.batchEndTime ?? course.endTime ?? "23:59";

    let emailAction = "generic";
    let usedFallback = false;

    if (courseType === "supervised") {
      if (enrollment.sessionType) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: recipientEmail,
            studentName: userName,
            sessionType: enrollment.sessionType,
          },
        );
        emailAction = "supervised_welcome";
      } else {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendEnrollmentConfirmation,
          {
            userEmail: recipientEmail,
            userPhone: enrollment.userPhone,
            courseName,
            enrollmentNumber: enrollment.enrollmentNumber,
            startDate,
            endDate,
            startTime,
            endTime,
          },
        );
        emailAction = "generic";
        usedFallback = true;
      }
    } else if (courseType === "therapy") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          therapyType: course.name,
          sessionCount: enrollment.sessions || course.sessions || 1,
          enrollmentNumber: enrollment.enrollmentNumber,
        },
      );
      emailAction = "therapy_confirmation";
    } else if (courseType === "internship") {
      const internshipPlan = course.usesBatches
        ? undefined
        : enrollment.internshipPlan ||
          extractInternshipPlanFromDuration(course.duration) ||
          "120";
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendInternshipEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
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
      emailAction = "internship_confirmation";
    } else if (courseType === "certificate" || courseType === "resume-studio") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCertificateEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction =
        courseType === "resume-studio"
          ? "resume_studio_confirmation"
          : "certificate_confirmation";
    } else if (courseType === "diploma") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendDiplomaEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "diploma_confirmation";
    } else if (courseType === "pre-recorded") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendPreRecordedEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
        },
      );
      emailAction = "pre_recorded_confirmation";
    } else if (courseType === "masterclass") {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendMasterclassEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "masterclass_confirmation";
    } else if (courseType === "worksheet" && course.fileUrl) {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendWorksheetPurchaseConfirmation,
        {
          userEmail: recipientEmail,
          userName,
          userPhone: enrollment.userPhone,
          worksheets: [{ name: courseName, fileUrl: course.fileUrl }],
        },
      );
      emailAction = "worksheet_confirmation";
    } else {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: recipientEmail,
          userPhone: enrollment.userPhone,
          courseName,
          enrollmentNumber: enrollment.enrollmentNumber,
          startDate,
          endDate,
          startTime,
          endTime,
        },
      );
      emailAction = "generic";
      usedFallback = courseType === "worksheet";
    }

    await ctx.db.patch(args.enrollmentId, {
      lastConfirmationSentAt: now,
    });

    const updatedEnrollment = await ctx.db.get(args.enrollmentId);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.resend_email",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      after: updatedEnrollment,
      metadata: {
        recipientEmail,
        courseType,
        emailAction,
        usedFallback,
        status: normalizeEnrollmentStatus(enrollment.status),
        lastConfirmationSentAt: now,
      },
    });

    return convexSuccess({
      enrollmentId: args.enrollmentId,
      recipientEmail,
      emailAction,
      usedFallback,
    });
  },
});

export const changeEnrollmentBatch = mutation({
  args: {
    batchId: v.id("courseBatches"),
    enrollmentId: v.id("enrollments"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      return adminEnrollmentFailure(
        "Enrollment not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const status = normalizeEnrollmentStatus(enrollment.status);
    if (status !== "active") {
      return adminEnrollmentFailure(
        `Cannot change batch for a ${status} enrollment.`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const [course, targetBatch] = await Promise.all([
      ctx.db.get(enrollment.courseId),
      ctx.db.get(args.batchId),
    ]);

    if (!course) {
      return adminEnrollmentFailure(
        "Course not found for this enrollment",
        convexResultErrorCode.NOT_FOUND,
      );
    }
    if (!course.usesBatches) {
      return adminEnrollmentFailure("This course does not use batches.");
    }
    if (!targetBatch) {
      return adminEnrollmentFailure(
        "Target batch not found.",
        convexResultErrorCode.NOT_FOUND,
      );
    }
    if (String(targetBatch.courseId) !== String(enrollment.courseId)) {
      return adminEnrollmentFailure(
        "Target batch must belong to the same course.",
      );
    }
    if ((targetBatch.lifecycleStatus ?? "published") !== "published") {
      return adminEnrollmentFailure(
        "Only published batches can receive enrollments.",
        convexResultErrorCode.CONFLICT,
      );
    }
    if (String(enrollment.batchId) === String(targetBatch._id)) {
      return convexSuccess({ enrollment });
    }

    const targetUsers = targetBatch.enrolledUsers ?? [];
    const targetCapacity = targetBatch.capacity ?? 0;
    if (
      targetCapacity > 0 &&
      targetUsers.length >= targetCapacity &&
      !targetUsers.includes(enrollment.userId)
    ) {
      return adminEnrollmentFailure(
        `Batch "${targetBatch.label}" is full.`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const previousBatch = enrollment.batchId
      ? await ctx.db.get(enrollment.batchId)
      : null;

    if (!targetUsers.includes(enrollment.userId)) {
      await ctx.db.patch(targetBatch._id, {
        enrolledUsers: [...targetUsers, enrollment.userId],
      });
    }

    if (previousBatch) {
      await removeUserFromBatchIfNoActiveEnrollment(ctx, {
        batchId: previousBatch._id,
        enrollmentIdToIgnore: enrollment._id,
        userId: enrollment.userId,
      });
    }

    const snapshot = getBatchSnapshot(targetBatch);
    const nextCourseName = `${course.name} (${targetBatch.label})`;

    await ctx.db.patch(enrollment._id, {
      ...snapshot,
      courseName: nextCourseName,
    });

    const updatedEnrollment = await ctx.db.get(enrollment._id);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.change_batch",
      entityType: "enrollment",
      entityId: String(enrollment._id),
      before: enrollment,
      after: updatedEnrollment,
      metadata: {
        fromBatchId: enrollment.batchId,
        fromBatchLabel: enrollment.batchLabel,
        reason: args.reason,
        toBatchId: targetBatch._id,
        toBatchLabel: targetBatch.label,
      },
    });

    if (!updatedEnrollment) {
      return adminEnrollmentFailure(
        "Enrollment could not be reloaded.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    return convexSuccess({ enrollment: updatedEnrollment });
  },
});

export const transferEnrollment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    targetCourseId: v.id("courses"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const [sourceEnrollment, targetCourse] = await Promise.all([
      ctx.db.get(args.enrollmentId),
      ctx.db.get(args.targetCourseId),
    ]);

    if (!sourceEnrollment) {
      return adminEnrollmentFailure(
        "Enrollment not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    if (!targetCourse) {
      return adminEnrollmentFailure(
        "Target course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    if (sourceEnrollment.courseId === args.targetCourseId) {
      return adminEnrollmentFailure(
        "Source and target course cannot be the same",
      );
    }

    const currentStatus = normalizeEnrollmentStatus(sourceEnrollment.status);
    if (currentStatus !== "active") {
      return adminEnrollmentFailure(
        "Only active enrollments can be transferred",
        convexResultErrorCode.CONFLICT,
      );
    }

    const existingActiveInTarget =
      (await ctx.db
        .query("enrollments")
        .withIndex("by_courseId_and_status", (q) =>
          q.eq("courseId", args.targetCourseId).eq("status", "active"),
        )
        .filter((q) => q.eq(q.field("userId"), sourceEnrollment.userId))
        .first()) ??
      (await ctx.db
        .query("enrollments")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.targetCourseId))
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), sourceEnrollment.userId),
            q.eq(q.field("status"), undefined),
          ),
        )
        .first());

    if (existingActiveInTarget) {
      return adminEnrollmentFailure(
        `User is already actively enrolled in "${targetCourse.name}". Cannot transfer to the same course.`,
        convexResultErrorCode.CONFLICT,
      );
    }

    if (targetCourse.usesBatches) {
      return adminEnrollmentFailure(
        `Target course "${targetCourse.name}" uses batches. Create a manual enrollment with a selected batch instead of transferring directly.`,
      );
    }

    const currentEnrolled = (targetCourse.enrolledUsers ?? []).length;
    const capacity = targetCourse.capacity ?? 0;
    if (
      capacity > 0 &&
      currentEnrolled >= capacity &&
      !(targetCourse.enrolledUsers ?? []).includes(sourceEnrollment.userId)
    ) {
      return adminEnrollmentFailure(
        `Target course "${targetCourse.name}" is at full capacity (${currentEnrolled}/${capacity}).`,
        convexResultErrorCode.CONFLICT,
      );
    }

    const now = Date.now();
    const transferredInternshipPlan =
      targetCourse.type === "internship" && !targetCourse.usesBatches
        ? extractInternshipPlanFromDuration(targetCourse.duration) ||
          sourceEnrollment.internshipPlan ||
          undefined
        : undefined;

    await ctx.db.patch(args.enrollmentId, {
      status: "transferred",
      statusReason: args.reason,
      transferredAt: now,
      transferredByAdminId: admin.userId,
      transferredToCourseId: args.targetCourseId,
    });

    await removeUserFromCourseIfNoActiveEnrollment(ctx, {
      userId: sourceEnrollment.userId,
      courseId: sourceEnrollment.courseId,
    });

    const courseCode =
      targetCourse.code?.trim() ||
      targetCourse.name.slice(0, 8).toUpperCase().replace(/\s+/g, "") ||
      "COURSE";
    const courseStartDate =
      targetCourse.startDate ?? new Date().toISOString().split("T")[0];
    const enrollmentNumber =
      targetCourse.type === "therapy" ||
      targetCourse.type === "supervised" ||
      targetCourse.type === "worksheet"
        ? "N/A"
        : await generateUniqueEnrollmentNumber(
            ctx,
            courseCode,
            courseStartDate,
          );
    if (typeof enrollmentNumber !== "string") {
      return enrollmentNumber;
    }

    const newEnrollmentId = await ctx.db.insert("enrollments", {
      userId: sourceEnrollment.userId,
      userName: sourceEnrollment.userName,
      userEmail: sourceEnrollment.userEmail,
      userPhone: sourceEnrollment.userPhone,
      courseId: args.targetCourseId,
      courseName: targetCourse.name,
      enrollmentNumber,
      isGuestUser: sourceEnrollment.isGuestUser,
      sessionType: sourceEnrollment.sessionType,
      courseType: targetCourse.type,
      internshipPlan: transferredInternshipPlan,
      sessions: targetCourse.sessions,
      isBogoFree: sourceEnrollment.isBogoFree,
      bogoSourceCourseId: sourceEnrollment.bogoSourceCourseId,
      bogoOfferName: sourceEnrollment.bogoOfferName,
      listedPrice: sourceEnrollment.listedPrice ?? targetCourse.price,
      checkoutPrice: sourceEnrollment.checkoutPrice ?? targetCourse.price,
      amountPaid:
        sourceEnrollment.amountPaid ??
        sourceEnrollment.checkoutPrice ??
        undefined,
      redemptionDiscountAmount: sourceEnrollment.redemptionDiscountAmount,
      couponCode: sourceEnrollment.couponCode,
      mindPointsRedeemed: sourceEnrollment.mindPointsRedeemed,
      bundleCampaignId: sourceEnrollment.bundleCampaignId,
      bundleCampaignName: sourceEnrollment.bundleCampaignName,
      registrationSource: "admin_transfer",
      status: "active",
      statusReason: `Transfer from ${sourceEnrollment.courseName || String(sourceEnrollment.courseId)}`,
    });

    if (!(targetCourse.enrolledUsers ?? []).includes(sourceEnrollment.userId)) {
      await ctx.db.patch(args.targetCourseId, {
        enrolledUsers: [
          ...(targetCourse.enrolledUsers ?? []),
          sourceEnrollment.userId,
        ],
      });
    }

    const [updatedSource, createdTarget] = await Promise.all([
      ctx.db.get(args.enrollmentId),
      ctx.db.get(newEnrollmentId),
    ]);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.transfer",
      entityType: "enrollment",
      entityId: String(args.enrollmentId),
      before: sourceEnrollment,
      after: updatedSource,
      metadata: {
        reason: args.reason,
        newEnrollmentId: String(newEnrollmentId),
        targetCourseId: String(args.targetCourseId),
      },
    });

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "enrollment.transfer_created",
      entityType: "enrollment",
      entityId: String(newEnrollmentId),
      after: createdTarget,
      metadata: {
        sourceEnrollmentId: String(args.enrollmentId),
        reason: args.reason,
      },
    });

    if (!updatedSource || !createdTarget) {
      return adminEnrollmentFailure(
        "Transferred enrollment could not be reloaded.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    return convexSuccess({
      sourceEnrollment: updatedSource,
      newEnrollment: createdTarget,
    });
  },
});
