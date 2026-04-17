"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { splitDescription } from "@/components/course/course-hero";
import type { PublicCourse } from "@mindpoint/backend";

interface Props {
  course: PublicCourse;
}

// Pull a tight set of three tiles from the course data itself. No defaults.
// Priority: painPoints (these read as "you're here because"). Fill remaining
// slots from whyDifferent.
function buildTiles(course: PublicCourse): string[] {
  const points = (course.painPoints ?? []).filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );
  const why = (course.whyDifferent ?? []).filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );
  const merged = [...points, ...why];
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of merged) {
    const key = item.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item.trim());
    if (deduped.length >= 3) break;
  }
  return deduped;
}

function buildHeadline(course: PublicCourse): string {
  switch (course.type) {
    case "therapy":
      return "A space that meets you where you are.";
    case "supervised":
      return "Someone experienced, in your corner.";
    case "internship":
      return "Practice, under steady guidance.";
    case "diploma":
      return "Depth, taken one week at a time.";
    case "worksheet":
      return "A resource you can keep returning to.";
    default:
      return "A calmer way to learn what this work asks of you.";
  }
}

export default function CourseWhyThisExists({ course }: Props) {
  const { rest } = splitDescription(course.description);
  const paragraph = rest;
  const tiles = buildTiles(course);

  // If the course has no supporting prose at all, omit the section.
  if (!paragraph && tiles.length === 0) return null;

  const headline = buildHeadline(course);

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">Why this exists</p>
            <h2 className="calm-section-title mt-5">
              {headline}
            </h2>
          </div>

          {paragraph && (
            <p className="calm-section-lead mt-8 max-w-[58ch]">{paragraph}</p>
          )}

          {tiles.length > 0 && (
            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {tiles.map((tile, i) => (
                <div key={i} className="calm-tile">
                  <p className="text-[0.98rem] leading-[1.55] text-foreground/85">
                    {tile}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
