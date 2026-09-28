import { internalMutation } from "./_generated/server";
import { maybeCreateCompletionRequest } from "./lmsCompletion";
import type { Id } from "./_generated/dataModel";

/**
 * Test helper: confirm the certificate name and issue the certificate for a
 * test enrollment, so the final screen can be previewed without a Faculty
 * sign-in. Mirrors `confirmCertificateName` + `approveCompletion`.
 *
 *   npx convex run bootstrapTestCompletion:issueTestCertificate
 */
export const issueTestCertificate = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "akshajuvekar6@gmail.com".trim().toLowerCase();
    const courseCode = "PRSP";
    const recipientName = "Ayush Juvekar";
    const now = Date.now();

    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === courseCode);
    if (!course) return { issued: false, reason: "course not found" };

    const enrollments = await ctx.db.query("enrollments").take(2000);
    const enrollment = enrollments.find(
      (row) =>
        row.courseId === course._id &&
        (row.userEmail ?? "").toLowerCase() === email,
    );
    if (enrollment === undefined) {
      return { issued: false, reason: "enrollment not found" };
    }

    const assignment = await ctx.db
      .query("lmsEnrollmentCurricula")
      .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollment._id))
      .unique();
    if (!assignment) return { issued: false, reason: "no curriculum" };

    const request = await ctx.db
      .query("lmsCompletionRequests")
      .withIndex("by_enrollmentId_and_curriculumId", (q) =>
        q
          .eq("enrollmentId", enrollment._id)
          .eq("curriculumId", assignment.curriculumId),
      )
      .unique();
    if (!request) return { issued: false, reason: "no completion request" };

    // Step 1: confirm the name (the learner's action).
    await ctx.db.patch(request._id, {
      confirmedRecipientName: recipientName,
      nameConfirmedAt: now,
      status: "pending",
    });

    // Step 2: approve and issue (normally Faculty).
    let certificateId = request.certificateId;
    if (!certificateId) {
      certificateId = await ctx.db.insert("lmsCertificates", {
        enrollmentId: enrollment._id,
        curriculumId: request.curriculumId,
        verificationCode: enrollment.enrollmentNumber,
        recipientName,
        courseName: course.name,
        status: "issued",
        issuedAt: now,
        publicVerificationEnabled: false,
      });
    } else {
      // Re-issue with the current scheme.
      await ctx.db.patch("lmsCertificates", certificateId, {
        verificationCode: enrollment.enrollmentNumber,
        recipientName,
        status: "issued",
        issuedAt: now,
      });
    }

    await ctx.db.patch(request._id, {
      status: "approved",
      reviewedAt: now,
      reviewedByTokenIdentifier: "test:facetest",
      certificateId,
    });
    await ctx.db.patch(assignment._id, {
      status: "completed",
      completedAt: now,
    });

    return {
      issued: true,
      certificateId,
      verificationCode: enrollment.enrollmentNumber,
      recipientName,
      courseName: course.name,
      next: `Sign in and open /lms — the issued certificate is shown. Verify at /verify/<code>.`,
    };
  },
});

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

// Remove the fabricated test certificate and completion request so the course
// can be completed for real, or re-issued with the current numbering.
//
//   npx convex run bootstrapTestCompletion:resetTestCertificate

export const resetTestCertificate = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "akshajuvekar6@gmail.com".trim().toLowerCase();
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === "PRSP");
    if (!course) return { cleared: false, reason: "course not found" };

    const enrollments = await ctx.db.query("enrollments").take(2000);
    const enrollment = enrollments.find(
      (row) =>
        row.courseId === course._id &&
        (row.userEmail ?? "").toLowerCase() === email,
    );
    if (!enrollment) return { cleared: false, reason: "enrollment not found" };

    let removedCertificates = 0;
    const certificates = await ctx.db
      .query("lmsCertificates")
      .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollment._id))
      .take(50);
    for (const certificate of certificates) {
      await ctx.db.delete(certificate._id);
      removedCertificates += 1;
    }

    let removedRequests = 0;
    const requests = await ctx.db
      .query("lmsCompletionRequests")
      .withIndex("by_enrollmentId_and_curriculumId", (q) =>
        q.eq("enrollmentId", enrollment._id),
      )
      .take(50);
    for (const request of requests) {
      await ctx.db.delete(request._id);
      removedRequests += 1;
    }

    return {
      cleared: true,
      enrollmentNumber: enrollment.enrollmentNumber,
      removedCertificates,
      removedRequests,
    };
  },
});

// Point the test enrollment at the owner's real Clerk identity, so the LMS
// (which queries by Clerk subject) can see it. Only touches the one test
// enrollment on the Sports Psychology course.
//
//   npx convex run bootstrapTestCompletion:linkTestEnrollmentToAccount

export const linkTestEnrollmentToAccount = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "akshajuvekar6@gmail.com".trim().toLowerCase();
    const clerkUserId = "user_31K6Xv7IHJW7qn9kxcwtWkEKHBu";
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === "PRSP");
    if (!course) return { linked: false, reason: "course not found" };

    const enrollments = await ctx.db.query("enrollments").take(2000);
    const enrollment = enrollments.find(
      (row) =>
        row.courseId === course._id &&
        (row.userEmail ?? "").toLowerCase() === email,
    );
    if (!enrollment) return { linked: false, reason: "enrollment not found" };

    await ctx.db.patch(enrollment._id, { userId: clerkUserId });
    return {
      linked: true,
      enrollmentNumber: enrollment.enrollmentNumber,
      userId: clerkUserId,
    };
  },
});
