"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Shield } from "lucide-react";
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
  ["Learn", "Structured, honest courses — from first principles to clinical practice."],
  ["Grow", "Live cohorts and supervision that keep you moving, not just reading."],
  ["Heal", "Therapy and tools for your own mind, at your own pace."],
  ["Belong", "A community of people who take mental health seriously, gently."],
];

const STORIES = [
  ["I finally understood why my mind keeps overthinking everything. The tools actually work.", "S.K. · Intern"],
  ["I came in confused about my career. Now I'm a practising counsellor.", "R.M. · Certificate graduate"],
  ["What sets TMP apart is the community. You're never learning alone.", "A.P. · Diploma student"],
];

const FALLBACK_COURSES = [
  { id: "cccft", name: "Relationship Psychology: Marital & Family Therapy", meta: "Starts Tue 22 Sep · Tue & Thu · 7:30 pm", price: "₹5,000" },
  { id: "ccich", name: "Inner Child Healing Certification", meta: "Starts Tue 6 Oct · Tue & Thu · 6:30 pm", price: "₹5,000" },
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
  const [emailSent, setEmailSent] = useState(false);
  const active = PATHS.find((p) => p.key === activePath);

  const programCards = upcomingCourses.slice(0, 3).map((course) => ({
    id: course._id,
    name: course.name,
    meta: course.startDate ? `Starts ${course.startDate}` : "Live cohort",
    price: formatPrice(course.price),
    href: `/courses/${course._id}`,
  }));

  const cards =
    programCards.length > 0
      ? programCards
      : FALLBACK_COURSES.map((c) => ({ ...c, href: "/courses" }));

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[clamp(620px,88vh,860px)] flex-col justify-center overflow-hidden">
        <Image
          src="/coastal/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(248,246,240,0.96)_0%,rgba(248,246,240,0.86)_34%,rgba(248,246,240,0.35)_58%,rgba(188,214,221,0.18)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(46%_72%_at_88%_34%,rgba(248,246,240,0.94),transparent_72%)]"
          aria-hidden="true"
        />

        <div className="container relative z-10 grid items-center gap-8 py-28 md:grid-cols-[1.35fr_0.65fr]">
          <div>
            <h1 className="font-display text-4xl leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              A Kinder,
              <em className="block font-normal italic">Brighter You.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/90 sm:text-xl">
              Practical tools. Compassionate guidance. A more mindful tomorrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase transition-transform hover:-translate-y-0.5"
              >
                Start your journey <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-[0.72rem] tracking-[0.32em] text-primary uppercase">
              <span>Learn</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Grow</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Heal</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Belong</span>
            </div>
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
          <aside className="text-left md:text-right">
            <div className="font-display text-2xl italic leading-tight text-primary sm:text-3xl">
              Wellness
              <br />
              Belongs
              <br />
              Here.
            </div>
            <div className="mt-4 h-px w-14 border-t border-border md:ml-auto" />
            <div className="mt-4 text-[0.62rem] leading-relaxed tracking-[0.28em] text-muted-foreground uppercase">
              Mindful People
              <br />
              Brighter Tomorrows
            </div>
          </aside>
        </div>
      </section>

      {/* ── Why we exist ── */}
      <section className="py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
              Why we exist
            </span>
            <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-5xl">
              Care for the mind, taught with the seriousness it deserves — and
              the warmth it needs.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-muted-foreground">
              The Mind Point is a learning home for psychology students, career
              changers and practising therapists in India. We pair
              evidence-based teaching with real practice, so what you learn
              actually changes how you work and live.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {PILLARS.map(([title, copy]) => (
                <div key={title} className="border-t border-dashed border-border pt-4">
                  <b className="font-display block text-xl font-medium">{title}</b>
                  <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="container border-0 border-t border-dashed border-border" />

      {/* ── Programs ── */}
      <section id="programs" className="py-20 sm:py-28">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
                Programs
              </span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                Step into a cohort this season.
              </h2>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Small, live and built around practice — not endless theory.
            </p>
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {cards.map((card, i) => (
              <article
                key={card.id}
                className="group flex flex-col overflow-hidden rounded border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_70px_-46px_rgba(19,46,43,0.6)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={i === 2 ? "/coastal/hero.jpg" : i === 1 ? "/coastal/calm.jpg" : "/coastal/shore.jpg"}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-primary uppercase">
                    {i === 2 ? "Coming soon" : "Upcoming"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3 className="font-display text-2xl leading-snug">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">{card.meta}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-4">
                    <span className="font-display text-xl">{card.price}</span>
                    <Link
                      href={card.href}
                      className="text-[0.7rem] font-semibold tracking-[0.2em] text-primary uppercase"
                    >
                      Enroll →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Find your path ── */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="container">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
                Find your path
              </span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                Where are you right now?
              </h2>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Pick the line that sounds most like you and we&apos;ll point to
              the next step.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActivePath(p.key)}
                className={`rounded border border-dashed p-7 text-left transition-colors ${
                  activePath === p.key
                    ? "border-primary bg-card"
                    : "border-border hover:border-primary hover:bg-card"
                }`}
              >
                <span className="font-display text-2xl italic text-primary">
                  {["i.", "ii.", "iii.", "iv."][i]}
                </span>
                <h3 className="font-display mt-3 text-xl leading-snug">{p.label}</h3>
              </button>
            ))}
          </div>
          {active && (
            <div className="mt-8 max-w-2xl rounded border border-dashed border-border bg-card p-6">
              <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-primary uppercase">
                Recommended
              </span>
              <h3 className="font-display mt-2 text-2xl">{active.title}</h3>
              <p className="mt-2 text-muted-foreground">{active.copy}</p>
              <Link
                href="/courses"
                className="mt-4 inline-block text-sm font-semibold text-primary"
              >
                See the next step →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── First step band ── */}
      <section className="relative overflow-hidden text-primary-foreground">
        <Image src="/coastal/wave.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,40,38,0.92),rgba(29,78,74,0.74)_55%,rgba(44,106,99,0.6))]"
          aria-hidden="true"
        />
        <div className="container relative z-10 grid items-center gap-10 py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-sea uppercase">
              A smaller first step
            </span>
            <h2 className="font-display mt-4 max-w-xl text-3xl tracking-tight sm:text-5xl">
              Not sure? Start with one calm conversation.
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/80">
              No pressure to commit to the whole path. Just a supportive first
              moment with someone who listens.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["~20 minutes", "Licensed professional", "Flexible timing"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:text-right">
            <div className="text-[0.62rem] tracking-[0.28em] text-primary-foreground/60 uppercase">
              From
            </div>
            <div className="font-display text-5xl leading-none">₹600</div>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-xs font-medium tracking-[0.16em] text-primary uppercase"
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
              <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
                Stories
              </span>
              <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
                People who found their way in.
              </h2>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Trusted by 10,000+ learners across India.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STORIES.map(([quote, who]) => (
              <figure key={who} className="border-t-2 border-primary pt-5">
                <blockquote className="font-display text-2xl italic leading-snug">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-4 text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
                  {who}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificates feature ── */}
      <section className="pb-20 sm:pb-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image src="/coastal/calm.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
              Certificates that are honest
            </span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Completion you can verify, claims you can trust.
            </h2>
            <p className="mt-4 text-muted-foreground">
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
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
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
          <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
            Free resource
          </span>
          <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
            Watch the free masterclass first.
          </h2>
          <p className="max-w-lg text-muted-foreground">
            One recorded session, no card, no pressure — just a taste of how we
            teach.
          </p>
          <form
            className="mt-2 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setEmailSent(true);
            }}
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              aria-label="Email"
              className="flex-1 rounded-full border border-primary bg-card px-5 py-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase"
            >
              {emailSent ? "Sent ✓" : "Send it to me"}
            </button>
          </form>
          <span className="text-[0.62rem] tracking-[0.3em] text-muted-foreground uppercase">
            No spam. Unsubscribe any time.
          </span>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="py-24">
        <div className="container flex flex-col items-center gap-6 text-center">
          <span className="text-[0.7rem] font-semibold tracking-[0.28em] text-primary uppercase">
            Begin
          </span>
          <h2 className="font-display max-w-3xl text-4xl leading-tight tracking-tight sm:text-6xl">
            Mindful people,
            <br />
            <em className="font-normal italic">brighter tomorrows.</em>
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Take the next step that feels kind, clear and manageable. We&apos;ll
            meet you there.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase transition-transform hover:-translate-y-0.5"
          >
            Start your journey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
