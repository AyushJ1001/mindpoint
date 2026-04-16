"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { formatINR } from "@/components/course/course-hero";
import type { PublicCourse } from "@mindpoint/backend";
import { getCoursePrice } from "@/lib/utils";

interface Props {
  course: PublicCourse;
  isOutOfStock: boolean;
  onReserve: () => void;
}

function tintClassFor(type?: string): string {
  switch (type) {
    case "certificate":
      return "calm-tint-certificate";
    case "diploma":
      return "calm-tint-diploma";
    case "therapy":
      return "calm-tint-therapy";
    case "supervised":
      return "calm-tint-supervised";
    case "internship":
      return "calm-tint-internship";
    case "pre-recorded":
      return "calm-tint-pre-recorded";
    case "masterclass":
      return "calm-tint-masterclass";
    case "worksheet":
      return "calm-tint-worksheet";
    case "resume-studio":
      return "calm-tint-resume-studio";
    default:
      return "calm-tint-certificate";
  }
}

// Appears once, just above the FAQ. Not sticky. Gives long-scroll readers a
// single terminal place to re-access the primary action.
export default function CourseTerminalCTA({
  course,
  isOutOfStock,
  onReserve,
}: Props) {
  if (course.type === "therapy" || course.type === "supervised") {
    return null;
  }

  const price = getCoursePrice(course);
  const poster = course.imageUrls?.[0] ?? null;
  const tintClass = tintClassFor(course.type);

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div className="flex flex-col items-start gap-6 border-t border-b border-foreground/10 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {poster && (
                <div
                  className={`${tintClass} relative h-20 w-16 flex-none overflow-hidden rounded-md`}
                  style={{
                    background:
                      "color-mix(in oklab, var(--hero-tint, var(--color-terracotta-light)) 62%, white)",
                  }}
                >
                  <Image
                    src={poster}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </div>
              )}
              <div>
                <p className="calm-kbd mb-2 text-foreground/55">Ready?</p>
                <p className="calm-terminal-summary">
                  {formatINR(price)}{" "}
                  <span className="text-foreground/55">
                    {"\u00b7"} {course.name}
                  </span>
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={onReserve}
              disabled={isOutOfStock}
              className="h-12 min-w-[11rem] text-base font-medium"
            >
              {isOutOfStock ? "Currently full" : "Add to cart"}
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
