"use client";

import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import { ctaVariants } from "@/components/coastal/cta";
import { showRupees } from "@/lib/utils";
import type { PublicCourse } from "@/lib/backend";

const WHATSAPP = "919770780086";

function whatsappHref(courseName: string) {
  const text = encodeURIComponent(
    `Hi, I have a question about the ${courseName} course.`,
  );
  return `https://wa.me/${WHATSAPP}?text=${text}`;
}

function typeLabel(course: PublicCourse) {
  const map: Record<string, string> = {
    certificate: "Certificate Course",
    diploma: "Diploma Programme",
    internship: "Internship Programme",
    masterclass: "Masterclass",
    "pre-recorded": "Self-paced Course",
    therapy: "Therapy",
    supervised: "Supervised Practice",
    worksheet: "Worksheets & Resources",
    "resume-studio": "Resume Studio",
  };
  return map[course.type ?? ""] ?? "Course";
}

// ---------------------------------------------------------------------------
// "Now enrolling" announcement bar
// ---------------------------------------------------------------------------
export function CourseEnrollmentBar({ course }: { course: PublicCourse }) {
  const batch = course.nextAvailableBatch;
  if (!batch) return null;
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold tracking-[0.14em] uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Now enrolling
        </span>
        <span className="opacity-90">
          <strong className="font-semibold">{course.name}</strong> starts{" "}
          {batch.startDate} · live cohort, online
        </span>
        <a href="#ways" className="underline underline-offset-2">
          See details →
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Not topics. Abilities."
// ---------------------------------------------------------------------------
export function CourseAbilities({ course }: { course: PublicCourse }) {
  const abilities =
    course.outcomes && course.outcomes.length > 0
      ? course.outcomes
      : (course.learningOutcomes ?? []).map((item) => item.title);
  if (abilities.length === 0) return null;

  const mid = Math.ceil(abilities.length / 2);
  const parts = [
    { label: "Part I · The model", items: abilities.slice(0, mid) },
    { label: "Part II · The room", items: abilities.slice(mid) },
  ].filter((part) => part.items.length > 0);

  return (
    <section className="calm-section-tight">
      <div className="calm-container-wide">
        <ScrollReveal>
          <p className={eyebrowVariants()}>What you&apos;ll be able to do</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            Not topics. <em className="italic">Abilities.</em>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-[60ch]">
            First the model, then the room. Every idea is something you practise
            until it feels normal.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {parts.map((part) => (
              <div key={part.label}>
                <p className="calm-kbd">{part.label}</p>
                <ul className="mt-4 space-y-3">
                  {part.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                      <span className="text-foreground/85 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// "Learn it, do it, prove it" — how the cohort runs
// ---------------------------------------------------------------------------
export function CourseCohortPhases({ course }: { course: PublicCourse }) {
  if (!course.usesBatches) return null;
  const phases = [
    {
      label: "Phase 1",
      title: "Learn the model",
      body: "Structured modules and the workbook. The foundation everyone starts on.",
    },
    {
      label: "Phase 2",
      title: "Practise live",
      body: "Live practical classes, role-plays and demonstrations with the faculty. Application, not lectures.",
    },
    {
      label: "Phase 3",
      title: "Earn the certificate",
      body: "Applied work and an assessment you have to pass, so the certificate means something.",
    },
  ];
  return (
    <section className="calm-section-tight bg-secondary/40">
      <div className="calm-container-wide">
        <ScrollReveal>
          <p className={eyebrowVariants()}>How the live cohort runs</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            Learn it, do it, <em className="italic">prove it.</em>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {phases.map((phase) => (
              <div
                key={phase.label}
                className="border-foreground/10 bg-card rounded-2xl border p-6"
              >
                <p className="calm-kbd">{phase.label}</p>
                <h3 className="font-display mt-3 text-xl">{phase.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {phase.body}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// "A rung, not a dead end" — progression
// ---------------------------------------------------------------------------
export function CourseProgression() {
  const steps = [
    "Learn the foundations",
    "Specialise",
    "Get certified",
    "Practise with confidence",
  ];
  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <p className={eyebrowVariants()}>Where this takes you</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            A rung, not a <em className="italic">dead end.</em>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-[60ch]">
            A certificate here isn&apos;t the finish line. It&apos;s a step
            toward practising — and it builds on everything that comes next.
          </p>
          <ol className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="border-foreground/15 bg-card rounded-full border px-4 py-2">
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="text-muted-foreground h-4 w-4" />
                )}
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// "Inside the live cohort" — derived from modules
// ---------------------------------------------------------------------------
export function CourseLiveCover({ course }: { course: PublicCourse }) {
  const modules = course.modules ?? [];
  if (!course.usesBatches || modules.length === 0) return null;
  const items = modules.slice(0, 6).map((module) => module.title);
  return (
    <section className="calm-section-tight bg-secondary/40">
      <div className="calm-container">
        <ScrollReveal>
          <p className={eyebrowVariants()}>Inside the live cohort</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
            What the live classes <em className="italic">cover.</em>
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="text-primary mt-1 h-4 w-4 shrink-0" />
                <span className="text-foreground/85 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// "A certificate you earn, not collect"
// ---------------------------------------------------------------------------
export function CourseCertificate({ course }: { course: PublicCourse }) {
  const isCredential =
    course.type === "certificate" ||
    course.type === "diploma" ||
    course.type === "internship";
  if (!isCredential) return null;
  const points = [
    "Finish every module at your own pace",
    "Complete the practical work and assessment",
    "Pass to earn it — attendance isn't enough",
    "Get a verifiable certificate anyone can check",
  ];
  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div className="border-primary/20 bg-primary/[0.04] rounded-3xl border px-7 py-10 sm:px-12">
            <p className={eyebrowVariants()}>How you earn it</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              A certificate you <em className="italic">earn,</em> not collect.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-[60ch]">
              Honest wording, assessed completion, and a verification code that
              anyone can check.
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <ShieldCheck className="text-primary mt-1 h-4 w-4 shrink-0" />
                  <span className="text-foreground/85 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------
export function CourseFinalCta({ course }: { course: PublicCourse }) {
  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div className="text-center">
            <p className={eyebrowVariants()}>Ready when you are</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-5xl">
              Stop reading about it.{" "}
              <em className="italic">Do it.</em>
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
              Start today, or join the next live cohort. Same faculty, same
              skill — at your pace.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#ways" className={ctaVariants({ layout: "flex" })}>
                Choose how you train
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappHref(course.name)}
                target="_blank"
                rel="noreferrer"
                className="calm-link text-sm font-medium"
              >
                Questions? Talk to us on WhatsApp
              </a>
            </div>
            {course.price ? (
              <p className="text-muted-foreground mt-6 inline-flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                From {showRupees(course.price)}
              </p>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function CourseMetaStrip({ course }: { course: PublicCourse }) {
  const batch = course.nextAvailableBatch;
  const items = [
    batch
      ? { icon: CalendarDays, label: `Starts ${batch.startDate}` }
      : { icon: CalendarDays, label: "Self-paced, start anytime" },
    course.duration
      ? { icon: Sparkles, label: course.duration }
      : { icon: Sparkles, label: typeLabel(course) },
    { icon: Users, label: "Small, capped cohorts" },
    { icon: ShieldCheck, label: "Verifiable certificate" },
  ];
  return (
    <div className="border-foreground/10 flex flex-wrap justify-center gap-x-6 gap-y-2 border-y py-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <item.icon className="text-primary h-3.5 w-3.5" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
