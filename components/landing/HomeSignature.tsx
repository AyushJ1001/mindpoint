import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";

/**
 * Two signature moments for the homepage: the lifetime recording promise and
 * the ₹999 introduction pathway. Both are static-first; Reveal only removes an
 * 18px offset once the section is in view.
 */
export function HomeSignature() {
  return (
    <>
      {/* Lifetime recordings */}
      <section
        id="recordings"
        aria-labelledby="recordings-heading"
        className="relative isolate overflow-hidden bg-[linear-gradient(150deg,#12322e,#1a4a45_60%,#215c55)] py-section-sm text-white sm:py-section"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.18] [background-image:repeating-radial-gradient(circle_at_82%_62%,rgba(255,255,255,0.16)_0_1px,transparent_1px_34px)]"
        />
        <div className="container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="text-brand-gold text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
              For eligible new registrations
            </span>
            <h2
              id="recordings-heading"
              className="font-display mt-3 text-3xl leading-tight tracking-tight text-white sm:text-5xl"
            >
              Learn Live. Revisit for a Lifetime.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/85">
              Attend interactive live sessions and return to your recordings
              whenever you want to revisit a concept, refresh your understanding
              or continue at your own pace.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              &ldquo;Lifetime&rdquo; means for as long as The Mind Point&rsquo;s
              platform operates, with 90 days&rsquo; notice and a download
              window if it ever closes.
            </p>
          </Reveal>

          <Reveal delay={120} className="justify-self-center">
            <svg
              viewBox="0 0 240 120"
              className="text-brand-gold/40 h-[22rem] w-[30rem] max-w-full"
              aria-hidden="true"
            >
              <path
                d="M120 60c-14-26-32-34-48-26-20 10-20 42 0 52 16 8 34 0 48-26 14-26 32-34 48-26 20 10 20 42 0 52-16 8-34 0-48-26Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </Reveal>
        </div>
      </section>

      {/* ₹999 pathway */}
      <section
        id="introductions"
        aria-labelledby="intro-heading"
        className="bg-section-ivory py-section-sm sm:py-section"
      >
        <div className="container">
          <Reveal>
            <span className="text-brand-sage text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
              Introduction courses
            </span>
            <h2
              id="intro-heading"
              className="font-display text-brand-heading mt-3 max-w-2xl text-3xl leading-tight tracking-tight sm:text-5xl"
            >
              Start with ₹999. Take the next step when you&rsquo;re ready.
            </h2>
            <p className="text-brand-body mt-4 max-w-2xl text-lg leading-8">
              Begin with an introduction course and explore the foundations of a
              subject that interests you. Your eligible ₹999 fee is credited once
              toward a certificate course.
            </p>
          </Reveal>

          <div className="relative mt-10">
            <span
              aria-hidden="true"
              className="via-brand-gold/50 absolute top-0 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent to-transparent sm:block"
            />
            <ol className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "Step one",
                title: "Begin with ₹999",
                copy: "Self-paced, yours to keep, with no schedule to keep up with.",
              },
              {
                step: "Step two",
                title: "Explore the foundations",
                copy: "Recorded lessons and reading notes that make the vocabulary stick.",
              },
              {
                step: "Step three",
                title: "Continue to a certificate",
                copy: "Join a live cohort and apply the credit against the ₹4,500 fee.",
              },
            ].map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 90}>
                <div className="border-brand-gold/40 relative h-full border-t pt-4">
                  <span
                    aria-hidden="true"
                    className="bg-brand-gold absolute -top-px left-0 h-px w-10"
                  />
                  <span className="text-brand-sage text-[0.66rem] font-semibold tracking-[0.16em] uppercase">
                    {item.step}
                  </span>
                  <b className="font-display text-brand-heading mt-2 block text-xl">
                    {item.title}
                  </b>
                  <p className="text-brand-body mt-1 text-sm leading-relaxed">
                    {item.copy}
                  </p>
                </div>
              </Reveal>
            ))}
            </ol>
          </div>

          <Reveal delay={120}>
            <Link
              href="/courses/intro"
              className="text-brand-teal mt-8 inline-block text-sm font-semibold underline underline-offset-4"
            >
              See the introduction courses →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
