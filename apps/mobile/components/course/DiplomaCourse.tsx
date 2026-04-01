import { View, Text } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Award, Clock } from "lucide-react-native";

const DIPLOMA_BENEFITS = [
  { icon: BookOpen, title: "In-Depth Curriculum", description: "Comprehensive study across key domains" },
  { icon: Users, title: "Expert Faculty", description: "Learn from experienced professionals" },
  { icon: Award, title: "Diploma Certificate", description: "Recognized credential for career advancement" },
  { icon: Clock, title: "Structured Program", description: "Guided learning path with clear milestones" },
];

interface DiplomaCourseProps {
  course: PublicCourse;
}

export default function DiplomaCourse({ course }: DiplomaCourseProps) {
  return (
    <View>
      <CourseOverview description={course.description} />
      <CourseModulesSection learningOutcomes={course.learningOutcomes} />
      <View className="mt-6 gap-3">
        {DIPLOMA_BENEFITS.map((benefit) => (
          <Card key={benefit.title} className="flex-row items-center gap-3">
            <View className="rounded-lg bg-primary/10 p-2">
              <benefit.icon size={20} color="#5b7a5e" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">
                {benefit.title}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {benefit.description}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
