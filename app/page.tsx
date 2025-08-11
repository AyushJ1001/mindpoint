"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Users, Award, ArrowRight, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { CourseCard } from "@/components/course-card";
import AnimatedCounter from "@/components/animated-counter";

export default function Home() {
  const courses = useQuery(api.courses.listCourses, { count: undefined });

  return (
    <main className="flex-1">
      {/* Hero: blend the video with the page background so edges merge as you scroll */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-indigo-900/40" />

        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/30 blur-3xl" />
          <div className="animate-float-slower absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/30 to-blue-500/30 blur-3xl" />
          <div className="animate-float-medium absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-300/20 to-indigo-400/20 blur-2xl" />
        </div>

        <div className="relative z-10 container grid gap-10 md:grid-cols-2 md:items-center">
          {/* Text */}
          <div className="hero-content flex flex-col items-start">
            <span className="mb-6 inline-flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 px-4 py-2 text-sm font-medium tracking-wide shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></span>
              Nurture mind & wellbeing
            </span>

            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              <span className="animate-gradient bg-gradient-to-r from-[#09094e] via-blue-800 to-blue-100 bg-clip-text text-transparent">
                The Mind Point
              </span>
            </h1>

            <p className="mt-4 max-w-prose bg-gradient-to-r from-blue-900/80 to-indigo-900/60 bg-clip-text text-base leading-relaxed font-medium text-transparent md:text-lg">
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
                className="border-blue-200/50 px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:bg-blue-50/50"
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent">
                  <AnimatedCounter target={10000} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Learners</div>
              </div>
              <div className="text-left transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Courses</div>
              </div>
              <div className="text-left transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-semibold text-transparent">
                  <AnimatedCounter target={4.8} decimals={1} />
                </div>
                <div className="text-muted-foreground text-xs">Avg rating</div>
              </div>
            </div>
          </div>

          {/* Imagery: video with proper layering */}
          <div className="hero-video-container relative mx-auto w-full max-w-xl transition-all duration-500 hover:scale-105">
            {/* Subtle backdrop for visual depth */}
            <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-white/20 to-white/10 blur-md" />
            {/* Video with original colors preserved */}
            <video
              src="/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 h-full w-full rounded-lg object-cover shadow-lg transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* Values / Benefits */}
      <section className="border-primary/10 border-y bg-gradient-to-br from-white/60 to-white/40 py-12 backdrop-blur-sm md:py-16">
        <div className="container grid gap-6 md:grid-cols-3">
          <div className="group flex items-start gap-4">
            <div className="from-primary/15 to-primary/5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-300 group-hover:scale-110">
              <Users className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground/90 text-lg font-semibold">
                Community-first
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learn with peers, mentors, and facilitators who care about
                holistic growth.
              </p>
            </div>
          </div>
          <div className="group flex items-start gap-4">
            <div className="from-primary/15 to-primary/5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-300 group-hover:scale-110">
              <Award className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground/90 text-lg font-semibold">
                Practitioner-led
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Courses designed by experienced professionals grounded in
                evidence-based practice.
              </p>
            </div>
          </div>
          <div className="group flex items-start gap-4">
            <div className="from-primary/15 to-primary/5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-300 group-hover:scale-110">
              <Star className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground/90 text-lg font-semibold">
                Structured outcomes
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Clear pathways, actionable tools, and measurable progress every
                step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Featured Courses
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Discover our comprehensive range of mental health and professional
              development programs.
            </p>
          </div>

          {courses?.courses && courses.courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">
                No courses available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new courses and programs.
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Button asChild variant="ghost" className="group">
              <Link href="/courses" className="inline-flex items-center">
                Browse all courses
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial band */}
      <section className="from-primary/5 to-accent/5 bg-gradient-to-br via-white/30 py-14 backdrop-blur-sm">
        <div className="container grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "The Mind Point’s approach helped me bring calm and clarity into my daily routine.",
              name: "Ananya Sharma",
              role: "Therapist-in-training",
            },
            {
              quote:
                "Practical, grounded, and compassionate. The lessons are easy to apply.",
              name: "Rahul Verma",
              role: "Team Lead",
            },
            {
              quote:
                "I felt supported throughout. The community and facilitators are amazing.",
              name: "Meera Iyer",
              role: "Educator",
            },
          ].map((t, idx) => (
            <Card
              key={idx}
              className="border-primary/10 h-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <Quote className="text-primary mb-4 h-6 w-6" />
                <p className="text-foreground/90 text-base leading-relaxed">
                  {t.quote}
                </p>
                <div className="text-muted-foreground mt-4 text-sm font-medium">
                  — {t.name}, {t.role}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16">
        <div className="from-primary/10 to-accent/10 pointer-events-none absolute inset-0 bg-gradient-to-tr via-transparent" />
        <div className="relative container">
          <Card className="border-0 bg-gradient-to-br from-white/90 to-white/70 shadow-xl backdrop-blur-sm">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-foreground/90 text-2xl font-semibold md:text-3xl">
                  Start your journey to a calmer, clearer mind.
                </h3>
                <p className="text-muted-foreground mt-2 max-w-prose leading-relaxed">
                  Join thousands learning practical tools for wellbeing and
                  professional growth.
                </p>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button
                  asChild
                  size="lg"
                  className="btn-video-harmony px-8 py-6"
                >
                  <Link href="/courses">Join a program</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
