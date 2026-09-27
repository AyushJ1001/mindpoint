"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import { Id } from "@/lib/backend/data-model";
import { ScrollReveal } from "@/components/ScrollReveal";
import ReviewForm from "@/components/course/review-form";
import { StarRating } from "@/components/course/ratings";
import { getRelativeTime } from "@/lib/time-utils";

interface Props {
  courseId: Id<"courses">;
  // Reserved for future type-aware copy variations.
  courseType?: string;
}

// Pick the most useful reviews to pull-quote: longest-but-still-readable,
// highest-rated, deduplicated by author.
function pickPullQuotes<
  T extends {
    content: string;
    rating: number;
    userName: string;
    userId: string;
  },
>(reviews: T[], limit = 4): T[] {
  const real = reviews.filter((r) => r.userId !== "placeholder");
  const seenAuthors = new Set<string>();
  return real
    .filter(
      (r) => r.content.trim().length >= 20 && r.content.trim().length <= 240,
    )
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.content.length - a.content.length;
    })
    .filter((r) => {
      const key = r.userId || r.userName.toLowerCase();
      if (seenAuthors.has(key)) return false;
      seenAuthors.add(key);
      return true;
    })
    .slice(0, limit);
}

export default function CourseFromStudents({ courseId }: Props) {
  const reviews = useQuery(api.courses.listReviewsForCourse, {
    courseId,
    sortBy: "rating",
  });

  const [formOpen, setFormOpen] = useState(false);

  const pullQuotes = useMemo(() => {
    if (!reviews) return [];
    return pickPullQuotes(reviews);
  }, [reviews]);

  // Only surface the section when there are at least two real, usable quotes.
  // No placeholders. The page is allowed to be shorter.
  if (reviews === undefined) {
    return null;
  }
  if (pullQuotes.length < 2) {
    // Still render an empty-but-useful state with the share prompt, so students
    // can contribute. Keeps the calm feel.
    return (
      <section className="calm-section-tight">
        <div className="calm-container">
          <ScrollReveal>
            <div>
              <p className="calm-section-number">From students</p>
              <h2 className="calm-section-title mt-5">
                Reviews arrive quietly.
              </h2>
            </div>
            <p className="calm-section-lead mt-5 max-w-[58ch]">
              We don&rsquo;t stack fake testimonials. As real students finish
              this course, their reflections will land here.
            </p>

            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              className="calm-link mt-8 text-sm"
            >
              {formOpen ? "Hide form" : "Share your experience \u2192"}
            </button>

            {formOpen && (
              <div className="mt-8 max-w-2xl">
                <ReviewForm courseId={courseId} />
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>
    );
  }

  const realReviews = reviews.filter((r) => r.userId !== "placeholder");
  const reviewCount = realReviews.length;
  const averageRating =
    reviewCount > 0
      ? realReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">From students</p>
            <h2 className="calm-section-title mt-5">How it actually lands.</h2>
          </div>

          <div className="mt-14 space-y-14">
            {pullQuotes.map((q) => (
              <figure key={q._id as unknown as string} className="max-w-[54ch]">
                <StarRating rating={q.rating} size="sm" />
                <blockquote className="calm-pull-quote mt-4">
                  &ldquo;{q.content.trim().replace(/^"|"$/g, "")}&rdquo;
                </blockquote>
                <figcaption className="text-foreground/55 mt-5 flex items-center gap-3 text-sm">
                  <span className="text-foreground/75 font-medium">
                    {q.userName}
                  </span>
                  <span
                    aria-hidden="true"
                    className="bg-foreground/30 h-1 w-1 rounded-full"
                  />
                  <span className="calm-kbd">
                    {getRelativeTime(q.submittedAt ?? q._creationTime)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="border-foreground/10 mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8">
            <div className="flex items-center gap-3">
              <StarRating rating={averageRating} size="sm" />
              <p className="calm-kbd text-foreground/55">
                {averageRating.toFixed(1)} &middot; {reviewCount} review
                {reviewCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              className="calm-link text-sm"
            >
              {formOpen ? "Hide form" : "Share your experience \u2192"}
            </button>
          </div>

          {formOpen && (
            <div className="mt-10 max-w-2xl">
              <ReviewForm courseId={courseId} />
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
