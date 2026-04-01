import { ScrollReveal } from "@/components/ScrollReveal";
import { Heart, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

const PATHS = [
  {
    title: "I want personal support",
    description:
      "Therapy, counselling, and tools for managing overthinking, anxiety, and emotional stress.",
    icon: Heart,
    href: "/courses/therapy",
    cta: "Explore support options",
  },
  {
    title: "I want to build my career",
    description:
      "Certificates, diplomas, internships, and supervised practice for psychology professionals.",
    icon: GraduationCap,
    href: "/courses",
    cta: "See programs",
  },
];

export default function TwoPathsSection() {
  return (
    <section id="paths" className="home-section-md relative -mt-6 sm:-mt-8">
      <div className="container">
        <ScrollReveal>
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
            <div className="max-w-xl space-y-4 lg:pt-2">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Start where you are
              </span>
              <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Most people come here needing one of two things first.
              </h2>
              <p className="text-muted-foreground text-base leading-7 sm:text-lg">
                A softer place to land, or a clearer path forward. The site
                should help people feel that difference immediately instead of
                making them sort through a wall of options.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {PATHS.map((path) => {
                const Icon = path.icon;
                return (
                  <article
                    key={path.title}
                    className="home-shell-soft rounded-[1.75rem] px-6 py-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="bg-primary/10 text-primary mb-4 inline-flex rounded-xl p-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-foreground text-xl font-semibold">
                      {path.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 leading-7">
                      {path.description}
                    </p>
                    <Link
                      href={path.href}
                      className="text-primary mt-5 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {path.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
