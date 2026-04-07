import { ScrollReveal } from "@/components/ScrollReveal";
import { curatedQuotes } from "@/lib/course-content-data";
import { LeafAccent } from "@/components/illustrations";

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
          <div className="mx-auto max-w-5xl">
            {/* Section header – no shell wrapper */}
            <div className="relative mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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

              {/* Decorative accent */}
              <LeafAccent className="pointer-events-none absolute -top-3 right-0 hidden h-10 w-10 rotate-[30deg] opacity-40 lg:block" />
            </div>

            {/* Quotes as simple blockquotes, not cards */}
            <div className="grid gap-6 lg:grid-cols-3">
              {quotes.slice(0, 3).map((q, i) => (
                <blockquote
                  key={i}
                  className="border-primary/12 border-l-2 py-1 pl-5"
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
