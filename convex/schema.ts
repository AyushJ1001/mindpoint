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
  }).index("by_name_and_type", ["name", "type"]),

  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
  }).index("by_course", ["course"]),
  enrollments: defineTable({
    userId: v.string(),
    userName: v.optional(v.string()),
    courseId: v.id("courses"),
    courseName: v.optional(v.string()),
    enrollmentNumber: v.string(),
  }),
});
