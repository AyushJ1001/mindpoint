"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function CourseImageGallery({
  imageUrls,
}: {
  imageUrls: string[];
}) {
  return (
    <div className="bg-muted/20 border-primary/20 relative overflow-hidden rounded-lg border-2">
      <div className="relative aspect-[9/16] w-full">
        {imageUrls.length <= 1 ? (
          <Image
            src={
              imageUrls[0] ??
              "/placeholder.svg?height=1600&width=900&query=course%20image"
            }
            alt="Course image"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            priority
            quality={95}
          />
        ) : (
          <Carousel className="h-full w-full">
            <CarouselContent className="h-full">
              {imageUrls.map((url, i) => (
                <CarouselItem key={i} className="h-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Course image ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      priority={i === 0}
                      quality={95}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-background/90 hover:bg-background absolute top-1/2 left-4 -translate-y-1/2 shadow-lg" />
            <CarouselNext className="bg-background/90 hover:bg-background absolute top-1/2 right-4 -translate-y-1/2 shadow-lg" />
          </Carousel>
        )}
      </div>
    </div>
  );
}
