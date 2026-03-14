"use client";

import { hasClerkPublishableKey } from "@mindpoint/config";
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { CartProvider } from "@/components/CartProvider";
import { ReferralTracker } from "@/components/ReferralTracker";
import { MindPointsProvider } from "@/contexts/MindPointsContext";
import ClientNavbar from "@/components/ClientNavbar";
import RouteBodyClass from "@/components/RouteBodyClass";
import StructuredData from "@/components/structured-data";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const appShell = (
    <>
      <RouteBodyClass />
      <StructuredData />
      <ClientNavbar />
      <main id="main-content" className="flex-grow" role="main" tabIndex={-1}>
        {children}
      </main>
    </>
  );

  // Only use ClerkProvider if the public key is available
  if (hasClerkPublishableKey()) {
    return (
      <ClerkProvider>
        <ConvexClientProvider>
          <MindPointsProvider>
            <CartProvider>
              <ReferralTracker />
              {appShell}
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
        {appShell}
      </CartProvider>
    </ConvexClientProvider>
  );
}
