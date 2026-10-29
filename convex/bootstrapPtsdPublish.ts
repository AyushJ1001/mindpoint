import { internalMutation } from "./_generated/server";

// Opens PTSD registrations: publishes the course, enables sales and publishes
// the February 2027 cohort. Idempotent.
//   npx convex run bootstrapPtsdPublish:openRegistrations --prod
const ACTOR = "bootstrap:ptsd-publish";

export const openRegistrations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === "CCPTSD");
    if (!course) return { error: "CCPTSD not found" };

    await ctx.db.patch(course._id, {
      lifecycleStatus: "published",
      salesEnabled: true,
      publishedAt: course.publishedAt ?? now,
      updatedAt: now,
      updatedByAdminId: ACTOR,
    });

    const batches = await ctx.db
      .query("courseBatches")
      .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
      .collect();
    const february = batches.find((b) => b.label === "February 2027 cohort");
    if (february) {
      await ctx.db.patch(february._id, {
        lifecycleStatus: "published",
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
    }

    return {
      courseId: String(course._id),
      batchId: february ? String(february._id) : null,
      published: true,
    };
  },
});
