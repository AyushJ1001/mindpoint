import { internalQuery } from "./_generated/server";

/**
 * Aggregated only: counts per course and cohort, no student identifiers.
 * Used to see what the proposed LMS cutoffs would hide before enforcing them.
 *
 * Certificate courses and internships: cohorts starting on or after 2027-01-01.
 * Workshops and masterclasses: events starting on or after 2026-11-01.
 */
const COURSE_CUTOFF = "2027-01-01";
const EVENT_CUTOFF = "2026-11-01";
const EVENT_TYPES = new Set(["masterclass", "worksheet"]);

export const audit = internalQuery({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").take(2000);
    const byId = new Map(courses.map((course) => [String(course._id), course]));
    const batches = await ctx.db.query("courseBatches").take(2000);
    const batchById = new Map(batches.map((b) => [String(b._id), b]));

    const enrollments = await ctx.db.query("enrollments").take(5000);
    const rows = new Map<
      string,
      {
        code: string;
        course: string;
        type: string;
        cohort: string;
        start: string;
        active: number;
        wouldHide: boolean;
      }
    >();

    for (const enrollment of enrollments) {
      if ((enrollment.status ?? "active") !== "active") continue;
      const course = byId.get(String(enrollment.courseId));
      if (!course) continue;
      const batch = enrollment.batchId ? batchById.get(String(enrollment.batchId)) : null;
      const start =
        batch?.startDate ?? course.startDate ?? "";
      const isEvent = EVENT_TYPES.has(course.type ?? "");
      const cutoff = isEvent ? EVENT_CUTOFF : COURSE_CUTOFF;
      const key = `${course.code}|${batch?.label ?? "no batch"}|${start}`;
      const row =
        rows.get(key) ??
        {
          code: course.code,
          course: course.name,
          type: course.type ?? "unknown",
          cohort: batch?.label ?? "No batch",
          start,
          active: 0,
          wouldHide: Boolean(start) && start < cutoff,
        };
      row.active += 1;
      rows.set(key, row);
    }

    return Array.from(rows.values()).sort((a, b) => a.start.localeCompare(b.start));
  },
});
