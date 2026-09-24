"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { cleanList } from "@/components/course/editorial/helpers";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

function headlineFor(course: PublicCourse): string {
  switch (course.type) {
    case "therapy":
      return "A space that meets you where you are.";
    case "supervised":
      return "Someone experienced, in your corner.";
    case "internship":
      return "Practice, under steady guidance.";
    case "diploma":
      return "Depth, taken one week at a time.";
    case "worksheet":
      return "A resource you can keep returning to.";
    case "pre-recorded":
      return "Learn it properly, at your own pace.";
    default:
      return "A calmer way to learn what this work asks of you.";
  }
}

export default function CourseNarrative({ course }: Props) {
  const reasons = cleanList(course.whyDifferent).slice(0, 4);

  if (reasons.length === 0) return null;

  return (
    <section className="calm-section">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">Why this exists</p>
          <h2 className="calm-section-title mt-5">{headlineFor(course)}</h2>

          <div className="border-foreground/10 mt-10 border-t pt-10">
            <p className="calm-kbd">The part that makes the difference</p>
            <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {reasons.map((reason, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="text-terracotta font-display mt-0.5 text-sm tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-foreground/85 text-[1rem] leading-[1.6]">
                    {reason}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
