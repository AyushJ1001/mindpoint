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
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find your path in mental health.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Structured programs, live workshops, self-paced learning, and
              professional support — all in one place. Start wherever feels right
              for you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category) => (
              <ScrollReveal key={category.href}>
                <Link
                  href={category.href}
                  className="group block rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <category.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.desc}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
