"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type CourseImageCarouselProps = {
  imageUrls?: string[];
  variant?: "card" | "hero";
  className?: string;
};

const variantStyles = {
  card: {
    frame: "bg-muted relative overflow-hidden rounded-t-2xl",
    placeholder: "h-56 sm:h-72",
    viewport: "h-56 sm:h-72",
    slide: "h-56 sm:h-72",
    image: "max-h-full max-w-full object-contain",
    previous:
      "absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70",
    next: "absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70",
  },
  hero: {
    frame: "relative overflow-hidden rounded-[inherit]",
    placeholder:
      "flex aspect-[4/3] items-center justify-center sm:aspect-[5/4]",
    viewport: "aspect-[4/3] sm:aspect-[5/4]",
    slide: "aspect-[4/3] sm:aspect-[5/4]",
    image: "h-full w-full object-contain p-4 sm:p-6",
    previous:
      "absolute top-1/2 left-3 h-10 w-10 -translate-y-1/2 rounded-full border-white/40 bg-white/85 text-foreground shadow-lg hover:bg-white",
    next: "absolute top-1/2 right-3 h-10 w-10 -translate-y-1/2 rounded-full border-white/40 bg-white/85 text-foreground shadow-lg hover:bg-white",
  },
} as const;

export function CourseImageCarousel({
  imageUrls = [],
  variant = "card",
  className,
}: CourseImageCarouselProps) {
  const styles = variantStyles[variant];
  const resolvedImageUrls = imageUrls.filter(Boolean);

  const stopEvent = (event: React.SyntheticEvent) => {
    if (variant === "card") {
      event.stopPropagation();
    }
  };

  if (resolvedImageUrls.length === 0) {
    return (
      <div
        className={cn(styles.frame, styles.placeholder, className)}
        onClick={stopEvent}
      >
        <BookOpen
          className="text-muted-foreground h-12 w-12"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (resolvedImageUrls.length === 1) {
    return (
      <div className={cn(styles.frame, className)} onClick={stopEvent}>
        <div
          className={cn(
            "relative flex items-center justify-center",
            styles.placeholder,
          )}
        >
          <Image
            src={resolvedImageUrls[0] ?? "/placeholder.svg"}
            alt="Course image"
            fill={variant === "hero"}
            width={variant === "card" ? 400 : undefined}
            height={variant === "card" ? 600 : undefined}
            priority={variant === "hero"}
            sizes={
              variant === "hero"
                ? "(max-width: 768px) 100vw, 72vw"
                : "(max-width: 768px) 100vw, 400px"
            }
            className={styles.image}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.frame, className)} onClick={stopEvent}>
      <Carousel className="h-full w-full">
        <CarouselContent className={cn("ml-0", styles.viewport)}>
          {resolvedImageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={`${imageUrl}-${index}`}
              className={cn("pl-0", styles.slide)}
            >
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={`Course image ${index + 1}`}
                  fill={variant === "hero"}
                  width={variant === "card" ? 400 : undefined}
                  height={variant === "card" ? 600 : undefined}
                  priority={index === 0}
                  sizes={
                    variant === "hero"
                      ? "(max-width: 768px) 100vw, 72vw"
                      : "(max-width: 768px) 100vw, 400px"
                  }
                  className={styles.image}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={styles.previous} />
        <CarouselNext className={styles.next} />
      </Carousel>
    </div>
  );
}
