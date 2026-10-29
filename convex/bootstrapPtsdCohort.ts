import { internalMutation } from "./_generated/server";

// February 2027 cohort for the PTSD draft (owner-supplied timetable).
//   npx convex run bootstrapPtsdCohort:applyPtsdCohort --prod
// Idempotent: matches the course by code and the cohort by label.

const ACTOR = "bootstrap:ptsd-cohort";
const CODE = "CCPTSD";
const LABEL = "February 2027 cohort";

export const applyPtsdCohort = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === CODE && !row.mergedIntoCourseId);
    if (!course) return { error: "CCPTSD not found" };

    await ctx.db.patch(course._id, {
      startDate: "2027-02-02",
      endDate: "2027-03-25",
      startTime: "19:30",
      endTime: "20:30",
      daysOfWeek: ["Tuesday", "Thursday"],
      sessions: 16,
      duration: "8 weeks",
      price: 4500,
      usesBatches: true,
      lifecycleStatus: "draft",
      salesEnabled: false,
      updatedAt: now,
      updatedByAdminId: ACTOR,
    });

    const existing = (
      await ctx.db
        .query("courseBatches")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect()
    ).find((batch) => batch.label === LABEL);

    const fields = {
      label: LABEL,
      startDate: "2027-02-02",
      endDate: "2027-03-25",
      startTime: "19:30",
      endTime: "20:30",
      daysOfWeek: ["Tuesday", "Thursday"],
      capacity: 30,
      lifecycleStatus: "draft" as const,
      sortOrder: 0,
      updatedAt: now,
      updatedByAdminId: ACTOR,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return { action: "updated", courseId: String(course._id), batchId: String(existing._id) };
    }

    const batchId = await ctx.db.insert("courseBatches", {
      ...fields,
      courseId: course._id,
      enrolledUsers: [],
      createdByAdminId: ACTOR,
    });
    return { action: "created", courseId: String(course._id), batchId: String(batchId) };
  },
});
