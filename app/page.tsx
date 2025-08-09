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
      {/* Hero: calming, content-forward, Satvic-inspired layout with warm, airy spacing */}
      <section className="relative overflow-hidden">
        <div className="from-primary/5 via-background to-accent/10 pointer-events-none absolute inset-0 bg-gradient-to-br" />
        <div className="relative container grid gap-10 py-16 md:grid-cols-2 md:items-center lg:py-24">
          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="text-muted-foreground mb-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
              Nurture mind & wellbeing
            </span>
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text text-4xl leading-tight font-semibold text-transparent md:text-5xl lg:text-6xl">
              The Mind Point
            </h1>
            <p className="text-muted-foreground mt-4 max-w-prose text-base leading-relaxed md:text-lg">
              Empowering minds through comprehensive mental health education and
              professional development. Learn with structured programs, live
              workshops, and science-backed resources.
            </p>
            <div className="mt-8 flex w-full flex-col items-start gap-3 sm:flex-row">
              <Button asChild size="lg" className="px-8 py-6 text-base">
                <Link href="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Courses
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base"
              >
                <Link href="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 grid w-full grid-cols-3 items-center gap-6 sm:max-w-[520px]">
              <div className="text-left">
                <div className="text-xl font-semibold">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Learners</div>
              </div>
              <div className="text-left">
                <div className="text-xl font-semibold">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs">Courses</div>
              </div>
              <div className="text-left">
                <div className="text-xl font-semibold">
                  <AnimatedCounter target={4.9} decimals={1} />
                </div>
                <div className="text-muted-foreground text-xs">Avg rating</div>
              </div>
            </div>
          </div>

          {/* Imagery */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="bg-primary/10 absolute -inset-6 -z-10 rounded-[28px] blur-2xl" />
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-0">
                <Image
                  src="/placeholder.svg?key=vtmm2"
                  alt="Guided learning in a calming environment"
                  width={1200}
                  height={900}
                  className="h-auto w-full object-cover"
                  priority
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values / Benefits */}
      <section className="bg-card/40 border-y py-12 md:py-16">
        <div className="container grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <Users className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Community-first</h3>
              <p className="text-muted-foreground text-sm">
                Learn with peers, mentors, and facilitators who care about
                holistic growth.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <Award className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Practitioner-led</h3>
              <p className="text-muted-foreground text-sm">
                Courses designed by experienced professionals grounded in
                evidence-based practice.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <Star className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Structured outcomes</h3>
              <p className="text-muted-foreground text-sm">
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
      <section className="bg-muted/40 py-14">
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
            <Card key={idx} className="h-full">
              <CardContent className="p-6">
                <Quote className="text-primary mb-4 h-6 w-6" />
                <p className="text-base leading-relaxed">{t.quote}</p>
                <div className="text-muted-foreground mt-4 text-sm">
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
          <Card className="bg-primary/5 border-0">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-2xl font-semibold md:text-3xl">
                  Start your journey to a calmer, clearer mind.
                </h3>
                <p className="text-muted-foreground mt-2 max-w-prose">
                  Join thousands learning practical tools for wellbeing and
                  professional growth.
                </p>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button asChild size="lg" className="px-8 py-6">
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
