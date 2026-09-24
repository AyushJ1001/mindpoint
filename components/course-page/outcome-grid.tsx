import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import type { CourseContent } from "@/lib/course-content/types";

export function OutcomeGrid({ course }: { course: CourseContent }) {
  return (
    <Section
      id="outcomes"
      eyebrow="What you'll be able to do"
      title="Not topics. Abilities."
      lead="The concrete things you should be able to do by the end of the programme."
      width="narrow"
    >
      {course.learningOutcomes.length > 0 ? (
        <ul className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {course.learningOutcomes.map((outcome, index) => (
            <li key={outcome} className="flex gap-4">
              <span
                aria-hidden="true"
                className="water-accent font-display mt-0.5 text-sm tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-foreground/85 text-[1.02rem] leading-[1.6]">
                {outcome}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <ContentPlaceholder label="Learning outcomes for this programme have not been supplied yet. Add them in the admin so this section renders a real list." />
      )}
    </Section>
  );
}
