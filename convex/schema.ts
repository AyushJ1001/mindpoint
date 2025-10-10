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
        freeCourseId: v.optional(v.id("courses")),
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
  })
    .index("by_name_and_type", ["name", "type"])
    .index("by_startDate", ["startDate"]),

  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
  }).index("by_course", ["course"]),

  guestUsers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  }).index("by_email", ["email"]),

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
  }),
});
