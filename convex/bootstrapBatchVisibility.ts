import { internalMutation } from "./_generated/server";

// One-off cohort visibility fixes. Idempotent and safe to re-run.
//
// Inner Child Healing had a stale October 2026 batch still published, so it
// showed as the next available cohort instead of the January 2027 one. This
// archives it; the January 2027 cohort becomes the next batch.
//
//   npx convex run bootstrapBatchVisibility:hideInnerChildOctoberCohort --prod

const ACTOR = "bootstrap:batch-visibility";

const HIDE: { code: string; label: string }[] = [
  { code: "CCICH", label: "October 2026 Batch" },
];

export const hideInnerChildOctoberCohort = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const archived: string[] = [];

    for (const target of HIDE) {
      const course = courses.find((row) => row.code === target.code);
      if (!course) continue;

      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect();

      for (const batch of batches) {
        if (
          batch.label === target.label &&
          batch.lifecycleStatus !== "archived"
        ) {
          await ctx.db.patch(batch._id, {
            lifecycleStatus: "archived",
            updatedAt: now,
            updatedByAdminId: ACTOR,
          });
          archived.push(`${target.code} / ${batch.label}`);
        }
      }
    }

    return { archived };
  },
});
