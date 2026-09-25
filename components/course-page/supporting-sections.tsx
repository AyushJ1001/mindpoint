import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import type { CourseContent } from "@/lib/course-content/types";

export function ShortProposition({ course }: { course: CourseContent }) {
  return (
    <Section id="proposition" width="narrow" className="pt-4 sm:pt-6">
      <p className="calm-lead text-foreground/85 text-xl leading-[1.6] sm:text-2xl">
        {course.description}
      </p>

      <div className="border-foreground/10 mt-10 border-t pt-8">
        <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
          Before you start
        </p>
        {course.prerequisites.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {course.prerequisites.map((item) => (
              <li
                key={item}
                className="text-foreground/80 flex gap-3 text-sm leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="bg-primary mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full"
                />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <ContentPlaceholder
            label="Prerequisites for this programme have not been supplied yet."
            className="mt-4"
          />
        )}
      </div>
    </Section>
  );
}

export function AudienceSection({ course }: { course: CourseContent }) {
  return (
    <Section
      id="audience"
      eyebrow="Who it is for"
      title="Made for a particular person."
      width="narrow"
      tone="mist"
    >
      {course.audience.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {course.audience.map((item) => (
            <li
              key={item}
              className="border-foreground/10 bg-card text-foreground/85 rounded-xl border p-4 text-sm leading-relaxed"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <ContentPlaceholder label="The intended audience for this programme has not been supplied yet." />
      )}
    </Section>
  );
}

export function WeeklyCommitment({ course }: { course: CourseContent }) {
  return (
    <Section
      id="commitment"
      eyebrow="Typical weekly commitment"
      title="What a week looks like."
      width="narrow"
    >
      {course.weeklyCommitment ? (
        <p className="text-foreground/85 max-w-[62ch] text-lg leading-relaxed">
          {course.weeklyCommitment}
        </p>
      ) : (
        <ContentPlaceholder label="The typical weekly commitment for this programme has not been supplied yet. Add the expected hours for Part I and Part II." />
      )}
    </Section>
  );
}

export function Testimonials() {
  return (
    <Section
      id="testimonials"
      eyebrow="In their words"
      title="From people who finished it."
      width="narrow"
      tone="wash"
    >
      <ContentPlaceholder label="Testimonials have not been collected or approved for publication yet. They will appear here once they are." />
    </Section>
  );
}

export function Disclaimer({ course }: { course: CourseContent }) {
  return (
    <section id="disclaimer" className="scroll-mt-24 py-12">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-6">
        <div className="border-foreground/10 border-t pt-8">
          <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
            Ethical and educational note
          </p>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            {course.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
