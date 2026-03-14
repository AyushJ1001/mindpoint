import Link from "next/link";
import {
  Award,
  BriefcaseBusiness,
  FileText,
  BookOpen,
  HeartPulse,
  PlaySquare,
  Sparkles,
  Telescope,
  GraduationCap,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Professional certifications to strengthen your mental-health foundation.",
    icon: Award,
  },
  {
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Supervised practical immersion with structured learning tracks.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "Long-form curriculum for advanced conceptual and clinical depth.",
    icon: GraduationCap,
  },
  {
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Self-paced modules for flexible learning windows and revision.",
    icon: PlaySquare,
  },
  {
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "Focused sessions with specialists on trending therapeutic themes.",
    icon: Sparkles,
  },
  {
    title: "Therapy Sessions",
    href: "/courses/therapy",
    desc: "Guided support sessions led by qualified professionals.",
    icon: HeartPulse,
  },
  {
    title: "Supervised Programs",
    href: "/courses/supervised",
    desc: "Case-based development under active mentor supervision.",
    icon: Telescope,
  },
  {
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "Portfolio and resume refinement for psychology careers.",
    icon: FileText,
  },
];

export default function CoursesHero() {
  return (
    <>
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/70 via-white to-indigo-100/75 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-950" />
        <div className="pointer-events-none absolute -top-28 left-0 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl dark:bg-blue-500/20" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-indigo-300/35 blur-3xl dark:bg-indigo-500/20" />

        <div className="relative z-10 container text-center">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-blue-200/70 bg-white/78 px-6 py-10 shadow-[0_26px_48px_-30px_rgba(37,99,235,0.9)] backdrop-blur sm:px-10 dark:border-blue-900/45 dark:bg-slate-950/60">
            <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-300">
              TMP Academy
            </p>
            <h1 className="mb-5 text-5xl font-semibold tracking-tight text-blue-950 sm:text-6xl dark:text-blue-100">
              Courses Built For Practice
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
              Choose specialized learning paths designed to improve competency,
              confidence, and career momentum.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Course Categories
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg sm:text-xl">
              Pick your lane and start with a pathway that matches your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative overflow-hidden rounded-[1.4rem] border border-blue-200/75 bg-gradient-to-br from-white to-blue-50/80 p-6 shadow-[0_20px_38px_-28px_rgba(37,99,235,0.88)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_28px_48px_-28px_rgba(37,99,235,0.95)] dark:border-blue-900/45 dark:bg-gradient-to-br dark:from-slate-950/85 dark:to-blue-950/42"
              >
                <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-200/60 blur-2xl dark:bg-blue-700/25" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-2xl border border-blue-200/70 bg-blue-100/80 p-3 text-blue-700 dark:border-blue-800/70 dark:bg-blue-950/65 dark:text-blue-200">
                    <category.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold leading-tight tracking-tight text-blue-950 transition-colors group-hover:text-blue-700 dark:text-blue-100 dark:group-hover:text-blue-200">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container">
          <div className="rounded-[1.8rem] border border-blue-200/70 bg-white/75 px-6 py-10 text-center shadow-[0_24px_45px_-32px_rgba(37,99,235,0.95)] backdrop-blur sm:px-10 dark:border-blue-900/45 dark:bg-slate-950/58">
            <div className="mb-5 inline-flex rounded-2xl border border-blue-200/70 bg-blue-100/80 p-4 text-blue-700 dark:border-blue-800/70 dark:bg-blue-950/60 dark:text-blue-200">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              All Available Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Browse the full catalog and enroll in programs that move your
              practice forward.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
