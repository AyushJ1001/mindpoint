import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const OFFERINGS = [
  {
    struggle: "Overthinking & anxiety",
    solution: "Therapy & CBT tools",
    href: "/courses/therapy",
  },
  {
    struggle: "Career confusion in mental health",
    solution: "Structured certificate programs",
    href: "/courses/certificate",
  },
  {
    struggle: "Need someone to talk to",
    solution: "One-on-one therapy sessions",
    href: "/courses/therapy",
  },
  {
    struggle: "Want real clinical skills",
    solution: "Supervised practice & internships",
    href: "/courses/supervised",
  },
  {
    struggle: "Learning on a busy schedule",
    solution: "Self-paced courses",
    href: "/courses/pre-recorded",
  },
];

export default function WhatWeOfferSection() {
  return (
    <section className="home-section-md">
      <div className="container">
        <ScrollReveal>
          <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* Left column – heading, no image */}
            <div className="max-w-xl space-y-4 lg:pt-2">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                What we offer
              </span>
              <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Real tools for real life, arranged more like a conversation than
                a catalog.
              </h2>
              <p className="text-muted-foreground text-base leading-7 sm:text-lg">
                Instead of listing products in a row, the homepage should help
                people connect what they are struggling with to the kind of
                support or structure that actually fits.
              </p>
            </div>

            {/* Right column – offerings as a clean flowing list */}
            <div className="w-full max-w-4xl divide-y divide-border/40">
              {OFFERINGS.map((item) => (
                <div
                  key={item.struggle}
                  className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4"
                >
                  <span className="text-foreground leading-7">
                    {item.struggle}
                  </span>
                  <ArrowRight className="text-primary/40 hidden h-4 w-4 shrink-0 sm:block" />
                  <Link
                    href={item.href}
                    className="text-primary font-medium hover:underline sm:text-right"
                  >
                    {item.solution}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
