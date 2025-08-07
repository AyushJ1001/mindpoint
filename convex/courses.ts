import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CourseType } from "./schema";

export const listCourses = query({
  // Validators for arguments.
  args: {
    count: v.optional(v.number()),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const courses = args.count
      ? await ctx.db
          .query("courses")
          // Ordered by _creationTime, return most recent
          .order("desc")
          .take(args.count)
      : await ctx.db.query("courses").order("desc").collect();
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: courses.reverse().map((course) => course),
    };
  },
});

export const listCoursesByType = query({
  // Validators for arguments.
  args: {
    type: CourseType,
    count: v.optional(v.number()),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();

    const filteredCourses = args.count ? courses.slice(0, args.count) : courses;

    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: filteredCourses.reverse().map((course) => course),
    };
  },
});

// Fetch a single course by its id
export const getCourseById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    return course;
  },
});

// List reviews for a given course
export const listReviewsForCourse = query({
  args: { courseId: v.id("courses"), count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("course", args.courseId))
      .order("desc")
      .collect();
    return args.count ? rows.slice(0, args.count) : rows;
  },
});

// Create a new review
export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic validation
    const rating = Math.max(1, Math.min(5, Math.round(args.rating)));
    // Ensure course exists
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";
    const userName = identity?.name ?? "Anonymous";

    const reviewId = await ctx.db.insert("reviews", {
      course: args.courseId,
      userId,
      userName,
      rating,
      content: args.content.trim(),
    });

    // Optionally attach to course document if needed in the future
    // await ctx.db.patch(args.courseId, { reviews: [...(course.reviews ?? []), reviewId] });

    return reviewId;
  },
});
