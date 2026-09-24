"use client";

import Image from "next/image";
import { CalendarDays, Clock, Users } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { showRupees } from "@/lib/utils";
import type { PublicCourse } from "@/lib/backend";

interface HeroBatch {
  _id: string;
  label?: string;
  startDate?: string;
  startTime?: string;
}

interface CourseHeroBrandProps {
  course: PublicCourse;
  batches?: HeroBatch[];
  activeBatchId?: string | null;
  onAddToCart: () => void;
}

function typeLabel(course: PublicCourse) {
  const map: Record<string, string> = {
    certificate: "Certificate Course",
    diploma: "Diploma Programme",
    internship: "Internship Programme",
    masterclass: "Masterclass",
    "pre-recorded": "Self-paced Course",
    therapy: "Therapy",
    supervised: "Supervised Practice",
    worksheet: "Worksheets & Resources",
    "resume-studio": "Resume Studio",
  };
  return map[course.type ?? ""] ?? "Course";
}

export default function CourseHeroBrand({
  course,
  batches = [],
  activeBatchId,
}: CourseHeroBrandProps) {
  const batch =
    batches.find((item) => item._id === activeBatchId) ?? batches[0] ?? null;
  const image = course.imageUrls?.[0] ?? null;

  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-20">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-4">
            <span className="text-terracotta text-[0.72rem] font-semibold tracking-[0.3em] uppercase">
              {typeLabel(course)}
            </span>
            <span className="bg-foreground/12 h-px flex-1" />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <h1 className="font-display text-foreground text-4xl leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-[4.2rem]">
              {course.name}
            </h1>
            {course.emotionalHook ? (
              <p className="font-display text-terracotta mt-4 text-2xl italic sm:text-3xl">
                {course.emotionalHook}
              </p>
            ) : null}
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              {course.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#ways"
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
              >
                Choose how you train
                <span aria-hidden="true">›</span>
              </a>
              <a
                href="#taste"
                className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
              >
                Try the core skill first
              </a>
              {course.price ? (
                <span className="text-muted-foreground ml-1 text-sm">
                  from {showRupees(course.price)}
                </span>
              ) : null}
            </div>

            <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <CalendarDays className="text-terracotta h-4 w-4" />
                {batch?.startDate
                  ? `Starts ${batch.startDate}`
                  : "Self-paced, start anytime"}
              </li>
              <li className="inline-flex items-center gap-2">
                <Clock className="text-terracotta h-4 w-4" />
                {batch?.startTime
                  ? `Live · ${batch.startTime}`
                  : (course.duration ?? typeLabel(course))}
              </li>
              <li className="inline-flex items-center gap-2">
                <Users className="text-terracotta h-4 w-4" />
                Small, capped cohorts
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal className="order-first lg:order-last">
            <div className="border-foreground/10 bg-secondary/40 relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border shadow-[0_40px_90px_-60px_rgba(19,46,43,0.7)]">
              {image ? (
                <Image
                  src={image}
                  alt={course.name}
                  fill
                  unoptimized
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-10">
                  <Image
                    src="/logo.png"
                    alt="The Mind Point"
                    width={200}
                    height={200}
                    className="h-auto w-40 opacity-80"
                  />
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
