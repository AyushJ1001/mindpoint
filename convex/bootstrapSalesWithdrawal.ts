import { internalMutation } from "./_generated/server";

// One-off catalogue fixes before January 2027 registrations. Idempotent and
// safe to re-run.
//
// The three ₹1,499 self-paced introductions are not ready for enrollment, so
// they are withdrawn from sale: hidden from the site and blocked at checkout.
// Their content, enrollments and LMS access stay as they are. The ₹999
// introductions stay on sale.
//
// The Counselling Psychology internship is published but had only a draft
// January 2027 cohort, so it could not be bought into a real batch. This
// publishes that cohort.
//
//   npx convex run bootstrapSalesWithdrawal:applyJanuaryCatalogue --prod

const ACTOR = "bootstrap:sales-withdrawal";

const WITHDRAW_CODES = ["PRCBTI", "PRICHI", "PRPDI"];

const PUBLISH_BATCHES: { code: string; label: string }[] = [
  { code: "INCLP", label: "January 2027 cohort" },
];

export const applyJanuaryCatalogue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Codes repeat across archived copies; only the live row counts.
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_lifecycleStatus", (q) =>
        q.eq("lifecycleStatus", "published"),
      )
      .take(2000);
    const byCode = new Map(
      courses
        .filter((course) => !course.mergedIntoCourseId)
        .map((course) => [course.code, course]),
    );
    const withdrawn: string[] = [];
    const published: string[] = [];
    const missing: string[] = [];

    for (const code of WITHDRAW_CODES) {
      const course = byCode.get(code);
      if (!course) {
        missing.push(code);
        continue;
      }
      if (course.salesEnabled === false) continue;
      await ctx.db.patch(course._id, {
        salesEnabled: false,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
      withdrawn.push(`${code} / ${course.name}`);
    }

    for (const target of PUBLISH_BATCHES) {
      const course = byCode.get(target.code);
      if (!course) {
        missing.push(target.code);
        continue;
      }

      const batches = await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .take(200);
      for (const batch of batches) {
        if (batch.label === target.label && batch.lifecycleStatus === "draft") {
          await ctx.db.patch(batch._id, {
            lifecycleStatus: "published",
            updatedAt: now,
            updatedByAdminId: ACTOR,
          });
          published.push(`${target.code} / ${batch.label}`);
        }
      }
    }

    return { withdrawn, published, missing };
  },
});
