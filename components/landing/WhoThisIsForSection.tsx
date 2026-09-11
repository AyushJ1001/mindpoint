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
      "I'm a career switcher exploring whether counselling is the right path for me.",
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
    <section className="brand-section-dark home-section-md relative overflow-hidden">
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-[#c7a768]" aria-hidden="true" />
                  <span className="text-[#9fd0cf] text-xs font-semibold tracking-[0.3em] uppercase">
                    Who belongs here
                  </span>
                </div>
                <h2 className="font-display mt-5 text-4xl leading-tight font-medium text-[#faf8f3] sm:text-5xl">
                  A serious learning space that still feels human.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-[#c9dbd8]">
                  TMP is designed for people who care deeply about psychology —
                  whether you are beginning, changing direction, practising, or
                  simply trying to understand yourself more clearly.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {PERSONAS.map((persona, index) => (
                  <ScrollReveal
                    key={persona.label}
                    transitionDelayMs={index * 80}
                  >
                    <blockquote className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-sm">
                      <span
                        className="font-display text-[#c7a768]/80 block text-4xl leading-none"
                        aria-hidden="true"
                      >
                        &ldquo;
                      </span>
                      <p className="mt-2 text-base leading-7 text-[#f4f0e7]">
                        {persona.quote}
                      </p>
                      <footer className="mt-5 text-xs font-semibold tracking-[0.16em] text-[#9fd0cf] uppercase">
                        {persona.label}
                      </footer>
                    </blockquote>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <LeafAccent className="brand-soft-float pointer-events-none absolute -bottom-4 left-[5%] hidden h-14 w-14 -rotate-[25deg] text-white opacity-10 select-none lg:block" />
      <div
        className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full border border-[#9fd0cf]/10"
        aria-hidden="true"
      />
    </section>
  );
}
