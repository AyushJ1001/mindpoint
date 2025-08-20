"use client";

import { CartProvider as UseCartProvider } from "react-use-cart";
import { ReactNode, useState, useEffect } from "react";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render children, but cart functionality will be available after hydration
  return (
    <UseCartProvider>
      <div suppressHydrationWarning={!mounted}>{children}</div>
    </UseCartProvider>
  );
}
