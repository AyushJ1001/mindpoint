import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const clerkPublic = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  const clerkIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN;

  let convexReachable = false;
  let convexError: string | null = null;

  if (convexUrl) {
    try {
      const client = new ConvexHttpClient(convexUrl);
      await client.query(api.courses.listCourses, { count: 1 });
      convexReachable = true;
    } catch (error) {
      convexError = error instanceof Error ? error.message.slice(0, 240) : "Unknown Convex error";
    }
  }

  return NextResponse.json({
    environment: process.env.VERCEL_ENV ?? "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    hasConvexUrl: Boolean(convexUrl),
    hasClerkPublishableKey: Boolean(clerkPublic),
    hasClerkSecretKey: Boolean(clerkSecret),
    hasClerkJwtIssuer: Boolean(clerkIssuer),
    convexReachable,
    convexError,
  });
}
