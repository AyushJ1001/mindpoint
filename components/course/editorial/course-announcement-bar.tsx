"use client";

import { Sparkles } from "lucide-react";

import { formatDate, typeLabel } from "@/components/course/editorial/helpers";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

export default function CourseAnnouncementBar({ course }: Props) {
  const start = formatDate(course.startDate);
  const isLive = course.usesBatches || course.type === "certificate";

  return (
    <div className="border-foreground/10 bg-primary text-primary-foreground border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2.5 text-center text-[0.78rem] sm:text-[0.82rem]">
        <span className="inline-flex items-center gap-2 font-semibold tracking-[0.18em] uppercase">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Now enrolling
        </span>
        <span className="text-primary-foreground/90">
          {course.name}
          {start ? ` starts ${start}` : ""} · {typeLabel(course.type)}
          {isLive ? ", live cohort, online" : ", online"}
        </span>
      </div>
    </div>
  );
}
