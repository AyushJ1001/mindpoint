import type { MutationCtx } from "../_generated/server";

export type InternshipPlan = "120" | "240";

export function extractInternshipPlanFromDuration(
  duration?: string,
): InternshipPlan | null {
  if (!duration) return null;

  const durationLower = duration.toLowerCase().trim();

  if (durationLower.includes("120") || durationLower.includes("2 week")) {
    return "120";
  }
  if (durationLower.includes("240") || durationLower.includes("4 week")) {
    return "240";
  }

  const weekMatch = durationLower.match(/(\d+)\s*week/);
  if (weekMatch) {
    const weeks = Number.parseInt(weekMatch[1], 10);
    if (weeks <= 2) return "120";
    if (weeks >= 4) return "240";
  }

  const hourMatch = durationLower.match(/(\d+)\s*hour/);
  if (hourMatch) {
    const hours = Number.parseInt(hourMatch[1], 10);
    if (hours <= 120) return "120";
    if (hours >= 240) return "240";
  }

  return null;
}

export function calculateInternshipEndDate(
  startDate: string | undefined,
  internshipPlan: InternshipPlan,
): string {
  const parsedStart = startDate ? new Date(startDate) : new Date();
  const start = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const weeks = internshipPlan === "120" ? 2 : 4;
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + weeks * 7);

  return endDate.toISOString().split("T")[0];
}

/**
 * Human-readable enrollment number: `TMP-<COURSECODE>-<YYYY>-<NNNN>`, e.g.
 * `TMP-PRCP-2026-0042`. Short enough to read aloud, shows the course at a
 * glance, and the sequence makes it easy to find in the admin list.
 *
 * The sequence comes from a per-course counter (see `nextEnrollmentSequence`),
 * so it never depends on the current time and cannot produce a `NaN`.
 */
export function formatEnrollmentNumber(
  courseCode: string,
  year: number,
  sequence: number,
): string {
  const code = (courseCode || "GEN").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const seq = Math.max(1, Math.floor(sequence)).toString().padStart(4, "0");
  return `TMP-${code}-${year}-${seq}`;
}

/** Legacy format, kept only so old records remain recognisable. */
export function generateEnrollmentNumber(
  courseCode: string,
  startDate: string,
): string {
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString(36).toUpperCase();
  const entropy = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `EN-${courseCode}-${month}${year}-${timestamp}-${entropy}`;
}

/**
 * Allocate the next enrollment number for a course. Uses a per-course, per-year
 * counter so numbers are sequential and readable. Must run inside a mutation.
 *
 * Convex mutations are serializable, so two concurrent allocations cannot read
 * the same `lastSequence`.
 */
export async function allocateEnrollmentNumber(
  ctx: MutationCtx,
  courseCode: string,
  when: number = Date.now(),
): Promise<string> {
  const code = (courseCode || "GEN").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const year = new Date(when).getFullYear();

  const existing = await ctx.db
    .query("enrollmentCounters")
    .withIndex("by_courseCode_and_year", (q) =>
      q.eq("courseCode", code).eq("year", year),
    )
    .unique();

  const next = (existing?.lastSequence ?? 0) + 1;

  if (existing) {
    await ctx.db.patch("enrollmentCounters", existing._id, {
      lastSequence: next,
      updatedAt: when,
    });
  } else {
    await ctx.db.insert("enrollmentCounters", {
      courseCode: code,
      year,
      lastSequence: next,
      updatedAt: when,
    });
  }

  return formatEnrollmentNumber(code, year, next);
}

export function roundCurrency(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value!));
}
