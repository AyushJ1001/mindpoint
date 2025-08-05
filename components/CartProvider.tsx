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

  if (!mounted) {
    return null;
  }

  return (
    <UseCartProvider>
      {children}
    </UseCartProvider>
  );
} 