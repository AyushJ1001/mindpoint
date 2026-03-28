import React, { useState, useEffect, memo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { Plus, Gift } from "lucide-react-native";
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
import { CourseImageCarousel } from "@/components/CourseImageCarousel";
import { BogoSelectionModal } from "@/components/BogoSelectionModal";

function getEnrolledCount(course: PublicCourse): number {
  return course.enrolledCount ?? 0;
}

interface CourseCardProps {
  course: PublicCourse;
  bogoCoursesByType?: Record<string, PublicCourse[]>;
}

export const CourseCard = memo(function CourseCard({
  course,
  bogoCoursesByType,
}: CourseCardProps) {
  const { addItem, inCart } = useCart();
  const router = useRouter();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const availableCourses =
    course.bogo && course.type && bogoCoursesByType
      ? (bogoCoursesByType[course.type] ?? undefined)
      : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  const offerDetails = getOfferDetails(course);
  const displayPrice = getCoursePrice(course);

  const handleAddToCart = () => {
    const seatsLeft = Math.max(
      0,
      (course.capacity ?? 0) - getEnrolledCount(course),
    );
    const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

    if (isOutOfStock) return;

    if (offerDetails?.hasBogo && availableCourses) {
      const selectableCourses = availableCourses.filter(
        (c) => c._id !== course._id,
      );
      if (selectableCourses.length > 0) {
        setShowBogoModal(true);
        return;
      }
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
    });
  };

  const handleBogoSelection = (selectedCourseId: Id<"courses">) => {
    const selectedFreeCourse = availableCourses?.find(
      (c) => c._id === selectedCourseId,
    );
    if (!selectedFreeCourse) return;

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
        originalPrice: selectedFreeCourse.price ?? 0,
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    setShowBogoModal(false);
  };

  const seatsLeft = Math.max(
    0,
    (course.capacity ?? 0) - getEnrolledCount(course),
  );
  const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;
  const isInCart = mounted ? inCart(course._id) : false;

  return (
    <>
      <Pressable
        onPress={() => router.push(`/course/${course._id}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        <Card className="overflow-hidden border-blue-200/80">
          <CourseImageCarousel imageUrls={course.imageUrls || []} />

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
              {course.name}
            </CardTitle>
          </CardHeader>

          <CardContent>
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
                  <Gift size={12} color="#6b7280" />
                  <Text className="text-xs text-muted-foreground">
                    Earn {calculatePointsEarned(course)} Mind Points
                  </Text>
                </View>
              </View>

              <Button
                size="sm"
                onPress={handleAddToCart}
                disabled={isInCart || isOutOfStock}
              >
                <View className="flex-row items-center">
                  <Plus size={14} color="#f5f7fa" />
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
      </Pressable>

      {showBogoModal && course.type && (
        <BogoSelectionModal
          isOpen={showBogoModal}
          onClose={() => setShowBogoModal(false)}
          onSelect={handleBogoSelection}
          courseType={
            course.type as
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
          sourceCourseId={course._id}
          sourceCourseName={course.name}
        />
      )}
    </>
  );
});
