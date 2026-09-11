import Link from "next/link";
import { ArrowRight, BookOpenCheck, Layers3 } from "lucide-react";

type LearningPortalPromoProps = {
  compact?: boolean;
};

export default function LearningPortalPromo({
  compact = false,
}: LearningPortalPromoProps) {
  return (
    <section
      className={
        compact
          ? "px-3 pb-12 sm:px-6"
          : "px-6 py-20 sm:px-10 lg:px-[7vw] lg:py-28"
      }
      aria-labelledby={compact ? "portal-promo-title" : "home-portal-title"}
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-[#0b3f3e] text-[#faf8f3]">
        <div
          className="pointer-events-none absolute -top-28 -right-20 h-80 w-80 rounded-full border border-[#9fd0cf]/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-10 bottom-0 h-48 w-48 bg-[radial-gradient(circle,rgba(142,193,195,0.2),transparent_68%)]"
          aria-hidden="true"
        />

        <div
          className={`relative grid gap-10 ${
            compact
              ? "p-7 sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end"
              : "p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:p-16"
          }`}
        >
          <div>
            <h2
              id={compact ? "portal-promo-title" : "home-portal-title"}
              className={`font-display max-w-3xl font-medium tracking-[-0.04em] ${
                compact
                  ? "text-4xl leading-[0.98] sm:text-5xl"
                  : "text-5xl leading-[0.94] sm:text-6xl lg:text-7xl"
              }`}
            >
              Your learning deserves
              <span className="block text-[#b9dedd] italic">
                a place of its own.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#d2e1de] sm:text-lg">
              The TMP Learning Portal brings your course journey, resources, and
              progress into one calmer, clearer place built for focused
              psychology learning.
            </p>
            <p className="mt-5 text-[0.66rem] font-bold tracking-[0.2em] text-[#9fd0cf] uppercase">
              The TMP Learning Portal · One connected learning experience
            </p>
          </div>

          <div className="lg:justify-self-end">
            {!compact && (
              <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-[#e8f1ef]">
                  <BookOpenCheck className="h-4 w-4 text-[#9fd0cf]" />
                  Learning organised around your journey
                </div>
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-[#e8f1ef]">
                  <Layers3 className="h-4 w-4 text-[#9fd0cf]" />
                  One considered home for TMP resources
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/learning-portal"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#faf8f3] px-6 text-xs font-bold tracking-[0.07em] text-[#0f4d4d] uppercase hover:bg-white"
              >
                Explore the learning portal
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 text-xs font-bold tracking-[0.07em] text-white uppercase hover:bg-white/10"
              >
                Explore programs now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
