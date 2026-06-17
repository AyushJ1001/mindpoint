import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  CourseType,
  PublicCourseBatchDocumentValue,
  PublicCourseDocumentValue,
} from "./schema";
import { pickPublicCourse, type PublicCourse } from "./_publicCourse";
import {
  getDefaultPublicCourseBatch,
  getPublicCourseBatch,
  isMergedCourse,
  isPublishedCourse,
  sortPublicCourseBatches,
  type PublicCourseBatch,
} from "./courseBatchHelpers";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

type PublicReviewFailure = ConvexFailure<
  "CONFLICT" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

function publicReviewFailure(
  message: string,
  code:
    | "CONFLICT"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR" = convexResultErrorCode.VALIDATION_ERROR,
): PublicReviewFailure {
  return convexFailure({ code, message });
}

async function listVisiblePublicBatchesForCourse(
  ctx: QueryCtx,
  courseId: Id<"courses">,
): Promise<PublicCourseBatch[]> {
  const rows = await ctx.db
    .query("courseBatches")
    .withIndex("by_courseId_and_lifecycleStatus", (q) =>
      q.eq("courseId", courseId).eq("lifecycleStatus", "published"),
    )
    .collect();

  return sortPublicCourseBatches(rows.map((row) => getPublicCourseBatch(row)));
}

async function toPublicCourse(
  ctx: QueryCtx,
  course: Doc<"courses">,
): Promise<PublicCourse> {
  if (!course.usesBatches) {
    return pickPublicCourse(course);
  }

  const visibleBatches = await listVisiblePublicBatchesForCourse(
    ctx,
    course._id,
  );
  const defaultBatch = getDefaultPublicCourseBatch(visibleBatches);

  return pickPublicCourse(course, {
    batchCount: visibleBatches.length,
    nextAvailableBatch: defaultBatch,
  });
}

function normalizePublicReviewRating(
  value: number,
): number | PublicReviewFailure {
  if (!Number.isFinite(value)) {
    return publicReviewFailure("Rating must be a valid number");
  }

  const rounded = Math.round(value * 2) / 2;
  return Math.max(0.5, Math.min(5, rounded));
}

async function listPublishedCourses(
  ctx: QueryCtx,
  limit: number,
  type?: Doc<"courses">["type"],
) {
  const [publishedViaIndex, publishedLegacy] = await Promise.all([
    type
      ? ctx.db
          .query("courses")
          .withIndex("by_type_and_lifecycleStatus", (q) =>
            q.eq("type", type).eq("lifecycleStatus", "published"),
          )
          .order("desc")
          .take(limit * 2)
      : ctx.db
          .query("courses")
          .withIndex("by_lifecycleStatus", (q) =>
            q.eq("lifecycleStatus", "published"),
          )
          .order("desc")
          .take(limit * 2),
    ctx.db
      .query("courses")
      .withIndex(
        type ? "by_type_and_lifecycleStatus" : "by_lifecycleStatus",
        (q) =>
          type
            ? q.eq("type", type).eq("lifecycleStatus", undefined)
            : q.eq("lifecycleStatus", undefined),
      )
      .order("desc")
      .take(limit * 2),
  ]);

  const merged = [...publishedViaIndex, ...publishedLegacy]
    .filter((course) => isPublishedCourse(course))
    .filter((course) => !isMergedCourse(course));
  const filteredByType = type
    ? merged.filter((course) => course.type === type)
    : merged;
  const uniqueById = new Map<string, Doc<"courses">>();
  for (const course of filteredByType) {
    uniqueById.set(String(course._id), course);
  }
  return Array.from(uniqueById.values())
    .sort((left, right) => right._creationTime - left._creationTime)
    .slice(0, limit);
}

export const listCourses = query({
  args: {
    count: v.optional(v.number()),
  },
  returns: v.array(PublicCourseDocumentValue),
  handler: async (ctx, args) => {
    const limit = Math.max(1, args.count ?? 1000);
    const courses = await listPublishedCourses(ctx, limit);
    return await Promise.all(
      courses.map((course) => toPublicCourse(ctx, course)),
    );
  },
});

export const listCoursesByType = query({
  args: {
    type: CourseType,
    count: v.optional(v.number()),
  },
  returns: v.object({
    viewer: v.union(v.string(), v.null()),
    courses: v.array(PublicCourseDocumentValue),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, args.count ?? 1000);
    const courses = await listPublishedCourses(ctx, limit, args.type);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: await Promise.all(
        courses.map((course) => toPublicCourse(ctx, course)),
      ),
    };
  },
});

export const getCourseById = query({
  args: { id: v.id("courses") },
  returns: v.union(PublicCourseDocumentValue, v.null()),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course || !isPublishedCourse(course)) return null;
    if (isMergedCourse(course)) return null;
    return await toPublicCourse(ctx, course);
  },
});

export const getCoursePageData = query({
  args: {
    id: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
  },
  returns: v.object({
    redirectToCourseId: v.union(v.id("courses"), v.null()),
    redirectToBatchId: v.union(v.id("courseBatches"), v.null()),
    course: v.union(PublicCourseDocumentValue, v.null()),
    batches: v.array(PublicCourseBatchDocumentValue),
    selectedBatch: v.union(PublicCourseBatchDocumentValue, v.null()),
  }),
  handler: async (ctx, args) => {
    const requested = await ctx.db.get(args.id);
    if (!requested) {
      return {
        redirectToCourseId: null,
        redirectToBatchId: null,
        course: null,
        batches: [],
        selectedBatch: null,
      };
    }

    let redirectToCourseId: Id<"courses"> | null = null;
    let redirectToBatchId: Id<"courseBatches"> | null = null;
    let canonical = requested;

    if (requested.mergedIntoCourseId) {
      const target = await ctx.db.get(requested.mergedIntoCourseId);
      if (!target) {
        return {
          redirectToCourseId: null,
          redirectToBatchId: null,
          course: null,
          batches: [],
          selectedBatch: null,
        };
      }
      canonical = target;
      redirectToCourseId = target._id;
      redirectToBatchId = requested.mergedIntoBatchId ?? null;
    }

    if (!isPublishedCourse(canonical)) {
      return {
        redirectToCourseId,
        redirectToBatchId,
        course: null,
        batches: [],
        selectedBatch: null,
      };
    }

    const batches = canonical.usesBatches
      ? await listVisiblePublicBatchesForCourse(ctx, canonical._id)
      : [];
    const explicitBatchId = args.batchId ?? redirectToBatchId ?? undefined;
    const selectedBatch = explicitBatchId
      ? (batches.find(
          (batch) => String(batch._id) === String(explicitBatchId),
        ) ?? null)
      : null;

    return {
      redirectToCourseId,
      redirectToBatchId,
      course: pickPublicCourse(canonical, {
        batchCount: batches.length,
        nextAvailableBatch: getDefaultPublicCourseBatch(batches),
      }),
      batches,
      selectedBatch,
    };
  },
});

export const listCourseBatchesForCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  returns: v.array(PublicCourseBatchDocumentValue),
  handler: async (ctx, args) => {
    return await listVisiblePublicBatchesForCourse(ctx, args.courseId);
  },
});

export const getRelatedVariants = query({
  args: { id: v.id("courses") },
  returns: v.array(PublicCourseDocumentValue),
  handler: async (ctx, args) => {
    const base = await ctx.db.get(args.id);
    if (!base || base.usesBatches) return [];
    const name = base.name;
    const type = base.type;
    const variants = await ctx.db
      .query("courses")
      .withIndex("by_name_and_type", (q) => q.eq("name", name).eq("type", type))
      .collect();
    const publishedVariants = variants
      .filter((course) => isPublishedCourse(course))
      .filter((course) => !isMergedCourse(course));

    publishedVariants.sort(
      (a, b) =>
        (a.price ?? 0) - (b.price ?? 0) || a._creationTime - b._creationTime,
    );

    return await Promise.all(
      publishedVariants.map((course) => toPublicCourse(ctx, course)),
    );
  },
});

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

    if (args.sortBy === "rating") {
      rows.sort((a, b) => b.rating - a.rating);
    }

    return args.count ? rows.slice(0, args.count) : rows;
  },
});

export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const rating = normalizePublicReviewRating(args.rating);
    if (typeof rating !== "number") {
      return rating;
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return publicReviewFailure(
        "Course not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";
    const userName = identity?.name ?? "Anonymous";

    const existingReview = identity
      ? await ctx.db
          .query("reviews")
          .withIndex("by_course_and_user", (q) =>
            q.eq("course", args.courseId).eq("userId", userId),
          )
          .first()
      : null;
    if (existingReview) {
      return publicReviewFailure(
        "You have already reviewed this course",
        convexResultErrorCode.CONFLICT,
      );
    }

    const reviewId = await ctx.db.insert("reviews", {
      course: args.courseId,
      userId,
      userName,
      rating,
      content: args.content.trim(),
      isEdited: false,
    });

    await ctx.db.patch(args.courseId, {
      reviews: [...(course.reviews ?? []), reviewId],
    });

    return convexSuccess({ reviewId });
  },
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const rating = normalizePublicReviewRating(args.rating);
    if (typeof rating !== "number") {
      return rating;
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return publicReviewFailure(
        "Review not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";

    if (review.userId !== userId) {
      return publicReviewFailure(
        "You can only edit your own reviews",
        convexResultErrorCode.FORBIDDEN,
      );
    }

    await ctx.db.patch(args.reviewId, {
      rating,
      content: args.content.trim(),
      isEdited: true,
    });

    return convexSuccess({ reviewId: args.reviewId });
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      return publicReviewFailure(
        "Review not found",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";

    if (review.userId !== userId) {
      return publicReviewFailure(
        "You can only delete your own reviews",
        convexResultErrorCode.FORBIDDEN,
      );
    }

    const course = await ctx.db.get(review.course);
    await ctx.db.delete(args.reviewId);

    if (course) {
      await ctx.db.patch(review.course, {
        reviews: (course.reviews ?? []).filter(
          (reviewId) => String(reviewId) !== String(args.reviewId),
        ),
      });
    }

    return convexSuccess({ reviewId: args.reviewId });
  },
});

export const getBogoCoursesByType = query({
  args: { courseType: CourseType },
  returns: v.array(PublicCourseDocumentValue),
  handler: async (ctx, args) => {
    const [publishedCourses, legacyPublishedCourses] = await Promise.all([
      ctx.db
        .query("courses")
        .withIndex("by_type_and_lifecycleStatus", (q) =>
          q.eq("type", args.courseType).eq("lifecycleStatus", "published"),
        )
        .order("desc")
        .collect(),
      ctx.db
        .query("courses")
        .withIndex("by_type_and_lifecycleStatus", (q) =>
          q.eq("type", args.courseType).eq("lifecycleStatus", undefined),
        )
        .order("desc")
        .collect(),
    ]);

    const visible = [...publishedCourses, ...legacyPublishedCourses]
      .filter((course) => course.bogo?.enabled === true)
      .filter((course) => !isMergedCourse(course));

    return await Promise.all(
      visible.map((course) => toPublicCourse(ctx, course)),
    );
  },
});

export const getBogoCoursesByTypes = query({
  args: { courseTypes: v.array(CourseType) },
  returns: v.record(v.string(), v.array(PublicCourseDocumentValue)),
  handler: async (ctx, args) => {
    const result: Record<string, PublicCourse[]> = {};

    for (const courseType of args.courseTypes) {
      const [publishedCourses, legacyPublishedCourses] = await Promise.all([
        ctx.db
          .query("courses")
          .withIndex("by_type_and_lifecycleStatus", (q) =>
            q.eq("type", courseType).eq("lifecycleStatus", "published"),
          )
          .order("desc")
          .collect(),
        ctx.db
          .query("courses")
          .withIndex("by_type_and_lifecycleStatus", (q) =>
            q.eq("type", courseType).eq("lifecycleStatus", undefined),
          )
          .order("desc")
          .collect(),
      ]);

      result[courseType] = await Promise.all(
        [...publishedCourses, ...legacyPublishedCourses]
          .filter((course) => course.bogo?.enabled === true)
          .filter((course) => !isMergedCourse(course))
          .map((course) => toPublicCourse(ctx, course)),
      );
    }

    return result;
  },
});
