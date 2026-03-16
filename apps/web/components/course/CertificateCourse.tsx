import React from "react";

import CourseModulesSection from "./course-modules-section";
import type { PublicCourse } from "@mindpoint/backend";

interface CertificateCourseProps {
  course: PublicCourse;
}

export default function CertificateCourse({ course }: CertificateCourseProps) {
  return (
    <>
      {/* Learning Outcomes Section */}
      <section className="py-16">
        <div className="container">
          <CourseModulesSection
            learningOutcomes={course.learningOutcomes ?? []}
          />
        </div>
      </section>
    </>
  );
}
