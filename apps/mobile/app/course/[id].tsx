import { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { useCart } from "react-use-cart";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse } from "@mindpoint/backend";
import type { Id } from "@mindpoint/backend/data-model";
import {
  getCoursePrice,
  getOfferDetails,
} from "@mindpoint/domain/pricing";
import CourseTypeRenderer from "@/components/course/CourseTypeRenderer";
import { CourseHero } from "@/components/course/course-hero";
import { StickyCTA } from "@/components/course/sticky-cta";
import { BogoSelectionModal } from "@/components/BogoSelectionModal";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const courses = useQuery(api.courses.listCourses, { count: 100 });
  const { addItem, inCart } = useCart();
  const [showBogoModal, setShowBogoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const course = useMemo(
    () => courses?.find((c) => c._id === id) ?? null,
    [courses, id],
  );

  const variants = useMemo(() => {
    if (!course || !courses) return [];
    if (
      course.type !== "therapy" &&
      course.type !== "internship" &&
      course.type !== "supervised"
    ) {
      return [];
    }
    return courses.filter(
      (c) => c.name === course.name && c.type === course.type,
    );
  }, [course, courses]);

  const bogoCourses = useMemo(() => {
    if (!course || !courses || !course.type) return [];
    return courses.filter(
      (c) => c.type === course.type && c.bogo && c._id !== course._id,
    );
  }, [course, courses]);

  if (!courses) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#5b7a5e" />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg font-semibold text-foreground">
          Course not found
        </Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          This course may no longer be available.
        </Text>
      </View>
    );
  }

  const offerDetails = getOfferDetails(course);
  const displayPrice = getCoursePrice(course);
  const isInCart = mounted ? inCart(course._id) : false;
  const seatsLeft = Math.max(
    0,
    (course.capacity ?? 0) - (course.enrolledCount ?? 0),
  );
  const isOutOfStock = (course.capacity ?? 0) === 0 || seatsLeft === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isInCart) return;

    if (offerDetails?.hasBogo && bogoCourses.length > 0) {
      setShowBogoModal(true);
      return;
    }

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: displayPrice,
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
    const selectedFreeCourse = bogoCourses.find(
      (c) => c._id === selectedCourseId,
    );
    if (!selectedFreeCourse) return;

    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: displayPrice,
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
          selectedFreeCourse.description || "Free course via BOGO offer",
        price: 0,
        originalPrice: selectedFreeCourse.price ?? 0,
        imageUrls: selectedFreeCourse.imageUrls || [],
        courseType: selectedFreeCourse.type,
      },
    });

    setShowBogoModal(false);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!showBogoModal) {
      router.push("/checkout");
    }
  };

  const showHero =
    course.type !== "therapy" &&
    course.type !== "supervised" &&
    course.type !== "worksheet";

  const showStickyCTA = course.type !== "worksheet";

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: showStickyCTA ? 100 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {showHero && (
          <CourseHero
            course={course}
            offerDetails={offerDetails}
            seatsLeft={seatsLeft}
            isOutOfStock={isOutOfStock}
          />
        )}

        <View className="px-4">
          <CourseTypeRenderer course={course} variants={variants} />
        </View>
      </ScrollView>

      {showStickyCTA && (
        <StickyCTA
          price={displayPrice}
          originalPrice={
            offerDetails?.hasDiscount ? offerDetails.originalPrice : undefined
          }
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isInCart={isInCart}
          isOutOfStock={isOutOfStock}
        />
      )}

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
    </View>
  );
}
