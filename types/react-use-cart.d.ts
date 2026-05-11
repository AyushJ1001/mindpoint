import type { ExtendedCartItem } from "@/lib/domain/cart";

declare module "react-use-cart" {
  interface Item extends Omit<ExtendedCartItem, "id" | "price" | "quantity"> {}
}
