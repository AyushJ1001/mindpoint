"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Shield } from "lucide-react";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { EmailCapture } from "@/components/coastal/EmailCapture";
import { ScrollReveal } from "@/components/ScrollReveal";
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

const STORIES = [
  [
    "I finally understood why my mind keeps overthinking everything. The tools actually work.",
    "S.K. · Intern",
  ],
  [
    "I came in confused about my career. Now I'm a practising counsellor.",
    "R.M. · Certificate graduate",
  ],
  [
    "What sets TMP apart is the community. You're never learning alone.",
    "A.P. · Diploma student",
  ],
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

const FAQ = [
  {
    q: "Is this a recognised degree?",
    a: "No. Our certificates document completion of a training programme — they are not a degree, licence or accreditation. We say so plainly, and we verify every certificate publicly.",
  },
  {
    q: "Do I need a psychology background?",
    a: "Not always. Some programs assume no prior training; others are built for students and practitioners. Each program page states who it's for.",
  },
  {
    q: "How do the live classes work?",
    a: "Cohorts are small and run live every week. If you miss one, the recording is available to your cohort for the access window.",
  },
  {
    q: "What if I'm not sure where to start?",
    a: "Start with one calm conversation. It's a single session with a licensed professional — a low-pressure way to get oriented.",
  },
];

function formatPrice(value?: number) {
  if (!value || value <= 0) return "Free";
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CoastalHome({
  canAccessAdmin,
  upcomingCourses,
}: CoastalHomeProps) {
  const [activePath, setActivePath] = useState<string | null>(null);
  const active = PATHS.find((p) => p.key === activePath);

  const programCards = upcomingCourses.slice(0, 3).map((course) => ({
    id: course._id,
    name: course.name,
    meta: course.startDate ? `Starts ${course.startDate}` : "Live cohort",
    price: formatPrice(course.price),
    href: `/courses/${course._id}`,
  }));

  const cards = programCards.length > 0 ? programCards : FALLBACK_COURSES;

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
        <p className="water-caption container mt-3 text-lg">
          A coastline, seen from above.
        </p>
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
            <p className="text-muted-foreground max-w-sm">
              Trusted by 10,000+ learners across India.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STORIES.map(([quote, who], i) => (
              <ScrollReveal key={who} transitionDelayMs={i * 80}>
                <figure className="border-primary h-full border-t-2 pt-5">
                  <blockquote className="font-display text-2xl leading-snug italic">
                    “{quote}”
                  </blockquote>
                  <figcaption className="text-muted-foreground mt-4 text-[0.68rem] tracking-[0.24em] uppercase">
                    {who}
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

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
          <Link href="/courses" className={ctaVariants({ layout: "flex" })}>
            Start your journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
