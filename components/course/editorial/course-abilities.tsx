"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { cleanList } from "@/components/course/editorial/helpers";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

export default function CourseAbilities({ course }: Props) {
  const outcomes = cleanList(course.outcomes).slice(0, 6);
  if (outcomes.length === 0) return null;

  const midpoint = Math.ceil(outcomes.length / 2);
  const columns = [outcomes.slice(0, midpoint), outcomes.slice(midpoint)];

  return (
    <section className="calm-section-tight">
      <div className="calm-container-wide">
        <ScrollReveal>
          <p className="calm-section-number">What you&rsquo;ll be able to do</p>
          <h2 className="calm-section-title mt-5">
            Not topics. <em className="text-terracotta italic">Abilities.</em>
          </h2>
          <span aria-hidden="true" className="calm-title-ornament mt-6" />

          <div className="mt-12 grid gap-x-14 gap-y-8 sm:grid-cols-2">
            {columns.map((column, columnIndex) => (
              <ul key={columnIndex} className="space-y-6">
                {column.map((outcome, index) => (
                  <li key={outcome} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="text-terracotta font-display mt-0.5 text-sm tabular-nums"
                    >
                      {String(columnIndex * midpoint + index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-foreground/85 text-[1.02rem] leading-[1.6]">
                      {outcome}
                    </p>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
