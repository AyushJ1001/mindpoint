import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { CourseType, PublicCourseDocumentValue } from "./schema";
import { pickPublicCourse, type PublicCourse } from "./_publicCourse";

function isPublishedCourse(course: {
  lifecycleStatus?: "draft" | "published" | "archived";
}) {
  return !course.lifecycleStatus || course.lifecycleStatus === "published";
}

export const listCourses = query({
  // Validators for arguments.
  args: {
    count: v.optional(v.number()),
  },
  returns: v.array(PublicCourseDocumentValue),

  // Query implementation.
  handler: async (ctx, args) => {
    const limit = Math.max(1, args.count ?? 1000);
    const [publishedViaIndex, publishedLegacy] = await Promise.all([
      ctx.db
        .query("courses")
        .withIndex("by_lifecycleStatus", (q) =>
          q.eq("lifecycleStatus", "published"),
        )
        .order("desc")
        .take(limit),
      ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("lifecycleStatus"), undefined))
        .order("desc")
        .take(limit),
    ]);
    const publishedCourses = [...publishedViaIndex, ...publishedLegacy]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit)
      .map((course) => pickPublicCourse(course));

    return publishedCourses;
  },
});

export const listCoursesByType = query({
  // Validators for arguments.
  args: {
    type: CourseType,
    count: v.optional(v.number()),
  },
  returns: v.object({
    viewer: v.union(v.string(), v.null()),
    courses: v.array(PublicCourseDocumentValue),
  }),

  // Query implementation.
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .collect();

    const publishedCourses = courses.filter((course) =>
      isPublishedCourse(course),
    );
    const filteredCourses = args.count
      ? publishedCourses.slice(0, args.count)
      : publishedCourses;

    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: filteredCourses
        .reverse()
        .map((course) => pickPublicCourse(course)),
    };
  },
});

// Fetch a single course by its id
export const getCourseById = query({
  args: { id: v.id("courses") },
  returns: v.union(PublicCourseDocumentValue, v.null()),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course || !isPublishedCourse(course)) return null;
    return pickPublicCourse(course);
  },
});

// Fetch related variants for a given course: same name & type (e.g., sessions/duration variants)
export const getRelatedVariants = query({
  args: { id: v.id("courses") },
  returns: v.array(PublicCourseDocumentValue),
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
    const publishedVariants = variants.filter((course) =>
      isPublishedCourse(course),
    );
    // Ensure stable order by price ascending, then _creationTime
    publishedVariants.sort(
      (a, b) =>
        (a.price ?? 0) - (b.price ?? 0) || a._creationTime - b._creationTime,
    );
    return publishedVariants.map((course) => pickPublicCourse(course));
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

    const existingIdStrings = new Set(
      (course.reviews ?? []).map((id) => String(id)),
    );

    if (!existingIdStrings.has(String(reviewId))) {
      await ctx.db.patch(args.courseId, {
        reviews: [...(course.reviews ?? []), reviewId],
      });
    }

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

    const course = await ctx.db.get(review.course);
    // Delete the review
    await ctx.db.delete(args.reviewId);

    if (course) {
      await ctx.db.patch(review.course, {
        reviews: (course.reviews ?? []).filter(
          (reviewId) => String(reviewId) !== String(args.reviewId),
        ),
      });
    }

    return args.reviewId;
  },
});

// Fetch courses with BOGO enabled for a specific course type
// Note: Since bogo.enabled is a nested field, we use index for type and filter for bogo
export const getBogoCoursesByType = query({
  args: { courseType: CourseType },
  returns: v.array(PublicCourseDocumentValue),
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_type", (q) => q.eq("type", args.courseType))
      .filter((q) => q.eq(q.field("bogo.enabled"), true))
      .order("desc")
      .collect();

    return courses
      .filter((course) => isPublishedCourse(course))
      .map((course) => pickPublicCourse(course));
  },
});

// Batch fetch BOGO courses for multiple course types at once
// This reduces the number of queries when rendering course grids
// Optimized to use indexes and parallel fetching
export const getBogoCoursesByTypes = query({
  args: { courseTypes: v.array(CourseType) },
  returns: v.record(v.string(), v.array(PublicCourseDocumentValue)),
  handler: async (ctx, args) => {
    const result: Record<string, PublicCourse[]> = {};

    // Initialize all types with empty arrays
    for (const courseType of args.courseTypes) {
      result[courseType] = [];
    }

    // Fetch BOGO courses for each type using index
    // Using Promise.all for parallel execution (though Convex queries are sequential)
    for (const courseType of args.courseTypes) {
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_type", (q) => q.eq("type", courseType))
        .filter((q) => q.eq(q.field("bogo.enabled"), true))
        .order("desc")
        .collect();

      result[courseType] = courses
        .filter((course) => isPublishedCourse(course))
        .map((course) => pickPublicCourse(course));
    }

    return result;
  },
});
