import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const OFFERINGS = [
  {
    number: "01",
    struggle: "Overthinking & anxiety",
    solution: "Therapy & CBT tools",
    href: "/courses/therapy",
  },
  {
    number: "02",
    struggle: "Career confusion in mental health",
    solution: "Structured certificate programs",
    href: "/courses/certificate",
  },
  {
    number: "03",
    struggle: "Need someone to talk to",
    solution: "One-on-one therapy sessions",
    href: "/courses/therapy",
  },
  {
    number: "04",
    struggle: "Want real clinical skills",
    solution: "Supervised practice & internships",
    href: "/courses/supervised",
  },
  {
    number: "05",
    struggle: "Learning on a busy schedule",
    solution: "Self-paced courses",
    href: "/courses/pre-recorded",
  },
];

export default function WhatWeOfferSection() {
  return (
    <section className="home-section-md relative">
      <div className="container">
        <ScrollReveal>
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="max-w-xl lg:sticky lg:top-28">
              <div className="flex items-center gap-4">
                <span className="brand-gold-rule" aria-hidden="true" />
                <span className="brand-kicker">What we offer</span>
              </div>
              <h2 className="font-display text-foreground mt-4 text-4xl leading-tight font-medium sm:text-5xl">
                Start with the need. Find the right kind of support.
              </h2>
              <p className="text-muted-foreground mt-5 text-base leading-7 sm:text-lg">
                Instead of making you decode a catalogue, we organise TMP around
                the question people actually arrive with: “What would help me
                now?”
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-card/70 px-5 sm:px-7">
              {OFFERINGS.map((item) => (
                <Link
                  key={item.struggle}
                  href={item.href}
                  className="group grid gap-3 border-b border-border/60 py-6 last:border-b-0 sm:grid-cols-[3.2rem_1fr_auto] sm:items-center sm:gap-5"
                >
                  <span className="font-display text-primary/45 text-xl italic">
                    {item.number}
                  </span>
                  <div>
                    <p className="text-foreground font-medium">
                      {item.struggle}
                    </p>
                    <p className="text-primary mt-1 text-sm font-semibold">
                      {item.solution}
                    </p>
                  </div>
                  <span className="bg-primary/7 text-primary hidden h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1 sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
