import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import {
  getAdminDevBypassIdentity,
  isAdminDevBypassEnabled,
} from "../../lib/admin-dev-bypass";

// Shared viewer resolution for learner-facing Convex features (LMS, quizzes).
export type Viewer = {
  userId: string;
  isAdmin: boolean;
  name?: string;
  email?: string;
};

export async function resolveViewer(
  ctx: QueryCtx | MutationCtx,
): Promise<Viewer | null> {
  if (isAdminDevBypassEnabled()) {
    const identity = getAdminDevBypassIdentity();
    return {
      userId: identity.userId,
      isAdmin: true,
      name: identity.name,
      email: identity.email,
    };
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;

  const userId = identity.subject;
  const byId = await ctx.db
    .query("adminManagers")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", userId))
    .first();
  let isAdmin = !!byId?.isActive;

  if (!isAdmin && identity.email) {
    const email = identity.email.trim().toLowerCase();
    const byEmail = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();
    isAdmin = !!byEmail?.isActive;
  }

  return {
    userId,
    isAdmin,
    name: identity.name ?? undefined,
    email: identity.email ?? undefined,
  };
}

export type EnrollmentAccess = "active" | "pending" | "none";

// Access state for a learner on a course. A manual/screenshot payment stays
// "pending" (no LMS access) until an admin approves it.
export async function getEnrollmentAccess(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  courseId: Doc<"courses">["_id"],
): Promise<EnrollmentAccess> {
  const rows = await ctx.db
    .query("enrollments")
    .withIndex("by_userId_and_courseId", (q) =>
      q.eq("userId", userId).eq("courseId", courseId),
    )
    .collect();

  if (
    rows.some(
      (row) =>
        (row.status ?? "active") === "active" &&
        (row.paymentVerification === undefined ||
          row.paymentVerification === "approved"),
    )
  ) {
    return "active";
  }
  if (
    rows.some(
      (row) =>
        (row.status ?? "active") === "active" &&
        row.paymentVerification === "pending",
    )
  ) {
    return "pending";
  }
  return "none";
}

export async function hasActiveEnrollment(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  courseId: Doc<"courses">["_id"],
): Promise<boolean> {
  return (await getEnrollmentAccess(ctx, userId, courseId)) === "active";
}

// A learner can view lesson/quiz content when enrolled, or when an admin.
export async function isViewerEnrolled(
  ctx: QueryCtx | MutationCtx,
  viewer: Viewer,
  courseId: Doc<"courses">["_id"],
): Promise<boolean> {
  return (
    viewer.isAdmin || (await hasActiveEnrollment(ctx, viewer.userId, courseId))
  );
}
