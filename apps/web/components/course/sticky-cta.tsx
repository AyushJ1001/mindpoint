"use client";

import { Button } from "@/components/ui/button";

export default function StickyCTA({
  price,
  onPrimary,
  onBuyNow,
  disabled,
  inCart,
  quantity,
  isOutOfStock,
}: {
  price: number;
  onPrimary: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  inCart?: boolean;
  quantity?: number;
  isOutOfStock?: boolean;
}) {
  return (
    <div
      className="bg-card/95 sticky bottom-0 left-0 z-30 border-t border-border backdrop-blur-md md:left-[var(--sidebar-width,0px)]"
      style={{
        right: "0",
        marginLeft: "0",
      }}
    >
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex flex-col items-center gap-3 py-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">Ready?</span>
            <span className="text-foreground text-xl font-semibold">
              \u20B9{price.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              onClick={onPrimary}
              disabled={disabled || isOutOfStock}
              className="w-full sm:w-auto"
            >
              {isOutOfStock
                ? "Currently full"
                : inCart
                  ? quantity && quantity > 1
                    ? `In your cart (${quantity})`
                    : "In your cart"
                  : "Add to your cart"}
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={onBuyNow}
              disabled={isOutOfStock}
            >
              Go to checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
