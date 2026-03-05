import type { QueryCtx, MutationCtx } from "./_generated/server";

export type AdminIdentity = {
  userId: string;
  email?: string;
  name?: string;
};

type AuthCtx = QueryCtx | MutationCtx;

export async function requireAdmin(ctx: AuthCtx): Promise<AdminIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;
  const userEmail = identity?.email?.trim().toLowerCase();

  if (!userId) {
    throw new Error("Unauthorized: sign in required");
  }

  const dbAdmin = await ctx.db
    .query("adminManagers")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", userId))
    .first();
  let isDbAdmin = !!dbAdmin?.isActive;

  if (!isDbAdmin && userEmail) {
    const emailAdmin = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", userEmail))
      .first();
    isDbAdmin = !!emailAdmin?.isActive;
  }

  if (!isDbAdmin) {
    throw new Error("Forbidden: admin access required");
  }

  return {
    userId,
    email: userEmail,
    name: identity?.name,
  };
}

export function normalizeCourseLifecycleStatus(
  status?: string,
): "draft" | "published" | "archived" {
  if (status === "draft" || status === "archived") {
    return status;
  }
  return "published";
}

export function normalizeEnrollmentStatus(
  status?: string,
): "active" | "cancelled" | "transferred" {
  if (status === "cancelled" || status === "transferred") {
    return status;
  }
  return "active";
}
