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
  v.literal("admin_transfer"),
);

export const CourseOfferValue = v.object({
  name: v.string(),
  discount: v.optional(v.number()),
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

export const EnrollmentSessionType = v.union(
  v.literal("focus"),
  v.literal("flow"),
  v.literal("elevate"),
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
  cancelledAt: v.optional(v.number()),
  transferredAt: v.optional(v.number()),
  transferredToCourseId: v.optional(v.id("courses")),
  lastConfirmationSentAt: v.optional(v.number()),
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
    .index("by_startDate", ["startDate"])
    .index("by_type", ["type"])
    .index("by_lifecycleStatus", ["lifecycleStatus"])
    .index("by_type_and_lifecycleStatus", ["type", "lifecycleStatus"])
    .index("by_mergedIntoCourseId", ["mergedIntoCourseId"]),

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
    legacySourceCourseId: v.optional(v.id("courses")),
    createdByAdminId: v.optional(v.string()),
    updatedByAdminId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_courseId", ["courseId"])
    .index("by_courseId_and_lifecycleStatus", ["courseId", "lifecycleStatus"])
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
    .index("by_enabled_priority", ["enabled", "priority"])
    .index("by_enabled_isArchived_priority", [
      "enabled",
      "isArchived",
      "priority",
    ]),

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
    .index("by_status", ["status"])
    .index("by_courseId_and_status", ["courseId", "status"])
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
});
