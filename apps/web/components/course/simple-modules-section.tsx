import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@mindpoint/backend";

interface SimpleModulesSectionProps {
  course: PublicCourse;
}

export default function SimpleModulesSection({
  course,
}: SimpleModulesSectionProps) {
  // Use modules if available, fall back to learningOutcomes
  const items = course.modules?.length
    ? course.modules.map((m) => m.title)
    : course.learningOutcomes?.length
      ? course.learningOutcomes.map((lo) => lo.title)
      : [];

  if (items.length === 0) return null;

  return (
    <section className="course-section-md">
      <div className="container">
        <ScrollReveal>
          <div className="course-shell mx-auto max-w-5xl px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="max-w-2xl">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Inside the program
              </span>
              <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A paced, practical journey instead of one long information dump.
              </h2>
              <p className="text-muted-foreground mt-3 text-base leading-7 sm:text-lg">
                Each part builds on the last, so the learning feels digestible
                and grounded rather than overwhelming.
              </p>
            </div>

            <ol className="mt-8 space-y-4">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="border-border/70 dark:bg-card/70 grid gap-3 rounded-[1.35rem] border bg-white/72 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:px-5 dark:border-white/8"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="text-primary/70 text-xs font-semibold tracking-[0.28em] uppercase">
                      Part {i + 1}
                    </span>
                    <div className="bg-primary/20 mt-2 hidden h-px w-12 sm:block" />
                  </div>
                  <p className="text-foreground text-base leading-7 sm:text-[1.02rem]">
                    {item}
                  </p>
                </li>
              ))}
            </ol>

            <p className="text-muted-foreground mt-7 italic">
              Clear steps. Real application. Enough room to absorb what matters.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
