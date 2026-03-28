import { View, Text, Pressable } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react-native";

interface InternshipCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
  onVariantSelect?: (hours: 120 | 240) => void;
}

export default function InternshipCourse({
  course,
  variants = [],
  onVariantSelect,
}: InternshipCourseProps) {
  const hasVariants = variants.length > 1;

  return (
    <View>
      <CourseOverview description={course.description} />

      {/* Duration selection for internship variants */}
      {hasVariants && (
        <View className="mt-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">
            Choose Your Plan
          </Text>
          <View className="gap-3">
            {variants.map((variant) => {
              const isSelected = variant._id === course._id;
              const duration = variant.duration || "Standard";
              return (
                <Pressable
                  key={variant._id}
                  onPress={() => {
                    const hours = duration.includes("240") ? 240 : 120;
                    onVariantSelect?.(hours);
                  }}
                >
                  <Card
                    className={`border-2 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Clock size={18} color={isSelected ? "#4338ca" : "#6b7280"} />
                        <View>
                          <Text className="text-sm font-semibold text-foreground">
                            {duration}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            Internship program
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Badge>
                          <Text className="text-xs font-semibold text-primary-foreground">
                            Selected
                          </Text>
                        </Badge>
                      )}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Allocation breakdown */}
      {course.allocation && course.allocation.length > 0 && (
        <View className="mt-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">
            Program Breakdown
          </Text>
          <View className="gap-2">
            {course.allocation.map((item: { topic: string; hours: number }, index: number) => (
              <View
                key={index}
                className="flex-row items-center justify-between rounded-lg bg-secondary px-4 py-3"
              >
                <Text className="flex-1 text-sm text-foreground">
                  {item.topic}
                </Text>
                <Text className="text-sm font-semibold text-primary">
                  {item.hours}h
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <CourseModulesSection learningOutcomes={course.learningOutcomes} />
    </View>
  );
}
