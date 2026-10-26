import { StarRating } from "@/components/course/ratings";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { getRelativeTime } from "@/lib/time-utils";
import { GOOGLE_RATING, GOOGLE_REVIEWS } from "@/lib/googleReviews";
import { REVIEW_HIGHLIGHTS } from "@/lib/reviewHighlights";

/** Approximate review age, matching the relative time shown on Google. */
function reviewAge(monthsAgo: number) {
  return getRelativeTime(Date.now() - monthsAgo * 30.44 * 86_400_000);
}

const captionClass =
  "text-muted-foreground mt-4 text-xs font-medium tracking-[0.04em]";

// Each review appears once: the Google reviews in full, then short quotes
// from course feedback forms. The rating is shown here and nowhere else on
// the homepage.
export function HomeReviews() {
  return (
    <section aria-labelledby="reviews-heading" className="py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className={eyebrowVariants()}>Student reviews</span>
            <h2
              id="reviews-heading"
              className="font-display mt-4 text-3xl tracking-tight sm:text-5xl"
            >
              What Our Students Say After Learning With Us
            </h2>
          </div>
          <div className="border-border flex items-center gap-4 border-l pl-5">
            <span className="font-display text-4xl leading-none">
              {GOOGLE_RATING.average.toFixed(1)}
            </span>
            <div>
              <StarRating rating={GOOGLE_RATING.average} size="sm" />
              <p className="text-muted-foreground mt-1 text-sm">
                from {GOOGLE_RATING.count} reviews on Google
              </p>
            </div>
          </div>
        </div>

        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {GOOGLE_REVIEWS.map((review) => (
            <li key={review.author}>
              <figure className="border-primary/40 flex h-full flex-col border-l-2 pl-5">
                <blockquote className="text-foreground/85 flex-1 leading-relaxed">
                  “{review.content}”
                </blockquote>
                <figcaption className={captionClass}>
                  {review.author} · Google review ·{" "}
                  {reviewAge(review.monthsAgo)}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="border-border mt-14 border-t border-dashed pt-10">
          <h3 className="text-muted-foreground text-sm font-semibold">
            From course feedback forms
          </h3>
          <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REVIEW_HIGHLIGHTS.map((review) => (
              <li key={review.author}>
                <figure>
                  <blockquote className="font-display text-lg leading-snug">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className={captionClass}>
                    {review.author} · {review.source}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
