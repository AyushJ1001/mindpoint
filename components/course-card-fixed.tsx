"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseImageCarousel } from "@/components/CourseTypePage";
import { showRupees, getOfferDetails, getCoursePrice } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { BogoSelectionModal } from "@/components/bogo-selection-modal";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const [offerDetails, setOfferDetails] = useState(getOfferDetails(course));
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    course.bogo?.enabled && course.type ? { courseType: course.type } : "skip",
  );

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update offer details every minute for real-time countdown
  useEffect(() => {
    const updateOfferDetails = () => {
      setOfferDetails(getOfferDetails(course));
    };

    updateOfferDetails();
    const interval = setInterval(updateOfferDetails, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [course]);

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

    // Check if BOGO is active and there are other courses of the same type
    // Only check BOGO if availableCourses has loaded and there are selectable courses
    if (
      offerDetails?.hasBogo &&
      availableCourses &&
      availableCourses.length > 0
    ) {
      // Filter out the source course to get only selectable courses
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== course._id,
      );
      if (selectableCourses.length > 0) {
        // There are other courses available, show BOGO modal
        setShowBogoModal(true);
        return;
      }
      // No other courses of same type with BOGO, proceed normally without BOGO
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: getCoursePrice(course),
      originalPrice: course.price, // Store original price for discount calculations
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
      offer: course.offer, // Store discount offer data in cart item
      bogo: course.bogo, // Store BOGO data in cart item
      courseType: course.type,
    });
  };

  const handleBogoSelection = (selectedCourseId: Id<"courses">) => {
    // Find the selected course from available courses
    const selectedFreeCourse = availableCourses?.find(
      (course) => course._id === selectedCourseId,
    );

    // Validate that the selected course exists
    if (!selectedFreeCourse) {
      console.error(
        "Selected course not found in available courses:",
        selectedCourseId,
      );
      return; // Don't add to cart if course doesn't exist
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: getCoursePrice(course),
      originalPrice: course.price, // Store original price for discount calculations
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1,
      offer: course.offer,
      bogo: course.bogo,
      courseType: course.type,
      selectedFreeCourse: {
        id: selectedFreeCourse._id,
        name: selectedFreeCourse.name,
        description:
          selectedFreeCourse.description ||
          "Free course selected via BOGO offer",
        price: 0,
        originalPrice: selectedFreeCourse.price, // Store original price for the free course
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    // Close the modal after successful selection
    setShowBogoModal(false);
  };

  const handleCardClick = () => {
    // Don't navigate if BOGO modal is open
    if (showBogoModal) {
      return;
    }
    router.push(`/courses/${course._id}`);
  };

  const displayPrice = getCoursePrice(course);

  return (
    <Card
      className="group ring-border/60 dark:ring-oklch(0.2_0.02_240) h-full cursor-pointer overflow-hidden border-0 shadow-sm ring-1 transition-all hover:shadow-md dark:shadow-lg dark:shadow-black/30 dark:hover:shadow-xl dark:hover:shadow-black/40"
      onClick={handleCardClick}
    >
      {/* Course Image */}
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      {(offerDetails?.hasDiscount || offerDetails?.hasBogo) && (
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
          {offerDetails?.hasDiscount && (
            <Badge
              variant="destructive"
              className="animate-pulse bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
            >
              🔥 {offerDetails.discountPercentage}% OFF
            </Badge>
          )}
          {offerDetails?.hasBogo && (
            <Badge className="bg-emerald-500/90 text-xs font-semibold text-white uppercase shadow-lg">
              🛍️ BOGO
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="group-hover:text-primary text-base font-semibold transition-colors">
          {course.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <div className="space-y-1">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-semibold"
          >
            {showRupees(displayPrice)}
          </Badge>
          {offerDetails && (
            <div className="space-y-1 text-xs">
              {offerDetails.hasDiscount && (
                <div className="text-muted-foreground">
                  <span className="line-through">
                    {showRupees(offerDetails.originalPrice)}
                  </span>
                </div>
              )}
              <div
                className={`font-medium ${offerDetails.hasBogo ? "text-emerald-600" : "text-orange-600"}`}
              >
                {offerDetails.timeLeft.days > 0 &&
                  `${offerDetails.timeLeft.days}d `}
                {offerDetails.timeLeft.hours > 0 &&
                  `${offerDetails.timeLeft.hours}h `}
                {offerDetails.timeLeft.minutes > 0 &&
                  `${offerDetails.timeLeft.minutes}m`}{" "}
                left
              </div>
            </div>
          )}
          {offerDetails?.hasBogo && (
            <div className="text-xs font-semibold text-emerald-600">
              Includes a free bonus enrollment
            </div>
          )}
        </div>
        {(() => {
          const seatsLeft = Math.max(
            0,
            (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
          );
          const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

          // Use mounted state to prevent hydration mismatch
          const isInCart = mounted ? inCart(course._id) : false;

          return (
            <Button
              onClick={handleAddToCart}
              disabled={isInCart || isOutOfStock}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isOutOfStock
                ? "Out of Stock"
                : isInCart
                  ? "Added"
                  : "Add to Cart"}
            </Button>
          );
        })()}
      </CardContent>

      {/* BOGO Selection Modal */}
      {offerDetails?.hasBogo && course.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={course.type}
          sourceCourseId={course._id}
          sourceCourseName={course.name}
        />
      )}
    </Card>
  );
}

export function UpcomingCourseCard({ course }: { course: Doc<"courses"> }) {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [offerDetails, setOfferDetails] = useState(getOfferDetails(course));
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    course.bogo?.enabled && course.type ? { courseType: course.type } : "skip",
  );

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update offer details every minute for real-time countdown
  useEffect(() => {
    const updateOfferDetails = () => {
      setOfferDetails(getOfferDetails(course));
    };

    updateOfferDetails();
    const interval = setInterval(updateOfferDetails, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [course]);

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

    // Check if BOGO is active and there are other courses of the same type
    // Only check BOGO if availableCourses has loaded and there are selectable courses
    if (
      offerDetails?.hasBogo &&
      availableCourses &&
      availableCourses.length > 0
    ) {
      // Filter out the source course to get only selectable courses
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== course._id,
      );
      if (selectableCourses.length > 0) {
        // There are other courses available, show BOGO modal
        setShowBogoModal(true);
        return;
      }
      // No other courses of same type with BOGO, proceed normally without BOGO
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: getCoursePrice(course),
      originalPrice: course.price, // Store original price for discount calculations
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1,
      offer: course.offer,
      bogo: course.bogo,
      courseType: course.type,
    });
  };

  const handleBogoSelection = (selectedCourseId: Id<"courses">) => {
    // Find the selected course from available courses
    const selectedFreeCourse = availableCourses?.find(
      (course) => course._id === selectedCourseId,
    );

    // Validate that the selected course exists
    if (!selectedFreeCourse) {
      console.error(
        "Selected course not found in available courses:",
        selectedCourseId,
      );
      return; // Don't add to cart if course doesn't exist
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: getCoursePrice(course),
      originalPrice: course.price, // Store original price for discount calculations
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1,
      offer: course.offer,
      bogo: course.bogo,
      courseType: course.type,
      selectedFreeCourse: {
        id: selectedFreeCourse._id,
        name: selectedFreeCourse.name,
        description:
          selectedFreeCourse.description ||
          "Free course selected via BOGO offer",
        price: 0,
        originalPrice: selectedFreeCourse.price, // Store original price for the free course
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    // Close the modal after successful selection
    setShowBogoModal(false);
  };

  const handleCardClick = () => {
    // Don't navigate if BOGO modal is open
    if (showBogoModal) {
      return;
    }
    router.push(`/courses/${course._id}`);
  };

  const timeUntilStart = getTimeUntilStart(course.startDate || "");
  const formattedDate = formatDate(course.startDate || "");
  const displayPrice = getCoursePrice(course);

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

      {(offerDetails?.hasDiscount || offerDetails?.hasBogo) && (
        <div className="pointer-events-none absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
          {offerDetails?.hasDiscount && (
            <Badge
              variant="destructive"
              className="animate-pulse bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
            >
              🔥 {offerDetails.discountPercentage}% OFF
            </Badge>
          )}
          {offerDetails?.hasBogo && (
            <Badge className="bg-emerald-500/90 text-xs font-semibold text-white uppercase shadow-lg">
              🛍️ BOGO
            </Badge>
          )}
        </div>
      )}

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

      <CardContent className="pt-0 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1 pr-3">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-semibold"
            >
              {showRupees(displayPrice)}
            </Badge>
            {offerDetails && (
              <div className="space-y-1 text-xs">
                {offerDetails.hasDiscount && (
                  <div className="text-muted-foreground">
                    <span className="line-through">
                      {showRupees(offerDetails.originalPrice)}
                    </span>
                  </div>
                )}
                <div
                  className={`font-medium ${offerDetails.hasBogo ? "text-emerald-600" : "text-orange-600"}`}
                >
                  {offerDetails.timeLeft.days > 0 &&
                    `${offerDetails.timeLeft.days}d `}
                  {offerDetails.timeLeft.hours > 0 &&
                    `${offerDetails.timeLeft.hours}h `}
                  {offerDetails.timeLeft.minutes > 0 &&
                    `${offerDetails.timeLeft.minutes}m`}{" "}
                  left
                </div>
              </div>
            )}
            {offerDetails?.hasBogo && (
              <div className="text-xs font-semibold text-emerald-600">
                Includes a free bonus enrollment
              </div>
            )}
          </div>
          {(() => {
            const seatsLeft = Math.max(
              0,
              (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
            );
            const isOutOfStock =
              (course.capacity ?? 0) === 0 || seatsLeft === 0;

            // Use mounted state to prevent hydration mismatch
            const isInCart = mounted ? inCart(course._id) : false;

            return (
              <Button
                onClick={handleAddToCart}
                disabled={isInCart || isOutOfStock}
                size="sm"
                className="relative z-10 shrink-0 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isOutOfStock
                  ? "Out of Stock"
                  : isInCart
                    ? "Added"
                    : "Enroll Now"}
              </Button>
            );
          })()}
        </div>
      </CardContent>

      {/* BOGO Selection Modal */}
      {offerDetails?.hasBogo && course.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={course.type}
          sourceCourseId={course._id}
          sourceCourseName={course.name}
        />
      )}
    </Card>
  );
}
