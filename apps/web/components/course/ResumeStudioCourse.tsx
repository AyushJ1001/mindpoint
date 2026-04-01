import React from "react";
import CourseModulesSection from "./course-modules-section";
import type { PublicCourse } from "@mindpoint/backend";

interface ResumeStudioCourseProps {
  course: PublicCourse;
}

export default function ResumeStudioCourse({
  course,
}: ResumeStudioCourseProps) {
  return (
    <section className="py-16">
      <div className="container">
        <CourseModulesSection
          learningOutcomes={course.learningOutcomes ?? []}
        />
      </div>
    </section>
  );
}
