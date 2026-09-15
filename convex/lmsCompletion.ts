import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function maybeCreateCompletionRequest(
  ctx: MutationCtx,
  enrollmentId: Id<"enrollments">,
) {
  const enrollment = await ctx.db.get("enrollments", enrollmentId);
  if (!enrollment) return null;
  const assignment = await ctx.db
    .query("lmsEnrollmentCurricula")
    .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollmentId))
    .unique();
  if (!assignment || assignment.status !== "active") return null;
  const activities = await ctx.db
    .query("lmsActivities")
    .withIndex("by_curriculumId", (q) =>
      q.eq("curriculumId", assignment.curriculumId),
    )
    .take(500);
  const requiredIds = new Set(
    activities
      .filter((activity) => activity.required)
      .map((activity) => activity._id),
  );
  if (requiredIds.size === 0) return null;
  const progress = await ctx.db
    .query("lmsActivityProgress")
    .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollmentId))
    .take(500);
  for (const item of progress) {
    if (item.status === "completed") requiredIds.delete(item.activityId);
  }
  if (requiredIds.size > 0) return null;
  const existing = await ctx.db
    .query("lmsCompletionRequests")
    .withIndex("by_enrollmentId_and_curriculumId", (q) =>
      q
        .eq("enrollmentId", enrollmentId)
        .eq("curriculumId", assignment.curriculumId),
    )
    .unique();
  if (existing) return existing._id;
  return await ctx.db.insert("lmsCompletionRequests", {
    enrollmentId,
    curriculumId: assignment.curriculumId,
    courseId: enrollment.courseId,
    batchId: enrollment.batchId,
    status: "awaiting_name",
    requestedAt: Date.now(),
  });
}
