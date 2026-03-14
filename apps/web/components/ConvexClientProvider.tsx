"use client";

import { hasClerkPublishableKey, readPublicEnv } from "@mindpoint/config";
import { ReactNode } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { convexUrl } = readPublicEnv();

  // Only create Convex client if the URL is available
  const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

  // If no Convex URL is available, render children without Convex providers
  if (!convex) {
    return <>{children}</>;
  }

  // If Clerk keys are available, use ConvexProviderWithClerk for authentication
  if (hasClerkPublishableKey()) {
    return (
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  // Fallback to regular ConvexProvider when Clerk keys are not available
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
