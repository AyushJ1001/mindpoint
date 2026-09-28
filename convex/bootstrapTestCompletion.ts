import { internalMutation } from "./_generated/server";
import { maybeCreateCompletionRequest } from "./lmsCompletion";
import type { Id } from "./_generated/dataModel";

// Test helper: mark every activity in an enrollment's curriculum complete, so
// the owner can see the certificate step without clicking through the whole
// course. Not for production use on a real student.
//
//   npx convex run bootstrapIntroCleanup:completeTestEnrollment \
//     '{"email":"akshajuvekar6@gmail.com","courseCode":"PRSP"}'

export const completeTestEnrollment = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "akshajuvekar6@gmail.com".trim().toLowerCase();
    const courseCode = "PRSP";
    const now = Date.now();

    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === courseCode);
    if (!course) return { completed: 0, reason: "course not found" };

    const enrollments = await ctx.db.query("enrollments").take(2000);
    const enrollment = enrollments.find(
      (row) =>
        row.courseId === course._id &&
        (row.userEmail ?? "").toLowerCase() === email,
    );
    if (!enrollment) return { completed: 0, reason: "enrollment not found" };

    const assignment = await ctx.db
      .query("lmsEnrollmentCurricula")
      .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollment._id))
      .unique();
    if (!assignment) return { completed: 0, reason: "no curriculum assigned" };

    const activities = await ctx.db
      .query("lmsActivities")
      .withIndex("by_curriculumId", (q) =>
        q.eq("curriculumId", assignment.curriculumId),
      )
      .take(500);

    let completed = 0;
    for (const activity of activities) {
      const existing = await ctx.db
        .query("lmsActivityProgress")
        .withIndex("by_enrollmentId_and_activityId", (q) =>
          q.eq("enrollmentId", enrollment._id).eq("activityId", activity._id),
        )
        .unique();
      const patch = {
        status: "completed" as const,
        startedAt: existing?.startedAt ?? now,
        submittedAt: now,
        completedAt: now,
        updatedAt: now,
      };
      if (existing) {
        await ctx.db.patch(existing._id, patch);
      } else {
        await ctx.db.insert("lmsActivityProgress", {
          enrollmentId: enrollment._id,
          activityId: activity._id,
          ...patch,
        });
      }
      completed += 1;
    }

    // Seed a submission for each assignment so the record looks real.
    for (const activity of activities.filter(
      (row) => row.type === "assignment",
    )) {
      const existing = await ctx.db
        .query("lmsSubmissions")
        .withIndex("by_enrollmentId_and_activityId", (q) =>
          q.eq("enrollmentId", enrollment._id).eq("activityId", activity._id),
        )
        .first();
      if (existing) continue;
      await ctx.db.insert("lmsSubmissions", {
        enrollmentId: enrollment._id,
        activityId: activity._id,
        courseId: enrollment.courseId,
        batchId: enrollment.batchId,
        attemptNumber: 1,
        responseText:
          "Test submission created to preview the completion and certificate flow.",
        status: "accepted",
        submittedAt: now,
        reviewedAt: now,
        feedback: "Auto-reviewed (test data).",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Seed feedback so the required feedback activity is satisfied.
    const feedbackActivity = activities.find((row) => row.type === "feedback");
    if (feedbackActivity) {
      const receipt = await ctx.db
        .query("lmsFeedbackReceipts")
        .withIndex("by_enrollmentId_and_activityId", (q) =>
          q
            .eq("enrollmentId", enrollment._id)
            .eq("activityId", feedbackActivity._id),
        )
        .unique();
      if (!receipt) {
        await ctx.db.insert("lmsFeedbackReceipts", {
          enrollmentId: enrollment._id,
          activityId: feedbackActivity._id,
          mode: "identified",
          receiptCode: `TMP-FB-TEST-${now.toString(36).toUpperCase()}`,
          submittedAt: now,
        });
        await ctx.db.insert("lmsFeedbackResponses", {
          activityId: feedbackActivity._id,
          curriculumId: assignment.curriculumId,
          courseId: enrollment.courseId,
          mode: "identified",
          enrollmentId: enrollment._id,
          batchId: enrollment.batchId,
          rating: 5,
          comment: "Test feedback to preview the completion flow.",
          reportingPeriod: new Date(now).toISOString().slice(0, 7),
          submittedAt: now,
        });
      }
    }

    const requestId = await maybeCreateCompletionRequest(ctx, enrollment._id);

    return {
      completed,
      enrollmentId: enrollment._id as Id<"enrollments">,
      completionRequestId: requestId,
      next: "Open /lms and confirm the certificate name to see the next step.",
    };
  },
});
