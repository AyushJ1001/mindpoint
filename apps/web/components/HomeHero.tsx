import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/animated-counter";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import HomeAdminButton from "@/components/HomeAdminButton";

const HIGHLIGHTS = [
  {
    title: "Expert-led cohorts",
    description:
      "Live mentorship from practitioners who actively work in counseling and psychology.",
    icon: GraduationCap,
  },
  {
    title: "Evidence-first curriculum",
    description:
      "Every module is structured for practical implementation, not just theoretical recall.",
    icon: ShieldCheck,
  },
  {
    title: "Lifelong community",
    description:
      "Join peer circles, alumni channels, and continuous support after course completion.",
    icon: Users,
  },
  {
    title: "Career acceleration",
    description:
      "Build portfolio-ready skills through projects, supervised practice, and capstone work.",
    icon: Sparkles,
  },
];

export default function HomeHero({
  canAccessAdmin = false,
}: {
  canAccessAdmin?: boolean;
}) {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lavender-100/70 via-white to-lavender-50/70 dark:from-background dark:via-background dark:to-background" />
        <div className="pointer-events-none absolute -top-32 -left-16 h-72 w-72 rounded-full bg-lavender-200/40 blur-3xl dark:bg-lavender-700/20" />
        <div className="pointer-events-none absolute top-10 -right-14 h-80 w-80 rounded-full bg-lavender-200/35 blur-3xl dark:bg-lavender-700/20" />

        <div className="relative z-10 container grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:gap-14">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-lavender-200 bg-white/70 px-4 py-2 text-sm font-medium text-lavender-900 shadow-[0_12px_25px_-20px_rgba(124,111,155,0.9)] backdrop-blur dark:border-lavender-700/70 dark:bg-card/50 dark:text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Nurture mind & wellbeing
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="animate-gradient block bg-gradient-to-r from-lavender-900 via-primary to-lavender-200 bg-clip-text text-transparent dark:from-lavender-100 dark:via-lavender-200 dark:to-cream-100">
                  The Mind Point
                </span>
              </h1>

              <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
                Empowering minds through comprehensive mental health education
                and professional development. Learn with structured programs,
                live workshops, and science-backed resources.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="btn-video-harmony w-full sm:w-auto"
              >
                <Link href="/courses">
                  <BookOpen className="h-5 w-5" />
                  Explore Courses
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/about">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {canAccessAdmin ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : process.env.NEXT_PUBLIC_CONVEX_URL ? (
                <HomeAdminButton />
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:max-w-[520px] sm:gap-4">
              <div className="rounded-2xl border border-lavender-200 bg-white/70 p-3 shadow-[0_10px_22px_-18px_rgba(124,111,155,0.8)] backdrop-blur dark:border-lavender-700/45 dark:bg-card/55">
                <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-semibold text-transparent">
                  <AnimatedCounter target={10000} suffix="+" />
                </div>
                <p className="text-muted-foreground text-xs">Learners</p>
              </div>
              <div className="rounded-2xl border border-lavender-200 bg-white/70 p-3 shadow-[0_10px_22px_-18px_rgba(124,111,155,0.8)] backdrop-blur dark:border-lavender-700/45 dark:bg-card/55">
                <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-semibold text-transparent">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <p className="text-muted-foreground text-xs">Courses</p>
              </div>
              <div className="rounded-2xl border border-lavender-200 bg-white/70 p-3 shadow-[0_10px_22px_-18px_rgba(124,111,155,0.8)] backdrop-blur dark:border-lavender-700/45 dark:bg-card/55">
                <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-semibold text-transparent">
                  <AnimatedCounter target={4.8} decimals={1} />
                </div>
                <p className="text-muted-foreground text-xs">Avg rating</p>
              </div>
            </div>
          </div>

          <div className="hero-video-container relative mx-auto w-full max-w-md rounded-[2rem] border border-lavender-200 bg-white/65 p-3 shadow-[0_34px_58px_-36px_rgba(124,111,155,0.95)] backdrop-blur-md dark:border-lavender-700/45 dark:bg-card/55">
            <div className="absolute -right-4 -bottom-4 flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/95 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-md dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Trusted by thousands
            </div>

            <div className="overflow-hidden rounded-[1.4rem]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                poster="/hero-poster.jpg"
              >
                <source src="/hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      <VideoTestimonialsSection />

      <section className="section-padding relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lavender-50/75 via-white to-lavender-50/80 dark:from-background dark:via-background dark:to-background" />
        <div className="relative z-10 container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Why People Choose The Mind Point
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for serious learners who want clarity, confidence, and
              practical outcomes in mental health work.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item) => (
              <article
                key={item.title}
                className="group rounded-[1.4rem] border border-lavender-200 bg-white/78 p-6 shadow-[0_20px_38px_-28px_rgba(124,111,155,0.9)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 dark:border-lavender-700/45 dark:bg-card/58"
              >
                <div className="mb-4 inline-flex rounded-2xl border border-lavender-200 bg-lavender-100/75 p-3 text-primary dark:border-lavender-700/70 dark:bg-card/60 dark:text-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl leading-tight font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
