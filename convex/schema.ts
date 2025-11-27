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

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  courses: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(CourseType),
    code: v.string(),
    price: v.number(),
    offer: v.optional(
      v.object({
        name: v.string(),
        discount: v.optional(v.number()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
      }),
    ),
    bogo: v.optional(
      v.object({
        enabled: v.boolean(),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        label: v.optional(v.string()),
      }),
    ),
    // Number of sessions for session-based offerings (e.g., therapy)
    sessions: v.optional(v.number()),
    capacity: v.number(),
    enrolledUsers: v.array(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    daysOfWeek: v.array(v.string()),
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
    // Worksheet-specific fields
    fileUrl: v.optional(v.string()), // UploadThing public URL for the PDF
    worksheetDescription: v.optional(v.string()), // Detailed worksheet description
    targetAudience: v.optional(v.array(v.string())), // "who is this worksheet for"
  })
    .index("by_name_and_type", ["name", "type"])
    .index("by_startDate", ["startDate"])
    .index("by_type", ["type"]),

  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
    isEdited: v.optional(v.boolean()),
  }).index("by_course", ["course"]),

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

  enrollments: defineTable({
    userId: v.string(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    courseId: v.id("courses"),
    courseName: v.optional(v.string()),
    enrollmentNumber: v.string(),
    isGuestUser: v.optional(v.boolean()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
    courseType: v.optional(CourseType),
    internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
    sessions: v.optional(v.number()), // Number of sessions for therapy courses
    isBogoFree: v.optional(v.boolean()),
    bogoSourceCourseId: v.optional(v.id("courses")),
    bogoOfferName: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_enrollmentNumber", ["enrollmentNumber"])
    .index("by_courseId", ["courseId"]),

  // User Mind Points balance
  mindPoints: defineTable({
    clerkUserId: v.string(),
    balance: v.number(),
    totalEarned: v.number(),
    totalRedeemed: v.number(),
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
});
