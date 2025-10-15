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
      <div className="bg-muted relative flex h-80 items-center justify-center rounded-t-lg">
        <BookOpen className="text-muted-foreground h-12 w-12" />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <div className="bg-muted relative flex h-80 items-center justify-center overflow-hidden rounded-t-lg">
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
    <div className="bg-muted relative h-80 overflow-hidden rounded-t-lg">
      <Carousel className="h-full w-full">
        <CarouselContent>
          {imageUrls.map((imageUrl, index) => (
            <CarouselItem
              key={index}
              className="flex h-80 items-center justify-center"
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

const CourseGroupCard = ({ courses }: { courses: Array<Doc<"courses">> }) => {
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

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    selectedCourse.bogo && selectedCourse.type
      ? { courseType: selectedCourse.type }
      : "skip",
  );

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayPrice = getCoursePrice(selectedCourse);
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
      className="card-shadow hover:card-shadow-lg transition-smooth group h-full cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={selectedCourse.imageUrls || []} />

      {/* Offer name badge (top-left) */}
      {offerDetails && (
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="secondary" className="text-xs font-semibold">
            {offerDetails.offerName}
          </Badge>
        </div>
      )}

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
              🛍️ {offerDetails.bogoLabel || "BOGO"}
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {sorted[0].name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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

        <div className="flex items-center justify-between">
          <div className="space-y-1">
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
                className="transition-smooth"
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

const CourseCard = ({ course }: { course: Doc<"courses"> }) => {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get available courses for BOGO selection
  const availableCourses = useQuery(
    api.courses.getBogoCoursesByType,
    course.bogo && course.type ? { courseType: course.type } : "skip",
  );

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayPrice = getCoursePrice(course);
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
      className="card-shadow hover:card-shadow-lg transition-smooth group h-full cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CourseImageCarousel imageUrls={course.imageUrls || []} />

      {/* Offer name badge (top-left) */}
      {offerDetails && (
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="secondary" className="text-xs font-semibold">
            {offerDetails.offerName}
          </Badge>
        </div>
      )}

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
              🛍️ {offerDetails.bogoLabel || "BOGO"}
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-smooth text-lg">
              {course.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
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
                className="transition-smooth"
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
  return (
    <div className="min-h-screen">
      {/* All Courses Section */}
      <section className="section-padding">
        <div className="container">
          {coursesData && coursesData.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                    <CourseGroupCard key={group[0]._id} courses={group} />
                  ) : (
                    <CourseCard key={group[0]._id} course={group[0]} />
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
