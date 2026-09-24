import Image from "next/image";

import { Section } from "@/components/course-page/section";
import type {
  AudienceGroup,
  ProgrammeAssessment,
  ProgrammeClosing,
  ProgrammeHero,
  ProgrammeMaterials,
  ProgrammeOverview,
  ProgrammeStep,
} from "@/lib/course-content/types";

export function ProgrammeHeroSection({ hero }: { hero: ProgrammeHero }) {
  return (
    <section className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <div className="container">
        <span className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
          {hero.eyebrow}
        </span>
        <h1 className="font-display text-foreground mt-5 max-w-[20ch] text-4xl leading-[1.03] tracking-[-0.03em] sm:text-6xl">
          {hero.title}
        </h1>
        <p className="font-display text-primary mt-6 max-w-[34ch] text-2xl leading-[1.2] italic sm:text-3xl">
          {hero.supporting}
        </p>
        <p className="text-muted-foreground mt-7 max-w-[62ch] text-lg leading-relaxed">
          {hero.description}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={hero.primaryCta.href}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
          >
            {hero.primaryCta.label}
            <span aria-hidden="true">›</span>
          </a>
          {hero.secondaryCta ? (
            <a
              href={hero.secondaryCta.href}
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
            >
              {hero.secondaryCta.label}
            </a>
          ) : null}
        </div>
        {hero.scopeLine ? (
          <p className="text-foreground/60 mt-7 max-w-[62ch] border-l-2 border-[#bcd6dd] pl-4 text-sm leading-relaxed">
            {hero.scopeLine}
          </p>
        ) : null}
      </div>

      <div className="relative mt-12 h-[280px] w-full overflow-hidden sm:mt-16 sm:h-[420px]">
        <Image
          src="/coastal/wave.jpg"
          alt="A wave breaking near the shore, spray catching the light."
          fill
          priority
          sizes="100vw"
          className="water-drift-slow object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#eaf3f4] to-transparent" />
      </div>
    </section>
  );
}

export function ProgrammeOverviewSection({
  overview,
}: {
  overview: ProgrammeOverview;
}) {
  return (
    <Section
      id="overview"
      eyebrow={overview.eyebrow}
      title={overview.title ?? "The course in one view"}
      tone="mist"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {overview.stages.map((stage) => (
          <article
            key={stage.label}
            className="water-glass flex flex-col rounded-2xl p-6 sm:p-8"
          >
            <p className="water-eyebrow text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
              {stage.label}
            </p>
            <h3 className="font-display text-foreground mt-3 text-2xl leading-snug">
              {stage.title}
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {stage.body}
            </p>
          </article>
        ))}
      </div>
      <p className="font-display text-primary mt-10 max-w-[62ch] text-xl leading-relaxed italic">
        {overview.progression}
      </p>
    </Section>
  );
}

export function AudienceGroupsSection({ groups }: { groups: AudienceGroup[] }) {
  return (
    <Section
      id="audience"
      eyebrow="Who this course is for"
      title="Different starts, one clear route."
      width="narrow"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((group) => (
          <article
            key={group.title}
            className="border-foreground/10 bg-card rounded-2xl border p-6"
          >
            <h3 className="font-display text-foreground text-lg">
              {group.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {group.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function HowItWorksSection({
  title,
  steps,
}: {
  title?: string;
  steps: ProgrammeStep[];
}) {
  return (
    <Section
      id="how-it-works"
      eyebrow="How the learning works"
      title={title}
      tone="mist"
    >
      <ol className="grid gap-8 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="border-foreground/10 border-t pt-5">
            <span
              aria-hidden="true"
              className="water-accent font-display text-2xl tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-foreground mt-3 text-xl leading-snug">
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function LearningMaterialsSection({
  materials,
}: {
  materials: ProgrammeMaterials;
}) {
  return (
    <Section
      id="materials"
      eyebrow={materials.eyebrow ?? "Included learning materials"}
      title={materials.title ?? "What is supplied for each stage"}
      width="narrow"
    >
      <ul className="divide-foreground/10 divide-y">
        {materials.items.map((item) => (
          <li key={item.label} className="py-5">
            <p className="text-foreground/85 text-[1rem] leading-relaxed">
              {item.label}
            </p>
            {item.note ? (
              <p className="text-muted-foreground mt-1 text-sm">{item.note}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {materials.note ? (
        <p className="text-muted-foreground border-foreground/10 mt-6 border-t pt-5 text-sm leading-relaxed">
          {materials.note}
        </p>
      ) : null}
    </Section>
  );
}

export function AssessmentSection({
  assessment,
}: {
  assessment: ProgrammeAssessment;
}) {
  return (
    <Section
      id="assessment"
      eyebrow={assessment.eyebrow ?? "Assessment and completion"}
      title={assessment.title ?? "How you are assessed"}
      width="narrow"
    >
      <p className="text-foreground/85 max-w-[62ch] text-[1.02rem] leading-relaxed">
        {assessment.body}
      </p>
      {assessment.items && assessment.items.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {assessment.items.map((item) => (
            <li
              key={item}
              className="text-foreground/80 flex gap-3 text-sm leading-relaxed"
            >
              <span
                aria-hidden="true"
                className="bg-primary mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}

export function ProgrammeClosing({ closing }: { closing: ProgrammeClosing }) {
  return (
    <section
      id="closing"
      className="water-band-deep water-on-deep scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-6 sm:py-28">
        <h2 className="font-display text-3xl leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl">
          {closing.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-[58ch] text-lg leading-relaxed text-[#f1ece0]/80">
          {closing.body}
        </p>
        <a
          href={closing.ctaHref}
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#f1ece0] px-6 py-3 text-sm font-medium text-[#0f2a28] transition-transform hover:-translate-y-0.5"
        >
          {closing.ctaLabel}
          <span aria-hidden="true">›</span>
        </a>
        {closing.scopeLine ? (
          <p className="mx-auto mt-8 max-w-[58ch] text-sm leading-relaxed text-[#f1ece0]/70">
            {closing.scopeLine}
          </p>
        ) : null}
      </div>
    </section>
  );
}
