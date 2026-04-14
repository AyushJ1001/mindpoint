"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse, PublicCourseBatch } from "@mindpoint/backend";
import { Id } from "@mindpoint/backend/data-model";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import CourseHero from "@/components/course/course-hero";
import CourseStorySection from "@/components/course/course-story-section";
import WhyDifferentSection from "@/components/course/why-different-section";
import SimpleModulesSection from "@/components/course/simple-modules-section";
import PricingSection from "@/components/course/pricing-section";
import CuratedQuotesSection from "@/components/course/curated-quotes-section";
import ReviewsSection from "@/components/course/reviews-section";
import FAQSection from "@/components/course/faq-section";
import CommunitiesSection from "@/components/course/communities-section";
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";
import StickyCTA from "@/components/course/sticky-cta";
import { BogoSelectionModal } from "@/components/bogo-selection-modal";
import {
  getOfferDetails,
  getCoursePrice,
  hasActivePromotion,
} from "@/lib/utils";

type CourseVariant = PublicCourse;

// Type for courses with sessions (therapy)
interface TherapyCourse extends PublicCourse {
  sessions?: number;
}

// Type for courses with duration (internship)
interface InternshipCourse extends PublicCourse {
  duration?: string;
}

export default function CourseClient({
  course,
  variants = [],
  batches = [],
}: {
  course: PublicCourse;
  variants?: CourseVariant[];
  batches?: PublicCourseBatch[];
}) {
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<PublicCourse>(course);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActiveCourse(course);
  }, [course]);

  useEffect(() => {
    const firstPurchasable = batches.find((batch) => batch.isPurchasable);
    const fallbackBatch = batches[0];
    const nextBatch = firstPurchasable ?? fallbackBatch;
    setSelectedBatchId(nextBatch?._id ? String(nextBatch._id) : "");
  }, [batches]);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const { addItem, inCart, updateItemQuantity, removeItem, items } = useCart();

  // State for buy now dialog
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);

  // State for BOGO modal
  const [showBogoModal, setShowBogoModal] = useState(false);

  const displayCourse = activeCourse ?? course;
  const selectedBatch = useMemo(
    () => batches.find((batch) => String(batch._id) === selectedBatchId),
    [batches, selectedBatchId],
  );

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    displayCourse.bogo?.enabled && displayCourse.type
      ? { courseType: displayCourse.type }
      : "skip",
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
      id: displayCourse._id,
      courseId: displayCourse._id,
      batchId: selectedBatch?._id,
      batchCode: selectedBatch?.batchCode,
      batchLabel: selectedBatch?.label,
      name: displayCourse.name,
      description: displayCourse.description,
      price: getCoursePrice(displayCourse),
      originalPrice: displayCourse.price,
      imageUrls: displayCourse.imageUrls || [],
      capacity: displayCourse.capacity || 1,
      quantity: 1,
      offer: displayCourse.offer,
      bogo: displayCourse.bogo,
      courseType: displayCourse.type,
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

  // Helper function to get current quantity of a course in cart
  const getCurrentQuantity = (courseId: string) => {
    const cartItem = items.find((item) => item.id === courseId);
    return cartItem?.quantity || 0;
  };

  // Helper function to handle buy now
  const handleBuyNow = (course: PublicCourse) => {
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
  const handleBuyNowConfirm = (course: PublicCourse) => {
    const effectiveBatch = selectedBatch;
    if (batches.length > 0 && !effectiveBatch) {
      return;
    }

    // Use utility function to get the correct price
    const priceToUse = getCoursePrice(course);

    // Remove all items from cart except the current course
    items.forEach((item) => {
      if (item.id !== displayCourse._id) {
        removeItem(item.id);
      }
    });

    // If the current course is not in cart, add it
    removeItem(displayCourse._id);
    addItem({
      id: displayCourse._id,
      courseId: displayCourse._id,
      batchId: effectiveBatch?._id,
      batchCode: effectiveBatch?.batchCode,
      batchLabel: effectiveBatch?.label,
      name: displayCourse.name,
      description: displayCourse.description,
      price: priceToUse,
      originalPrice: displayCourse.price, // Store original price for discount calculations
      imageUrls: displayCourse.imageUrls || [],
      capacity: effectiveBatch?.availableSeats ?? (displayCourse.capacity || 1),
      quantity: 1,
      offer: displayCourse.offer,
      bogo: displayCourse.bogo,
    });

    // Navigate to cart
    router.push("/cart");
  };

  // Helper function to handle quantity increase
  const handleIncreaseQuantity = (course: PublicCourse) => {
    const effectiveBatch = selectedBatch;
    if (batches.length > 0 && !effectiveBatch) {
      return;
    }

    const currentQuantity = getCurrentQuantity(course._id);
    const maxQuantity =
      effectiveBatch?.availableSeats ?? (course.capacity || 1);

    // Use utility function to get the correct price
    const priceToUse = getCoursePrice(course);

    // Check if BOGO is active and there are other courses of the same type
    // Only check BOGO if availableCourses has loaded and there are selectable courses
    if (
      offerDetails?.hasBogo &&
      availableCourses &&
      availableCourses.length > 0
    ) {
      // Filter out the source course to get only selectable courses
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== displayCourse._id,
      );
      if (selectableCourses.length > 0) {
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
        courseId: course._id,
        batchId: effectiveBatch?._id,
        batchCode: effectiveBatch?.batchCode,
        batchLabel: effectiveBatch?.label,
        name: course.name,
        description: course.description,
        price: priceToUse,
        originalPrice: course.price, // Store original price for discount calculations
        imageUrls: course.imageUrls || [],
        capacity: effectiveBatch?.availableSeats ?? (course.capacity || 1),
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
  const handleDecreaseQuantity = (course: PublicCourse) => {
    const currentQuantity = getCurrentQuantity(course._id);

    if (currentQuantity > 1) {
      updateItemQuantity(course._id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeItem(course._id);
    }
  };

  const seatsLeft =
    selectedBatch?.availableSeats ??
    Math.max(0, (displayCourse.capacity ?? 0) - (displayCourse.enrolledCount ?? 0));

  // Check if course is out of stock (capacity 0 or no seats left)
  const isOutOfStock =
    batches.length > 0
      ? !selectedBatch || !selectedBatch.isPurchasable || seatsLeft === 0
      : (displayCourse.capacity ?? 0) === 0 || seatsLeft === 0;

  // Build variant options only for internship or therapy
  const normalizedVariants: CourseVariant[] = useMemo(() => {
    const sameGroup = variants
      .filter(
        (v) => v.name === displayCourse.name && v.type === displayCourse.type,
      )
      .concat([]);
    // Ensure current course is included
    const present = sameGroup.some((v) => v._id === displayCourse._id);
    if (!present) sameGroup.push(displayCourse);
    // Sort by sessions (therapy) or duration/price
    if (displayCourse.type === "therapy") {
      sameGroup.sort((a, b) => {
        const as = (a as TherapyCourse).sessions ?? 0;
        const bs = (b as TherapyCourse).sessions ?? 0;
        return as - bs || (a.price ?? 0) - (b.price ?? 0);
      });
    } else if (displayCourse.type === "internship") {
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
  }, [variants, displayCourse]);

  const shouldShowVariantSelect =
    (displayCourse.type === "therapy" || displayCourse.type === "internship") &&
    normalizedVariants.length > 1;

  const variantLabel = (v: CourseVariant): string => {
    if (displayCourse.type === "therapy") {
      const s = (v as TherapyCourse).sessions;
      if (typeof s === "number" && s > 0) {
        return `${s} ${s === 1 ? "session" : "sessions"}`;
      }
    }
    if (displayCourse.type === "internship") {
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
      // Update URL without full navigation to avoid white flash
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/courses/${val}`);
      }
    } else {
      router.replace(`/courses/${val}`, { scroll: false });
    }
  };

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatchId(batchId);
    if (inCart(displayCourse._id)) {
      removeItem(displayCourse._id);
    }
  };

  return (
    <div className="course-page relative overflow-hidden pb-28">
      {/* 1. Hero — emotional hook + badges + CTA */}
      <CourseHero course={displayCourse} />

      {/* 2. Recognition + outcomes */}
      <CourseStorySection course={displayCourse} />

      {/* 3. Why Different */}
      <WhyDifferentSection course={displayCourse} />

      {/* 4. Program Structure */}
      <SimpleModulesSection course={displayCourse} />

      {/* 5. Quote bridge */}
      <CuratedQuotesSection courseType={displayCourse.type} />

      {/* 6. Pricing */}
      <PricingSection
        course={course}
        activeCourse={activeCourse}
        variants={variants}
        isOutOfStock={isOutOfStock}
        seatsLeft={seatsLeft}
        hasValidOffer={hasValidOffer}
        offerDetails={offerDetails}
        batches={batches}
        selectedBatchId={selectedBatchId}
        handleBatchSelect={handleBatchSelect}
        shouldShowVariantSelect={shouldShowVariantSelect}
        normalizedVariants={normalizedVariants}
        variantLabel={variantLabel}
        handleVariantSelect={handleVariantSelect}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleBuyNow={handleBuyNow}
        getCurrentQuantity={getCurrentQuantity}
        inCart={(id) => (mounted ? inCart(id) : false)}
        removeItem={removeItem}
        mounted={mounted}
      />

      {/* 7. Reviews */}
      <ReviewsSection
        courseId={displayCourse._id}
        courseType={displayCourse.type}
      />

      {/* 8. FAQ */}
      {displayCourse.type === "therapy" ? (
        <TherapyFAQSection />
      ) : displayCourse.type === "supervised" ? (
        <SupervisedFAQSection />
      ) : (
        <FAQSection />
      )}

      {/* 9. Community */}
      <CommunitiesSection />

      {/* Buy Now Dialog */}
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

      {/* BOGO Modal */}
      {offerDetails?.hasBogo && displayCourse.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={displayCourse.type}
          sourceCourseId={displayCourse._id}
          sourceCourseName={displayCourse.name}
        />
      )}

      {/* Sticky CTA - visible only after scrolling past pricing */}
      {displayCourse.type !== "worksheet" && (
        <StickyCTA
          price={getCoursePrice(activeCourse)}
          onPrimary={() => handleIncreaseQuantity(activeCourse)}
          onBuyNow={() => handleBuyNow(activeCourse)}
          disabled={
            isOutOfStock ||
            (batches.length > 0 && !selectedBatch) ||
            (inCart(activeCourse._id) &&
              getCurrentQuantity(activeCourse._id) >=
                (selectedBatch?.availableSeats ?? (activeCourse.capacity || 1)))
          }
          inCart={inCart(activeCourse._id)}
          quantity={getCurrentQuantity(activeCourse._id)}
          isOutOfStock={isOutOfStock}
        />
      )}
    </div>
  );
}
