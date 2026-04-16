"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@mindpoint/backend";

interface Props {
  course: PublicCourse;
}

// Try to extract 2-3 short bullets from a module description. We accept a few
// common patterns in the CMS: newline-separated lines, bullet characters,
// semicolons, or em/en-dash lists.
function bulletsFromDescription(desc?: string): string[] {
  if (!desc) return [];
  const raw = desc.trim();
  if (!raw) return [];

  // Prefer explicit delimiters when present.
  const delimited = raw
    .split(/\n+|\s*\u2022\s*|\s*[\u2013\u2014]\s+|\s*;\s*|\s*\|\s*/)
    .map((s) => s.replace(/^[-*]+\s*/, "").trim())
    .filter(Boolean);

  if (delimited.length >= 2) {
    return delimited.slice(0, 3);
  }

  // Fall back to sentence splitting.
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [];
  return sentences.slice(0, 3);
}

type ModuleRow = {
  title: string;
  bullets: string[];
};

function buildRows(course: PublicCourse): ModuleRow[] {
  if (course.modules && course.modules.length > 0) {
    return course.modules.map((m) => ({
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

export default function CourseCurriculum({ course }: Props) {
  const rows = buildRows(course);
  if (rows.length === 0) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container-wide">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">Curriculum</p>
            <h2 className="calm-section-title mt-5">
              What will you learn.
            </h2>
            <span
              aria-hidden="true"
              className="calm-title-ornament mt-6"
            />
          </div>

          <ol className="calm-module-list mt-14">
            {rows.map((row, i) => (
              <li key={i} className="calm-module-card">
                <div className="min-w-0">
                  <h3 className="calm-module-title text-foreground">
                    {row.title}
                  </h3>
                  {row.bullets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {row.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="flex gap-3 text-[0.92rem] leading-[1.55] text-foreground/75"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.55rem] h-px w-3 flex-none bg-foreground/35"
                          />
                          <span>{b}</span>
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
