"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { CartProvider } from "@/components/CartProvider";
import { ReferralTracker } from "@/components/ReferralTracker";
import { MindPointsProvider } from "@/contexts/MindPointsContext";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Only use ClerkProvider if the public key is available
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkProvider>
        <ConvexClientProvider>
          <MindPointsProvider>
            <CartProvider>
              <ReferralTracker />
              {children}
            </CartProvider>
          </MindPointsProvider>
        </ConvexClientProvider>
      </ClerkProvider>
    );
  }

  // Fallback when Clerk keys are not available
  // ConvexClientProvider will handle the fallback internally
  return (
    <ConvexClientProvider>
      <CartProvider>
        <ReferralTracker />
        {children}
      </CartProvider>
    </ConvexClientProvider>
  );
}
