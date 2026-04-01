import React from "react";
import CourseModulesSection from "./course-modules-section";
import type { PublicCourse } from "@mindpoint/backend";

interface MasterclassCourseProps {
  course: PublicCourse;
}

export default function MasterclassCourse({ course }: MasterclassCourseProps) {
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
