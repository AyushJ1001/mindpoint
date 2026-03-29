import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";
import { Card } from "@/components/ui/card";
import { Video, Users, Lightbulb, Award } from "lucide-react-native";

const MASTERCLASS_BENEFITS = [
  {
    icon: Video,
    title: "Expert-Led Sessions",
    description:
      "Learn directly from industry leaders and subject matter experts with deep practical knowledge.",
  },
  {
    icon: Users,
    title: "Interactive Learning",
    description:
      "Engage in live discussions, Q&A sessions, and collaborative learning experiences.",
  },
  {
    icon: Lightbulb,
    title: "Practical Insights",
    description:
      "Gain actionable knowledge and real-world techniques you can apply immediately.",
  },
  {
    icon: Award,
    title: "Certificate of Completion",
    description:
      "Receive a recognized certificate to showcase your new skills and knowledge.",
  },
];

interface MasterclassCourseProps {
  course: PublicCourse;
}

export default function MasterclassCourse({ course }: MasterclassCourseProps) {
  return (
    <View>
      <CourseOverview description={course.description} />
      <CourseModulesSection learningOutcomes={course.learningOutcomes} />

      {/* Benefits Section */}
      <View className="mt-8">
        <Text className="mb-2 text-center text-xl font-bold text-primary">
          Masterclass Benefits
        </Text>
        <Text className="mb-5 text-center text-sm text-muted-foreground">
          What makes this masterclass special
        </Text>

        <View className="gap-3">
          {MASTERCLASS_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="border-0"
                style={{
                  shadowColor: "#4338ca",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-start gap-3 p-4">
                  <LinearGradient
                    colors={["#4338ca", "#7c3aed"]}
                    style={{ height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 12 }}
                  >
                    <Icon size={20} color="#ffffff" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {benefit.title}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted-foreground">
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </View>
  );
}
