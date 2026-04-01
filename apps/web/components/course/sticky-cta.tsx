"use client";

import { useEffect, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const pricingSection = document.getElementById("pricing");
    if (!pricingSection) {
      // If no pricing section found, always show
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when pricing section is NOT visible (scrolled past it)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -100px 0px" },
    );

    observer.observe(pricingSection);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4 sm:px-6 md:px-8">
      <div className="pointer-events-auto mx-auto max-w-4xl">
        <div className="border-border/70 bg-background/84 rounded-[1.7rem] border px-4 py-3 shadow-[0_18px_45px_-30px_rgb(45_42_55/0.35)] backdrop-blur-xl">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">
                A gentle next step
              </span>
              <span className="text-foreground text-xl font-semibold">
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
                  ? "Currently full"
                  : inCart
                    ? quantity && quantity > 1
                      ? `In your cart (${quantity})`
                      : "In your cart"
                    : "Reserve your spot"}
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
    </div>
  );
}
