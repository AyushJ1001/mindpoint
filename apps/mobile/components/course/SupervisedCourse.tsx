import { View, Text, Pressable } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { showRupees, getCoursePrice } from "@mindpoint/domain/pricing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "expo-router";

interface SupervisedCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
}

export default function SupervisedCourse({
  course,
  variants = [],
}: SupervisedCourseProps) {
  const router = useRouter();
  const sortedVariants =
    variants.length > 0
      ? [...variants].sort(
          (a, b) => ((a as any).sessions ?? 0) - ((b as any).sessions ?? 0),
        )
      : [course];

  return (
    <View>
      <View className="mt-4">
        <Text className="mb-1 text-2xl font-bold text-foreground">
          {course.name}
        </Text>
        <Text className="mb-4 text-sm text-muted-foreground">
          Choose your supervision plan
        </Text>

        <View className="gap-3">
          {sortedVariants.map((variant) => {
            const sessions = (variant as any).sessions ?? 0;
            const price = getCoursePrice(variant);
            const isSelected = variant._id === course._id;

            return (
              <Pressable
                key={variant._id}
                onPress={() => router.replace(`/course/${variant._id}`)}
              >
                <Card
                  className={`border-2 ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-foreground">
                        {sessions} {sessions === 1 ? "Session" : "Sessions"}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        Supervised practice sessions
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-primary">
                        {showRupees(price)}
                      </Text>
                      {isSelected && (
                        <Badge className="mt-1">
                          <Text className="text-xs text-primary-foreground">
                            Selected
                          </Text>
                        </Badge>
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
