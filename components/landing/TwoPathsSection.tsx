import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight, HeartHandshake, GraduationCap } from "lucide-react";
import Link from "next/link";
import { GrowthIllustration } from "@/components/illustrations";

const PATHS = [
  {
    title: "I want personal support",
    description:
      "Therapy, counselling, and practical tools for navigating overthinking, anxiety, emotional stress, and relationships.",
    href: "/courses/therapy",
    cta: "Explore support options",
    icon: HeartHandshake,
    accent: "bg-[#e5f0ed]",
  },
  {
    title: "I want to build my career",
    description:
      "Certificates, diplomas, internships, and supervised learning for psychology students and aspiring professionals.",
    href: "/courses",
    cta: "See learning programs",
    icon: GraduationCap,
    accent: "bg-[#f1e7da]",
  },
];

export default function TwoPathsSection() {
  return (
    <section id="paths" className="home-section-md relative">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="brand-gold-rule" aria-hidden="true" />
              <span className="brand-kicker">Start where you are</span>
              <span className="brand-gold-rule" aria-hidden="true" />
            </div>
            <h2 className="font-display text-foreground mt-4 text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
              Two paths. One thoughtful place to begin.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-7 sm:text-lg">
              Whether you are here to understand yourself or to grow into the
              professional you want to become, TMP can meet you at that point.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {PATHS.map((path, index) => {
            const Icon = path.icon;
            return (
              <ScrollReveal key={path.title} transitionDelayMs={index * 90}>
                <div className="brand-card group relative h-full overflow-hidden rounded-[2rem] p-7 sm:p-8">
                  <div
                    className={`${path.accent} absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-70 transition-transform duration-700 group-hover:scale-110`}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="bg-primary/8 text-primary mb-7 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-foreground text-3xl leading-tight font-medium">
                      {path.title}
                    </h3>
                    <p className="text-muted-foreground mt-4 max-w-md text-base leading-7">
                      {path.description}
                    </p>
                    <Link
                      href={path.href}
                      className="text-primary mt-7 inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
                    >
                      {path.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 right-[8%] hidden select-none opacity-[0.1] mix-blend-multiply lg:block dark:mix-blend-screen dark:opacity-[0.08]">
        <GrowthIllustration className="h-16 w-24 rotate-[18deg]" />
      </div>
    </section>
  );
}
