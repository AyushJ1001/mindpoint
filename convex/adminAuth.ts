import type { QueryCtx, MutationCtx } from "./_generated/server";
import {
  getAdminDevBypassIdentity,
  isAdminDevBypassEnabled,
} from "../lib/admin-dev-bypass";

export type AdminIdentity = {
  userId: string;
  email?: string;
  name?: string;
};

type AuthCtx = QueryCtx | MutationCtx;

/**
 * Query contexts expose no write methods, so the opportunistic Clerk-id binding
 * in `requireAdmin` only runs from a mutation. Nothing depends on it happening.
 */
function canWrite(ctx: AuthCtx): ctx is MutationCtx {
  return typeof (ctx.db as { patch?: unknown }).patch === "function";
}

export async function requireAdmin(ctx: AuthCtx): Promise<AdminIdentity> {
  if (isAdminDevBypassEnabled()) {
    return getAdminDevBypassIdentity();
  }

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

    // No admin row holds a Clerk id yet, so the email match is the only way in.
    // Bind the id the first time a matching account signs in and writes, so the
    // fallback can be retired later without locking anybody out. A failed
    // binding must never block sign-in.
    if (isDbAdmin && emailAdmin && !emailAdmin.clerkUserId && canWrite(ctx)) {
      try {
        await ctx.db.patch("adminManagers", emailAdmin._id, {
          clerkUserId: userId,
        });
      } catch {
        // Best effort: the email fallback still authorises this request.
      }
    }
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
