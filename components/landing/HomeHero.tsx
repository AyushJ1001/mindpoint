import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield } from "lucide-react";

interface HomeHeroProps {
  canAccessAdmin: boolean;
  startSummary?: string;
}

const heroButton =
  "inline-flex items-center justify-center gap-2 rounded-brand px-6 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * The flowing-water photograph is the section background. A teal overlay keeps
 * the text above WCAG AA contrast on the brightest foam; the slow drift only
 * runs on wide screens without a reduced-motion preference (see
 * `.hero-water-image` in globals.css), so phones get the still image.
 */
export function HomeHero({ canAccessAdmin, startSummary }: HomeHeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-section-deep relative isolate overflow-hidden text-white"
    >
      <Image
        src="/coastal/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-water-image -z-20 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(23,63,58,0.88),rgba(23,63,58,0.84))] lg:bg-[linear-gradient(90deg,rgba(23,63,58,0.92)_0%,rgba(23,63,58,0.86)_60%,rgba(23,63,58,0.5)_100%)]"
      />

      <div className="container py-20 sm:py-28 lg:py-36">
        <span
          aria-hidden="true"
          className="bg-brand-gold block h-0.5 w-14 rounded-none"
        />
        <h1
          id="hero-heading"
          className="font-display mt-6 max-w-3xl text-4xl leading-[1.08] font-medium tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl"
        >
          Study Psychology. Understand It Deeply. Learn to Apply It.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/90 sm:text-xl">
          Discover structured psychology education designed to connect essential
          knowledge with meaningful practical learning.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href="/january-2027"
            className={`${heroButton} bg-brand-ivory text-brand-teal hover:bg-white`}
          >
            Explore January Courses <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#approach"
            className={`${heroButton} border border-white/70 text-white hover:bg-white/10`}
          >
            Discover Our Learning Approach
          </Link>
        </div>

        <div className="mt-12 flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/25 pt-6 text-sm text-white/90">
          <p>
            <b className="font-semibold text-white">Registration is open</b> for
            courses starting {startSummary ?? "in January 2027"}.
          </p>
          <p>
            Free masterclass in preparation.{" "}
            <Link
              href="/masterclass"
              className="hover:text-brand-gold font-semibold text-white underline underline-offset-4"
            >
              Get notified
            </Link>
          </p>
        </div>

        {canAccessAdmin && (
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <Shield className="h-4 w-4" /> Admin
          </Link>
        )}
      </div>
    </section>
  );
}
