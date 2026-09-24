"use client";

import Image from "next/image";
import { CalendarDays, Clock, Users } from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import {
  cleanLines,
  formatDate,
  scheduleLine,
  typeLabel,
} from "@/components/course/editorial/helpers";
import type { PublicCourse } from "@/lib/backend";

interface HeroBatch {
  _id: string;
  label?: string;
  startDate?: string;
  startTime?: string;
}

interface Props {
  course: PublicCourse;
  batches?: HeroBatch[];
  activeBatchId?: string | null;
}

export default function CourseEditorialHero({
  course,
  batches = [],
  activeBatchId,
}: Props) {
  const batch =
    batches.find((item) => item._id === activeBatchId) ?? batches[0] ?? null;
  const start = formatDate(batch?.startDate ?? course.startDate);
  const image = course.imageUrls?.[0] ?? null;
  const lead = cleanLines(course.description);
  const isLiveCohort =
    course.usesBatches ||
    course.type === "certificate" ||
    course.type === "diploma" ||
    course.type === "supervised" ||
    course.type === "internship";

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal>
          <div className="flex items-center gap-4">
            <span className="text-terracotta text-[0.72rem] font-semibold tracking-[0.32em] uppercase">
              {typeLabel(course.type)}
            </span>
            <span className="bg-foreground/15 h-px flex-1" />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <ScrollReveal>
            <h1 className="font-display text-foreground text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[4rem]">
              {course.name}
            </h1>

            {course.emotionalHook ? (
              <p className="font-display text-terracotta mt-5 text-2xl italic sm:text-3xl">
                {course.emotionalHook}
              </p>
            ) : null}

            {lead.length > 0 ? (
              <div className="text-muted-foreground mt-6 max-w-xl space-y-2 text-lg leading-relaxed">
                {lead.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : null}

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
                Try it first
              </a>
            </div>

            <ul className="text-muted-foreground mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <CalendarDays className="text-terracotta h-4 w-4" aria-hidden="true" />
                {start ? `Starts ${start}` : "Self-paced, start anytime"}
              </li>
              {scheduleLine(course) ? (
                <li className="inline-flex items-center gap-2">
                  <Clock className="text-terracotta h-4 w-4" aria-hidden="true" />
                  {scheduleLine(course)}
                </li>
              ) : null}
              <li className="inline-flex items-center gap-2">
                <Users className="text-terracotta h-4 w-4" aria-hidden="true" />
                {isLiveCohort ? "Small, capped cohorts" : "Learn at your own pace"}
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal className="order-first lg:order-last">
            <div className="relative mx-auto w-full max-w-md">
              <div className="border-foreground/10 bg-card rotate-[-1.5deg] rounded-[1.75rem] border p-3 shadow-[0_50px_100px_-60px_rgba(19,46,43,0.65)]">
                <div className="bg-secondary/40 relative aspect-[4/5] overflow-hidden rounded-[1.35rem]">
                  {image ? (
                    <Image
                      src={image}
                      alt={course.name}
                      fill
                      unoptimized
                      priority
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-10">
                      <Image
                        src="/logo.png"
                        alt="The Mind Point"
                        width={220}
                        height={220}
                        className="h-auto w-40 opacity-80"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
