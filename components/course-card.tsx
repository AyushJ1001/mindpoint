"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseImageCarousel } from "@/components/CourseTypePage";
import { showRupees } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Helper function to get time until start date
const getTimeUntilStart = (dateString: string) => {
  try {
    const startDate = new Date(dateString);
    const now = new Date();
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Started";
    if (diffDays === 0) return "Starts today";
    if (diffDays === 1) return "Starts tomorrow";
    if (diffDays < 7) return `Starts in ${diffDays} days`;
    if (diffDays < 30) return `Starts in ${Math.ceil(diffDays / 7)} weeks`;
    return `Starts in ${Math.ceil(diffDays / 30)} months`;
  } catch {
    return "Date TBD";
  }
};

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
      className="group ring-border/60 dark:ring-oklch(0.2_0.02_240) h-full cursor-pointer overflow-hidden border-0 shadow-sm ring-1 transition-all hover:shadow-md dark:shadow-lg dark:shadow-black/30 dark:hover:shadow-xl dark:hover:shadow-black/40"
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

export function UpcomingCourseCard({ course }: { course: Doc<"courses"> }) {
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
      quantity: 1,
    });
  };

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  const timeUntilStart = getTimeUntilStart(course.startDate || "");
  const formattedDate = formatDate(course.startDate || "");

  return (
    <Card
      className="group ring-border/60 dark:ring-oklch(0.2_0.02_240) relative h-full cursor-pointer overflow-hidden border-0 shadow-sm ring-1 transition-all hover:scale-[1.02] hover:shadow-lg dark:shadow-lg dark:shadow-black/30 dark:hover:shadow-xl dark:hover:shadow-black/40"
      onClick={handleCardClick}
    >
      {/* Upcoming badge */}
      <div className="pointer-events-none absolute top-3 left-3 z-20">
        <Badge
          variant="default"
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
        >
          <Clock className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      </div>

      {/* Course Image */}
      <div className="pointer-events-none">
        <CourseImageCarousel imageUrls={course.imageUrls || []} />
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors group-hover:underline">
          {course.name}
        </CardTitle>

        {/* Start Date Information */}
        <div className="mt-2 space-y-1">
          <div className="text-muted-foreground flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
            {timeUntilStart}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-semibold"
          >
            {showRupees(course.price || 100)}
          </Badge>
          {(() => {
            const seatsLeft = Math.max(
              0,
              (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
            );
            const isOutOfStock =
              (course.capacity ?? 0) === 0 || seatsLeft === 0;

            return (
              <Button
                onClick={handleAddToCart}
                disabled={inCart(course._id) || isOutOfStock}
                size="sm"
                className="relative z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isOutOfStock
                  ? "Out of Stock"
                  : inCart(course._id)
                    ? "Added"
                    : "Enroll Now"}
              </Button>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
