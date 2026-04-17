"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@mindpoint/backend";

interface Props {
  course: PublicCourse;
}

export default function CourseOutcomes({ course }: Props) {
  const outcomes = (course.outcomes ?? [])
    .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
    .map((o) => o.trim())
    .slice(0, 5);

  if (outcomes.length === 0) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">What changes after</p>
            <h2 className="calm-section-title mt-5">
              You walk away different.
            </h2>
          </div>

          <div className="mt-12">
            {outcomes.map((outcome, i) => (
              <div key={i} className="calm-outcome-row">
                <span aria-hidden="true" className="calm-arrow">
                  &rarr;
                </span>
                <p className="calm-outcome-line">{outcome}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
