"use client";

import { ReactNode } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Keep required public env checks local in client boot code so Next can inline them.
  // If Convex isn't configured (e.g. Vercel previews for Dependabot), fall back to a
  // dummy deployment URL so hooks like `useQuery` don't crash during prerender.
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://dummy.convex.cloud";
  const isDummyConvexUrl = !process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = new ConvexReactClient(convexUrl);

  if (isDummyConvexUrl) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  // If Clerk keys are available, use ConvexProviderWithClerk for authentication
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  // Fallback to regular ConvexProvider when Clerk keys are not available
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
