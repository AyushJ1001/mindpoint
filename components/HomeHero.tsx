import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/animated-counter";

export default function HomeHero() {
  return (
    <main className="flex-1">
      {/* Hero: blend the video with the page background so edges merge as you scroll */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-950 dark:via-slate-950 dark:to-indigo-950" />

        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/30 blur-3xl dark:from-blue-600/20 dark:to-indigo-700/10" />
          <div className="animate-float-slower absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/30 to-blue-500/30 blur-3xl dark:from-indigo-600/20 dark:to-blue-700/10" />
          <div className="animate-float-medium absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-400/20 blur-2xl dark:from-blue-500/15 dark:to-indigo-500/15" />
        </div>

        <div className="relative z-10 container grid gap-10 md:grid-cols-2 md:items-center">
          {/* Text */}
          <div className="hero-content flex flex-col items-start">
            <span className="mb-6 inline-flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 px-4 py-2 text-sm font-medium tracking-wide shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 dark:border-blue-400/20 dark:from-blue-900/60 dark:to-indigo-900/50 dark:text-white">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-300 dark:to-indigo-300"></span>
              Nurture mind & wellbeing
            </span>

            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              <span className="animate-gradient bg-gradient-to-r from-[#09094e] via-blue-800 to-blue-100 bg-clip-text text-transparent dark:from-indigo-200 dark:via-blue-200 dark:to-sky-300">
                The Mind Point
              </span>
            </h1>

            <p className="mt-4 max-w-prose bg-gradient-to-r from-blue-900/80 to-indigo-900/60 bg-clip-text text-base leading-relaxed font-medium text-transparent md:text-lg dark:from-indigo-200 dark:to-blue-200">
              Empowering minds through comprehensive mental health education and
              professional development. Learn with structured programs, live
              workshops, and science-backed resources.
            </p>
            <div className="mt-8 flex w-full flex-col items-start gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="btn-video-harmony px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  Explore Courses
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-200/50 px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:bg-blue-50/50 dark:border-blue-300/30 dark:hover:border-blue-300/50 dark:hover:bg-blue-900/30"
              >
                <Link href="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 grid w-full grid-cols-3 items-center gap-6 sm:max-w-[520px]">
              <div className="text-left transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent dark:from-indigo-300 dark:to-blue-300">
                  <AnimatedCounter target={10000} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Learners</div>
              </div>
              <div className="text-left transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent dark:from-indigo-300 dark:to-blue-300">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Courses</div>
              </div>
              <div className="text-left transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent dark:from-indigo-300 dark:to-blue-300">
                  <AnimatedCounter target={4.8} decimals={1} />
                </div>
                <div className="text-muted-foreground text-xs">Avg rating</div>
              </div>
            </div>
          </div>

          {/* Imagery: video with proper layering */}
          <div className="hero-video-container relative mx-auto w-full max-w-lg transition-all duration-500 hover:scale-105">
            {/* Subtle backdrop for visual depth */}
            <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-white/20 to-white/10 blur-md dark:from-blue-400/10 dark:to-indigo-400/5" />

            {/* Video container with rounded corners and shadow */}
            <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur-sm dark:from-slate-900/60 dark:to-slate-800/40">
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

              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-muted/50">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Choose The Mind Point?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              We combine academic excellence with practical application to
              provide you with the best learning experience
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-6 text-center transition-all hover:shadow-lg">
              <div className="text-primary mx-auto mb-4 h-12 w-12">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from certified mental health professionals with years of
                experience
              </p>
            </div>

            <div className="rounded-lg border p-6 text-center transition-all hover:shadow-lg">
              <div className="text-primary mx-auto mb-4 h-12 w-12">
                <BookOpen className="h-full w-full" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Comprehensive Curriculum
              </h3>
              <p className="text-muted-foreground">
                Evidence-based content designed to meet industry standards
              </p>
            </div>

            <div className="rounded-lg border p-6 text-center transition-all hover:shadow-lg">
              <div className="text-primary mx-auto mb-4 h-12 w-12">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Community Support</h3>
              <p className="text-muted-foreground">
                Join a community of learners and professionals in the field
              </p>
            </div>

            <div className="rounded-lg border p-6 text-center transition-all hover:shadow-lg">
              <div className="text-primary mx-auto mb-4 h-12 w-12">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Flexible Learning</h3>
              <p className="text-muted-foreground">
                Study at your own pace with 24/7 access to course materials
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
