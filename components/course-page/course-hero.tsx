import Image from "next/image";

import type { CourseContent } from "@/lib/course-content/types";

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function TideItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[7.5rem] flex-1">
      <dt className="text-[0.62rem] font-semibold tracking-[0.22em] text-[#1d4e4a]/70 uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-[#132e2b]">{value}</dd>
    </div>
  );
}

export function CourseHero({ course }: { course: CourseContent }) {
  const liveStart = formatDate(course.liveStart);
  const meta: { label: string; value: string }[] = [];
  if (course.duration) meta.push({ label: "Duration", value: course.duration });
  if (course.selfPacedStart)
    meta.push({ label: "Foundations", value: course.selfPacedStart });
  if (liveStart) meta.push({ label: "Live cohort", value: liveStart });
  if (course.cohortSize)
    meta.push({ label: "Cohort", value: `Capped at ${course.cohortSize}` });

  const primaryLabel = course.applicationBased
    ? "Start your application"
    : "Choose how you train";

  return (
    <section className="pt-12 sm:pt-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            {course.category}
          </span>
          <span className="water-rule h-px flex-1" />
          {course.campaign ? (
            <span className="text-foreground/45 text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
              January 2027
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-foreground mt-8 max-w-[18ch] text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]">
          {course.title}
        </h1>

        <p className="font-display text-primary mt-6 max-w-[36ch] text-2xl leading-[1.2] sm:text-3xl">
          {course.tagline}
        </p>

        <p className="text-muted-foreground mt-7 max-w-[58ch] text-lg leading-relaxed">
          {course.heroCopy}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#options"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
          >
            {primaryLabel}
            <span aria-hidden="true">›</span>
          </a>
          {course.cta.secondaryHref && course.cta.secondaryLabel ? (
            <a
              href={course.cta.secondaryHref}
              target="_blank"
              rel="noreferrer"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
            >
              {course.cta.secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>

      {/* Horizon */}
      <div className="relative mt-12 sm:mt-16">
        <div className="relative h-[300px] w-full overflow-hidden sm:h-[440px]">
          <Image
            src="/coastal/calm.jpg"
            alt="Sunrise over a calm sea, with gentle surf reaching wet sand."
            fill
            priority
            sizes="100vw"
            className="water-drift-slow object-cover"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f4f8f7] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0f2a28]/60 to-transparent" />
        </div>

        {meta.length > 0 ? (
          <div className="mx-auto -mt-12 w-full max-w-6xl px-5 sm:px-6">
            <dl className="water-glass flex flex-wrap gap-x-10 gap-y-4 rounded-2xl px-6 py-5">
              {meta.map((item) => (
                <TideItem key={item.label} {...item} />
              ))}
            </dl>
          </div>
        ) : null}

      </div>
    </section>
  );
}
