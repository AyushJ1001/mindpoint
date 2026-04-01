import React, { useState, useEffect, memo } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { Plus, Gift } from "lucide-react-native";
import { ScaleOnPress } from "@/components/animated/ScaleOnPress";
import type { PublicCourse } from "@mindpoint/backend";
import type { Id } from "@mindpoint/backend/data-model";
import {
  showRupees,
  getOfferDetails,
  getCoursePrice,
} from "@mindpoint/domain/pricing";
import { calculatePointsEarned } from "@mindpoint/domain/mind-points";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CourseImageCarousel } from "@/components/CourseImageCarousel";
import { BogoSelectionModal } from "@/components/BogoSelectionModal";

function getEnrolledCount(course: PublicCourse): number {
  return course.enrolledCount ?? 0;
}

function extractVariantLabel(course: PublicCourse): string | null {
  const sessions = (course as any).sessions;
  if (typeof sessions === "number") {
    return `${sessions} ${sessions === 1 ? "session" : "sessions"}`;
  }
  const duration = (course as any).duration;
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration.trim();
  }
  return null;
}

interface CourseGroupCardProps {
  courses: PublicCourse[];
  bogoCoursesByType?: Record<string, PublicCourse[]>;
}

export const CourseGroupCard = memo(function CourseGroupCard({
  courses,
  bogoCoursesByType,
}: CourseGroupCardProps) {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sorted = [...courses].sort((a, b) => a.price - b.price);

  // Detect variant selection mode
  const useSessionsMode = sorted.every(
    (c) => typeof (c as any).sessions === "number",
  );
  const useDurationMode =
    !useSessionsMode &&
    sorted.every(
      (c) =>
        typeof (c as any).duration === "string" && !!(c as any).duration,
    );

  const [selectedValue, setSelectedValue] = useState<string>(() => {
    if (useSessionsMode) return String((sorted[0] as any).sessions ?? 0);
    if (useDurationMode) return (sorted[0] as any).duration ?? "";
    return sorted[0]._id;
  });

  const selectedCourse = useSessionsMode
    ? sorted.find((c) => (c as any).sessions === parseInt(selectedValue, 10)) ??
      sorted[0]
    : useDurationMode
      ? sorted.find((c) => (c as any).duration === selectedValue) ?? sorted[0]
      : sorted.find((c) => c._id === selectedValue) ?? sorted[0];

  const availableCourses =
    selectedCourse.bogo && selectedCourse.type && bogoCoursesByType
      ? (bogoCoursesByType[selectedCourse.type] ?? undefined)
      : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  const offerDetails = getOfferDetails(selectedCourse);
  const displayPrice = getCoursePrice(selectedCourse);

  // Build select options
  const selectOptions = sorted.map((variant, idx) => {
    if (useSessionsMode) {
      const sessions = (variant as any).sessions ?? 0;
      return {
        label: `${sessions} ${sessions === 1 ? "session" : "sessions"} — ${showRupees(getCoursePrice(variant))}`,
        value: String(sessions),
      };
    }
    if (useDurationMode) {
      const duration = (variant as any).duration ?? "";
      return {
        label: `${duration.trim()} — ${showRupees(getCoursePrice(variant))}`,
        value: duration,
      };
    }
    const extracted = extractVariantLabel(variant);
    const label = extracted ?? `Option ${idx + 1}`;
    return {
      label: `${label} — ${showRupees(getCoursePrice(variant))}`,
      value: variant._id,
    };
  });

  const handleAddToCart = () => {
    const seatsLeft = Math.max(
      0,
      (selectedCourse.capacity ?? 0) - getEnrolledCount(selectedCourse),
    );
    const isOutOfStock =
      (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) return;

    if (offerDetails?.hasBogo && availableCourses) {
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== selectedCourse._id,
      );
      if (selectableCourses.length > 0) {
        setShowBogoModal(true);
        return;
      }
    }

    const label = extractVariantLabel(selectedCourse);
    addItem({
      id: selectedCourse._id,
      name: label
        ? `${selectedCourse.name} (${label})`
        : selectedCourse.name,
      description: selectedCourse.description,
      price: getCoursePrice(selectedCourse),
      originalPrice: selectedCourse.price,
      imageUrls: selectedCourse.imageUrls || [],
      capacity: selectedCourse.capacity || 1,
      quantity: 1,
      offer: selectedCourse.offer,
      bogo: selectedCourse.bogo,
      courseType: selectedCourse.type,
    });
  };

  const handleBogoSelection = (selectedCourseId: Id<"courses">) => {
    const selectedFreeCourse = availableCourses?.find(
      (c) => c._id === selectedCourseId,
    );
    if (!selectedFreeCourse) return;

    const label = extractVariantLabel(selectedCourse);
    addItem({
      id: selectedCourse._id,
      name: label
        ? `${selectedCourse.name} (${label})`
        : selectedCourse.name,
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

    setShowBogoModal(false);
  };

  const seatsLeft = Math.max(
    0,
    (selectedCourse.capacity ?? 0) - getEnrolledCount(selectedCourse),
  );
  const isOutOfStock =
    (selectedCourse.capacity ?? 0) === 0 || seatsLeft === 0;
  const isInCart = mounted ? inCart(selectedCourse._id) : false;

  return (
    <>
      <ScaleOnPress
        onPress={() => router.push(`/course/${selectedCourse._id}`)}
      >
        <Card className="overflow-hidden border-border">
          <CourseImageCarousel
            imageUrls={selectedCourse.imageUrls || []}
          />

          {/* Offer badges */}
          {offerDetails && (
            <View className="absolute left-3 right-3 top-3 flex-row items-start justify-between">
              <Badge variant="secondary" className="max-w-[55%] bg-white/95">
                <Text
                  className="text-xs font-semibold text-secondary-foreground"
                  numberOfLines={1}
                >
                  {offerDetails.offerName}
                </Text>
              </Badge>
              <View className="items-end gap-1">
                {offerDetails.hasDiscount && (
                  <Badge className="bg-orange-500">
                    <Text className="text-xs font-semibold text-white">
                      {offerDetails.discountPercentage}% OFF
                    </Text>
                  </Badge>
                )}
                {offerDetails.hasBogo && (
                  <Badge className="bg-emerald-500">
                    <Text className="text-xs font-semibold uppercase text-white">
                      {offerDetails.bogoLabel || "BOGO"}
                    </Text>
                  </Badge>
                )}
              </View>
            </View>
          )}

          <CardHeader>
            <CardTitle className="text-base" numberOfLines={2}>
              {sorted[0].name}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Variant selector */}
            <View className="mb-3">
              <Select
                options={selectOptions}
                value={selectedValue}
                onValueChange={setSelectedValue}
                placeholder={
                  useSessionsMode
                    ? "Select sessions"
                    : useDurationMode
                      ? "Select duration"
                      : "Select an option"
                }
              />
            </View>

            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Badge variant="secondary" className="self-start">
                  <Text className="text-sm font-semibold text-secondary-foreground">
                    {showRupees(displayPrice)}
                  </Text>
                </Badge>
                {offerDetails?.hasDiscount && (
                  <Text className="mt-1 text-xs text-muted-foreground line-through">
                    {showRupees(offerDetails.originalPrice)}
                  </Text>
                )}
                {offerDetails && (
                  <Text
                    className={`mt-0.5 text-xs font-medium ${offerDetails.hasBogo ? "text-emerald-600" : "text-orange-600"}`}
                  >
                    {offerDetails.timeLeft.days > 0 &&
                      `${offerDetails.timeLeft.days}d `}
                    {offerDetails.timeLeft.hours > 0 &&
                      `${offerDetails.timeLeft.hours}h `}
                    {offerDetails.timeLeft.minutes > 0 &&
                      `${offerDetails.timeLeft.minutes}m`}{" "}
                    left
                  </Text>
                )}
                {offerDetails?.hasBogo && (
                  <Text className="mt-0.5 text-xs font-semibold text-emerald-600">
                    Includes a free bonus course
                  </Text>
                )}
                <View className="mt-1 flex-row items-center gap-1">
                  <Gift size={12} color="#8a8279" />
                  <Text className="text-xs text-muted-foreground">
                    Earn {calculatePointsEarned(selectedCourse)} Mind Points
                  </Text>
                </View>
              </View>

              <Button
                size="sm"
                onPress={handleAddToCart}
                disabled={isInCart || isOutOfStock}
              >
                <View className="flex-row items-center">
                  <Plus size={14} color="#ffffff" />
                  <Text className="ml-1 text-xs font-semibold text-primary-foreground">
                    {isOutOfStock
                      ? "Out of Stock"
                      : isInCart
                        ? "Added"
                        : "Add to Cart"}
                  </Text>
                </View>
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScaleOnPress>

      {showBogoModal && selectedCourse.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={
            selectedCourse.type as
              | "certificate"
              | "internship"
              | "diploma"
              | "pre-recorded"
              | "masterclass"
              | "therapy"
              | "supervised"
              | "resume-studio"
              | "worksheet"
          }
          sourceCourseId={selectedCourse._id}
          sourceCourseName={selectedCourse.name}
        />
      )}
    </>
  );
});
