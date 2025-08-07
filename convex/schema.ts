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
    capacity: v.number(),
    enrolledUsers: v.array(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    daysOfWeek: v.array(v.string()),
    content: v.string(),
    reviews: v.array(v.id("reviews")),
    imageUrls: v.optional(v.array(v.id("_storage"))),
  }),
  reviews: defineTable({
    userId: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
  }),
  enrollments: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    enrollmentNumber: v.string(),
  }),
});
