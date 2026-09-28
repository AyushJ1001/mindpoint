import { internalMutation } from "./_generated/server";
import { formatEnrollmentNumber } from "./_shared/enrollment";

// Renumber existing enrollments to the human scheme
// (`TMP-<COURSECODE>-<YYYY>-<NNNN>`), keeping the old value in
// `legacyEnrollmentNumber` so any old reference can still be traced.
//
// Ordering is by creation time per course, so the sequence reflects the real
// order of enrolment. Therapy/supervised/worksheet rows keep "N/A".
//
//   npx convex run bootstrapEnrollmentNumbers:renumberEnrollments

const KEEP_NA_TYPES = new Set(["therapy", "supervised", "worksheet"]);

export const renumberEnrollments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const courseById = new Map(courses.map((course) => [course._id, course]));

    const enrollments = await ctx.db.query("enrollments").take(2000);
    const ordered = [...enrollments].sort(
      (a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0),
    );

    // Per-course, per-year running sequence.
    const counters = new Map<string, number>();
    const renumbered: { from: string; to: string }[] = [];
    let skipped = 0;

    for (const enrollment of ordered) {
      const course = courseById.get(enrollment.courseId);
      const type = enrollment.courseType ?? course?.type;
      if (type && KEEP_NA_TYPES.has(type)) {
        skipped += 1;
        continue;
      }

      const rawCode = (course?.code ?? enrollment.courseName ?? "GEN")
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase();
      const year = new Date(enrollment._creationTime ?? now).getFullYear();
      const key = `${rawCode}-${year}`;
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);

      const fresh = formatEnrollmentNumber(rawCode, year, next);
      if (enrollment.enrollmentNumber === fresh) continue;

      await ctx.db.patch(enrollment._id, {
        enrollmentNumber: fresh,
        legacyEnrollmentNumber: enrollment.enrollmentNumber,
      });
      renumbered.push({ from: enrollment.enrollmentNumber, to: fresh });
    }

    // Seed the live counters so new enrollments continue the sequence.
    for (const [key, lastSequence] of counters) {
      const [rawCode, yearText] = key.split("-");
      const year = Number(yearText);
      const existing = await ctx.db
        .query("enrollmentCounters")
        .withIndex("by_courseCode_and_year", (q) =>
          q.eq("courseCode", rawCode).eq("year", year),
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          lastSequence: Math.max(existing.lastSequence, lastSequence),
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("enrollmentCounters", {
          courseCode: rawCode,
          year,
          lastSequence,
          updatedAt: now,
        });
      }
    }

    return {
      renumbered: renumbered.length,
      skipped,
      sample: renumbered.slice(0, 5),
    };
  },
});
