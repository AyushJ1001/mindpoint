"use client";

import { ReactNode } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// Create exactly one Convex client for the lifetime of the browser session.
// Recreating this client during Clerk sign-in can reset the auth handshake and
// leave authenticated queries stuck in a loading state.
const configuredConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(
  configuredConvexUrl ?? "https://dummy.convex.cloud",
);
const isDummyConvexUrl = !configuredConvexUrl;

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (isDummyConvexUrl) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  // If Clerk keys are available, use ConvexProviderWithClerk for authentication.
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
