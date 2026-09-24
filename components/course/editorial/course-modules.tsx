"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

function bulletsFromDescription(desc?: string): string[] {
  if (!desc) return [];
  const raw = desc.trim();
  if (!raw) return [];

  const delimited = raw
    .split(/\n+|\s*\u2022\s*|\s*[\u2013\u2014]\s+|\s*;\s*|\s*\|\s*/)
    .map((s) => s.replace(/^[-*]+\s*/, "").trim())
    .filter(Boolean);

  if (delimited.length >= 2) return delimited.slice(0, 3);

  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [];
  return sentences.slice(0, 3);
}

type ModuleRow = { title: string; bullets: string[] };

function buildRows(course: PublicCourse): ModuleRow[] {
  const modules = (course as { modules?: { title: string; description?: string }[] })
    .modules;
  if (modules && modules.length > 0) {
    return modules.map((m) => ({
      title: m.title,
      bullets: bulletsFromDescription(m.description),
    }));
  }
  if (course.learningOutcomes && course.learningOutcomes.length > 0) {
    return course.learningOutcomes.map((lo) => ({
      title: lo.title,
      bullets: [],
    }));
  }
  return [];
}

export default function CourseModules({ course }: Props) {
  const rows = buildRows(course);
  if (rows.length === 0) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container-wide">
        <ScrollReveal>
          <p className="calm-section-number">Inside the course</p>
          <h2 className="calm-section-title mt-5">
            What you&rsquo;ll <em className="text-terracotta italic">cover</em>.
          </h2>
          <span aria-hidden="true" className="calm-title-ornament mt-6" />

          <ol className="mt-12 space-y-10">
            {rows.map((row, index) => (
              <li key={index} className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:gap-6">
                <span
                  aria-hidden="true"
                  className="font-display text-terracotta text-2xl leading-none tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="border-foreground/10 border-t pt-4">
                  <h3 className="font-display text-foreground text-xl leading-snug">
                    {row.title}
                  </h3>
                  {row.bullets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {row.bullets.map((bullet, bulletIndex) => (
                        <li
                          key={bulletIndex}
                          className="text-foreground/70 flex gap-3 text-[0.94rem] leading-[1.55]"
                        >
                          <span
                            aria-hidden="true"
                            className="bg-foreground/30 mt-[0.6rem] h-px w-3 flex-none"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}
