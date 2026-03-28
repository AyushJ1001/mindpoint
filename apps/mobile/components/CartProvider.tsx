import { PropsWithChildren } from "react";
import { CartProvider as UseCartProvider } from "react-use-cart";
import { useAsyncCartStorage } from "@/lib/cart-storage";

export function CartProvider({ children }: PropsWithChildren) {
  return (
    <UseCartProvider storage={useAsyncCartStorage}>
      {children}
    </UseCartProvider>
  );
}
