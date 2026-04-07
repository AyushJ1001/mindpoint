import { ScrollReveal } from "@/components/ScrollReveal";
import { LeafAccent } from "@/components/illustrations";

const PERSONAS = [
  {
    quote:
      "I'm a psychology student wanting real-world skills, not just textbook theory.",
    label: "Psychology Student",
  },
  {
    quote:
      "I'm a career switcher exploring whether counseling is the right path for me.",
    label: "Career Changer",
  },
  {
    quote:
      "I'm a practicing therapist who wants structured supervision and peer community.",
    label: "Working Professional",
  },
  {
    quote:
      "I want to understand mental health better — for myself and the people I care about.",
    label: "Lifelong Learner",
  },
];

export default function WhoThisIsForSection() {
  return (
    <section className="home-section-sm relative pt-4 sm:pt-6">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
              {/* Left column – heading */}
              <div>
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  Who this is for
                </span>
                <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Built for the curious, the compassionate, and the
                  not-quite-sure-yet.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-8">
                  Whether you&apos;re studying, shifting careers, practicing
                  already, or simply trying to understand yourself better, there
                  should be a clear way in.
                </p>
              </div>

              {/* Right column – personas as flowing blockquotes */}
              <div className="space-y-6">
                {PERSONAS.map((persona, index) => (
                  <blockquote
                    key={persona.label}
                    className="border-primary/15 relative border-l-2 py-1 pl-5"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <p className="text-foreground/85 text-base leading-7 italic">
                      &ldquo;{persona.quote}&rdquo;
                    </p>
                    <footer className="text-muted-foreground mt-2 text-sm font-medium tracking-[0.14em] uppercase">
                      {persona.label}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Floating leaf accent ── */}
      <LeafAccent className="pointer-events-none absolute -bottom-4 left-[6%] hidden h-10 w-10 -rotate-[25deg] opacity-[0.35] select-none lg:block" />
    </section>
  );
}
