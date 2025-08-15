import React from "react";

import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface CertificateCourseProps {
  course: Doc<"courses">;
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
