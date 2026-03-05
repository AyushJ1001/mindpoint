import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
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
    console.warn("Failed to check admin access via Convex:", error);
    return false;
  }
}
