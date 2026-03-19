import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
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

  const reviewIds = new Set((course.reviews ?? []).map((id) => String(id)));
  if (args.action === "add") {
    reviewIds.add(String(args.reviewId));
  } else {
    reviewIds.delete(String(args.reviewId));
  }

  await ctx.db.patch(args.courseId, {
    reviews: Array.from(reviewIds).map((id) => id as Id<"reviews">),
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

    let rows = args.courseId
      ? await ctx.db
          .query("reviews")
          .withIndex("by_course", (q) => q.eq("course", args.courseId!))
          .order("desc")
          .take(scanLimit)
      : await ctx.db.query("reviews").order("desc").take(scanLimit);

    if (typeof args.rating === "number") {
      rows = rows.filter((row) => row.rating === args.rating);
    }

    const courseIds = Array.from(
      new Set(rows.map((row) => String(row.course))),
    ).map((id) => id as Id<"courses">);
    const courseDocs = await Promise.all(
      courseIds.map(async (courseId) => ({
        courseId: String(courseId),
        course: await ctx.db.get(courseId),
      })),
    );
    const coursesById = new Map(
      courseDocs.map(({ courseId, course }) => [courseId, course] as const),
    );

    let enriched = rows.map((row) => {
      const course = coursesById.get(String(row.course));
      return {
        ...row,
        courseName: course?.name ?? "Unknown course",
        courseCode: course?.code ?? "—",
        courseType: course?.type ?? null,
      };
    });

    if (args.search) {
      const search = args.search.toLowerCase();
      enriched = enriched.filter((row) =>
        [
          row.userName,
          row.userId,
          row.content,
          row.courseName,
          row.courseCode,
          row.courseType ?? "",
        ].some((part) => part.toLowerCase().includes(search)),
      );
    }

    switch (args.sortBy) {
      case "oldest":
        enriched.sort((a, b) => a._creationTime - b._creationTime);
        break;
      case "rating":
        enriched.sort(
          (a, b) => b.rating - a.rating || b._creationTime - a._creationTime,
        );
        break;
      default:
        enriched.sort((a, b) => b._creationTime - a._creationTime);
        break;
    }

    return enriched.slice(0, limit);
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
