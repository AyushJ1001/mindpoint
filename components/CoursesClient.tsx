"use client";

import React, { useState } from "react";
import { useCart } from "react-use-cart";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";
import { BogoSelectionModal } from "@/components/bogo-selection-modal";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Type for courses with sessions (therapy)
interface TherapyCourse extends Doc<"courses"> {
  sessions?: number;
}

// Type for courses with duration (internship)
interface InternshipCourse extends Doc<"courses"> {
  duration?: string;
}
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Plus } from "lucide-react";
import { showRupees, getOfferDetails, getCoursePrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseImageCarousel = ({ imageUrls }: { imageUrls: string[] }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="bg-muted relative flex h-56 items-center justify-center rounded-t-2xl sm:h-72">
        <BookOpen className="text-muted-foreground h-12 w-12" />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <div className="bg-muted relative flex h-56 items-center justify-center overflow-hidden rounded-t-2xl sm:h-72">
        <Image
          src={
            imageUrls[0] ??
            "https://blocks.astratic.com/img/general-img-landscape.png"
          }
          alt="Course image"
          className="max-h-full max-w-full object-contain"
          width={400}
          height={600}
        />
      </div>
    );
  }

  return (
    <div className="bg-muted relative h-56 overflow-hidden rounded-t-2xl sm:h-72">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {imageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="flex h-56 items-center justify-center sm:h-72"
            >
              <Image
                src={imageUrl || ""}
                alt={`Course image ${index + 1}`}
                className="max-h-full max-w-full object-contain"
                width={400}
                height={600}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-black/50 text-white hover:bg-black/70" />
        <CarouselNext className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-black/50 text-white hover:bg-black/70" />
      </Carousel>
    </div>
  );
};

// Prefer explicit fields: `sessions` (number) or fallback to `duration` (string) for label
const extractVariantLabel = (course: Doc<"courses">): string | null => {
  if (typeof (course as TherapyCourse).sessions === "number") {
    const count = (course as TherapyCourse).sessions ?? 0;
    return `${count} ${count === 1 ? "session" : "sessions"}`;
  }
  const duration = (course as InternshipCourse).duration;
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration.trim();
  }
  // Last resort: try to extract sessions from text
  const candidates = [course.name, course.description ?? "", course.content];
  for (const text of candidates) {
    if (!text) continue;
    const match = text.match(/(\d+)\s*(session|sessions)\b/i);
    if (match) {
      const count = Number(match[1]);
      return `${count} ${count === 1 ? "session" : "sessions"}`;
    }
  }
  return null;
};

const CourseGroupCard = ({
  courses,
  bogoCoursesByType,
}: {
  courses: Array<Doc<"courses">>;
  bogoCoursesByType?: Record<string, Doc<"courses">[]>;
}) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const sorted = [...courses].sort((a, b) => a.price - b.price);
  const useSessionsMode = sorted.every(
    (c) => typeof (c as TherapyCourse).sessions === "number",
  );
  const useDurationMode =
    !useSessionsMode &&
    sorted.every(
      (c) =>
        typeof (c as InternshipCourse).duration === "string" &&
        !!(c as InternshipCourse).duration,
    );
  const [selectedId, setSelectedId] = React.useState(sorted[0]._id);
  const [selectedSessions, setSelectedSessions] = React.useState<number>(
    useSessionsMode ? ((sorted[0] as TherapyCourse).sessions ?? 0) : 0,
  );
  const [selectedDuration, setSelectedDuration] = React.useState<string>(
    useDurationMode ? ((sorted[0] as InternshipCourse).duration ?? "") : "",
  );
  const [mounted, setMounted] = useState(false);
  const selectedCourse = useSessionsMode
    ? (sorted.find((c) => (c as TherapyCourse).sessions === selectedSessions) ??
      sorted[0])
    : useDurationMode
      ? (sorted.find(
          (c) => (c as InternshipCourse).duration === selectedDuration,
        ) ?? sorted[0])
      : (sorted.find((c) => c._id === selectedId) ?? sorted[0]);

  // Get available courses for BOGO selection from props
  const availableCourses =
    selectedCourse.bogo && selectedCourse.type && bogoCoursesByType
      ? (bogoCoursesByType[selectedCourse.type] ?? undefined)
      : undefined;

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayPrice = getCoursePrice(selectedCourse);
  // Use shared time for offer details - updates automatically via useNow hook
  // now is used to trigger re-renders every minute, getOfferDetails uses Date.now() internally
  const offerDetails = getOfferDetails(selectedCourse);

  const handleAddToCart = () => {
    // Check if course is out of stock
    const seatsLeft = Math.max(
      0,
      (selectedCourse.capacity ?? 0) -
        (selectedCourse.enrolledUsers?.length ?? 0),
    );
    const isOutOfStock =
      (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }

    // Check if BOGO is active and there are other courses of the same type
    // Only check BOGO if availableCourses has loaded and there are selectable courses
    if (offerDetails?.hasBogo && availableCourses) {
      // Filter out the source course to get only selectable courses
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== selectedCourse._id,
      );
      if (selectableCourses.length > 0) {
        // There are other courses available, show BOGO modal
        setShowBogoModal(true);
        return;
      }
      // No other courses of same type with BOGO, proceed normally without BOGO
    }

    const label = extractVariantLabel(selectedCourse);
    addItem({
      id: selectedCourse._id,
      name: label ? `${selectedCourse.name} (${label})` : selectedCourse.name,
      description: selectedCourse.description,
      price: getCoursePrice(selectedCourse),
      originalPrice: selectedCourse.price, // Store original price for discount calculations
      imageUrls: selectedCourse.imageUrls || [],
      capacity: selectedCourse.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
      offer: selectedCourse.offer,
      bogo: selectedCourse.bogo,
      courseType: selectedCourse.type,
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

    const label = extractVariantLabel(selectedCourse);
    addItem({
      id: selectedCourse._id,
      name: label ? `${selectedCourse.name} (${label})` : selectedCourse.name,
      description: selectedCourse.description,
      price: getCoursePrice(selectedCourse),
      originalPrice: selectedCourse.price,
      imageUrls: selectedCourse.imageUrls || [],
      capacity: selectedCourse.capacity || 1,
      quantity: 1,
      offer: selectedCourse.offer,
      bogo: selectedCourse.bogo,
      courseType: selectedCourse.type,
      selectedFreeCourse: {
        id: selectedFreeCourse._id,
        name: selectedFreeCourse.name,
        description:
          selectedFreeCourse.description ||
          "Free course selected via BOGO offer",
        price: 0,
        originalPrice: selectedFreeCourse.price ?? 0,
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    // Close the modal after successful selection
    setShowBogoModal(false);
  };

  const handleCardClick = () => {
    router.push(`/courses/${selectedCourse._id}`);
  };

  return (
    <Card
      className="group relative h-full cursor-pointer overflow-hidden rounded-[1.35rem] border border-blue-200/80 bg-gradient-to-b from-white via-blue-50/55 to-white/95 shadow-[0_14px_35px_-24px_rgba(37,99,235,0.85)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-22px_rgba(37,99,235,0.95)] dark:border-blue-900/50 dark:bg-gradient-to-b dark:from-slate-950/80 dark:via-blue-950/35 dark:to-slate-950/90"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={selectedCourse.imageUrls || []} />

      {offerDetails && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          {offerDetails && (
            <Badge
              variant="secondary"
              className="max-w-[52%] truncate whitespace-nowrap bg-white/95 text-[11px] font-semibold shadow-sm"
            >
              <span className="sm:hidden">Special Offer</span>
              <span className="hidden sm:inline">{offerDetails.offerName}</span>
            </Badge>
          )}
          {(offerDetails?.hasDiscount || offerDetails?.hasBogo) && (
            <div className="flex max-w-[46%] flex-col items-end gap-1">
              {offerDetails?.hasDiscount && (
                <Badge
                  variant="destructive"
                  className="max-w-full animate-pulse whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-500 text-[11px] text-white shadow-lg"
                >
                  <span className="sm:hidden">
                    {offerDetails.discountPercentage}% OFF
                  </span>
                  <span className="hidden sm:inline">
                    🔥 {offerDetails.discountPercentage}% OFF
                  </span>
                </Badge>
              )}
              {offerDetails?.hasBogo && (
                <Badge className="max-w-full whitespace-nowrap bg-emerald-500/90 text-[11px] font-semibold text-white uppercase shadow-lg">
                  <span className="sm:hidden">BOGO</span>
                  <span className="hidden sm:inline">
                    🛍️ {offerDetails.bogoLabel || "BOGO"}
                  </span>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth line-clamp-2 text-base sm:text-lg">
              {sorted[0].name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="mb-3">
          {useSessionsMode ? (
            <Select
              value={String(selectedSessions)}
              onValueChange={(val) => setSelectedSessions(parseInt(val, 10))}
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sessions</SelectLabel>
                  {sorted.map((variant) => {
                    const sessions = (variant as TherapyCourse).sessions ?? 0;
                    const label = `${sessions} ${sessions === 1 ? "session" : "sessions"}`;
                    return (
                      <SelectItem key={variant._id} value={String(sessions)}>
                        {label} — {showRupees(getCoursePrice(variant))}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : useDurationMode ? (
            <Select
              value={selectedDuration}
              onValueChange={(val) => setSelectedDuration(val)}
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Duration</SelectLabel>
                  {sorted.map((variant) => {
                    const duration =
                      (variant as InternshipCourse).duration ?? "";
                    const label = duration?.trim() ?? "Duration";
                    return (
                      <SelectItem key={variant._id} value={duration}>
                        {label} — {showRupees(getCoursePrice(variant))}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={selectedId as unknown as string}
              onValueChange={(val) =>
                setSelectedId(val as unknown as Id<"courses">)
              }
            >
              <SelectTrigger
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  {sorted.map((variant, idx) => {
                    const extracted = extractVariantLabel(variant);
                    let label = extracted ?? `Option ${idx + 1}`;
                    const isTherapy =
                      (variant.type as string | undefined) === "therapy";
                    if (!extracted && isTherapy && sorted.length === 3) {
                      const mapped = [3, 6, 8][idx];
                      label = `${mapped} ${mapped === 1 ? "session" : "sessions"}`;
                    }
                    return (
                      <SelectItem
                        key={variant._id}
                        value={variant._id as unknown as string}
                      >
                        {label} — {showRupees(getCoursePrice(variant))}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-base font-semibold"
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
                Includes a free bonus course
              </div>
            )}
          </div>
          {(() => {
            const seatsLeft = Math.max(
              0,
              (selectedCourse.capacity ?? 0) -
                (selectedCourse.enrolledUsers?.length ?? 0),
            );
            const isOutOfStock =
              (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;

            // Use mounted state to prevent hydration mismatch
            const isInCart = mounted ? inCart(selectedCourse._id) : false;

            return (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isInCart || isOutOfStock}
                size="sm"
                className="transition-smooth w-full sm:w-auto"
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
        </div>
      </CardContent>

      {/* BOGO Selection Modal */}
      {offerDetails?.hasBogo && selectedCourse.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={selectedCourse.type}
          sourceCourseId={selectedCourse._id}
          sourceCourseName={selectedCourse.name}
        />
      )}
    </Card>
  );
};

const CourseCard = ({
  course,
  bogoCoursesByType,
}: {
  course: Doc<"courses">;
  bogoCoursesByType?: Record<string, Doc<"courses">[]>;
}) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get available courses for BOGO selection from props
  const availableCourses =
    course.bogo && course.type && bogoCoursesByType
      ? (bogoCoursesByType[course.type] ?? undefined)
      : undefined;

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayPrice = getCoursePrice(course);
  // Use shared time for offer details - updates automatically via useNow hook
  // now is used to trigger re-renders every minute, getOfferDetails uses Date.now() internally
  const offerDetails = getOfferDetails(course);

  const handleAddToCart = () => {
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
    if (offerDetails?.hasBogo && availableCourses) {
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
      originalPrice: course.price,
      imageUrls: course.imageUrls || [],
      capacity: course.capacity || 1,
      quantity: 1, // Explicitly set initial quantity to 1
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
        originalPrice: selectedFreeCourse.price,
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    // Close the modal after successful selection
    setShowBogoModal(false);
  };

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <Card
      className="group relative h-full cursor-pointer overflow-hidden rounded-[1.35rem] border border-blue-200/80 bg-gradient-to-b from-white via-blue-50/55 to-white/95 shadow-[0_14px_35px_-24px_rgba(37,99,235,0.85)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-22px_rgba(37,99,235,0.95)] dark:border-blue-900/50 dark:bg-gradient-to-b dark:from-slate-950/80 dark:via-blue-950/35 dark:to-slate-950/90"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      {offerDetails && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          {offerDetails && (
            <Badge
              variant="secondary"
              className="max-w-[52%] truncate whitespace-nowrap bg-white/95 text-[11px] font-semibold shadow-sm"
            >
              <span className="sm:hidden">Special Offer</span>
              <span className="hidden sm:inline">{offerDetails.offerName}</span>
            </Badge>
          )}
          {(offerDetails?.hasDiscount || offerDetails?.hasBogo) && (
            <div className="flex max-w-[46%] flex-col items-end gap-1">
              {offerDetails?.hasDiscount && (
                <Badge
                  variant="destructive"
                  className="max-w-full animate-pulse whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-500 text-[11px] text-white shadow-lg"
                >
                  <span className="sm:hidden">
                    {offerDetails.discountPercentage}% OFF
                  </span>
                  <span className="hidden sm:inline">
                    🔥 {offerDetails.discountPercentage}% OFF
                  </span>
                </Badge>
              )}
              {offerDetails?.hasBogo && (
                <Badge className="max-w-full whitespace-nowrap bg-emerald-500/90 text-[11px] font-semibold text-white uppercase shadow-lg">
                  <span className="sm:hidden">BOGO</span>
                  <span className="hidden sm:inline">
                    🛍️ {offerDetails.bogoLabel || "BOGO"}
                  </span>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth line-clamp-2 text-base sm:text-lg">
              {course.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-base font-semibold"
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
                Includes a free bonus course
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isInCart || isOutOfStock}
                size="sm"
                className="transition-smooth w-full shrink-0 sm:w-auto"
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
};

interface CoursesClientProps {
  coursesData: Doc<"courses">[];
}

export default function CoursesClient({ coursesData }: CoursesClientProps) {
  // Collect unique course types that have BOGO enabled
  const bogoCourseTypes = React.useMemo(() => {
    const types = new Set<Doc<"courses">["type"]>();
    coursesData.forEach((course) => {
      if (course.bogo?.enabled && course.type) {
        types.add(course.type);
      }
    });
    return Array.from(types).filter(
      (type): type is NonNullable<typeof type> => type !== undefined,
    );
  }, [coursesData]);

  // Batch fetch BOGO courses for all types at once
  const bogoCoursesByType = useQuery(
    api.courses.getBogoCoursesByTypes,
    bogoCourseTypes.length > 0 ? { courseTypes: bogoCourseTypes } : "skip",
  );

  return (
    <div className="min-h-screen">
      {/* All Courses Section */}
      <section className="section-padding pt-0">
        <div className="container">
          {coursesData && coursesData.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const nameToCourses = new Map<string, Array<Doc<"courses">>>();
                for (const course of coursesData) {
                  const list = nameToCourses.get(course.name) ?? [];
                  list.push(course);
                  nameToCourses.set(course.name, list);
                }
                const groups = Array.from(nameToCourses.values());
                return groups.map((group) =>
                  group.length > 1 ? (
                    <CourseGroupCard
                      key={group[0]._id}
                      courses={group}
                      bogoCoursesByType={bogoCoursesByType}
                    />
                  ) : (
                    <CourseCard
                      key={group[0]._id}
                      course={group[0]}
                      bogoCoursesByType={bogoCoursesByType}
                    />
                  ),
                );
              })()}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">
                No courses available yet
              </h3>
              <p className="text-muted-foreground">
                We&apos;re working on adding new courses. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
