import { useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { Star, MessageSquare } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsSectionProps {
  courseId: Id<"courses">;
  courseType?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          color={star <= rating ? "#f59e0b" : "#e2dcd4"}
          fill={star <= rating ? "#f59e0b" : "transparent"}
        />
      ))}
    </View>
  );
}

function formatReviewDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsSection({
  courseId,
  courseType,
}: ReviewsSectionProps) {
  const reviews = useQuery(api.courses.listReviewsForCourse, {
    courseId,
    sortBy: "date",
  });

  const sectionTitle =
    courseType === "therapy" || courseType === "supervised"
      ? "Client Reviews"
      : "Student Reviews";

  if (!reviews) {
    return (
      <View className="mt-6">
        <Text className="mb-4 text-lg font-semibold text-foreground">
          {sectionTitle}
        </Text>
        <View className="gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-2">
        <MessageSquare size={20} color="#5b7a5e" />
        <Text className="text-lg font-semibold text-foreground">
          {sectionTitle}
        </Text>
        <Text className="text-sm text-muted-foreground">
          ({reviews.length})
        </Text>
      </View>

      {reviews.length === 0 ? (
        <Card>
          <Text className="text-center text-sm text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {reviews.slice(0, 6).map((review: {
            _id: string;
            rating: number;
            text?: string;
            userName?: string;
            _creationTime: number;
          }) => (
            <Card key={review._id}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">
                  {review.userName || "Anonymous"}
                </Text>
                <StarRating rating={review.rating} />
              </View>
              {review.text && (
                <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                  {review.text}
                </Text>
              )}
              <Text className="mt-2 text-xs text-muted-foreground">
                {formatReviewDate(review._creationTime)}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
