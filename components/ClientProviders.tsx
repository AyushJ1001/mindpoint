"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { CartProvider } from "@/components/CartProvider";
import { ReferralTracker } from "@/components/ReferralTracker";
import { MindPointsProvider } from "@/contexts/MindPointsContext";
import ClientNavbar from "@/components/ClientNavbar";
import RouteBodyClass from "@/components/RouteBodyClass";
import StructuredData from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const pathname = usePathname();

  // Throwaway design routes use synthetic, in-memory data and should not boot
  // the authenticated storefront shell when local credentials are absent.
  if (pathname.startsWith("/prototype/")) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <main id="main-content" className="flex-grow" role="main" tabIndex={-1}>
          {children}
        </main>
      </ThemeProvider>
    );
  }

  const appShell = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouteBodyClass />
      <StructuredData />
      <ClientNavbar />
      <main id="main-content" className="flex-grow" role="main" tabIndex={-1}>
        {children}
      </main>
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
