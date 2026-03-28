import { View, Text, Pressable } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { showRupees, getCoursePrice } from "@mindpoint/domain/pricing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  Brain,
  Heart,
  Lock,
  Globe,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const THERAPY_BENEFITS = [
  {
    icon: Shield,
    title: "Licensed Professionals",
    description: "Work with certified and experienced therapists",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions at times that work for you",
  },
  {
    icon: Brain,
    title: "Evidence-Based",
    description: "Approaches grounded in scientific research",
  },
  {
    icon: Heart,
    title: "Affordable Care",
    description: "Quality mental health support at accessible prices",
  },
  {
    icon: Lock,
    title: "Confidential",
    description: "Your privacy is our top priority",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Connect from anywhere in the world",
  },
];

interface TherapyCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
}

export default function TherapyCourse({
  course,
  variants = [],
}: TherapyCourseProps) {
  const router = useRouter();
  const sortedVariants =
    variants.length > 0
      ? [...variants].sort(
          (a, b) => ((a as any).sessions ?? 0) - ((b as any).sessions ?? 0),
        )
      : [course];

  return (
    <View>
      {/* Plan selection */}
      <View className="mt-4">
        <Text className="mb-1 text-2xl font-bold text-foreground">
          {course.name}
        </Text>
        <Text className="mb-4 text-sm text-muted-foreground">
          Choose a plan that works for you
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
                        {variant.description || "Therapy sessions"}
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

      {/* Benefits */}
      <View className="mt-6">
        <Text className="mb-3 text-lg font-semibold text-foreground">
          Why Choose Our Therapy
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {THERAPY_BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="w-[47%]">
              <benefit.icon size={24} color="#4338ca" />
              <Text className="mt-2 text-sm font-semibold text-foreground">
                {benefit.title}
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {benefit.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </View>
  );
}
