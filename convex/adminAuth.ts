import type { QueryCtx, MutationCtx } from "./_generated/server";

export type AdminIdentity = {
  userId: string;
  email?: string;
  name?: string;
};

type AuthCtx = QueryCtx | MutationCtx;

function getAllowedAdminIds(): Set<string> {
  const raw = process.env.ADMIN_CLERK_USER_IDS || "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function requireAdmin(ctx: AuthCtx): Promise<AdminIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  if (!userId) {
    throw new Error("Unauthorized: sign in required");
  }

  const allowedAdmins = getAllowedAdminIds();
  if (!allowedAdmins.has(userId)) {
    throw new Error("Forbidden: admin access required");
  }

  return {
    userId,
    email: identity?.email,
    name: identity?.name,
  };
}

export function normalizeCourseLifecycleStatus(status?: string):
  | "draft"
  | "published"
  | "archived" {
  if (status === "draft" || status === "archived") {
    return status;
  }
  return "published";
}

export function normalizeEnrollmentStatus(status?: string):
  | "active"
  | "cancelled"
  | "transferred" {
  if (status === "cancelled" || status === "transferred") {
    return status;
  }
  return "active";
}

export function isAuthenticatedUserId(userId: string): boolean {
  return !userId.includes("@");
}
