"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { CartProvider } from "@/components/CartProvider";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <CartProvider>{children}</CartProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
