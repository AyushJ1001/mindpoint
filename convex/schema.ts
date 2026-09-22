import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const CourseType = v.union(
  v.literal("certificate"),
  v.literal("internship"),
  v.literal("diploma"),
  v.literal("pre-recorded"),
  v.literal("masterclass"),
  v.literal("therapy"),
  v.literal("supervised"),
  v.literal("resume-studio"),
  v.literal("worksheet"),
);

export const CourseLifecycleStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const CourseBatchAvailabilityStatus = v.union(
  v.literal("upcoming_open"),
  v.literal("upcoming_full"),
  v.literal("past"),
  v.literal("archived"),
);

export const EnrollmentStatus = v.union(
  v.literal("active"),
  v.literal("cancelled"),
  v.literal("transferred"),
);

export const EnrollmentRegistrationSource = v.union(
  v.literal("checkout"),
  v.literal("guest_checkout"),
  v.literal("admin_manual"),
  v.literal("admin_paid_recovery"),
  v.literal("admin_transfer"),
);

export const OfferDiscountType = v.union(
  v.literal("percentage"),
  v.literal("fixedPrice"),
  v.literal("flatOff"),
);

export const CourseOfferValue = v.object({
  name: v.string(),
  discount: v.optional(v.number()),
  discountType: v.optional(OfferDiscountType),
  discountValue: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
});

export const CourseBogoValue = v.object({
  enabled: v.boolean(),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  label: v.optional(v.string()),
});

export const BundleCampaignValue = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  flatFee: v.number(),
  requiredCourseCountMin: v.number(),
  requiredCourseCountMax: v.number(),
  eligibleCourseIds: v.array(v.id("courses")),
  priority: v.number(),
  enabled: v.boolean(),
  isArchived: v.boolean(),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdByAdminId: v.string(),
  updatedByAdminId: v.string(),
});

export const AdminCouponDiscountValue = v.union(
  v.object({
    type: v.literal("percentage"),
    value: v.number(),
    maxDiscount: v.optional(v.number()),
  }),
  v.object({
    type: v.literal("flat"),
    value: v.number(),
  }),
  v.object({
    type: v.literal("free"),
  }),
);

export const AdminCouponSelectorValue = v.union(
  v.object({
    type: v.literal("cart"),
  }),
  v.object({
    type: v.literal("courses"),
    courseIds: v.array(v.id("courses")),
  }),
  v.object({
    type: v.literal("courseTypes"),
    courseTypes: v.array(CourseType),
  }),
);

export const AdminCouponRequirementValue = v.union(
  v.object({
    type: v.literal("none"),
  }),
  v.object({
    type: v.literal("courses"),
    courseIds: v.array(v.id("courses")),
  }),
  v.object({
    type: v.literal("courseTypes"),
    courseTypes: v.array(CourseType),
  }),
);

export const AdminCouponValue = v.object({
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  enabled: v.boolean(),
  isArchived: v.boolean(),
  discount: AdminCouponDiscountValue,
  appliesTo: AdminCouponSelectorValue,
  requires: AdminCouponRequirementValue,
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  redemptionLimit: v.optional(v.number()),
  totalRedemptions: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdByAdminId: v.string(),
  updatedByAdminId: v.string(),
});

export const EnrollmentSessionType = v.union(
  v.literal("focus"),
  v.literal("flow"),
  v.literal("elevate"),
);

export const LmsCurriculumStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const LmsActivityType = v.union(
  v.literal("reading"),
  v.literal("media"),
  v.literal("external_resource"),
  v.literal("quiz"),
  v.literal("assignment"),
  v.literal("feedback"),
);

export const LmsFeedbackMode = v.union(
  v.literal("identified"),
  v.literal("anonymous"),
);

export const LmsReleaseMode = v.union(
  v.literal("immediate"),
  v.literal("date"),
  v.literal("prerequisite"),
);

export const LmsCompletionMode = v.union(
  v.literal("view"),
  v.literal("self_confirm"),
  v.literal("submit"),
  v.literal("pass"),
  v.literal("faculty_approval"),
);

export const LmsProgressStatus = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("submitted"),
  v.literal("awaiting_review"),
  v.literal("completed"),
  v.literal("blocked"),
);

const sharedCourseFields = {
  name: v.string(),
  description: v.optional(v.string()),
  type: v.optional(CourseType),
  code: v.string(),
  price: v.number(),
  offer: v.optional(CourseOfferValue),
  bogo: v.optional(CourseBogoValue),
  sessions: v.optional(v.number()),
  capacity: v.optional(v.number()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  daysOfWeek: v.optional(v.array(v.string())),
  content: v.string(),
  reviews: v.array(v.id("reviews")),
  duration: v.optional(v.string()),
  prerequisites: v.optional(v.string()),
  imageUrls: v.optional(v.array(v.string())),
  modules: v.optional(
    v.array(
      v.object({
        title: v.string(),
        description: v.string(),
      }),
    ),
  ),
  learningOutcomes: v.optional(
    v.array(
      v.object({
        icon: v.string(),
        title: v.string(),
      }),
    ),
  ),
  allocation: v.optional(
    v.array(
      v.object({
        topic: v.string(),
        hours: v.number(),
      }),
    ),
  ),
  fileUrl: v.optional(v.string()),
  worksheetDescription: v.optional(v.string()),
  targetAudience: v.optional(v.array(v.string())),
  emotionalHook: v.optional(v.string()),
  painPoints: v.optional(v.array(v.string())),
  outcomes: v.optional(v.array(v.string())),
  whyDifferent: v.optional(v.array(v.string())),
};

const courseTableFields = {
  ...sharedCourseFields,
  enrolledUsers: v.array(v.string()),
  usesBatches: v.optional(v.boolean()),
  mergedIntoCourseId: v.optional(v.id("courses")),
  mergedIntoBatchId: v.optional(v.id("courseBatches")),
  lifecycleStatus: v.optional(CourseLifecycleStatus),
  createdByAdminId: v.optional(v.string()),
  updatedByAdminId: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
  publishedAt: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
};

export const PublicCourseFields = {
  ...sharedCourseFields,
  enrolledCount: v.number(),
  usesBatches: v.boolean(),
  batchCount: v.number(),
  nextAvailableBatch: v.optional(
    v.object({
      _creationTime: v.number(),
      _id: v.id("courseBatches"),
      courseId: v.id("courses"),
      label: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      daysOfWeek: v.array(v.string()),
      capacity: v.number(),
      enrolledCount: v.number(),
      lifecycleStatus: CourseLifecycleStatus,
      availabilityStatus: CourseBatchAvailabilityStatus,
      sortOrder: v.number(),
    }),
  ),
};

export const PublicCourseBatchFields = {
  courseId: v.id("courses"),
  label: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  daysOfWeek: v.array(v.string()),
  capacity: v.number(),
  enrolledCount: v.number(),
  lifecycleStatus: CourseLifecycleStatus,
  availabilityStatus: CourseBatchAvailabilityStatus,
  sortOrder: v.number(),
};

export const PublicCourseBatchDocumentValue = v.object({
  _id: v.id("courseBatches"),
  _creationTime: v.number(),
  ...PublicCourseBatchFields,
});

export const PublicCourseDocumentValue = v.object({
  _id: v.id("courses"),
  _creationTime: v.number(),
  ...PublicCourseFields,
});

const publicEnrollmentFields = {
  userId: v.string(),
  userName: v.optional(v.string()),
  userEmail: v.optional(v.string()),
  userPhone: v.optional(v.string()),
  courseId: v.id("courses"),
  courseName: v.optional(v.string()),
  enrollmentNumber: v.string(),
  isGuestUser: v.optional(v.boolean()),
  sessionType: v.optional(EnrollmentSessionType),
  courseType: v.optional(CourseType),
  batchId: v.optional(v.id("courseBatches")),
  batchLabel: v.optional(v.string()),
  batchStartDate: v.optional(v.string()),
  batchEndDate: v.optional(v.string()),
  batchStartTime: v.optional(v.string()),
  batchEndTime: v.optional(v.string()),
  batchDaysOfWeek: v.optional(v.array(v.string())),
  internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
  sessions: v.optional(v.number()),
  isBogoFree: v.optional(v.boolean()),
  bogoSourceCourseId: v.optional(v.id("courses")),
  bogoOfferName: v.optional(v.string()),
  listedPrice: v.optional(v.number()),
  checkoutPrice: v.optional(v.number()),
  amountPaid: v.optional(v.number()),
  redemptionDiscountAmount: v.optional(v.number()),
  couponCode: v.optional(v.string()),
  mindPointsRedeemed: v.optional(v.number()),
  bundleCampaignId: v.optional(v.id("bundleCampaigns")),
  bundleCampaignName: v.optional(v.string()),
  registrationSource: v.optional(EnrollmentRegistrationSource),
  status: v.optional(EnrollmentStatus),
  statusReason: v.optional(v.string()),
  // Manual payment verification (screenshot/UPI checkouts). Absent = verified.
  paymentVerification: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  ),
  paymentVerificationNote: v.optional(v.string()),
  cancelledAt: v.optional(v.number()),
  transferredAt: v.optional(v.number()),
  transferredToCourseId: v.optional(v.id("courses")),
  lastConfirmationSentAt: v.optional(v.number()),
  checkoutAttemptId: v.optional(v.id("checkoutAttempts")),
  razorpayOrderId: v.optional(v.string()),
  razorpayPaymentId: v.optional(v.string()),
  paymentScreenshotUrl: v.optional(v.string()),
  referrerClerkUserId: v.optional(v.string()),
};

const enrollmentTableFields = {
  ...publicEnrollmentFields,
  cancelledByAdminId: v.optional(v.string()),
  transferredByAdminId: v.optional(v.string()),
};

export const PublicEnrollmentFields = publicEnrollmentFields;

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  courses: defineTable(courseTableFields)
    .index("by_name_and_type", ["name", "type"])
    .index("by_type", ["type"])
    .index("by_lifecycleStatus", ["lifecycleStatus"])
    .index("by_type_and_lifecycleStatus", ["type", "lifecycleStatus"]),

  courseBatches: defineTable({
    courseId: v.id("courses"),
    label: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    daysOfWeek: v.array(v.string()),
    capacity: v.number(),
    enrolledUsers: v.array(v.string()),
    lifecycleStatus: v.optional(CourseLifecycleStatus),
    sortOrder: v.number(),
    // Optional live-class link shown to learners enrolled in this batch.
    meetingUrl: v.optional(v.string()),
    meetingNote: v.optional(v.string()),
    legacySourceCourseId: v.optional(v.id("courses")),
    createdByAdminId: v.optional(v.string()),
    updatedByAdminId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_courseId", ["courseId"])
    .index("by_courseId_and_lifecycleStatus", ["courseId", "lifecycleStatus"])
    .index("by_lifecycleStatus", ["lifecycleStatus"])
    .index("by_legacySourceCourseId", ["legacySourceCourseId"]),

  offerCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    offer: v.optional(CourseOfferValue),
    bogo: v.optional(CourseBogoValue),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdByAdminId: v.string(),
    updatedByAdminId: v.string(),
    lastAppliedAt: v.optional(v.number()),
    lastAppliedCourseIds: v.optional(v.array(v.id("courses"))),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_isArchived_updatedAt", ["isArchived", "updatedAt"]),

  bundleCampaigns: defineTable(BundleCampaignValue)
    .index("by_updatedAt", ["updatedAt"])
    .index("by_isArchived_updatedAt", ["isArchived", "updatedAt"])
    .index("by_enabled_isArchived_priority", [
      "enabled",
      "isArchived",
      "priority",
    ]),

  adminCoupons: defineTable(AdminCouponValue)
    .index("by_code", ["code"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_isArchived_updatedAt", ["isArchived", "updatedAt"]),

  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
    isEdited: v.optional(v.boolean()),
  })
    .index("by_course", ["course"])
    .index("by_course_and_user", ["course", "userId"]),

  guestUsers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  }).index("by_email", ["email"]),

  // Marketing leads captured from the storefront's free resources and forms.
  // Marketing consent is stored separately from Course communication, with its
  // purpose and the wording version agreed at the moment of capture.
  leads: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    educationStatus: v.optional(v.string()),
    interest: v.optional(v.string()),
    message: v.optional(v.string()),
    source: v.string(),
    marketingConsent: v.boolean(),
    consentPurpose: v.optional(v.string()),
    consentTextVersion: v.optional(v.string()),
    consentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_source", ["source"])
    .index("by_createdAt", ["createdAt"]),

  // User profiles for storing additional user data (e.g., WhatsApp number)
  userProfiles: defineTable({
    clerkUserId: v.string(), // Clerk user ID
    whatsappNumber: v.optional(v.string()), // WhatsApp phone number for manual communications
  }).index("by_clerkUserId", ["clerkUserId"]),

  enrollments: defineTable(enrollmentTableFields)
    .index("by_userId", ["userId"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_courseId", ["userId", "courseId"])
    .index("by_enrollmentNumber", ["enrollmentNumber"])
    .index("by_courseId", ["courseId"])
    .index("by_batchId", ["batchId"])
    .index("by_batchId_and_status", ["batchId", "status"])
    .index("by_checkoutAttemptId", ["checkoutAttemptId"])
    .index("by_razorpayPaymentId", ["razorpayPaymentId"])
    .index("by_status", ["status"])
    .index("by_courseId_and_status", ["courseId", "status"])
    .index("by_paymentVerification", ["paymentVerification"])
    .index("by_courseId_and_status_and_userId", [
      "courseId",
      "status",
      "userId",
    ]),

  // User Mind Points balance
  mindPoints: defineTable({
    clerkUserId: v.string(),
    balance: v.number(),
    totalEarned: v.number(),
    totalRedeemed: v.number(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    searchText: v.optional(v.string()),
  }).index("by_clerkUserId", ["clerkUserId"]),

  // Points transaction history
  pointsTransactions: defineTable({
    clerkUserId: v.string(),
    type: v.union(v.literal("earn"), v.literal("redeem")),
    points: v.number(),
    description: v.string(),
    enrollmentId: v.optional(v.id("enrollments")),
    couponId: v.optional(v.id("coupons")),
    createdAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  // Redemption coupons
  coupons: defineTable({
    code: v.string(),
    clerkUserId: v.string(),
    courseType: v.string(), // Which category can be redeemed
    discount: v.number(), // 100 for 100% off
    isUsed: v.boolean(),
    pointsCost: v.number(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_isUsed", ["isUsed"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_clerkUserId_and_isUsed", ["clerkUserId", "isUsed"]),

  referralRewards: defineTable({
    referrerClerkUserId: v.string(),
    referredClerkUserId: v.string(),
    awardedPoints: v.number(),
    createdAt: v.number(),
    firstEnrollmentId: v.optional(v.id("enrollments")),
  })
    .index("by_referredClerkUserId", ["referredClerkUserId"])
    .index("by_referrerClerkUserId", ["referrerClerkUserId"]),

  checkoutAttempts: defineTable({
    cartIntent: v.any(),
    authoritativeAmount: v.number(),
    authoritativeLineItems: v.array(v.any()),
    validationStatus: v.union(
      v.literal("valid"),
      v.literal("changed"),
      v.literal("blocked"),
    ),
    validationSummary: v.any(),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
    paymentScreenshotUrl: v.optional(v.string()),
    buyerUserId: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
    referrerClerkUserId: v.optional(v.string()),
    status: v.union(
      v.literal("created"),
      v.literal("payment_ordered"),
      v.literal("payment_captured"),
      v.literal("finalized"),
      v.literal("recovery_required"),
      v.literal("recovered"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    finalizedAt: v.optional(v.number()),
    recoveredByAdminId: v.optional(v.string()),
    recoveryReason: v.optional(v.string()),
  })
    .index("by_razorpayPaymentId", ["razorpayPaymentId"])
    .index("by_status", ["status"]),

  adminAuditLogs: defineTable({
    actorAdminId: v.string(),
    actorEmail: v.optional(v.string()),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_entityType", ["entityType"])
    .index("by_entityType_and_actorAdminId", ["entityType", "actorAdminId"])
    .index("by_actorAdminId", ["actorAdminId"]),

  lmsCurricula: defineTable({
    courseId: v.id("courses"),
    version: v.number(),
    title: v.string(),
    status: LmsCurriculumStatus,
    createdByAdminId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    manifestHash: v.optional(v.string()),
  })
    .index("by_courseId", ["courseId"])
    .index("by_courseId_and_status", ["courseId", "status"])
    .index("by_courseId_and_version", ["courseId", "version"]),

  lmsModules: defineTable({
    curriculumId: v.id("lmsCurricula"),
    title: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_curriculumId_and_sortOrder", ["curriculumId", "sortOrder"]),

  lmsActivities: defineTable({
    curriculumId: v.id("lmsCurricula"),
    moduleId: v.id("lmsModules"),
    type: LmsActivityType,
    title: v.string(),
    instructions: v.optional(v.string()),
    content: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    required: v.boolean(),
    sortOrder: v.number(),
    releaseMode: LmsReleaseMode,
    releaseAt: v.optional(v.number()),
    prerequisiteActivityId: v.optional(v.id("lmsActivities")),
    completionMode: LmsCompletionMode,
    gradingCriteria: v.optional(v.string()),
    passingScore: v.optional(v.number()),
    feedbackMode: v.optional(LmsFeedbackMode),
    feedbackMinimumGroupSize: v.optional(v.number()),
    rightsApproved: v.boolean(),
    accessibleAlternative: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_curriculumId", ["curriculumId"])
    .index("by_moduleId_and_sortOrder", ["moduleId", "sortOrder"]),

  lmsQuizQuestions: defineTable({
    activityId: v.id("lmsActivities"),
    prompt: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_activityId_and_sortOrder", ["activityId", "sortOrder"]),

  lmsQuizOptions: defineTable({
    questionId: v.id("lmsQuizQuestions"),
    label: v.string(),
    sortOrder: v.number(),
    isCorrect: v.boolean(),
    createdAt: v.number(),
  }).index("by_questionId_and_sortOrder", ["questionId", "sortOrder"]),

  lmsQuizAttempts: defineTable({
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    attemptNumber: v.number(),
    score: v.number(),
    correctAnswerCount: v.number(),
    questionCount: v.number(),
    passed: v.boolean(),
    submittedAt: v.number(),
  })
    .index("by_enrollmentId_and_activityId", ["enrollmentId", "activityId"])
    .index("by_activityId_and_passed", ["activityId", "passed"]),

  lmsQuizAnswers: defineTable({
    attemptId: v.id("lmsQuizAttempts"),
    questionId: v.id("lmsQuizQuestions"),
    selectedOptionId: v.id("lmsQuizOptions"),
    isCorrect: v.boolean(),
    createdAt: v.number(),
  }).index("by_attemptId", ["attemptId"]),

  lmsFeedbackResponses: defineTable({
    activityId: v.id("lmsActivities"),
    curriculumId: v.id("lmsCurricula"),
    courseId: v.id("courses"),
    mode: LmsFeedbackMode,
    enrollmentId: v.optional(v.id("enrollments")),
    batchId: v.optional(v.id("courseBatches")),
    rating: v.number(),
    comment: v.optional(v.string()),
    reportingPeriod: v.string(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_activityId", ["activityId"])
    .index("by_courseId", ["courseId"])
    .index("by_courseId_and_batchId", ["courseId", "batchId"])
    .index("by_courseId_and_activityId", ["courseId", "activityId"])
    .index("by_enrollmentId_and_activityId", ["enrollmentId", "activityId"]),

  lmsFeedbackReceipts: defineTable({
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    mode: LmsFeedbackMode,
    receiptCode: v.string(),
    submittedAt: v.number(),
  }).index("by_enrollmentId_and_activityId", ["enrollmentId", "activityId"]),

  lmsEnrollmentCurricula: defineTable({
    enrollmentId: v.id("enrollments"),
    curriculumId: v.id("lmsCurricula"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("suspended"),
    ),
    activatedAt: v.number(),
    activatedByAdminId: v.string(),
    completedAt: v.optional(v.number()),
  })
    .index("by_enrollmentId", ["enrollmentId"])
    .index("by_curriculumId", ["curriculumId"])
    .index("by_enrollmentId_and_status", ["enrollmentId", "status"]),

  lmsActivityProgress: defineTable({
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    status: LmsProgressStatus,
    evidenceReference: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_enrollmentId", ["enrollmentId"])
    .index("by_enrollmentId_and_activityId", ["enrollmentId", "activityId"])
    .index("by_activityId_and_status", ["activityId", "status"]),

  lmsSubmissions: defineTable({
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    courseId: v.optional(v.id("courses")),
    batchId: v.optional(v.id("courseBatches")),
    attemptNumber: v.number(),
    responseText: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("in_review"),
      v.literal("returned"),
      v.literal("accepted"),
    ),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    claimedAt: v.optional(v.number()),
    claimedByTokenIdentifier: v.optional(v.string()),
    reviewedByTokenIdentifier: v.optional(v.string()),
    feedback: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_enrollmentId_and_activityId", ["enrollmentId", "activityId"])
    .index("by_activityId_and_status", ["activityId", "status"])
    .index("by_status", ["status"])
    .index("by_courseId_and_status", ["courseId", "status"])
    .index("by_courseId_and_batchId_and_status", [
      "courseId",
      "batchId",
      "status",
    ]),

  lmsFacultyAssignments: defineTable({
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    facultyTokenIdentifier: v.optional(v.string()),
    facultyEmail: v.optional(v.string()),
    facultyName: v.optional(v.string()),
    canGrade: v.boolean(),
    canAnswerQuestions: v.boolean(),
    canApproveCompletion: v.boolean(),
    assignedByAdminId: v.string(),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_facultyTokenIdentifier", ["facultyTokenIdentifier"])
    .index("by_facultyEmail", ["facultyEmail"])
    .index("by_courseId_and_facultyTokenIdentifier", [
      "courseId",
      "facultyTokenIdentifier",
    ])
    .index("by_courseId_and_facultyEmail", ["courseId", "facultyEmail"]),

  lmsQuestions: defineTable({
    enrollmentId: v.id("enrollments"),
    curriculumId: v.id("lmsCurricula"),
    courseId: v.optional(v.id("courses")),
    batchId: v.optional(v.id("courseBatches")),
    activityId: v.optional(v.id("lmsActivities")),
    authorTokenIdentifier: v.string(),
    visibility: v.union(
      v.literal("private"),
      v.literal("course"),
      v.literal("batch"),
    ),
    body: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("answered"),
      v.literal("closed"),
    ),
    officialAnswer: v.optional(v.string()),
    answeredByTokenIdentifier: v.optional(v.string()),
    moderatedByTokenIdentifier: v.optional(v.string()),
    moderationReason: v.optional(v.string()),
    createdAt: v.number(),
    answeredAt: v.optional(v.number()),
    moderatedAt: v.optional(v.number()),
  })
    .index("by_enrollmentId", ["enrollmentId"])
    .index("by_curriculumId_and_status", ["curriculumId", "status"])
    .index("by_status", ["status"])
    .index("by_courseId_and_status", ["courseId", "status"])
    .index("by_courseId_and_batchId_and_status", [
      "courseId",
      "batchId",
      "status",
    ]),

  lmsNotifications: defineTable({
    recipientUserId: v.string(),
    enrollmentId: v.id("enrollments"),
    kind: v.union(
      v.literal("question_answered"),
      v.literal("submission_accepted"),
      v.literal("submission_returned"),
      v.literal("completion_approved"),
      v.literal("completion_correction"),
      v.literal("completion_review"),
    ),
    title: v.string(),
    body: v.string(),
    href: v.string(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_recipientUserId_and_createdAt", ["recipientUserId", "createdAt"])
    .index("by_recipientUserId_and_enrollmentId_and_createdAt", [
      "recipientUserId",
      "enrollmentId",
      "createdAt",
    ]),

  lmsCompletionRequests: defineTable({
    enrollmentId: v.id("enrollments"),
    curriculumId: v.id("lmsCurricula"),
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    status: v.union(
      v.literal("awaiting_name"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("correction_required"),
      v.literal("under_review"),
      v.literal("revoked"),
    ),
    requestedAt: v.number(),
    confirmedRecipientName: v.optional(v.string()),
    nameConfirmedAt: v.optional(v.number()),
    correctionReason: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    reviewedByTokenIdentifier: v.optional(v.string()),
    certificateId: v.optional(v.id("lmsCertificates")),
  })
    .index("by_enrollmentId_and_curriculumId", ["enrollmentId", "curriculumId"])
    .index("by_courseId_and_status", ["courseId", "status"])
    .index("by_courseId_and_batchId_and_status", [
      "courseId",
      "batchId",
      "status",
    ]),

  lmsCertificates: defineTable({
    enrollmentId: v.id("enrollments"),
    curriculumId: v.id("lmsCurricula"),
    verificationCode: v.string(),
    recipientName: v.string(),
    courseName: v.string(),
    status: v.union(
      v.literal("issued"),
      v.literal("suspended"),
      v.literal("revoked"),
    ),
    issuedAt: v.number(),
    publicVerificationEnabled: v.optional(v.boolean()),
    suspendedAt: v.optional(v.number()),
    suspensionReason: v.optional(v.string()),
    revokedAt: v.optional(v.number()),
    revocationReason: v.optional(v.string()),
    replacesCertificateId: v.optional(v.id("lmsCertificates")),
  })
    .index("by_enrollmentId", ["enrollmentId"])
    .index("by_verificationCode", ["verificationCode"]),

  adminManagers: defineTable({
    clerkUserId: v.optional(v.string()),
    adminEmail: v.optional(v.string()),
    adminName: v.optional(v.string()),
    isActive: v.boolean(),
    note: v.optional(v.string()),
    removalNote: v.optional(v.string()),
    addedAt: v.number(),
    addedByAdminId: v.string(),
    addedByEmail: v.optional(v.string()),
    removedAt: v.optional(v.number()),
    removedByAdminId: v.optional(v.string()),
    removedByEmail: v.optional(v.string()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_adminEmail", ["adminEmail"])
    .index("by_isActive", ["isActive"])
    .index("by_addedAt", ["addedAt"]),

  // Editorial overrides for storefront copy (course category pages and
  // bespoke landing pages). Absent rows fall back to the code defaults.
  siteContent: defineTable({
    key: v.string(),
    data: v.any(),
    updatedAt: v.number(),
    updatedByAdminId: v.string(),
    updatedByEmail: v.optional(v.string()),
  }).index("by_key", ["key"]),

});
