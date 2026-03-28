import { View } from "react-native";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseOverview } from "./course-overview";
import { CourseModulesSection } from "./course-modules-section";

interface ResumeStudioCourseProps {
  course: PublicCourse;
}

export default function ResumeStudioCourse({ course }: ResumeStudioCourseProps) {
  return (
    <View>
      <CourseOverview description={course.description} />
      <CourseModulesSection learningOutcomes={course.learningOutcomes} />
    </View>
  );
}
