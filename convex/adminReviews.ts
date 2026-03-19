import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

function normalizeRating(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Rating must be a valid number");
  }

  const rounded = Math.round(value * 2) / 2;
  const clamped = Math.max(0.5, Math.min(5, rounded));

  if (!Number.isFinite(clamped)) {
    throw new Error("Rating must be between 0.5 and 5");
  }

  return clamped;
}

function normalizeRequiredText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required`);
  }
  return trimmed;
}

function normalizeOptionalUserId(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isCourseDoc(value: unknown): value is Doc<"courses"> {
  return (
    !!value &&
    typeof value === "object" &&
    "name" in value &&
    "code" in value &&
    "reviews" in value
  );
}

async function syncCourseReviewReference(
  ctx: MutationCtx,
  args: {
    courseId: Id<"courses">;
    reviewId: Id<"reviews">;
    action: "add" | "remove";
  },
) {
  const course = await ctx.db.get(args.courseId);
  if (!course) {
    return;
  }

  const existingIds = course.reviews ?? [];
  const nextIds =
    args.action === "add"
      ? existingIds.some((id) => id === args.reviewId)
        ? existingIds
        : [...existingIds, args.reviewId]
      : existingIds.filter((id) => id !== args.reviewId);

  await ctx.db.patch(args.courseId, {
    reviews: nextIds,
  });
}

export const listReviews = query({
  args: {
    search: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    rating: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("rating")),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);
    const scanLimit = args.search
      ? Math.min(Math.max(limit * 10, 500), 2500)
      : Math.min(Math.max(limit * 5, 250), 1500);
    const courseCache = new Map<string, Doc<"courses"> | null>();

    const getCourse = async (courseId: Id<"courses">) => {
      const key = String(courseId);
      if (courseCache.has(key)) {
        return courseCache.get(key) ?? null;
      }

      const result = await ctx.db.get(courseId);
      const course = isCourseDoc(result) ? result : null;
      courseCache.set(key, course);
      return course;
    };

    let rows = args.courseId
      ? await ctx.db
          .query("reviews")
          .withIndex("by_course", (q) => q.eq("course", args.courseId!))
          .order("desc")
          .take(scanLimit)
      : await ctx.db.query("reviews").order("desc").take(scanLimit);
    const hitScanLimit = rows.length === scanLimit;

    if (typeof args.rating === "number") {
      rows = rows.filter((row) => row.rating === args.rating);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      const filteredRows = [];

      for (const row of rows) {
        const matchesBaseFields = [row.userName, row.userId, row.content]
          .filter((part): part is string => typeof part === "string")
          .some((part) => part.toLowerCase().includes(search));

        if (matchesBaseFields) {
          filteredRows.push(row);
          continue;
        }

        const course = await getCourse(row.course);
        const courseParts = [
          course?.name ?? "",
          course?.code ?? "",
          course?.type ?? "",
        ];

        if (courseParts.some((part) => part.toLowerCase().includes(search))) {
          filteredRows.push(row);
        }
      }

      rows = filteredRows;
    }

    switch (args.sortBy) {
      case "oldest":
        rows.sort((a, b) => a._creationTime - b._creationTime);
        break;
      case "rating":
        rows.sort(
          (a, b) => b.rating - a.rating || b._creationTime - a._creationTime,
        );
        break;
      default:
        rows.sort((a, b) => b._creationTime - a._creationTime);
        break;
    }

    const limitedRows = rows.slice(0, limit);

    return {
      reviews: await Promise.all(
        limitedRows.map(async (row) => {
          const course = await getCourse(row.course);
          return {
            ...row,
            courseName: course?.name ?? "Unknown course",
            courseCode: course?.code ?? "—",
            courseType: course?.type ?? null,
          };
        }),
      ),
      hasMore: hitScanLimit,
    };
  },
});

export const createReview = mutation({
  args: {
    courseId: v.id("courses"),
    userName: v.string(),
    userId: v.optional(v.string()),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    const review = {
      course: args.courseId,
      userName: normalizeRequiredText(args.userName, "Reviewer name"),
      userId:
        normalizeOptionalUserId(args.userId) || `admin-managed:${admin.userId}`,
      rating: normalizeRating(args.rating),
      content: normalizeRequiredText(args.content, "Review content"),
      isEdited: false,
    };

    const reviewId = await ctx.db.insert("reviews", review);
    await syncCourseReviewReference(ctx, {
      courseId: args.courseId,
      reviewId,
      action: "add",
    });

    const created = await ctx.db.get(reviewId);
    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "review.create",
      entityType: "review",
      entityId: String(reviewId),
      after: created,
      metadata: {
        courseId: String(args.courseId),
        courseName: course.name,
      },
    });

    return created;
  },
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    courseId: v.id("courses"),
    userName: v.string(),
    userId: v.optional(v.string()),
    rating: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.reviewId);

    if (!existing) {
      throw new Error("Review not found");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const patch = {
      course: args.courseId,
      userName: normalizeRequiredText(args.userName, "Reviewer name"),
      userId:
        normalizeOptionalUserId(args.userId) ||
        (existing.userId?.trim()
          ? existing.userId
          : `admin-managed:${admin.userId}`),
      rating: normalizeRating(args.rating),
      content: normalizeRequiredText(args.content, "Review content"),
      isEdited: true,
    };

    await ctx.db.patch(args.reviewId, patch);

    if (String(existing.course) !== String(args.courseId)) {
      await syncCourseReviewReference(ctx, {
        courseId: existing.course,
        reviewId: args.reviewId,
        action: "remove",
      });
      await syncCourseReviewReference(ctx, {
        courseId: args.courseId,
        reviewId: args.reviewId,
        action: "add",
      });
    }

    const updated = await ctx.db.get(args.reviewId);
    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "review.update",
      entityType: "review",
      entityId: String(args.reviewId),
      before: existing,
      after: updated,
    });

    return updated;
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.get(args.reviewId);

    if (!existing) {
      throw new Error("Review not found");
    }

    await ctx.db.delete(args.reviewId);
    await syncCourseReviewReference(ctx, {
      courseId: existing.course,
      reviewId: args.reviewId,
      action: "remove",
    });

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "review.delete",
      entityType: "review",
      entityId: String(args.reviewId),
      before: existing,
    });

    return { success: true };
  },
});
