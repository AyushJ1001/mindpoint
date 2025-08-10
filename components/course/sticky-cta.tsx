"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function StickyCTA({
  price,
  onPrimary,
  disabled,
  inCart,
  quantity,
  isOutOfStock,
}: {
  price: number;
  onPrimary: () => void;
  disabled?: boolean;
  inCart?: boolean;
  quantity?: number;
  isOutOfStock?: boolean;
}) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-30 border-t backdrop-blur">
      <div className="container">
        <div className="flex flex-col items-center gap-3 py-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              Your selection
            </span>
            <span className="text-primary text-xl font-semibold">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              onClick={onPrimary}
              disabled={disabled || isOutOfStock}
              className="w-full sm:w-auto"
            >
              {isOutOfStock
                ? "Out of Stock"
                : inCart
                  ? quantity && quantity > 1
                    ? `In cart (${quantity})`
                    : "Added to cart"
                  : "Add to cart"}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-4 w-4" /> Buy now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
