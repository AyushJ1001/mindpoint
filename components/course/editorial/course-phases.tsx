"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

const PHASES = [
  {
    label: "Phase 1",
    title: "Learn the model",
    body: "Self-paced modules and the workbook. The foundation everyone starts on, at your own pace.",
  },
  {
    label: "Phase 2",
    title: "Practise live",
    body: "Live classes, role-plays and demonstrations with faculty. Application, not lectures.",
  },
  {
    label: "Phase 3",
    title: "Earn the certificate",
    body: "Supervised practice and an assessment you have to pass. Then your verifiable certificate.",
  },
];

export default function CoursePhases({ course }: Props) {
  const isLive =
    course.usesBatches ||
    course.type === "certificate" ||
    course.type === "diploma" ||
    course.type === "supervised";

  if (!isLive) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">How the cohort runs</p>
          <h2 className="calm-section-title mt-5">
            Learn it, do it, <em className="text-terracotta italic">prove</em> it.
          </h2>

          <ol className="mt-12 space-y-8">
            {PHASES.map((phase, index) => (
              <li
                key={phase.title}
                className="border-foreground/10 grid gap-3 border-t pt-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
              >
                <span className="calm-kbd pt-1">{phase.label}</span>
                <div>
                  <h3 className="font-display text-foreground text-xl">
                    {phase.title}
                  </h3>
                  <p className="text-foreground/70 mt-2 max-w-[52ch] text-[0.98rem] leading-[1.6]">
                    {phase.body}
                  </p>
                </div>
                {index < PHASES.length - 1 ? (
                  <span aria-hidden="true" className="hidden" />
                ) : null}
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}
