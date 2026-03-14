"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "md" as const,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" } as const;
  const displayRating = rating;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalfFilled =
          starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;
        return (
          <div key={i} className="relative">
            <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: isFilled ? "100%" : isHalfFilled ? "50%" : "0%" }}
            >
              <Star
                className={cn(sizeClasses[size], "text-yellow-500")}
                fill="currentColor"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InteractiveStarRating({
  rating,
  onRatingChange,
  size = "md" as const,
}: {
  rating: number;
  onRatingChange: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const sizeClasses = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" } as const;
  const displayRating = hoverRating ?? rating;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fullStarValue = i + 1;
        const halfStarValue = i + 0.5;
        return (
          <div key={i} className="relative">
            <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
            <div
              className="absolute inset-0 cursor-pointer overflow-hidden transition-transform hover:scale-110"
              style={{ width: "50%" }}
              onMouseEnter={() => setHoverRating(halfStarValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => onRatingChange(halfStarValue)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  displayRating >= halfStarValue
                    ? "text-yellow-500"
                    : "text-transparent",
                )}
                fill="currentColor"
              />
            </div>
            <div
              className="absolute inset-0 cursor-pointer overflow-hidden transition-transform hover:scale-110"
              style={{ width: "100%", left: "50%" }}
              onMouseEnter={() => setHoverRating(fullStarValue)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => onRatingChange(fullStarValue)}
            >
              <div style={{ transform: "translateX(-50%)" }}>
                <Star
                  className={cn(
                    sizeClasses[size],
                    displayRating >= fullStarValue
                      ? "text-yellow-500"
                      : "text-transparent",
                  )}
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
