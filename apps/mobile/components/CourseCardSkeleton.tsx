import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border">
      {/* Image placeholder */}
      <Skeleton className="h-44 w-full rounded-none" />

      {/* Card header - title */}
      <View className="px-4 pt-4 pb-2">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="mt-2 h-4 w-1/2 rounded" />
      </View>

      {/* Card content */}
      <View className="flex-row items-start justify-between px-4 pb-4">
        <View className="flex-1">
          {/* Price badge */}
          <Skeleton className="h-7 w-20 rounded-[999px]" />
          {/* Offer text */}
          <Skeleton className="mt-2 h-3 w-24 rounded" />
          {/* Mind Points text */}
          <Skeleton className="mt-2 h-3 w-32 rounded" />
        </View>
        {/* Add to cart button */}
        <Skeleton className="h-9 w-28 rounded-lg" />
      </View>
    </Card>
  );
}
