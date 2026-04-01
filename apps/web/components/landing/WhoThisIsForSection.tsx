import { ScrollReveal } from "@/components/ScrollReveal";

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
    <section className="home-section-sm pt-4 sm:pt-6">
      <div className="container">
        <ScrollReveal>
          <div className="home-shell-soft mx-auto max-w-6xl px-6 py-7 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
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

              <div className="grid gap-4 md:grid-cols-2">
                {PERSONAS.map((persona, index) => (
                  <article
                    key={persona.label}
                    className="home-subpanel rounded-[1.35rem] px-5 py-5"
                    style={{ transitionDelay: `${index * 90}ms` }}
                  >
                    <blockquote className="text-foreground/85 text-base leading-7 italic">
                      &ldquo;{persona.quote}&rdquo;
                    </blockquote>
                    <p className="text-muted-foreground mt-3 text-sm font-medium tracking-[0.14em] uppercase">
                      {persona.label}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
