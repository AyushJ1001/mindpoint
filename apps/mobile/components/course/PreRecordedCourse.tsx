import { View, Text } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";
import { Card } from "@/components/ui/card";
import { Play, Clock, RefreshCw, Download } from "lucide-react-native";

const SELF_PACED_BENEFITS = [
  { icon: Play, title: "Instant Access", description: "Start learning immediately after enrollment" },
  { icon: Clock, title: "Learn At Your Pace", description: "No deadlines, no pressure" },
  { icon: RefreshCw, title: "Lifetime Access", description: "Revisit materials anytime" },
  { icon: Download, title: "Downloadable Resources", description: "Access materials offline" },
];

interface PreRecordedCourseProps {
  course: PublicCourse;
}

export default function PreRecordedCourse({ course }: PreRecordedCourseProps) {
  return (
    <View>
      <CourseOverview description={course.description} />
      <CourseModulesSection learningOutcomes={course.learningOutcomes} />
      <View className="mt-6 gap-3">
        {SELF_PACED_BENEFITS.map((benefit) => (
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
