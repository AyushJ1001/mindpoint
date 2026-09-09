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
  ArrowUpRight,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Structured learning with a credential you can build on.",
    icon: Award,
    note: "Learn",
  },
  {
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Hands-on practice with guidance, feedback, and real application.",
    icon: BriefcaseBusiness,
    note: "Practice",
  },
  {
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "A deeper, longer learning journey for those ready to go further.",
    icon: GraduationCap,
    note: "Advance",
  },
  {
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Flexible self-paced modules you can return to whenever you need.",
    icon: PlaySquare,
    note: "Self-paced",
  },
  {
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "Focused learning experiences built around one useful topic at a time.",
    icon: Sparkles,
    note: "Explore",
  },
  {
    title: "Therapy Sessions",
    href: "/courses/therapy",
    desc: "A professional, supportive space to pause, understand, and move forward.",
    icon: HeartPulse,
    note: "Support",
  },
  {
    title: "Supervised Programs",
    href: "/courses/supervised",
    desc: "Guided feedback and structured practice for developing clinical confidence.",
    icon: Telescope,
    note: "Supervision",
  },
  {
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "Practical help presenting your psychology experience with clarity and confidence.",
    icon: FileText,
    note: "Career",
  },
];

export default function CoursesHero() {
  return (
    <>
      <section className="brand-hero relative overflow-hidden border-b border-primary/5 py-16 sm:py-20 lg:py-24">
        <div className="container relative z-10">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="brand-gold-rule" aria-hidden="true" />
                <span className="brand-kicker">The Mind Point Academy</span>
                <span className="brand-gold-rule" aria-hidden="true" />
              </div>
              <h1 className="font-display text-foreground mx-auto mt-6 max-w-4xl text-5xl leading-[1.02] font-medium tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Find the kind of learning that fits
                <span className="text-primary block italic">where you are now.</span>
              </h1>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
                From first explorations to professional training, TMP brings psychology education,
                supervised practice, and personal support into one thoughtful learning ecosystem.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="home-section-md">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span className="brand-kicker">Choose your path</span>
              <h2 className="font-display text-foreground mt-4 text-4xl font-medium sm:text-5xl">
                Eight ways to begin — without the catalogue overwhelm.
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-8">
                Start with the format or goal that feels most relevant. You can always move between paths as you grow.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, index) => (
              <ScrollReveal key={category.href} transitionDelayMs={index * 60}>
                <Link
                  href={category.href}
                  className="brand-card group relative block h-full overflow-hidden rounded-[1.8rem] p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[#deebe8] opacity-55 transition-transform duration-500 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <div className="bg-primary/8 text-primary inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                        <category.icon className="h-5 w-5" />
                      </div>
                      <span className="text-primary/55 text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
                        {category.note}
                      </span>
                    </div>
                    <h3 className="font-display text-foreground text-2xl leading-tight font-medium transition-colors group-hover:text-primary">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      {category.desc}
                    </p>
                    <div className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                      Explore
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
