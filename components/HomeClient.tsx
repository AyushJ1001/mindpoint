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

export default function HomeClient() {
  const courses = useQuery(api.courses.listCourses, { count: undefined });

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
          <div className="hero-video-container relative mx-auto w-full max-w-xl transition-all duration-500 hover:scale-105">
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

      {/* Featured Courses Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Featured Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover our most popular courses designed to enhance your mental
              health knowledge and professional skills
            </p>
          </div>

          {courses && courses.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-xl font-semibold">
                  Expert Instructors
                </h3>
                <p className="text-muted-foreground">
                  Learn from certified mental health professionals with years of
                  experience
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-xl font-semibold">
                  Comprehensive Curriculum
                </h3>
                <p className="text-muted-foreground">
                  Evidence-based content designed to meet industry standards
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-xl font-semibold">
                  Community Support
                </h3>
                <p className="text-muted-foreground">
                  Join a community of learners and professionals in the field
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="text-primary mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-xl font-semibold">
                  Flexible Learning
                </h3>
                <p className="text-muted-foreground">
                  Study at your own pace with 24/7 access to course materials
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="section-padding">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Quote className="text-primary mx-auto mb-6 h-12 w-12" />
            <blockquote className="mb-6 text-2xl font-medium italic md:text-3xl">
              "The Mind Point has transformed my understanding of mental health
              and equipped me with practical skills that I use every day in my
              practice."
            </blockquote>
            <cite className="text-muted-foreground text-lg">
              — Dr. Sarah Johnson, Licensed Therapist
            </cite>
          </div>
        </div>
      </section>
    </main>
  );
}
