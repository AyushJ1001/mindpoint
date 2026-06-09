import type { QueryCtx, MutationCtx } from "./_generated/server";

export type AdminIdentity = {
  userId: string;
  email?: string;
  name?: string;
};

type AuthCtx = QueryCtx | MutationCtx;

function isTruthy(value?: string) {
  return ["1", "true", "yes", "on"].includes(
    (value || "").trim().toLowerCase(),
  );
}

function isAdminDevBypassEnabled() {
  if (
    process.env.VERCEL_ENV === "production" ||
    isTruthy(process.env.ADMIN_DEV_BYPASS_DISABLED)
  ) {
    return false;
  }

  if (isTruthy(process.env.ADMIN_DEV_BYPASS)) {
    return true;
  }

  const convexDeployment = process.env.CONVEX_DEPLOYMENT || "";
  const clerkIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN || "";
  const clerkPublishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";

  return (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "development" ||
    process.env.VERCEL_ENV === "preview" ||
    convexDeployment.startsWith("dev:") ||
    clerkIssuer.includes("accounts.dev") ||
    clerkPublishableKey.startsWith("pk_test_") ||
    clerkSecretKey.startsWith("sk_test_")
  );
}

export async function requireAdmin(ctx: AuthCtx): Promise<AdminIdentity> {
  if (isAdminDevBypassEnabled()) {
    return {
      userId: "dev-admin-bypass",
      email: "dev-admin-bypass@themindpoint.local",
      name: "Dev Admin Bypass",
    };
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
