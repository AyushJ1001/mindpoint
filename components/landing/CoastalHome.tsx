"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Pause, Play, Shield } from "lucide-react";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { ScrollReveal } from "@/components/ScrollReveal";
import CoastalVideoTestimonials from "@/components/landing/CoastalVideoTestimonials";
import { StarRating } from "@/components/course/ratings";
import { getRelativeTime } from "@/lib/time-utils";
import { GOOGLE_RATING, GOOGLE_REVIEWS } from "@/lib/googleReviews";
import { REVIEW_HIGHLIGHTS } from "@/lib/reviewHighlights";
import { HOME_FAQ } from "@/lib/home-faq";
import type { PublicCourse } from "@/lib/backend";

interface CoastalHomeProps {
  canAccessAdmin: boolean;
  upcomingCourses: PublicCourse[];
}

const PATHS = [
  {
    key: "student",
    label: "I'm studying psychology",
    title: "Certificate programs",
    copy: "Structured, live and practical — the skills your degree skips. Start with a certificate and add supervision later.",
  },
  {
    key: "switcher",
    label: "I want to switch careers",
    title: "Find your path, step by step",
    copy: "Begin with one calm conversation, then try a recorded intro before committing to a full certificate.",
  },
  {
    key: "practise",
    label: "I already practise",
    title: "Supervision & advanced practice",
    copy: "Structured supervision and peer community, with certificates that state completion honestly.",
  },
  {
    key: "self",
    label: "I want to understand myself",
    title: "Start with one calm conversation",
    copy: "A single session with a licensed professional. No commitment, no pressure.",
  },
];

const PILLARS = [
  [
    "Learn",
    "Structured, honest courses — from first principles to clinical practice.",
  ],
  [
    "Grow",
    "Live cohorts and supervision that keep you moving, not just reading.",
  ],
  ["Heal", "Therapy and tools for your own mind, at your own pace."],
  ["Belong", "A community of people who take mental health seriously, gently."],
];

const FALLBACK_COURSES = [
  {
    id: "cccbt",
    name: "CBT, REBT, CBMT",
    meta: "Starts 12 Jan 2027 · Tue & Thu · 7:30 pm",
    price: "₹2,999",
    href: "/january-2027",
  },
  {
    id: "ccich",
    name: "Inner Child Healing",
    meta: "Starts 12 Jan 2027 · Tue & Thu · 7:30 pm",
    price: "₹2,999",
    href: "/january-2027",
  },
  {
    id: "ccpd",
    name: "Personality Disorders",
    meta: "Starts 12 Jan 2027 · Tue & Thu · 7:30 pm",
    price: "₹2,999",
    href: "/january-2027",
  },
];

const FAQ = HOME_FAQ;

function formatPrice(value?: number) {
  if (!value || value <= 0) return "Free";
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Approximate review age, matching the relative time shown on Google. */
function reviewAge(monthsAgo: number) {
  return getRelativeTime(Date.now() - monthsAgo * 30.44 * 86_400_000);
}

export default function CoastalHome({
  canAccessAdmin,
  upcomingCourses,
}: CoastalHomeProps) {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const active = PATHS.find((p) => p.key === activePath);

  const programCards = upcomingCourses.slice(0, 3).map((course) => ({
    id: course._id,
    name: course.name,
    meta: course.startDate ? `Starts ${course.startDate}` : "Live cohort",
    price: formatPrice(course.price),
    href: `/courses/${course._id}`,
  }));

  const cards = programCards.length > 0 ? programCards : FALLBACK_COURSES;

  const featuredReview = GOOGLE_REVIEWS[0];
  const sideReviews = GOOGLE_REVIEWS.slice(1, 4);
  const interstitialReview = GOOGLE_REVIEWS[4];
  const marqueeReviews = REVIEW_HIGHLIGHTS.slice(4);

  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-14 sm:pt-20">
        <div className="container">
          <span className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            The Mind Point · Psychology education
          </span>
          <h1 className="font-display text-foreground mt-5 max-w-[16ch] text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            A learning home for{" "}
            <em className="text-primary italic">psychology</em>.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg sm:text-xl">
            Evidence-based teaching with real practice, for psychology students,
            career changers and practising therapists in India — at a pace that
            stays kind.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/programs" className={ctaVariants({ layout: "flex" })}>
              Find your programme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase transition-colors"
            >
              Browse all courses
            </Link>
          </div>
          <p className="text-muted-foreground mt-5 text-sm">
            New here?{" "}
            <Link href="/masterclass" className="text-primary font-semibold">
              Watch the free masterclass
            </Link>{" "}
            or start with a{" "}
            <Link href="/courses/intro" className="text-primary font-semibold">
              ₹999 self-paced intro
            </Link>
            .
          </p>
          <div className="border-border mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-dashed pt-6">
            <StarRating rating={GOOGLE_RATING.average} size="sm" />
            <p className="text-muted-foreground text-sm">
              <b className="text-foreground font-semibold">
                {GOOGLE_RATING.average.toFixed(1)}
              </b>{" "}
              from {GOOGLE_RATING.count} Google reviews
            </p>
            <span
              aria-hidden="true"
              className="bg-border hidden h-4 w-px sm:block"
            />
            <p className="text-muted-foreground text-sm">
              Loved by students, career changers and therapists across India
            </p>
          </div>
          <div className="text-primary mt-10 flex flex-wrap items-center gap-3 text-[0.72rem] tracking-[0.3em] uppercase">
            <span>Learn</span>
            <span className="bg-primary h-1 w-1 rounded-full" />
            <span>Understand</span>
            <span className="bg-primary h-1 w-1 rounded-full" />
            <span>Observe</span>
            <span className="bg-primary h-1 w-1 rounded-full" />
            <span>Apply</span>
            <span className="bg-primary h-1 w-1 rounded-full" />
            <span>Practise</span>
            <span className="bg-primary h-1 w-1 rounded-full" />
            <span>Integrate</span>
          </div>
          {canAccessAdmin && (
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="relative mt-12 h-[300px] w-full overflow-hidden sm:mt-16 sm:h-[460px]">
          <Image
            src="/coastal/hero.jpg"
            alt="Turquoise water meeting pale sand, seen from above."
            fill
            priority
            sizes="100vw"
            className="water-drift-slow object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#eaf3f4] to-transparent" />
        </div>
      </section>

      {/* ── Why we exist ── */}
      <section className="py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className={eyebrowVariants()}>Why we exist</span>
            <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-5xl">
              Care for the mind, taught with the seriousness it deserves — and
              the warmth it needs.
            </h2>
          </div>
          <div>
            <p className="text-muted-foreground text-lg leading-8">
              The Mind Point is a learning home for psychology students, career
              changers and practising therapists in India. We pair
              evidence-based teaching with real practice, so what you learn
              actually changes how you work and live.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {PILLARS.map(([title, copy]) => (
                <div
                  key={title}
                  className="border-border border-t border-dashed pt-4"
                >
                  <b className="font-display block text-xl font-medium">
                    {title}
                  </b>
                  <p className="text-muted-foreground mt-1 text-sm">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-border container border-0 border-t border-dashed" />

      {/* ── Programs ── */}
      <section id="programs" className="py-20 sm:py-28">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={eyebrowVariants()}>Programs</span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                Step into a cohort this season.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Small, live and built around practice — not endless theory.
            </p>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {cards.map((card, i) => (
              <ScrollReveal key={card.id} transitionDelayMs={i * 80}>
                <article className="group border-border bg-card flex h-full flex-col overflow-hidden rounded border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_70px_-46px_rgba(19,46,43,0.6)]">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        i === 2
                          ? "/coastal/hero.jpg"
                          : i === 1
                            ? "/coastal/calm.jpg"
                            : "/coastal/shore.jpg"
                      }
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="bg-background/90 text-primary absolute top-4 left-4 rounded-full px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
                      Upcoming
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-7">
                    <h3 className="font-display text-2xl leading-snug">
                      {card.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{card.meta}</p>
                    <div className="border-border mt-auto flex items-center justify-between border-t border-dashed pt-4">
                      <span className="font-display text-xl">{card.price}</span>
                      <Link
                        href={card.href}
                        className="text-primary text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
                      >
                        Enroll →
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull-quote interstitial ── */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <ScrollReveal>
            <figure className="mx-auto max-w-3xl text-center">
              <span className={eyebrowVariants({ tone: "muted" })}>
                In their words
              </span>
              <blockquote className="font-display mt-6 text-2xl leading-snug tracking-tight sm:text-4xl">
                “{interstitialReview.content}”
              </blockquote>
              <figcaption className="text-muted-foreground mt-6 text-[0.68rem] tracking-[0.24em] uppercase">
                {interstitialReview.author} &middot; Google &middot;{" "}
                {reviewAge(interstitialReview.monthsAgo)}
              </figcaption>
            </figure>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Find your path ── */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={eyebrowVariants()}>Find your path</span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                Where are you right now?
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Pick the line that sounds most like you and we&apos;ll point to
              the next step.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p, i) => (
              <ScrollReveal key={p.key} transitionDelayMs={i * 80}>
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={activePath === p.key}
                  onClick={() => setActivePath(p.key)}
                  className={`h-full w-full rounded border border-dashed p-7 text-left transition-colors ${
                    activePath === p.key
                      ? "border-primary bg-card"
                      : "border-border hover:border-primary hover:bg-card"
                  }`}
                >
                  <span className="font-display text-primary text-2xl italic">
                    {["i.", "ii.", "iii.", "iv."][i]}
                  </span>
                  <span className="font-display mt-3 block text-xl leading-snug">
                    {p.label}
                  </span>
                </button>
              </ScrollReveal>
            ))}
          </div>
          {active && (
            <div className="border-border bg-card mt-8 max-w-2xl rounded border border-dashed p-6">
              <span className="text-primary text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
                Recommended
              </span>
              <h3 className="font-display mt-2 text-2xl">{active.title}</h3>
              <p className="text-muted-foreground mt-2">{active.copy}</p>
              <Link
                href="/courses"
                className="text-primary mt-4 inline-block text-sm font-semibold"
              >
                See the next step →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── First step band ── */}
      <section className="text-primary-foreground relative overflow-hidden">
        <Image
          src="/coastal/wave.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,40,38,0.92),rgba(29,78,74,0.74)_55%,rgba(44,106,99,0.6))]"
          aria-hidden="true"
        />
        <div className="relative z-10 container grid items-center gap-10 py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className={eyebrowVariants({ tone: "sea" })}>
              A smaller first step
            </span>
            <h2 className="font-display mt-4 max-w-xl text-3xl tracking-tight sm:text-5xl">
              Not sure? Start with one calm conversation.
            </h2>
            <p className="text-primary-foreground/80 mt-4 max-w-lg">
              No pressure to commit to the whole path. Just a supportive first
              moment with someone who listens.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["~20 minutes", "Licensed professional", "Flexible timing"].map(
                (t) => (
                  <span
                    key={t}
                    className="border-primary-foreground/30 bg-primary-foreground/10 rounded-full border px-4 py-1.5 text-sm"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="lg:text-right">
            <div className={eyebrowVariants({ size: "micro", tone: "light" })}>
              From
            </div>
            <div className="font-display text-5xl leading-none">₹600</div>
            <Link
              href="/contact"
              className="bg-background text-primary mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase"
            >
              Book your first session <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stories ── */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className={eyebrowVariants()}>Stories</span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                People who found their way in.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={GOOGLE_RATING.average} size="sm" />
              <p className="text-muted-foreground text-sm">
                {GOOGLE_RATING.average.toFixed(1)} on Google
                <span aria-hidden="true"> &middot; </span>
                {GOOGLE_RATING.count} reviews
              </p>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <ScrollReveal>
              <figure className="water-band-mist flex h-full flex-col justify-between rounded-2xl p-8 sm:p-10">
                <div>
                  <StarRating rating={GOOGLE_RATING.average} size="sm" />
                  <blockquote className="font-display mt-6 text-2xl leading-snug sm:text-3xl">
                    “{featuredReview.content}”
                  </blockquote>
                </div>
                <figcaption className="text-muted-foreground mt-8 text-[0.68rem] tracking-[0.24em] uppercase">
                  {featuredReview.author} &middot; Google &middot;{" "}
                  {reviewAge(featuredReview.monthsAgo)}
                </figcaption>
              </figure>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {sideReviews.map((review, i) => (
                <ScrollReveal
                  key={`${review.author}-${i}`}
                  transitionDelayMs={i * 80}
                >
                  <figure className="border-primary/70 flex h-full flex-col border-l-2 pl-5">
                    <blockquote className="text-foreground/80 flex-1 text-[0.95rem] leading-relaxed">
                      “{review.content}”
                    </blockquote>
                    <figcaption className="text-muted-foreground mt-4 text-[0.62rem] tracking-[0.24em] uppercase">
                      {review.author} &middot; Google &middot;{" "}
                      {reviewAge(review.monthsAgo)}
                    </figcaption>
                  </figure>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Video reflections ── */}
      <CoastalVideoTestimonials />

      {/* ── Certificates feature ── */}
      <section className="pb-20 sm:pb-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image
              src="/coastal/calm.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className={eyebrowVariants()}>
              Certificates that are honest
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Completion you can verify, claims you can trust.
            </h2>
            <p className="text-muted-foreground mt-4">
              Every certificate states completion honestly — not a degree, not a
              licence. Each carries a public verification code you can check in
              seconds.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Public verification for every certificate",
                "Completion wording, never overstated",
                "Stream-only recordings, private to your cohort",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Review band ── */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className={eyebrowVariants()}>
              Rated {GOOGLE_RATING.average.toFixed(1)}
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              {GOOGLE_RATING.count} reviews. One calm way of teaching.
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <StarRating rating={GOOGLE_RATING.average} size="md" />
              <span className="text-muted-foreground text-sm">on Google</span>
            </div>
            <div className="mt-8">
              <Link
                href="/programs"
                className={ctaVariants({ layout: "flex" })}
              >
                Find your programme <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {REVIEW_HIGHLIGHTS.slice(0, 4).map((review, i) => (
              <ScrollReveal
                key={`${review.author}-${i}`}
                transitionDelayMs={i * 80}
              >
                <figure className="border-border bg-background/70 flex h-full flex-col rounded-2xl border p-6">
                  <blockquote className="text-foreground/80 flex-1 text-[0.95rem] leading-relaxed">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="text-muted-foreground mt-4 text-[0.62rem] tracking-[0.24em] uppercase">
                    {review.author} &middot; {review.source}
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Review marquee ── */}
      <section
        aria-label="What people say about The Mind Point"
        className="water-band border-border relative overflow-hidden border-y border-dashed py-8"
      >
        <div className="water-marquee">
          <div
            className="water-marquee-track"
            style={marqueePaused ? { animationPlayState: "paused" } : undefined}
          >
            {[0, 1].map((group) => (
              <ul
                key={group}
                role="list"
                aria-hidden={group === 1}
                className="water-marquee-group"
              >
                {marqueeReviews.map((review, i) => (
                  <li
                    key={`${group}-${review.author}-${i}`}
                    className="flex items-center gap-4 whitespace-nowrap"
                  >
                    <span className="font-display text-lg">
                      “{review.quote}”
                    </span>
                    <span className="text-muted-foreground text-[0.62rem] tracking-[0.24em] uppercase">
                      {review.author} &middot; {review.source}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMarqueePaused((v) => !v)}
          aria-label={marqueePaused ? "Play reviews" : "Pause reviews"}
          aria-pressed={marqueePaused}
          className="water-glass text-primary absolute top-1/2 right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#2b8585] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {marqueePaused ? (
            <Play className="ml-0.5 h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
      </section>

      {/* ── Masterclass capture ── */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className={eyebrowVariants()}>Free resource</span>
          <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
            Watch the free masterclass first.
          </h2>
          <p className="text-muted-foreground max-w-lg">
            One recorded session, no card, no pressure — just a taste of how we
            teach.
          </p>
          <EmailCapture source="masterclass" />
          <Link
            href="/masterclass"
            className="text-primary text-sm font-semibold"
          >
            Open the full masterclass page →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className={eyebrowVariants()}>Questions</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              A few honest answers.
            </h2>
          </div>
          <div className="border-border border-t border-dashed">
            {FAQ.map((item) => (
              <details key={item.q} className="faq-item py-5">
                <summary className="font-display text-xl leading-snug">
                  {item.q}
                </summary>
                <p className="text-muted-foreground mt-3 max-w-prose">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="py-24">
        <div className="container flex flex-col items-center gap-6 text-center">
          <span className={eyebrowVariants()}>Begin</span>
          <h2 className="font-display max-w-3xl text-4xl leading-tight tracking-tight sm:text-6xl">
            Mindful people,
            <br />
            <em className="font-normal italic">brighter tomorrows.</em>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Take the next step that feels kind, clear and manageable. We&apos;ll
            meet you there.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StarRating rating={GOOGLE_RATING.average} size="sm" />
            <p className="text-muted-foreground text-sm">
              <b className="text-foreground font-semibold">
                {GOOGLE_RATING.average.toFixed(1)}
              </b>
              <span> from {GOOGLE_RATING.count} reviews</span>
              <span aria-hidden="true"> &middot; </span>
              <span>join them</span>
            </p>
          </div>
          <Link href="/courses" className={ctaVariants({ layout: "flex" })}>
            Start your journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
