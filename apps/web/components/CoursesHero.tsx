import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  PlaySquare,
  Sparkles,
  HeartPulse,
  Telescope,
  FileText,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Structured learning with a credential you can build on.",
    icon: Award,
  },
  {
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Hands-on practice with a mentor in your corner.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "A deeper commitment for those ready to go further.",
    icon: GraduationCap,
  },
  {
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Self-paced modules you can revisit anytime.",
    icon: PlaySquare,
  },
  {
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "Focused sessions on one topic, taught by someone who lives it.",
    icon: Sparkles,
  },
  {
    title: "Therapy Sessions",
    href: "/courses/therapy",
    desc: "A safe, professional space to be heard and supported.",
    icon: HeartPulse,
  },
  {
    title: "Supervised Programs",
    href: "/courses/supervised",
    desc: "Guided feedback on real clinical work, from someone who cares.",
    icon: Telescope,
  },
  {
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "Help telling your professional story clearly and compellingly.",
    icon: FileText,
  },
];

export default function CoursesHero() {
  return (
    <>
      <section className="section-padding relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full opacity-[0.22]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--color-terracotta-light) 76%, transparent), transparent 66%)",
          }}
          aria-hidden="true"
        />
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find your path in mental health.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Structured programs, live workshops, self-paced learning, and
              professional support — all in one place. Start wherever feels
              right for you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <ScrollReveal>
            <div className="home-shell-soft mx-auto max-w-6xl overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                    Browse by category
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
                    Jump into a category, or scroll down for a calmer, grouped
                    catalog.
                  </p>
                </div>
                <p className="text-muted-foreground text-xs tracking-[0.28em] uppercase">
                  Scroll →
                </p>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6">
                <div className="flex w-max gap-3">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.href}
                      href={category.href}
                      className="group border-border/60 bg-card/60 hover:border-border hover:bg-card relative flex w-[18.5rem] flex-none items-start gap-3 rounded-[1.35rem] border px-4 py-4 shadow-[0_16px_36px_-30px_rgba(124,111,155,0.65)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="bg-primary/10 text-primary mt-0.5 inline-flex h-11 w-11 flex-none items-center justify-center rounded-[1.05rem]">
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-foreground group-hover:text-primary text-sm leading-6 font-semibold">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                          {category.desc}
                        </p>
                      </div>
                      <div
                        className="pointer-events-none absolute -right-3 -bottom-3 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                        style={{
                          background:
                            "radial-gradient(circle, color-mix(in oklab, var(--color-primary) 24%, transparent), transparent 70%)",
                        }}
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
