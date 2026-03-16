import React from "react";

import InternshipSection from "./internship-section";
import type { PublicCourse } from "@mindpoint/backend";

interface InternshipCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
  onVariantSelect?: (hours: 120 | 240) => void;
}

export default function InternshipCourse({
  course,
  variants = [],
  onVariantSelect,
}: InternshipCourseProps) {
  return (
    <>
      {/* Internship Details Section */}
      <section className="py-16">
        <div className="container">
          <InternshipSection
            internship={course}
            variants={variants}
            onVariantSelect={onVariantSelect}
          />
        </div>
      </section>
    </>
  );
}
