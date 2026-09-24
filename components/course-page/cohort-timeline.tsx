import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import type { CourseContent } from "@/lib/course-content/types";

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function CohortTimeline({ course }: { course: CourseContent }) {
  const liveStart = formatDate(course.liveStart);
  const liveEnd = formatDate(course.liveEnd);

  const steps = [
    {
      label: "Foundations open",
      value: course.selfPacedStart ?? "Self-paced, start anytime",
    },
    {
      label: "Live cohort begins",
      value: liveStart,
    },
    {
      label: "Live cohort ends",
      value: liveEnd,
    },
  ].filter((step) => step.value);

  const hasDates = Boolean(liveStart || course.selfPacedStart);

  return (
    <Section
      id="cohort"
      eyebrow="Upcoming cohort dates"
      title="When it runs."
      lead="Foundations is available immediately. The live cohort runs to a schedule so the group stays together."
      width="narrow"
      tone="mist"
    >
      {hasDates ? (
        <ol className="space-y-6">
          {steps.map((step, index) => (
            <li
              key={step.label}
              className="border-foreground/10 grid gap-2 border-t pt-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <span className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
                {step.label}
              </span>
              <span className="text-foreground/85 text-base">{step.value}</span>
              {index === steps.length - 1 && course.cohortSize ? (
                <span className="text-muted-foreground text-sm sm:col-start-2">
                  Capped at {course.cohortSize} places for real discussion.
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <ContentPlaceholder label="Cohort dates for this programme have not been confirmed yet. Add the next live cohort dates in the admin." />
      )}
    </Section>
  );
}
