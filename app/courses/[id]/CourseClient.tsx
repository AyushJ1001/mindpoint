"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import StickyCTA from "@/components/course/sticky-cta";
import CourseTypeRenderer from "@/components/course/CourseTypeRenderer";
import CourseHero from "@/components/course/course-hero";
import CountdownTimer from "@/components/course/countdown-timer";
import CourseOverview from "@/components/course/course-overview";
import { BogoSelectionModal } from "@/components/bogo-selection-modal";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  getOfferDetails,
  getCoursePrice,
  hasActivePromotion,
} from "@/lib/utils";

type CourseVariant = Doc<"courses">;

// Type for courses with sessions (therapy)
interface TherapyCourse extends Doc<"courses"> {
  sessions?: number;
}

// Type for courses with duration (internship)
interface InternshipCourse extends Doc<"courses"> {
  duration?: string;
}

export default function CourseClient({
  course,
  variants = [],
}: {
  course: Doc<"courses">;
  variants?: CourseVariant[];
}) {
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<Doc<"courses">>(course);
  const [customDuration, setCustomDuration] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setActiveCourse(course);
  }, [course]);

  // Update customDuration when activeCourse changes (for live updates)
  useEffect(() => {
    if (activeCourse && activeCourse.duration) {
      setCustomDuration(activeCourse.duration);
    } else {
      // Reset customDuration if no course duration is set
      setCustomDuration(undefined);
    }
  }, [activeCourse]);

  const { addItem, inCart, updateItemQuantity, removeItem, items } = useCart();

  // State for buy now dialog
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);

  // State for BOGO modal
  const [showBogoModal, setShowBogoModal] = useState(false);

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    course.bogo?.enabled && course.type ? { courseType: course.type } : "skip",
  );

  // Handle BOGO selection
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
      originalPrice: course.price,
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
        imageUrls: selectedFreeCourse.imageUrls || [],
      },
    });

    // Close the modal after successful selection
    setShowBogoModal(false);
  };

  // Helper function to get current quantity of a course in cart
  const getCurrentQuantity = (courseId: string) => {
    const cartItem = items.find((item) => item.id === courseId);
    return cartItem?.quantity || 0;
  };

  // Helper function to handle buy now
  const handleBuyNow = (course: Doc<"courses">) => {
    // Check if cart has any items (including this course)
    if (items.length > 0) {
      // Cart has items, show confirmation dialog
      setShowBuyNowDialog(true);
    } else {
      // Cart is empty, proceed directly
      handleBuyNowConfirm(course);
    }
  };

  // Helper function to confirm buy now action
  const handleBuyNowConfirm = (course: Doc<"courses">) => {
    // Use utility function to get the correct price
    const priceToUse = getCoursePrice(course);

    // Remove all items from cart except the current course
    items.forEach((item) => {
      if (item.id !== course._id) {
        removeItem(item.id);
      }
    });

    // If the current course is not in cart, add it
    if (!inCart(course._id)) {
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: priceToUse,
        originalPrice: course.price, // Store original price for discount calculations
        imageUrls: course.imageUrls || [],
        capacity: course.capacity || 1,
        quantity: 1,
        offer: course.offer,
        bogo: course.bogo,
      });
    } else {
      // If it's already in cart, ensure it has the correct price and quantity
      updateItemQuantity(course._id, 1);
    }

    // Navigate to cart
    router.push("/cart");
  };

  // Helper function to handle quantity increase
  const handleIncreaseQuantity = (course: Doc<"courses">) => {
    const currentQuantity = getCurrentQuantity(course._id);
    const maxQuantity = course.capacity || 1;

    // Use utility function to get the correct price
    const priceToUse = getCoursePrice(course);

    // Check if BOGO is active and there are other courses of the same type
    if (offerDetails?.hasBogo && course.bogo?.enabled) {
      // Check if there are other courses of the same type with BOGO enabled
      if (availableCourses && availableCourses.length > 1) {
        // There are other courses available, show BOGO modal
        setShowBogoModal(true);
        return;
      }
      // No other courses of same type with BOGO, proceed normally without BOGO
    }

    if (currentQuantity === 0) {
      // Add to cart if not already there
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: priceToUse,
        originalPrice: course.price, // Store original price for discount calculations
        imageUrls: course.imageUrls || [],
        capacity: course.capacity || 1,
        quantity: 1, // Explicitly set initial quantity to 1
        offer: course.offer,
        bogo: course.bogo,
        courseType: course.type,
      });
    } else if (currentQuantity < maxQuantity) {
      // Increase quantity if below capacity
      updateItemQuantity(course._id, currentQuantity + 1);
    }
  };

  // Helper function to handle quantity decrease
  const handleDecreaseQuantity = (course: Doc<"courses">) => {
    const currentQuantity = getCurrentQuantity(course._id);

    if (currentQuantity > 1) {
      updateItemQuantity(course._id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeItem(course._id);
    }
  };

  const seatsLeft = Math.max(
    0,
    (course.capacity ?? 0) - (course.enrolledUsers?.length ?? 0),
  );

  // Check if course is out of stock (capacity 0 or no seats left)
  const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

  // Build variant options only for internship or therapy
  const normalizedVariants: CourseVariant[] = useMemo(() => {
    const sameGroup = variants
      .filter((v) => v.name === course.name && v.type === course.type)
      .concat([]);
    // Ensure current course is included
    const present = sameGroup.some((v) => v._id === course._id);
    if (!present) sameGroup.push(course);
    // Sort by sessions (therapy) or duration/price
    if (course.type === "therapy") {
      sameGroup.sort((a, b) => {
        const as = (a as TherapyCourse).sessions ?? 0;
        const bs = (b as TherapyCourse).sessions ?? 0;
        return as - bs || (a.price ?? 0) - (b.price ?? 0);
      });
    } else if (course.type === "internship") {
      // Try to sort by duration if present, else by price
      const parseWeeks = (d?: string) => {
        if (!d) return Number.MAX_SAFE_INTEGER;
        const m = d.match(/(\d+)\s*week/i);
        return m ? Number.parseInt(m[1]!, 10) : Number.MAX_SAFE_INTEGER;
      };
      sameGroup.sort((a, b) => {
        const aw = parseWeeks((a as InternshipCourse).duration);
        const bw = parseWeeks((b as InternshipCourse).duration);
        if (aw !== bw) return aw - bw;
        return (a.price ?? 0) - (b.price ?? 0);
      });
    }
    return sameGroup;
  }, [variants, course]);

  const shouldShowVariantSelect =
    (course.type === "therapy" || course.type === "internship") &&
    normalizedVariants.length > 1;

  const variantLabel = (v: CourseVariant): string => {
    if (course.type === "therapy") {
      const s = (v as TherapyCourse).sessions;
      if (typeof s === "number" && s > 0) {
        return `${s} ${s === 1 ? "session" : "sessions"}`;
      }
    }
    if (course.type === "internship") {
      const d = (v as InternshipCourse).duration;
      if (d && d.trim()) {
        return d.trim();
      }
      // Fallbacks for internships
      const m =
        v.name.match(/(\d+\s*weeks?)/i) ||
        (v.description ?? "").match(/(\d+\s*weeks?)/i);
      if (m) {
        return m[1]!;
      }
    }
    // Generic fallback
    if (
      typeof (v as InternshipCourse).duration === "string" &&
      (v as InternshipCourse).duration
    ) {
      return (v as InternshipCourse).duration!;
    }
    if (typeof (v as TherapyCourse).sessions === "number") {
      const s = (v as TherapyCourse).sessions;
      return `${s} ${s === 1 ? "session" : "sessions"}`;
    }
    // Default fallback - ensure we always return a string
    return "Option";
  };

  const displayCourse = activeCourse ?? course;

  // Check if course has a valid offer using utility function
  const hasValidOffer = useMemo(() => {
    return hasActivePromotion({
      offer: displayCourse.offer ?? null,
      bogo: displayCourse.bogo ?? null,
    });
  }, [displayCourse.offer, displayCourse.bogo]);

  // Calculate offer details using utility function
  const offerDetails = useMemo(() => {
    return getOfferDetails(displayCourse);
  }, [displayCourse]);

  const handleVariantSelect = (val: string) => {
    if (!val) return;
    if ((displayCourse._id as unknown as string) === val) return;
    const target = normalizedVariants.find(
      (v) => (v._id as unknown as string) === val,
    );
    if (target) {
      // Instantly update UI client-side
      setActiveCourse(target);
      // Update customDuration immediately for live updates
      if (target.duration) {
        setCustomDuration(target.duration);
      }
      // Update URL without full navigation to avoid white flash
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/courses/${val}`);
      }
    } else {
      router.replace(`/courses/${val}`, { scroll: false });
    }
  };

  // Function to get gradient background based on course type
  const getCourseTypeGradient = (courseType: string) => {
    switch (courseType) {
      case "certificate":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "internship":
        return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "therapy":
        return "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "diploma":
        return "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "pre-recorded":
        return "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "masterclass":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "supervised":
        return "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      case "resume-studio":
        return "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
      default:
        return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-oklch(0.08_0.02_240) dark:to-oklch(0.12_0.02_240)";
    }
  };

  // Function to get gradient background for sticky section with proper opacity
  const getStickyGradient = (courseType: string) => {
    switch (courseType) {
      case "certificate":
        return "!bg-gradient-to-br !from-blue-50 !to-indigo-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "internship":
        return "!bg-gradient-to-br !from-green-50 !to-emerald-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "therapy":
        return "!bg-gradient-to-br !from-pink-50 !to-rose-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "diploma":
        return "!bg-gradient-to-br !from-purple-50 !to-violet-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "pre-recorded":
        return "!bg-gradient-to-br !from-orange-50 !to-amber-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "masterclass":
        return "!bg-gradient-to-br !from-yellow-50 !to-amber-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "supervised":
        return "!bg-gradient-to-br !from-teal-50 !to-cyan-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      case "resume-studio":
        return "!bg-gradient-to-br !from-emerald-50 !to-green-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
      default:
        return "!bg-gradient-to-br !from-blue-50 !to-indigo-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)";
    }
  };

  return (
    <>
      {/* Background gradient that covers the entire courses area */}
      <div
        className={`fixed inset-0 ${getCourseTypeGradient(course.type || "certificate")} -z-10`}
        style={{
          top: "64px", // Below navbar
          bottom: "80px", // Above footer
          left: "0px", // Cover full width including sidebar
          right: "0px",
        }}
      />

      <div className="relative z-10">
        {/* Conditionally render hero section for course types that use it */}
        {course.type !== "therapy" && course.type !== "supervised" && (
          <>
            <CourseHero
              course={activeCourse}
              variants={variants}
              activeCourse={activeCourse}
              setActiveCourse={setActiveCourse}
              hasValidOffer={hasValidOffer}
              offerDetails={offerDetails}
              isOutOfStock={isOutOfStock}
              seatsLeft={seatsLeft}
              shouldShowVariantSelect={shouldShowVariantSelect}
              normalizedVariants={normalizedVariants}
              variantLabel={variantLabel}
              handleVariantSelect={handleVariantSelect}
              handleIncreaseQuantity={handleIncreaseQuantity}
              handleDecreaseQuantity={handleDecreaseQuantity}
              handleBuyNow={handleBuyNow}
              getCurrentQuantity={getCurrentQuantity}
              inCart={inCart}
              removeItem={removeItem}
              customDuration={customDuration}
            />

            <Separator className="my-8" />

            {/* Only show countdown timer for non-pre-recorded courses */}
            {course.type !== "pre-recorded" && (
              <CountdownTimer
                course={activeCourse}
                customDuration={customDuration}
              />
            )}

            <CourseOverview description={course.description ?? ""} />
          </>
        )}

        {/* Course Type Specific Sections */}
        <CourseTypeRenderer
          course={course}
          variants={variants}
          onVariantSelect={(hours) => {
            // Sort variants by price (ascending) - lower price = 120 hours, higher price = 240 hours
            const sortedVariants = [...normalizedVariants].sort(
              (a, b) => (a.price || 0) - (b.price || 0),
            );

            let targetVariant;
            if (hours === 120) {
              // Select the lower-priced variant for 120 hours
              targetVariant = sortedVariants[0];
            } else if (hours === 240) {
              // Select the higher-priced variant for 240 hours
              targetVariant = sortedVariants[sortedVariants.length - 1];
            }

            if (targetVariant) {
              // Select the variant using the existing handler
              handleVariantSelect(targetVariant._id as unknown as string);
            }
          }}
        />

        {/* Buy Now Confirmation Dialog */}
        <Dialog open={showBuyNowDialog} onOpenChange={setShowBuyNowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cart Already Has Items</DialogTitle>
              <DialogDescription>
                Your cart currently contains items. Would you like to:
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBuyNowDialog(false);
                  handleBuyNowConfirm(displayCourse);
                }}
                className="w-full sm:w-auto"
              >
                Buy Only This Course
              </Button>
              <Button
                onClick={() => {
                  setShowBuyNowDialog(false);
                  // If course is not in cart, add it; if it is, just proceed to checkout
                  if (!inCart(displayCourse._id)) {
                    handleIncreaseQuantity(displayCourse);
                  }
                  router.push("/cart");
                }}
                className="w-full sm:w-auto"
              >
                Keep All Items
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* BOGO Selection Modal */}
        {course.bogo?.enabled && course.type && (
          <BogoSelectionModal
            isOpen={showBogoModal}
            onClose={() => setShowBogoModal(false)}
            onSelect={handleBogoSelection}
            courseType={course.type}
            sourceCourseId={course._id}
            sourceCourseName={course.name}
          />
        )}

        {/* Sticky CTA */}
        <StickyCTA
          price={getCoursePrice(activeCourse)}
          onPrimary={() => handleIncreaseQuantity(activeCourse)}
          onBuyNow={() => handleBuyNow(activeCourse)}
          disabled={
            isOutOfStock ||
            (inCart(activeCourse._id) &&
              getCurrentQuantity(activeCourse._id) >=
                (activeCourse.capacity || 1))
          }
          inCart={inCart(activeCourse._id)}
          quantity={getCurrentQuantity(activeCourse._id)}
          isOutOfStock={isOutOfStock}
          gradientClass={getStickyGradient(activeCourse.type || "certificate")}
        />
      </div>
    </>
  );
}
