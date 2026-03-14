import "server-only";

import { api } from "@mindpoint/backend/api";
import { readPublicEnv } from "@mindpoint/config";
import { ConvexHttpClient } from "convex/browser";

function normalizeEmail(email?: string | null): string | undefined {
  const normalized = (email || "").trim().toLowerCase();
  return normalized || undefined;
}

export async function hasAdminAccess(
  userId?: string | null,
  email?: string | null,
  convexToken?: string | null,
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);

  if (!userId && !normalizedEmail) {
    return false;
  }

  const { convexUrl } = readPublicEnv();
  if (!convexUrl) {
    return false;
  }

  if (!convexToken) {
    return false;
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(convexToken);
    return await convex.query(api.adminManagers.isUserAdmin, {});
  } catch (error) {
    // Only treat auth/permission errors as "no access";
    // re-throw infrastructure errors so Next.js error boundary can handle them
    if (
      error instanceof Error &&
      (error.message.includes("Not authenticated") ||
        error.message.includes("Forbidden") ||
        error.message.includes("not an admin"))
    ) {
      return false;
    }
    console.error(
      "Admin access check failed due to infrastructure error:",
      error,
    );
    throw error;
  }
}
