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
    return courses;
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

// Fetch related variants for a given course: same name & type (e.g., sessions/duration variants)
export const getRelatedVariants = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const base = await ctx.db.get(args.id);
    if (!base) return [];
    const name = base.name;
    const type = base.type;
    // Use index to efficiently fetch variants by same name and type
    const variants = await ctx.db
      .query("courses")
      .withIndex("by_name_and_type", (q) => q.eq("name", name).eq("type", type))
      .collect();
    // Ensure stable order by price ascending, then _creationTime
    variants.sort(
      (a, b) =>
        (a.price ?? 0) - (b.price ?? 0) || a._creationTime - b._creationTime,
    );
    return variants;
  },
});

// List reviews for a given course
export const listReviewsForCourse = query({
  args: {
    courseId: v.id("courses"),
    count: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("date"), v.literal("rating"))),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("course", args.courseId))
      .order("desc")
      .collect();

    // Sort by rating if requested
    if (args.sortBy === "rating") {
      rows.sort((a, b) => b.rating - a.rating);
    }
    // Default is already sorted by date (desc)

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
      isEdited: false,
    });

    // Optionally attach to course document if needed in the future
    // await ctx.db.patch(args.courseId, { reviews: [...(course.reviews ?? []), reviewId] });

    return reviewId;
  },
});

// Update an existing review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic validation
    const rating = Math.max(1, Math.min(5, Math.round(args.rating)));

    // Get the review
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    // Check if user owns this review
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";

    if (review.userId !== userId) {
      throw new Error("You can only edit your own reviews");
    }

    // Update the review
    await ctx.db.patch(args.reviewId, {
      rating,
      content: args.content.trim(),
      isEdited: true,
    });

    return args.reviewId;
  },
});

// Delete a review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    // Get the review
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    // Check if user owns this review
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";

    if (review.userId !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    // Delete the review
    await ctx.db.delete(args.reviewId);

    return args.reviewId;
  },
});

// Fetch courses with BOGO enabled for a specific course type
export const getBogoCoursesByType = query({
  args: { courseType: CourseType },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.courseType),
          q.eq(q.field("bogo.enabled"), true),
        ),
      )
      .order("desc")
      .collect();

    return courses;
  },
});
