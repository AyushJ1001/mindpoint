"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { CartProvider } from "@/components/CartProvider";
import { ReferralTracker } from "@/components/ReferralTracker";
import { MindPointsProvider } from "@/contexts/MindPointsContext";
import ClientNavbar from "@/components/ClientNavbar";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import RouteBodyClass from "@/components/RouteBodyClass";
import StructuredData from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { WaterMain } from "@/components/water/water-main";

interface ClientProvidersProps {
  children: ReactNode;
  /**
   * Rendered above the navigation, outside the page content. The layout passes
   * the promotional strip here so it sits above the navbar rather than under it.
   */
  topStrip?: ReactNode;
}

export default function ClientProviders({
  children,
  topStrip,
}: ClientProvidersProps) {
  const appShell = (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RouteBodyClass />
      <StructuredData />
      {topStrip}
      <AnnouncementBanner />
      <ClientNavbar />
      <WaterMain>{children}</WaterMain>
    </ThemeProvider>
  );

  // Keep required public env checks local in client boot code so Next can inline them.
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
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
