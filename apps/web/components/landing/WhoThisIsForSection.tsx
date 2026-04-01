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
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Who this is for
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl text-lg leading-relaxed">
            Whether you&apos;re a psychology student looking to bridge theory and
            practice, a working professional exploring a career shift into mental
            health, or someone who simply wants to understand the mind more
            deeply — this is your space. The Mind Point was built for the
            curious, the compassionate, and the committed.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PERSONAS.map((persona, index) => (
            <ScrollReveal key={persona.label}>
              <article
                className="rounded-2xl border border-border bg-card p-6"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <blockquote className="text-foreground/80 text-base italic leading-relaxed">
                  &ldquo;{persona.quote}&rdquo;
                </blockquote>
                <p className="text-muted-foreground mt-3 text-sm">
                  — {persona.label}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
