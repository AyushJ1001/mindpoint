import { ScrollReveal } from "@/components/ScrollReveal";
import { curatedQuotes } from "@/lib/course-content-data";

interface CuratedQuotesSectionProps {
  courseType?: string;
}

export default function CuratedQuotesSection({
  courseType,
}: CuratedQuotesSectionProps) {
  const quotes =
    curatedQuotes[courseType || "certificate"] || curatedQuotes.certificate;

  if (!quotes || quotes.length === 0) return null;

  return (
    <section className="course-section-sm pb-4 sm:pb-5">
      <div className="container">
        <ScrollReveal>
          <div className="course-shell-soft mx-auto max-w-5xl px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  A few voices before you decide
                </span>
                <h2 className="font-display text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Real people tend to describe the same thing: clarity that
                  stays with them.
                </h2>
              </div>
              <p className="text-muted-foreground max-w-md text-sm leading-6 sm:text-base">
                A little reassurance before you get to the practical details.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {quotes.slice(0, 3).map((q, i) => (
                <blockquote
                  key={i}
                  className="border-border/70 dark:bg-card/72 rounded-[1.3rem] border bg-white/78 px-4 py-4 dark:border-white/8"
                >
                  <p className="text-foreground text-sm leading-6 italic sm:text-base">
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <footer className="text-muted-foreground mt-3 text-xs font-medium tracking-[0.18em] uppercase">
                    {q.initials}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
