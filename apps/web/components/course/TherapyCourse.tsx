import React from "react";
import ChoosePlan from "@/components/therapy/choose-plan";
import type { PublicCourse } from "@mindpoint/backend";

interface TherapyCourseProps {
  course: PublicCourse;
  variants?: PublicCourse[];
}

export default function TherapyCourse({
  course,
  variants = [],
}: TherapyCourseProps) {
  return (
    <>
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {course.name}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
            Choose the level of support that feels right.
          </p>
        </div>
      </section>
      <ChoosePlan
        course={course}
        variants={variants}
        onBook={(payload) => {
          console.log("Booking payload:", payload);
        }}
      />
    </>
  );
}
