"use client";

import Link from "next/link";
import { Calendar, Clock, Radio, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultEmotionalHooks } from "@/lib/course-content-data";
import { formatCourseTimeRange } from "@/lib/course-schedule";
import type { PublicCourse } from "@mindpoint/backend";

// Keep utility functions for use by other components
export function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}

export function parseUTCDateOnly(dateStr: string): Date | null {
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = isoDate.exec(dateStr);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getOrdinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  if (rem10 === 1) return "st";
  if (rem10 === 2) return "nd";
  if (rem10 === 3) return "rd";
  return "th";
}

export function formatDateCommon(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

interface CourseHeroProps {
  course: PublicCourse;
}

export default function CourseHero({ course }: CourseHeroProps) {
  const emotionalHook =
    course.emotionalHook ||
    defaultEmotionalHooks[course.type || "certificate"] ||
    "Transform your understanding.";
  const isPreRecorded = course.type === "pre-recorded";
  const isWorksheet = course.type === "worksheet";
  const reassuranceLine = isWorksheet
    ? "A practical resource you can keep returning to when you need steadier ground."
    : isPreRecorded
      ? "Move at your own pace, with enough structure to keep the learning warm and usable."
      : "Live guidance, practical tools, and a pace that still leaves room to breathe.";

  // Build info badges
  const badges: Array<{ icon: typeof Calendar; label: string }> = [];

  if (course.startDate && !isPreRecorded && !isWorksheet) {
    badges.push({
      icon: Calendar,
      label: `Starts ${formatDateCommon(course.startDate)}`,
    });
  }

  const daysLabel = course.daysOfWeek?.length
    ? course.daysOfWeek.join(", ")
    : null;
  const timeLabel = formatCourseTimeRange(course.startTime, course.endTime);
  const scheduleLabel =
    !isPreRecorded && !isWorksheet && (daysLabel || timeLabel)
      ? [daysLabel, timeLabel].filter(Boolean).join(" • ")
      : null;

  if (scheduleLabel) {
    badges.push({
      icon: Clock,
      label: scheduleLabel,
    });
  }

  if (course.duration) {
    badges.push({ icon: Clock, label: course.duration });
  } else if (isPreRecorded) {
    badges.push({ icon: Clock, label: "Self-paced" });
  }

  if (!isPreRecorded && !isWorksheet) {
    badges.push({ icon: Radio, label: "Live + Interactive" });
  }

  if (!isWorksheet) {
    badges.push({ icon: Award, label: "Certificate Included" });
  }

  return (
    <section className="course-section-lg relative overflow-hidden pt-10 pb-12 sm:pt-14 lg:pt-16">
      <div
        aria-hidden="true"
        className="course-hero-glow pointer-events-none absolute inset-x-0 top-0 h-full"
      />
      <div className="relative container">
        <ScrollReveal>
          <div className="course-shell course-shell-strong relative mx-auto max-w-4xl overflow-hidden px-6 py-8 text-center sm:px-10 sm:py-10 lg:px-12">
            <div
              aria-hidden="true"
              className="bg-primary/10 absolute inset-x-16 top-0 h-28 rounded-full blur-3xl"
            />

            <nav
              className="text-muted-foreground relative mb-7 text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                href="/courses"
                className="hover:text-primary transition-colors"
              >
                Courses
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{course.name}</span>
            </nav>

            <div className="relative mx-auto max-w-3xl">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Thoughtful learning, made human
              </span>
              <h1 className="font-display text-foreground mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {emotionalHook}
              </h1>

              <p className="text-muted-foreground mt-4 text-lg leading-8">
                <span className="text-foreground font-medium">
                  {course.name}
                </span>
                {course.description && (
                  <span className="mt-2 block text-base leading-7 sm:text-[1.05rem]">
                    {course.description}
                  </span>
                )}
              </p>
            </div>

            {badges.length > 0 && (
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                {badges.map((badge) => (
                  <Badge
                    key={badge.label}
                    variant="secondary"
                    className="dark:bg-card/76 dark:text-foreground rounded-full border border-white/45 bg-white/78 px-3.5 py-1.5 text-sm shadow-sm dark:border-white/10"
                  >
                    <badge.icon className="mr-1.5 h-3.5 w-3.5" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            <div className="relative mt-9">
              <Button size="lg" asChild className="min-w-[12rem] shadow-sm">
                <a href="#pricing">Reserve your spot</a>
              </Button>
              <p className="text-muted-foreground mt-4 text-sm leading-6 sm:text-[0.96rem]">
                {reassuranceLine}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Keep CourseScheduleSection export for backward compatibility
export function CourseScheduleSection({
  ...props
}: {
  course: PublicCourse;
  customDuration?: string;
}) {
  void props;
  return null;
}
