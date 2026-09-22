import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isLmsCourseType } from "./lmsCourseScope";

export async function activatePublishedLmsCurriculum(
  ctx: MutationCtx,
  args: {
    enrollmentId: Id<"enrollments">;
    courseId: Id<"courses">;
    courseType?: string;
  },
) {
  if (!isLmsCourseType(args.courseType)) return null;

  const existing = await ctx.db
    .query("lmsEnrollmentCurricula")
    .withIndex("by_enrollmentId", (q) =>
      q.eq("enrollmentId", args.enrollmentId),
    )
    .unique();
  if (existing) return existing._id;

  const published = await ctx.db
    .query("lmsCurricula")
    .withIndex("by_courseId_and_status", (q) =>
      q.eq("courseId", args.courseId).eq("status", "published"),
    )
    .order("desc")
    .take(1);
  if (!published[0]) return null;

  return await ctx.db.insert("lmsEnrollmentCurricula", {
    enrollmentId: args.enrollmentId,
    curriculumId: published[0]._id,
    status: "active",
    activatedAt: Date.now(),
    activatedByAdminId: "system:checkout",
  });
}
