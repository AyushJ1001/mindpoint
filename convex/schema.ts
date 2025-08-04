import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    imageUrls: v.optional(v.array(v.string())),
  }),
  reviews: defineTable({
    userId: v.string(),
    createdAt: v.string(),
    rating: v.number(),
    content: v.string(),
    course: v.id("courses"),
  }),
});
