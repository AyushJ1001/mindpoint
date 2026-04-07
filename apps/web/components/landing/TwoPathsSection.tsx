import { ScrollReveal } from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const PATHS = [
  {
    title: "I want personal support",
    description:
      "Therapy, counselling, and tools for managing overthinking, anxiety, and emotional stress.",
    href: "/courses/therapy",
    cta: "Explore support options",
  },
  {
    title: "I want to build my career",
    description:
      "Certificates, diplomas, internships, and supervised practice for psychology professionals.",
    href: "/courses",
    cta: "See programs",
  },
];

export default function TwoPathsSection() {
  return (
    <section id="paths" className="home-section-md relative">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
              Start where you are
            </span>
            <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Most people come here needing one of two things first.
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base leading-7 sm:text-lg">
              A softer place to land, or a clearer path forward.
            </p>
          </div>
        </ScrollReveal>

        {/* Clean two-column text, no images */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-10 sm:grid-cols-2 sm:gap-14">
          {PATHS.map((path) => (
            <ScrollReveal key={path.title}>
              <div className="text-center sm:text-left">
                <h3 className="text-foreground text-xl font-semibold sm:text-2xl">
                  {path.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-base leading-7">
                  {path.description}
                </p>
                <Link
                  href={path.href}
                  className="text-primary mt-5 inline-flex items-center gap-1.5 font-medium hover:underline"
                >
                  {path.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── Floating butterfly accent ── */}
      <div className="pointer-events-none absolute -bottom-8 right-[8%] hidden h-16 w-24 rotate-[18deg] select-none opacity-[0.14] mix-blend-multiply lg:block dark:mix-blend-screen dark:opacity-[0.1]">
        <Image src="/illustrations/growth.jpg" alt="" fill className="object-contain" sizes="96px" />
      </div>
    </section>
  );
}
