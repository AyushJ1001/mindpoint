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
  // Only create Convex client if the URL is available
  const convex = process.env.NEXT_PUBLIC_CONVEX_URL
    ? new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)
    : null;

  // If no Convex URL is available, render children without Convex providers
  if (!convex) {
    return <>{children}</>;
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
