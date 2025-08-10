"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseImageCarousel } from "@/components/CourseTypePage";
import { showRupees } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

export function CourseCard({ course }: { course: Doc<"courses"> }) {
  const { addItem, inCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if course is out of stock
    const seatsLeft = Math.max(
      0,
      (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
    );
    const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price || 100,
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
    });
  };

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <Card
      className="group ring-border/60 h-full cursor-pointer overflow-hidden border-0 shadow-sm ring-1 transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      {/* Course Image */}
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      <CardHeader className="pb-3">
        <CardTitle className="group-hover:text-primary text-base font-semibold transition-colors">
          {course.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
          {showRupees(course.price || 100)}
        </Badge>
        {(() => {
          const seatsLeft = Math.max(
            0,
            (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
          );
          const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

          return (
            <Button
              onClick={handleAddToCart}
              disabled={inCart(course._id) || isOutOfStock}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isOutOfStock
                ? "Out of Stock"
                : inCart(course._id)
                  ? "Added"
                  : "Add to Cart"}
            </Button>
          );
        })()}
      </CardContent>
    </Card>
  );
}
