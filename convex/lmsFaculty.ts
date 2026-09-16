import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { maybeCreateCompletionRequest } from "./lmsCompletion";
import { summarizeLmsFeedback } from "./_shared/lmsFeedback";

type FacultyPermission =
  | "canGrade"
  | "canAnswerQuestions"
  | "canApproveCompletion";

async function requireFacultyIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized: sign in required");
  return identity;
}

export const getAccessStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireFacultyIdentity(ctx);
    const email = identity.email?.trim().toLowerCase();
    const [activeAssignments, emailAssignments] = await Promise.all([
      ctx.db
        .query("lmsFacultyAssignments")
        .withIndex("by_facultyTokenIdentifier", (q) =>
          q.eq("facultyTokenIdentifier", identity.tokenIdentifier),
        )
        .take(100),
      email
        ? ctx.db
            .query("lmsFacultyAssignments")
            .withIndex("by_facultyEmail", (q) => q.eq("facultyEmail", email))
            .take(100)
        : Promise.resolve([]),
    ]);

    return {
      email,
      activeAssignments: activeAssignments.length,
      pendingAssignments: emailAssignments.filter(
        (assignment) => !assignment.facultyTokenIdentifier,
      ).length,
    };
  },
});

export const claimFacultyAccess = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireFacultyIdentity(ctx);
    const email = identity.email?.trim().toLowerCase();
    if (!email) {
      throw new Error("Your signed-in account does not provide an email");
    }
    const assignments = await ctx.db
      .query("lmsFacultyAssignments")
      .withIndex("by_facultyEmail", (q) => q.eq("facultyEmail", email))
      .take(100);
    const pending = assignments.filter(
      (assignment) => !assignment.facultyTokenIdentifier,
    );
    for (const assignment of pending) {
      await ctx.db.patch("lmsFacultyAssignments", assignment._id, {
        facultyTokenIdentifier: identity.tokenIdentifier,
        facultyName: assignment.facultyName ?? identity.name ?? email,
      });
      await ctx.db.insert("adminAuditLogs", {
        actorAdminId: identity.tokenIdentifier,
        actorEmail: email,
        action: "lms.faculty_assignment.claimed",
        entityType: "lmsFacultyAssignment",
        entityId: assignment._id,
        after: {
          facultyEmail: email,
          facultyTokenIdentifier: identity.tokenIdentifier,
        },
        createdAt: Date.now(),
      });
    }
    return { claimed: pending.length };
  },
});

async function getFacultyAssignment(
  ctx: QueryCtx | MutationCtx,
  enrollment: Doc<"enrollments">,
  permission?: FacultyPermission,
) {
  const identity = await requireFacultyIdentity(ctx);
  const assignments = await ctx.db
    .query("lmsFacultyAssignments")
    .withIndex("by_courseId_and_facultyTokenIdentifier", (q) =>
      q
        .eq("courseId", enrollment.courseId)
        .eq("facultyTokenIdentifier", identity.tokenIdentifier),
    )
    .take(100);
  const assignment = assignments.find(
    (item) =>
      (!item.batchId || item.batchId === enrollment.batchId) &&
      (!permission || item[permission]),
  );
  if (!assignment)
    throw new Error("Forbidden: assigned Faculty access required");
  return assignment;
}

export const listMyQueue = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireFacultyIdentity(ctx);
    const assignments = await ctx.db
      .query("lmsFacultyAssignments")
      .withIndex("by_facultyTokenIdentifier", (q) =>
        q.eq("facultyTokenIdentifier", identity.tokenIdentifier),
      )
      .take(100);
    const allowed = (
      enrollment: Doc<"enrollments">,
      permission: FacultyPermission,
    ) =>
      assignments.some(
        (assignment) =>
          assignment.courseId === enrollment.courseId &&
          (!assignment.batchId || assignment.batchId === enrollment.batchId) &&
          assignment[permission],
      );

    const scopedWork = await Promise.all(
      assignments.slice(0, 10).map(async (assignment) => {
        const submissionsFor = async (status: "submitted" | "in_review") =>
          assignment.batchId
            ? await ctx.db
                .query("lmsSubmissions")
                .withIndex("by_courseId_and_batchId_and_status", (q) =>
                  q
                    .eq("courseId", assignment.courseId)
                    .eq("batchId", assignment.batchId)
                    .eq("status", status),
                )
                .order("asc")
                .take(25)
            : await ctx.db
                .query("lmsSubmissions")
                .withIndex("by_courseId_and_status", (q) =>
                  q.eq("courseId", assignment.courseId).eq("status", status),
                )
                .order("asc")
                .take(25);
        const questions = assignment.batchId
          ? await ctx.db
              .query("lmsQuestions")
              .withIndex("by_courseId_and_batchId_and_status", (q) =>
                q
                  .eq("courseId", assignment.courseId)
                  .eq("batchId", assignment.batchId)
                  .eq("status", "open"),
              )
              .order("asc")
              .take(25)
          : await ctx.db
              .query("lmsQuestions")
              .withIndex("by_courseId_and_status", (q) =>
                q.eq("courseId", assignment.courseId).eq("status", "open"),
              )
              .order("asc")
              .take(25);
        const completionsFor = (status: "pending" | "under_review") =>
          assignment.batchId
            ? ctx.db
                .query("lmsCompletionRequests")
                .withIndex("by_courseId_and_batchId_and_status", (q) =>
                  q
                    .eq("courseId", assignment.courseId)
                    .eq("batchId", assignment.batchId)
                    .eq("status", status),
                )
                .order("asc")
                .take(25)
            : ctx.db
                .query("lmsCompletionRequests")
                .withIndex("by_courseId_and_status", (q) =>
                  q.eq("courseId", assignment.courseId).eq("status", status),
                )
                .order("asc")
                .take(25);
        const [pendingCompletions, heldCompletions] = await Promise.all([
          completionsFor("pending"),
          completionsFor("under_review"),
        ]);
        const completions = [...pendingCompletions, ...heldCompletions];
        const [submitted, inReview] = await Promise.all([
          submissionsFor("submitted"),
          submissionsFor("in_review"),
        ]);
        return { submitted, inReview, questions, completions };
      }),
    );
    const submitted = Array.from(
      new Map(
        scopedWork
          .flatMap((group) => group.submitted)
          .map((item) => [item._id, item]),
      ).values(),
    );
    const inReview = Array.from(
      new Map(
        scopedWork
          .flatMap((group) => group.inReview)
          .map((item) => [item._id, item]),
      ).values(),
    );
    const questions = Array.from(
      new Map(
        scopedWork
          .flatMap((group) => group.questions)
          .map((item) => [item._id, item]),
      ).values(),
    );
    const completions = Array.from(
      new Map(
        scopedWork
          .flatMap((group) => group.completions)
          .map((item) => [item._id, item]),
      ).values(),
    );

    const submissionItems = await Promise.all(
      [...submitted, ...inReview].map(async (submission) => {
        const [enrollment, activity] = await Promise.all([
          ctx.db.get("enrollments", submission.enrollmentId),
          ctx.db.get("lmsActivities", submission.activityId),
        ]);
        if (!enrollment || !activity || !allowed(enrollment, "canGrade"))
          return null;
        const course = await ctx.db.get("courses", enrollment.courseId);
        return {
          kind: "submission" as const,
          id: submission._id,
          enrollmentId: enrollment._id,
          activityId: activity._id,
          title: activity.title,
          courseName: course?.name ?? enrollment.courseName ?? "Course",
          studentName: enrollment.userName ?? "Student",
          studentEmail: enrollment.userEmail,
          body: submission.responseText,
          gradingCriteria: activity.gradingCriteria,
          attemptNumber: submission.attemptNumber,
          status: submission.status,
          claimState: !submission.claimedByTokenIdentifier
            ? ("unclaimed" as const)
            : submission.claimedByTokenIdentifier === identity.tokenIdentifier
              ? ("claimed_by_me" as const)
              : ("claimed_by_other" as const),
          createdAt: submission.submittedAt ?? submission.createdAt,
        };
      }),
    );

    const questionItems = await Promise.all(
      questions.map(async (question) => {
        const enrollment = await ctx.db.get(
          "enrollments",
          question.enrollmentId,
        );
        if (!enrollment || !allowed(enrollment, "canAnswerQuestions"))
          return null;
        const [course, activity] = await Promise.all([
          ctx.db.get("courses", enrollment.courseId),
          question.activityId
            ? ctx.db.get("lmsActivities", question.activityId)
            : null,
        ]);
        return {
          kind: "question" as const,
          id: question._id,
          enrollmentId: enrollment._id,
          activityId: question.activityId,
          title: activity?.title ?? "Course question",
          courseName: course?.name ?? enrollment.courseName ?? "Course",
          studentName: enrollment.userName ?? "Student",
          studentEmail: enrollment.userEmail,
          body: question.body,
          visibility: question.visibility,
          status: question.status,
          createdAt: question.createdAt,
        };
      }),
    );

    const completionItems = await Promise.all(
      completions.map(async (request) => {
        const enrollment = await ctx.db.get(
          "enrollments",
          request.enrollmentId,
        );
        if (!enrollment || !allowed(enrollment, "canApproveCompletion"))
          return null;
        const course = await ctx.db.get("courses", enrollment.courseId);
        return {
          kind: "completion" as const,
          id: request._id,
          enrollmentId: enrollment._id,
          title:
            request.status === "under_review"
              ? "Completion under review"
              : "Completion approval",
          courseName: course?.name ?? enrollment.courseName ?? "Course",
          studentName: enrollment.userName ?? "Student",
          studentEmail: enrollment.userEmail,
          body:
            request.status === "under_review"
              ? (request.correctionReason ??
                "This Completion is held for an evidence review.")
              : "Every required activity is complete. Revalidation will run before Certificate issuance.",
          status: request.status,
          createdAt: request.requestedAt,
        };
      }),
    );

    const courseAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await ctx.db.get("courses", assignment.courseId);
        return {
          assignmentId: assignment._id,
          courseId: assignment.courseId,
          courseName: course?.name ?? "Course",
          batchId: assignment.batchId,
          canGrade: assignment.canGrade,
          canAnswerQuestions: assignment.canAnswerQuestions,
          canApproveCompletion: assignment.canApproveCompletion,
        };
      }),
    );

    return {
      assignments: courseAssignments,
      items: [...submissionItems, ...questionItems, ...completionItems]
        .filter((item) => item !== null)
        .sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});

export const listMyFeedbackReports = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireFacultyIdentity(ctx);
    const assignments = await ctx.db
      .query("lmsFacultyAssignments")
      .withIndex("by_facultyTokenIdentifier", (q) =>
        q.eq("facultyTokenIdentifier", identity.tokenIdentifier),
      )
      .take(100);
    const scopedResponses = await Promise.all(
      assignments.slice(0, 10).map(async (assignment) => {
        return assignment.batchId
          ? await ctx.db
              .query("lmsFeedbackResponses")
              .withIndex("by_courseId_and_batchId", (q) =>
                q
                  .eq("courseId", assignment.courseId)
                  .eq("batchId", assignment.batchId),
              )
              .order("desc")
              .take(500)
          : await ctx.db
              .query("lmsFeedbackResponses")
              .withIndex("by_courseId", (q) =>
                q.eq("courseId", assignment.courseId),
              )
              .order("desc")
              .take(500);
      }),
    );
    const responses = Array.from(
      new Map(
        scopedResponses
          .flat()
          .map((response) => [response._id, response] as const),
      ).values(),
    );
    const byActivity = new Map<string, typeof responses>();
    for (const response of responses) {
      const group = byActivity.get(response.activityId) ?? [];
      group.push(response);
      byActivity.set(response.activityId, group);
    }
    const reports = await Promise.all(
      Array.from(byActivity.values()).map(async (group) => {
        const first = group[0];
        const [activity, course] = await Promise.all([
          ctx.db.get("lmsActivities", first.activityId),
          ctx.db.get("courses", first.courseId),
        ]);
        if (!activity || activity.type !== "feedback") return null;
        const minimumGroupSize =
          activity.feedbackMode === "anonymous"
            ? (activity.feedbackMinimumGroupSize ?? 5)
            : 1;
        const released =
          activity.feedbackMode !== "anonymous" ||
          group.length >= minimumGroupSize;
        const summary = summarizeLmsFeedback(
          group.map((response) => response.rating),
        );
        return {
          activityId: activity._id,
          activityTitle: activity.title,
          courseName: course?.name ?? "Course",
          mode: activity.feedbackMode ?? ("identified" as const),
          minimumGroupSize,
          responseCount: summary.responseCount,
          released,
          averageRating: released ? summary.averageRating : null,
          comments: released
            ? group
                .map((response) => response.comment)
                .filter((comment): comment is string => Boolean(comment))
                .slice(0, 20)
            : [],
        };
      }),
    );
    return reports.filter((report) => report !== null);
  },
});

export const claimSubmission = mutation({
  args: { submissionId: v.id("lmsSubmissions") },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const submission = await ctx.db.get("lmsSubmissions", args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const enrollment = await ctx.db.get("enrollments", submission.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canGrade");
    if (
      submission.status !== "submitted" &&
      submission.status !== "in_review"
    ) {
      throw new Error("This submission is no longer available for review");
    }
    if (
      submission.claimedByTokenIdentifier &&
      submission.claimedByTokenIdentifier !== identity.tokenIdentifier
    ) {
      throw new Error(
        "Another Faculty reviewer is already working on this submission",
      );
    }
    if (submission.claimedByTokenIdentifier === identity.tokenIdentifier) {
      return { status: "in_review" as const, alreadyClaimed: true };
    }
    const now = Date.now();
    await ctx.db.patch("lmsSubmissions", submission._id, {
      status: "in_review",
      claimedAt: now,
      claimedByTokenIdentifier: identity.tokenIdentifier,
      updatedAt: now,
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: "lms.submission.claimed",
      entityType: "lmsSubmission",
      entityId: submission._id,
      before: { status: submission.status },
      after: { status: "in_review" },
      metadata: {
        enrollmentId: submission.enrollmentId,
        activityId: submission.activityId,
      },
      createdAt: now,
    });
    return { status: "in_review" as const, alreadyClaimed: false };
  },
});

export const reviewSubmission = mutation({
  args: {
    submissionId: v.id("lmsSubmissions"),
    decision: v.union(v.literal("accepted"), v.literal("returned")),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const submission = await ctx.db.get("lmsSubmissions", args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const enrollment = await ctx.db.get("enrollments", submission.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canGrade");
    if (submission.status === "submitted") {
      throw new Error("Claim this submission before recording a decision");
    }
    if (submission.status !== "in_review") {
      throw new Error("This submission has already been reviewed");
    }
    if (submission.claimedByTokenIdentifier !== identity.tokenIdentifier) {
      throw new Error("Claim this submission before recording a decision");
    }
    const feedback = args.feedback.trim();
    if (args.decision === "returned" && feedback.length < 10) {
      throw new Error(
        "Returned work needs clear feedback of at least 10 characters",
      );
    }
    const now = Date.now();
    await ctx.db.patch("lmsSubmissions", submission._id, {
      status: args.decision,
      feedback: feedback || undefined,
      reviewedAt: now,
      claimedAt: undefined,
      claimedByTokenIdentifier: undefined,
      reviewedByTokenIdentifier: identity.tokenIdentifier,
      updatedAt: now,
    });
    const progress = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", submission.enrollmentId)
          .eq("activityId", submission.activityId),
      )
      .unique();
    if (progress) {
      await ctx.db.patch("lmsActivityProgress", progress._id, {
        status: args.decision === "accepted" ? "completed" : "in_progress",
        completedAt: args.decision === "accepted" ? now : undefined,
        updatedAt: now,
      });
    }
    if (args.decision === "accepted") {
      await maybeCreateCompletionRequest(ctx, submission.enrollmentId);
    }
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: `lms.submission.${args.decision}`,
      entityType: "lmsSubmission",
      entityId: submission._id,
      before: { status: submission.status },
      after: { status: args.decision },
      metadata: {
        enrollmentId: submission.enrollmentId,
        activityId: submission.activityId,
      },
      createdAt: now,
    });
    await ctx.db.insert("lmsNotifications", {
      recipientUserId: enrollment.userId,
      enrollmentId: enrollment._id,
      kind:
        args.decision === "accepted"
          ? "submission_accepted"
          : "submission_returned",
      title:
        args.decision === "accepted"
          ? "Submission accepted"
          : "Submission returned for revision",
      body:
        feedback ||
        (args.decision === "accepted"
          ? "Faculty accepted your learning evidence."
          : "Open the activity to review Faculty feedback."),
      href: `/lms?enrollment=${enrollment._id}&activity=${submission.activityId}#lms-active-work`,
      createdAt: now,
    });
    return { status: args.decision };
  },
});

export const answerQuestion = mutation({
  args: { questionId: v.id("lmsQuestions"), answer: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const question = await ctx.db.get("lmsQuestions", args.questionId);
    if (!question) throw new Error("Question not found");
    const enrollment = await ctx.db.get("enrollments", question.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canAnswerQuestions");
    if (question.status !== "open")
      throw new Error("This Question is already closed");
    const answer = args.answer.trim();
    if (!answer) throw new Error("An answer is required");
    const now = Date.now();
    await ctx.db.patch("lmsQuestions", question._id, {
      officialAnswer: answer,
      answeredByTokenIdentifier: identity.tokenIdentifier,
      status: "answered",
      answeredAt: now,
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: "lms.question.answered",
      entityType: "lmsQuestion",
      entityId: question._id,
      before: { status: question.status },
      after: { status: "answered" },
      metadata: {
        enrollmentId: question.enrollmentId,
        activityId: question.activityId,
      },
      createdAt: now,
    });
    await ctx.db.insert("lmsNotifications", {
      recipientUserId: enrollment.userId,
      enrollmentId: enrollment._id,
      kind: "question_answered",
      title: "Faculty answered your Question",
      body: answer,
      href: "/lms#lms-questions",
      createdAt: now,
    });
    return { status: "answered" as const };
  },
});

export const moderateQuestion = mutation({
  args: {
    questionId: v.id("lmsQuestions"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const question = await ctx.db.get("lmsQuestions", args.questionId);
    if (!question) throw new Error("Question not found");
    const enrollment = await ctx.db.get("enrollments", question.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canAnswerQuestions");
    if (question.status !== "open") {
      throw new Error("Only an open Question can be moderated");
    }
    const reason = args.reason.trim();
    if (reason.length < 10 || reason.length > 500) {
      throw new Error(
        "A moderation reason between 10 and 500 characters is required",
      );
    }
    const now = Date.now();
    await ctx.db.patch("lmsQuestions", question._id, {
      status: "closed",
      moderatedByTokenIdentifier: identity.tokenIdentifier,
      moderationReason: reason,
      moderatedAt: now,
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: "lms.question.moderated",
      entityType: "lmsQuestion",
      entityId: question._id,
      before: { status: question.status },
      after: { status: "closed", reason },
      createdAt: now,
    });
    return { status: "closed" as const };
  },
});

export const approveCompletion = mutation({
  args: { requestId: v.id("lmsCompletionRequests") },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const request = await ctx.db.get("lmsCompletionRequests", args.requestId);
    if (!request) throw new Error("Completion request not found");
    if (request.status === "approved" && request.certificateId) {
      return {
        status: "approved" as const,
        certificateId: request.certificateId,
      };
    }
    if (request.status !== "pending" && request.status !== "under_review")
      throw new Error("Completion has already been reviewed");
    if (!request.confirmedRecipientName) {
      throw new Error("The Student must confirm the Certificate name first");
    }
    const enrollment = await ctx.db.get("enrollments", request.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canApproveCompletion");
    const activities = await ctx.db
      .query("lmsActivities")
      .withIndex("by_curriculumId", (q) =>
        q.eq("curriculumId", request.curriculumId),
      )
      .take(500);
    const requiredIds = new Set(
      activities.filter((item) => item.required).map((item) => item._id),
    );
    const progress = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", request.enrollmentId),
      )
      .take(500);
    for (const item of progress)
      if (item.status === "completed") requiredIds.delete(item.activityId);
    if (requiredIds.size > 0)
      throw new Error("Required learning evidence is no longer complete");
    const existingCertificates = await ctx.db
      .query("lmsCertificates")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", request.enrollmentId),
      )
      .order("desc")
      .take(20);
    const activeCertificate = existingCertificates.find(
      (item) => item.status === "issued",
    );
    const now = Date.now();
    let certificateId = activeCertificate?._id;
    const suspendedCertificate = request.certificateId
      ? await ctx.db.get("lmsCertificates", request.certificateId)
      : null;
    if (suspendedCertificate?.status === "suspended") {
      if (
        suspendedCertificate.recipientName === request.confirmedRecipientName
      ) {
        await ctx.db.patch("lmsCertificates", suspendedCertificate._id, {
          status: "issued",
          suspendedAt: undefined,
          suspensionReason: undefined,
        });
        certificateId = suspendedCertificate._id;
      } else {
        await ctx.db.patch("lmsCertificates", suspendedCertificate._id, {
          status: "revoked",
          revokedAt: now,
          revocationReason: "Replaced after an approved name correction",
        });
      }
    }
    if (!certificateId) {
      const course = await ctx.db.get("courses", enrollment.courseId);
      certificateId = await ctx.db.insert("lmsCertificates", {
        enrollmentId: enrollment._id,
        curriculumId: request.curriculumId,
        verificationCode:
          `${enrollment.enrollmentNumber}-${now.toString(36)}`.toUpperCase(),
        recipientName: request.confirmedRecipientName,
        courseName: course?.name ?? enrollment.courseName ?? "Course",
        status: "issued",
        issuedAt: now,
        publicVerificationEnabled: false,
        replacesCertificateId:
          suspendedCertificate?.status === "suspended"
            ? suspendedCertificate._id
            : undefined,
      });
    }
    await ctx.db.patch("lmsCompletionRequests", request._id, {
      status: "approved",
      reviewedAt: now,
      reviewedByTokenIdentifier: identity.tokenIdentifier,
      certificateId,
    });
    const assignment = await ctx.db
      .query("lmsEnrollmentCurricula")
      .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollment._id))
      .unique();
    if (assignment)
      await ctx.db.patch("lmsEnrollmentCurricula", assignment._id, {
        status: "completed",
        completedAt: now,
      });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: "lms.completion.approved",
      entityType: "lmsCompletionRequest",
      entityId: request._id,
      before: { status: request.status },
      after: { status: "approved", certificateId },
      metadata: {
        enrollmentId: enrollment._id,
        curriculumId: request.curriculumId,
      },
      createdAt: now,
    });
    await ctx.db.insert("lmsNotifications", {
      recipientUserId: enrollment.userId,
      enrollmentId: enrollment._id,
      kind: "completion_approved",
      title: "Your Certificate is ready",
      body: "Faculty approved your Completion after revalidating the required evidence.",
      href: "/lms#lms-certificate",
      createdAt: now,
    });
    return { status: "approved" as const, certificateId };
  },
});

export const updateCompletionReview = mutation({
  args: {
    requestId: v.id("lmsCompletionRequests"),
    status: v.union(
      v.literal("correction_required"),
      v.literal("under_review"),
      v.literal("revoked"),
    ),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireFacultyIdentity(ctx);
    const request = await ctx.db.get("lmsCompletionRequests", args.requestId);
    if (!request) throw new Error("Completion request not found");
    const enrollment = await ctx.db.get("enrollments", request.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await getFacultyAssignment(ctx, enrollment, "canApproveCompletion");
    if (request.status === "revoked") {
      throw new Error("This Completion is already revoked");
    }
    const reason = args.reason.trim();
    if (reason.length < 10 || reason.length > 500) {
      throw new Error("A reason between 10 and 500 characters is required");
    }
    if (args.status === "revoked" && !request.certificateId) {
      throw new Error("A Certificate must exist before it can be revoked");
    }
    const now = Date.now();
    await ctx.db.patch("lmsCompletionRequests", request._id, {
      status: args.status,
      correctionReason: reason,
      reviewedAt: now,
      reviewedByTokenIdentifier: identity.tokenIdentifier,
    });
    if (request.certificateId) {
      await ctx.db.patch("lmsCertificates", request.certificateId, {
        status: args.status === "revoked" ? "revoked" : "suspended",
        suspendedAt: args.status === "revoked" ? undefined : now,
        suspensionReason: args.status === "revoked" ? undefined : reason,
        revokedAt: args.status === "revoked" ? now : undefined,
        revocationReason: args.status === "revoked" ? reason : undefined,
      });
    }
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: `lms.completion.${args.status}`,
      entityType: "lmsCompletionRequest",
      entityId: request._id,
      before: { status: request.status },
      after: { status: args.status, reason },
      createdAt: now,
    });
    await ctx.db.insert("lmsNotifications", {
      recipientUserId: enrollment.userId,
      enrollmentId: enrollment._id,
      kind:
        args.status === "correction_required"
          ? "completion_correction"
          : "completion_review",
      title:
        args.status === "correction_required"
          ? "Certificate correction needed"
          : args.status === "revoked"
            ? "Certificate revoked"
            : "Completion placed under review",
      body: reason,
      href: "/lms#lms-certificate",
      createdAt: now,
    });
    return { status: args.status };
  },
});
