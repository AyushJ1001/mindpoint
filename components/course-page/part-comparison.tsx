import { CurriculumAccordion } from "@/components/course-page/curriculum-accordion";
import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import { cn } from "@/lib/utils";
import type { CourseContent } from "@/lib/course-content/types";

function FormatList({ formats }: { formats: string[] }) {
  return (
    <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {formats.map((format) => (
        <li
          key={format}
          className="text-foreground/75 flex items-center gap-2.5 text-sm"
        >
          <span
            aria-hidden="true"
            className="bg-primary h-1 w-1 flex-none rounded-full"
          />
          {format}
        </li>
      ))}
    </ul>
  );
}

export function PartComparison({ course }: { course: CourseContent }) {
  const { partOne, partTwo } = course;

  return (
    <Section
      id="parts"
      eyebrow="How it is taught"
      title="Two parts. One programme."
      lead="Part I is self-paced. Part II is live and faculty-led. They build on each other rather than repeat each other."
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <article className="border-foreground/10 bg-card flex flex-col rounded-2xl border p-6 sm:p-8">
          <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
            {partOne.title}
          </p>
          <h3 className="font-display text-foreground mt-3 text-2xl leading-snug">
            {partOne.subtitle}
          </h3>
          <FormatList formats={partOne.formats} />

          <div className="border-foreground/10 mt-7 border-t pt-6">
            <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
              Modules
            </p>
            <div className="mt-3">
              <CurriculumAccordion
                items={partOne.modules}
                emptyLabel="Part I modules have not been supplied yet. Add them in the admin so this renders a real module list."
              />
            </div>
          </div>

          {partOne.assessment ? (
            <p className="text-muted-foreground border-foreground/10 mt-6 border-t pt-5 text-sm">
              {partOne.assessment}
            </p>
          ) : null}

          <p className="text-muted-foreground mt-6 text-sm">
            Upgrade to the live Part II at any time by paying only the
            difference.
          </p>
        </article>

        <article
          className={cn(
            "flex flex-col rounded-2xl border p-6 sm:p-8",
            "border-primary/25 bg-primary/[0.04]",
          )}
        >
          <p className="text-primary/70 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
            {partTwo.title}
          </p>
          <h3 className="font-display text-foreground mt-3 text-2xl leading-snug">
            {partTwo.subtitle}
          </h3>
          <FormatList formats={partTwo.formats} />

          <div className="border-foreground/10 mt-7 border-t pt-6">
            <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
              Live sessions
            </p>
            <div className="mt-3">
              {partTwo.sessions.length > 0 ? (
                <ol className="divide-foreground/10 divide-y">
                  {partTwo.sessions.map((session, index) => (
                    <li
                      key={session}
                      className="flex gap-4 py-3 text-sm leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="water-accent font-display tabular-nums"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-foreground/85">{session}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ContentPlaceholder label="Live session topics for this programme have not been supplied yet." />
              )}
            </div>
          </div>

          {partTwo.assessment ? (
            <p className="text-muted-foreground border-foreground/10 mt-6 border-t pt-5 text-sm">
              {partTwo.assessment}
            </p>
          ) : null}
        </article>
      </div>
    </Section>
  );
}
