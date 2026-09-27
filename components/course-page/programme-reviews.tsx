"use client";

import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { StarRating } from "@/components/course/ratings";
import { getRelativeTime } from "@/lib/time-utils";
import { Section } from "@/components/course-page/section";

interface Props {
  courseId?: string | null;
}

// Live reviews for a programme page. Renders nothing until it has at least one
// review, so a page without reviews stays clean rather than showing an empty
// block. Ratings come from the reviews themselves.
export function ProgrammeReviews({ courseId }: Props) {
  const reviews = useQuery(
    api.courses.listReviewsForCourse,
    courseId ? { courseId: courseId as Id<"courses"> } : "skip",
  );

  const real = (reviews ?? []).filter((r) => r.userId !== "placeholder");
  if (real.length === 0) return null;

  const average = real.reduce((sum, r) => sum + r.rating, 0) / real.length;
  const shown = [...real]
    .filter((r) => r.content.trim().length >= 20)
    .sort((a, b) => b.rating - a.rating || b.content.length - a.content.length)
    .slice(0, 6);

  return (
    <Section
      id="reviews"
      eyebrow="In their words"
      title="From people who finished it."
      width="wide"
    >
      <div className="flex flex-wrap items-center gap-3">
        <StarRating rating={average} size="md" />
        <p className="text-muted-foreground text-sm">
          {average.toFixed(1)} average <span aria-hidden="true">&middot;</span>{" "}
          {real.length} review
          {real.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((review) => (
          <figure
            key={review._id as unknown as string}
            className="border-foreground/10 bg-card flex h-full flex-col rounded-2xl border p-6"
          >
            <StarRating rating={review.rating} size="sm" />
            <blockquote className="text-foreground/80 mt-4 flex-1 text-[0.95rem] leading-relaxed">
              &ldquo;{review.content.trim().replace(/^"|"$/g, "")}&rdquo;
            </blockquote>
            <figcaption className="text-muted-foreground mt-5 flex items-center gap-2 text-xs">
              <span className="text-foreground/70 font-medium">
                {review.userName}
              </span>
              <span
                aria-hidden="true"
                className="bg-foreground/30 h-1 w-1 rounded-full"
              />
              <span>
                {getRelativeTime(review.submittedAt ?? review._creationTime)}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
