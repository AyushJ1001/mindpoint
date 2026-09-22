import { ScrollReveal } from "@/components/ScrollReveal";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { ctaVariants } from "@/components/coastal/cta";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  PlaySquare,
  Sparkles,
  HeartPulse,
  Telescope,
  FileText,
  BookOpen,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Structured, practice-first learning with a credential you can actually use.",
    icon: Award,
  },
  {
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Real cases, clear milestones, and a mentor in your corner.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "The deeper commitment, for when you're ready to go all in.",
    icon: GraduationCap,
  },
  {
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Self-paced modules you can start tonight and revisit anytime.",
    icon: PlaySquare,
  },
  {
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "One topic, taught with depth by someone who lives it.",
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
    desc: "Honest feedback on real clinical work, from a working clinician.",
    icon: Telescope,
  },
  {
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "A psychology-specific CV that finally tells your story clearly.",
    icon: FileText,
  },
  {
    title: "Worksheets & Resources",
    href: "/courses/worksheet",
    desc: "Evidence-based tools you can download and use in the next session.",
    icon: BookOpen,
  },
];

const TRUST_POINTS = [
  "Expert-led and practice-first",
  "Small, attentive cohorts",
  "Certificates with honest wording",
  "Support that continues after the course",
];

export default function CoursesHero() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className={eyebrowVariants()}>Programs</span>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              There&apos;s a way in.{" "}
              <em className="italic">Find the one that fits.</em>
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg">
              Live cohorts, self-paced modules, therapy, supervision and career
              tools — each priced and paced for real life. Start where you are;
              we&apos;ll meet you there.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a href="#catalog" className={ctaVariants({ layout: "flex" })}>
                Browse all courses
              </a>
              <Link href="/contact" className="calm-link text-sm font-medium">
                Not sure where to start? Ask us
              </Link>
            </div>
            <ul className="border-border mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-dashed pt-6">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="text-foreground/70 inline-flex items-center gap-2 text-sm"
                >
                  <Check className="text-primary h-4 w-4 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded shadow-[0_40px_80px_-50px_rgba(19,46,43,0.6)]">
            <Image
              src="/coastal/calm.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((category) => (
            <ScrollReveal key={category.href}>
              <Link
                href={category.href}
                className="group border-border hover:border-primary hover:bg-card block h-full rounded border border-dashed p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-46px_rgba(19,46,43,0.5)]"
              >
                <div className="text-primary mb-5">
                  <category.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-display group-hover:text-primary mb-2 text-xl transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {category.desc}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
      <section className="container pb-20 sm:pb-28">
        <Link
          href="/courses/cbt-rebt-cbmt"
          className="group border-border hover:border-primary bg-card flex flex-col gap-5 rounded-2xl border border-dashed p-7 transition-all duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="max-w-2xl">
            <span className={eyebrowVariants({ size: "micro" })}>
              Featured course
            </span>
            <h2 className="font-display group-hover:text-primary mt-3 text-2xl transition-colors sm:text-3xl">
              CBT, REBT &amp; CBMT
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              An eight-week live certificate covering all three approaches — and
              how to use them with real clients, in a small supervised group.
            </p>
          </div>
          <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
            See the course
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </>
  );
}
