import { View } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";

interface MasterclassCourseProps {
  course: PublicCourse;
}

export default function MasterclassCourse({ course }: MasterclassCourseProps) {
  return (
    <View>
      <CourseOverview description={course.description} />
      <CourseModulesSection learningOutcomes={course.learningOutcomes} />
    </View>
  );
}
