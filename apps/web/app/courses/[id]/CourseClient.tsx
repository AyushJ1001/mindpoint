"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse, PublicCourseBatch } from "@mindpoint/backend";
import { Id } from "@mindpoint/backend/data-model";
import { buildCartItemId } from "@mindpoint/domain/cart";

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
import CourseWhyThisExists from "@/components/course/course-why-this-exists";
import CourseCurriculum from "@/components/course/course-curriculum";
import CourseOutcomes from "@/components/course/course-outcomes";
import PricingSection from "@/components/course/pricing-section";
import CourseFromStudents from "@/components/course/course-from-students";
import CourseTerminalCTA from "@/components/course/course-terminal-cta";
import FAQSection from "@/components/course/faq-section";
import CourseFooterNote from "@/components/course/course-footer-note";
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import SupervisedFAQSection from "@/components/therapy/supervised-faq-section";
import { LeafAccent, WaveDivider } from "@/components/illustrations";
import { BogoSelectionModal } from "@/components/bogo-selection-modal";
import {
  getOfferDetails,
  getCoursePrice,
  hasActivePromotion,
} from "@/lib/utils";
import { getEnrolledCount } from "@/lib/course-enrollment";
import { toast } from "sonner";

type CourseVariant = PublicCourse;

interface TherapyCourse extends PublicCourse {
  sessions?: number;
}

interface InternshipCourse extends PublicCourse {
  duration?: string;
}

export default function CourseClient({
  course,
  variants = [],
  batches = [],
  selectedBatch = null,
}: {
  course: PublicCourse;
  variants?: CourseVariant[];
  batches?: PublicCourseBatch[];
  selectedBatch?: PublicCourseBatch | null;
}) {
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<PublicCourse>(course);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    selectedBatch?._id ?? null,
  );
  const [mounted, setMounted] = useState(false);
  const usesBatches = Boolean(course.usesBatches);

  useEffect(() => {
    setActiveCourse(course);
  }, [course]);

  useEffect(() => {
    setSelectedBatchId(selectedBatch?._id ?? null);
  }, [selectedBatch?._id, course._id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { addItem, inCart, updateItemQuantity, removeItem, items } = useCart();

  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [showBogoModal, setShowBogoModal] = useState(false);

  const activeBatch = useMemo(() => {
    if (!usesBatches) return null;
    return (
      batches.find((batch) => batch._id === selectedBatchId) ??
      selectedBatch ??
      course.nextAvailableBatch ??
      batches[0] ??
      null
    );
  }, [
    batches,
    course.nextAvailableBatch,
    selectedBatch,
    selectedBatchId,
    usesBatches,
  ]);

  const displayCourse = useMemo(() => {
    const baseCourse = activeCourse ?? course;
    if (!usesBatches || !activeBatch) return baseCourse;
    return {
      ...baseCourse,
      capacity: activeBatch.capacity,
      daysOfWeek: activeBatch.daysOfWeek,
      endDate: activeBatch.endDate,
      endTime: activeBatch.endTime,
      enrolledCount: activeBatch.enrolledCount,
      startDate: activeBatch.startDate,
      startTime: activeBatch.startTime,
    };
  }, [activeBatch, activeCourse, course, usesBatches]);

  const cartLineId = useMemo(
    () =>
      usesBatches
        ? buildCartItemId(displayCourse._id, activeBatch?._id)
        : String(displayCourse._id),
    [activeBatch?._id, displayCourse._id, usesBatches],
  );

  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    displayCourse.bogo?.enabled && displayCourse.type
      ? { courseType: displayCourse.type }
      : "skip",
  );

  const handleBogoSelection = (selection: {
    batchId?: Id<"courseBatches">;
    batchLabel?: string;
    courseId: Id<"courses">;
  }) => {
    const selectedFreeCourse = availableCourses?.find(
      (c) => c._id === selection.courseId,
    );
    if (!selectedFreeCourse) {
      console.error(
        "Selected course not found in available courses:",
        selection.courseId,
      );
      return;
    }
    if (usesBatches && !activeBatch) {
      toast.error("Select a batch before adding this course to the cart.");
      return;
    }
    addItem({
      id: cartLineId,
      courseId: displayCourse._id,
      batchDaysOfWeek: activeBatch?.daysOfWeek,
      batchEndDate: activeBatch?.endDate,
      batchEndTime: activeBatch?.endTime,
      batchId: activeBatch?._id,
      batchLabel: activeBatch?.label,
      batchStartDate: activeBatch?.startDate,
      batchStartTime: activeBatch?.startTime,
      name: activeBatch?.label
        ? `${displayCourse.name} (${activeBatch.label})`
        : displayCourse.name,
      description: displayCourse.description,
      price: getCoursePrice(displayCourse),
      originalPrice: displayCourse.price,
      imageUrls: displayCourse.imageUrls || [],
      capacity: (activeBatch?.capacity ?? displayCourse.capacity) || 1,
      quantity: 1,
      offer: displayCourse.offer,
      bogo: displayCourse.bogo,
      courseType: displayCourse.type,
      selectedFreeCourse: {
        id: selection.courseId,
        courseId: selection.courseId,
        batchId: selection.batchId,
        batchLabel: selection.batchLabel,
        name: selectedFreeCourse.name,
        description:
          selectedFreeCourse.description ||
          "Free course selected via BOGO offer",
        price: 0,
        originalPrice: selectedFreeCourse.price,
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });
    setShowBogoModal(false);
  };

  const getCurrentQuantity = (courseId: string) => {
    const lookupId = usesBatches ? cartLineId : courseId;
    const cartItem = items.find((item) => item.id === lookupId);
    return cartItem?.quantity || 0;
  };

  const removeCurrentCartLine = (courseId: string) => {
    removeItem(usesBatches ? cartLineId : courseId);
  };

  const handleBuyNow = (c: PublicCourse) => {
    if (items.length > 0) {
      setShowBuyNowDialog(true);
    } else {
      handleBuyNowConfirm(c);
    }
  };

  const handleBuyNowConfirm = (c: PublicCourse) => {
    if (usesBatches && !activeBatch) {
      toast.error("Select a batch before continuing to checkout.");
      return;
    }
    const priceToUse = getCoursePrice(c);
    items.forEach((item) => {
      if (item.id !== cartLineId) removeItem(item.id);
    });
    if (!inCart(cartLineId)) {
      addItem({
        id: cartLineId,
        courseId: displayCourse._id,
        batchDaysOfWeek: activeBatch?.daysOfWeek,
        batchEndDate: activeBatch?.endDate,
        batchEndTime: activeBatch?.endTime,
        batchId: activeBatch?._id,
        batchLabel: activeBatch?.label,
        batchStartDate: activeBatch?.startDate,
        batchStartTime: activeBatch?.startTime,
        name: activeBatch?.label
          ? `${displayCourse.name} (${activeBatch.label})`
          : displayCourse.name,
        description: displayCourse.description,
        price: priceToUse,
        originalPrice: displayCourse.price,
        imageUrls: displayCourse.imageUrls || [],
        capacity: (activeBatch?.capacity ?? displayCourse.capacity) || 1,
        quantity: 1,
        offer: displayCourse.offer,
        bogo: displayCourse.bogo,
        courseType: displayCourse.type,
      });
    } else {
      updateItemQuantity(cartLineId, 1);
    }
    router.push("/cart");
  };

  const handleIncreaseQuantity = (c: PublicCourse) => {
    if (usesBatches && !activeBatch) {
      toast.error("Select a batch before adding this course to the cart.");
      return;
    }
    const currentQuantity = getCurrentQuantity(c._id);
    const maxQuantity = (activeBatch?.capacity ?? c.capacity) || 1;
    const priceToUse = getCoursePrice(c);

    if (
      offerDetails?.hasBogo &&
      availableCourses &&
      availableCourses.length > 0
    ) {
      const selectableCourses = availableCourses.filter(
        (other) => other._id !== displayCourse._id,
      );
      if (selectableCourses.length > 0) {
        setShowBogoModal(true);
        return;
      }
    }

    if (currentQuantity === 0) {
      addItem({
        id: cartLineId,
        courseId: c._id,
        batchDaysOfWeek: activeBatch?.daysOfWeek,
        batchEndDate: activeBatch?.endDate,
        batchEndTime: activeBatch?.endTime,
        batchId: activeBatch?._id,
        batchLabel: activeBatch?.label,
        batchStartDate: activeBatch?.startDate,
        batchStartTime: activeBatch?.startTime,
        name: activeBatch?.label ? `${c.name} (${activeBatch.label})` : c.name,
        description: c.description,
        price: priceToUse,
        originalPrice: c.price,
        imageUrls: c.imageUrls || [],
        capacity: (activeBatch?.capacity ?? c.capacity) || 1,
        quantity: 1,
        offer: c.offer,
        bogo: c.bogo,
        courseType: c.type,
      });
    } else if (currentQuantity < maxQuantity) {
      updateItemQuantity(cartLineId, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = (c: PublicCourse) => {
    const currentQuantity = getCurrentQuantity(c._id);
    if (currentQuantity > 1) {
      updateItemQuantity(cartLineId, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeItem(cartLineId);
    }
  };

  const seatsLeft = Math.max(
    0,
    (displayCourse.capacity ?? 0) - getEnrolledCount(displayCourse),
  );
  const isOutOfStock = (displayCourse.capacity ?? 0) === 0 || seatsLeft === 0;

  const normalizedVariants: CourseVariant[] = useMemo(() => {
    const sameGroup = variants
      .filter(
        (v) => v.name === displayCourse.name && v.type === displayCourse.type,
      )
      .concat([]);
    const present = sameGroup.some((v) => v._id === displayCourse._id);
    if (!present) sameGroup.push(displayCourse);
    if (displayCourse.type === "therapy") {
      sameGroup.sort((a, b) => {
        const as = (a as TherapyCourse).sessions ?? 0;
        const bs = (b as TherapyCourse).sessions ?? 0;
        return as - bs || (a.price ?? 0) - (b.price ?? 0);
      });
    } else if (displayCourse.type === "internship") {
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
    !usesBatches &&
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
      if (d && d.trim()) return d.trim();
      const m =
        v.name.match(/(\d+\s*weeks?)/i) ||
        (v.description ?? "").match(/(\d+\s*weeks?)/i);
      if (m) return m[1]!;
    }
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
    return "Option";
  };

  const hasValidOffer = useMemo(() => {
    return hasActivePromotion({
      offer: displayCourse.offer ?? null,
      bogo: displayCourse.bogo ?? null,
    });
  }, [displayCourse.offer, displayCourse.bogo]);

  const offerDetails = useMemo(
    () => getOfferDetails(displayCourse),
    [displayCourse],
  );

  const handleVariantSelect = (val: string) => {
    if (usesBatches) return;
    if (!val) return;
    if ((displayCourse._id as unknown as string) === val) return;
    const target = normalizedVariants.find(
      (v) => (v._id as unknown as string) === val,
    );
    if (target) {
      setActiveCourse(target);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/courses/${val}`);
      }
    } else {
      router.replace(`/courses/${val}`, { scroll: false });
    }
  };

  const handleBatchSelect = (value: string) => {
    if (!usesBatches) return;
    setSelectedBatchId(value);
    router.replace(`/courses/${course._id}?batch=${value}`, { scroll: false });
  };

  const batchOptions = batches.map((batch) => ({
    ...batch,
    isSelectable: batch.availabilityStatus === "upcoming_open",
    summary: [batch.label, batch.startDate, batch.startTime]
      .filter(Boolean)
      .join(" \u00b7 "),
  }));

  return (
    <div className="calm-page">
      <CourseHero
        course={displayCourse}
        batches={usesBatches ? batchOptions : []}
        activeBatchId={activeBatch?._id ?? null}
        onBatchSelect={usesBatches ? handleBatchSelect : undefined}
        onAddToCart={() => handleIncreaseQuantity(displayCourse)}
      />

      <WaveDivider className="mx-auto w-full max-w-3xl opacity-50" />

      <div className="calm-section-warm">
        <CourseWhyThisExists course={displayCourse} />
      </div>

      <div className="relative">
        <LeafAccent className="pointer-events-none absolute -top-3 right-[8%] w-8 rotate-12 opacity-25 sm:w-10" />
        <CourseCurriculum course={displayCourse} />
      </div>

      <WaveDivider className="mx-auto w-full max-w-3xl opacity-40" />

      <div className="calm-section-cool">
        <CourseOutcomes course={displayCourse} />
      </div>

      <div className="relative">
        <LeafAccent className="pointer-events-none absolute -top-2 left-[6%] w-7 -rotate-[20deg] -scale-x-100 opacity-20 sm:w-9" />
      </div>

      <PricingSection
        course={course}
        activeCourse={displayCourse}
        variants={variants}
        isOutOfStock={isOutOfStock}
        seatsLeft={seatsLeft}
        hasValidOffer={hasValidOffer}
        offerDetails={offerDetails}
        shouldShowVariantSelect={shouldShowVariantSelect}
        normalizedVariants={normalizedVariants}
        variantLabel={variantLabel}
        handleVariantSelect={handleVariantSelect}
        handleIncreaseQuantity={handleIncreaseQuantity}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleBuyNow={handleBuyNow}
        getCurrentQuantity={getCurrentQuantity}
        inCart={(id) =>
          mounted ? inCart(usesBatches ? cartLineId : id) : false
        }
        removeItem={removeCurrentCartLine}
        mounted={mounted}
        usesBatches={usesBatches}
        batchOptions={batchOptions}
        activeBatchId={activeBatch?._id ?? null}
        handleBatchSelect={handleBatchSelect}
      />

      <CourseFromStudents
        courseId={displayCourse._id}
        courseType={displayCourse.type}
      />

      <CourseTerminalCTA
        course={displayCourse}
        isOutOfStock={isOutOfStock}
        onReserve={() => {
          if (typeof window !== "undefined") {
            const el = document.getElementById("pricing");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
          }
          handleIncreaseQuantity(displayCourse);
        }}
      />

      <WaveDivider className="mx-auto w-full max-w-3xl opacity-40" />

      {displayCourse.type === "therapy" ? (
        <TherapyFAQSection />
      ) : displayCourse.type === "supervised" ? (
        <SupervisedFAQSection />
      ) : (
        <FAQSection />
      )}

      <CourseFooterNote />

      <Dialog open={showBuyNowDialog} onOpenChange={setShowBuyNowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your cart already has items</DialogTitle>
            <DialogDescription>
              Your cart currently contains other items. Would you like to:
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
              Buy only this course
            </Button>
            <Button
              onClick={() => {
                setShowBuyNowDialog(false);
                if (!inCart(cartLineId)) handleIncreaseQuantity(displayCourse);
                router.push("/cart");
              }}
              className="w-full sm:w-auto"
            >
              Keep all items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
