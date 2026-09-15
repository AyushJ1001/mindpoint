import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { LmsActivityType, LmsCompletionMode, LmsReleaseMode } from "./schema";
import { maybeCreateCompletionRequest } from "./lmsCompletion";
import { scoreLmsQuiz } from "./_shared/lmsQuiz";

type ViewerCtx = QueryCtx | MutationCtx;

async function requireViewer(ctx: ViewerCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: sign in required");
  }
  return identity;
}

async function requireOwnedEnrollment(
  ctx: ViewerCtx,
  enrollmentId: Id<"enrollments">,
) {
  const identity = await requireViewer(ctx);
  const enrollment = await ctx.db.get("enrollments", enrollmentId);
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }
  if (
    enrollment.userId !== identity.subject &&
    enrollment.userId !== identity.tokenIdentifier
  ) {
    throw new Error("Forbidden: Enrollment access required");
  }
  if (enrollment.status && enrollment.status !== "active") {
    throw new Error("Enrollment is not active");
  }
  return { enrollment, identity };
}

async function requireEnrollmentCurriculum(
  ctx: ViewerCtx,
  enrollmentId: Id<"enrollments">,
) {
  const { enrollment, identity } = await requireOwnedEnrollment(
    ctx,
    enrollmentId,
  );
  const assignment = await ctx.db
    .query("lmsEnrollmentCurricula")
    .withIndex("by_enrollmentId", (q) => q.eq("enrollmentId", enrollmentId))
    .unique();
  if (!assignment || assignment.status === "suspended") {
    throw new Error("LMS access has not been activated for this Enrollment");
  }
  const curriculum = await ctx.db.get("lmsCurricula", assignment.curriculumId);
  if (!curriculum || curriculum.status !== "published") {
    throw new Error("Published Curriculum not found");
  }
  return { assignment, curriculum, enrollment, identity };
}

function validateHttpsUrl(value?: string) {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("External resources must use HTTPS");
  }
  return url.href;
}

export const createDraftCurriculum = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const course = await ctx.db.get("courses", args.courseId);
    if (!course) throw new Error("Course not found");

    const existing = await ctx.db
      .query("lmsCurricula")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(100);
    const version =
      existing.reduce((highest, item) => Math.max(highest, item.version), 0) +
      1;
    const now = Date.now();
    const curriculumId = await ctx.db.insert("lmsCurricula", {
      courseId: args.courseId,
      version,
      title: args.title.trim() || `${course.name} Curriculum`,
      status: "draft",
      createdByAdminId: admin.userId,
      createdAt: now,
      updatedAt: now,
    });
    return { curriculumId, version };
  },
});

export const addModule = mutation({
  args: {
    curriculumId: v.id("lmsCurricula"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const curriculum = await ctx.db.get("lmsCurricula", args.curriculumId);
    if (!curriculum || curriculum.status !== "draft") {
      throw new Error("Only a Draft Curriculum can be edited");
    }
    const modules = await ctx.db
      .query("lmsModules")
      .withIndex("by_curriculumId_and_sortOrder", (q) =>
        q.eq("curriculumId", args.curriculumId),
      )
      .order("desc")
      .take(1);
    const now = Date.now();
    const moduleId = await ctx.db.insert("lmsModules", {
      curriculumId: args.curriculumId,
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      sortOrder: (modules[0]?.sortOrder ?? -1) + 1,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch("lmsCurricula", args.curriculumId, { updatedAt: now });
    return { moduleId };
  },
});

export const addActivity = mutation({
  args: {
    moduleId: v.id("lmsModules"),
    type: LmsActivityType,
    title: v.string(),
    instructions: v.optional(v.string()),
    content: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    required: v.boolean(),
    releaseMode: LmsReleaseMode,
    releaseAt: v.optional(v.number()),
    prerequisiteActivityId: v.optional(v.id("lmsActivities")),
    completionMode: LmsCompletionMode,
    passingScore: v.optional(v.number()),
    rightsApproved: v.boolean(),
    accessibleAlternative: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const module = await ctx.db.get("lmsModules", args.moduleId);
    if (!module) throw new Error("Module not found");
    const curriculum = await ctx.db.get("lmsCurricula", module.curriculumId);
    if (!curriculum || curriculum.status !== "draft") {
      throw new Error("Only a Draft Curriculum can be edited");
    }
    if (!args.title.trim()) throw new Error("Activity title is required");
    if (args.releaseMode === "date" && !args.releaseAt) {
      throw new Error("A date-based release needs a release date");
    }
    if (args.releaseMode === "prerequisite" && !args.prerequisiteActivityId) {
      throw new Error("A prerequisite release needs an activity");
    }
    if (args.completionMode === "pass" && args.passingScore === undefined) {
      throw new Error("A passing-score activity needs a passing score");
    }
    if (
      args.type === "quiz" &&
      (args.completionMode !== "pass" ||
        args.passingScore === undefined ||
        args.passingScore < 0 ||
        args.passingScore > 100)
    ) {
      throw new Error("A Quiz needs a passing score between 0 and 100");
    }

    const existing = await ctx.db
      .query("lmsActivities")
      .withIndex("by_moduleId_and_sortOrder", (q) =>
        q.eq("moduleId", args.moduleId),
      )
      .order("desc")
      .take(1);
    const now = Date.now();
    const activityId = await ctx.db.insert("lmsActivities", {
      curriculumId: module.curriculumId,
      moduleId: args.moduleId,
      type: args.type,
      title: args.title.trim(),
      instructions: args.instructions?.trim() || undefined,
      content: args.content?.trim() || undefined,
      externalUrl: validateHttpsUrl(args.externalUrl),
      durationMinutes: args.durationMinutes,
      required: args.required,
      sortOrder: (existing[0]?.sortOrder ?? -1) + 1,
      releaseMode: args.releaseMode,
      releaseAt: args.releaseAt,
      prerequisiteActivityId: args.prerequisiteActivityId,
      completionMode: args.completionMode,
      passingScore: args.passingScore,
      rightsApproved: args.rightsApproved,
      accessibleAlternative: args.accessibleAlternative?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch("lmsCurricula", module.curriculumId, { updatedAt: now });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "lms.activity.created",
      entityType: "lmsActivity",
      entityId: activityId,
      after: { type: args.type, rightsApproved: args.rightsApproved },
      createdAt: now,
    });
    return { activityId };
  },
});

export const addQuizQuestion = mutation({
  args: {
    activityId: v.id("lmsActivities"),
    prompt: v.string(),
    options: v.array(
      v.object({
        label: v.string(),
        isCorrect: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const activity = await ctx.db.get("lmsActivities", args.activityId);
    if (!activity || activity.type !== "quiz") {
      throw new Error("Quiz activity not found");
    }
    const curriculum = await ctx.db.get("lmsCurricula", activity.curriculumId);
    if (!curriculum || curriculum.status !== "draft") {
      throw new Error("Quiz questions can only be added to a Draft Curriculum");
    }
    const prompt = args.prompt.trim();
    const options = args.options.map((option) => ({
      label: option.label.trim(),
      isCorrect: option.isCorrect,
    }));
    if (!prompt) throw new Error("Question text is required");
    if (options.length < 2 || options.length > 6) {
      throw new Error("A Quiz question needs between 2 and 6 options");
    }
    if (options.some((option) => !option.label)) {
      throw new Error("Every Quiz option needs text");
    }
    if (
      new Set(options.map((option) => option.label.toLowerCase())).size !==
      options.length
    ) {
      throw new Error("Quiz options must be unique");
    }
    if (options.filter((option) => option.isCorrect).length !== 1) {
      throw new Error("Choose exactly one correct answer");
    }
    const existing = await ctx.db
      .query("lmsQuizQuestions")
      .withIndex("by_activityId_and_sortOrder", (q) =>
        q.eq("activityId", args.activityId),
      )
      .order("desc")
      .take(1);
    const now = Date.now();
    const questionId = await ctx.db.insert("lmsQuizQuestions", {
      activityId: args.activityId,
      prompt,
      sortOrder: (existing[0]?.sortOrder ?? -1) + 1,
      createdAt: now,
      updatedAt: now,
    });
    for (let index = 0; index < options.length; index += 1) {
      await ctx.db.insert("lmsQuizOptions", {
        questionId,
        label: options[index].label,
        sortOrder: index,
        isCorrect: options[index].isCorrect,
        createdAt: now,
      });
    }
    await ctx.db.patch("lmsCurricula", curriculum._id, { updatedAt: now });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "lms.quiz_question.created",
      entityType: "lmsQuizQuestion",
      entityId: questionId,
      after: { activityId: activity._id, optionCount: options.length },
      createdAt: now,
    });
    return { questionId };
  },
});

export const getAdminCurriculum = query({
  args: { curriculumId: v.id("lmsCurricula") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const curriculum = await ctx.db.get("lmsCurricula", args.curriculumId);
    if (!curriculum) return null;
    const modules = await ctx.db
      .query("lmsModules")
      .withIndex("by_curriculumId_and_sortOrder", (q) =>
        q.eq("curriculumId", args.curriculumId),
      )
      .take(100);
    const activities = await ctx.db
      .query("lmsActivities")
      .withIndex("by_curriculumId", (q) =>
        q.eq("curriculumId", args.curriculumId),
      )
      .take(500);
    const quizQuestions = (
      await Promise.all(
        activities
          .filter((activity) => activity.type === "quiz")
          .map(async (activity) => {
            const questions = await ctx.db
              .query("lmsQuizQuestions")
              .withIndex("by_activityId_and_sortOrder", (q) =>
                q.eq("activityId", activity._id),
              )
              .take(100);
            return await Promise.all(
              questions.map(async (question) => ({
                ...question,
                options: await ctx.db
                  .query("lmsQuizOptions")
                  .withIndex("by_questionId_and_sortOrder", (q) =>
                    q.eq("questionId", question._id),
                  )
                  .take(6),
              })),
            );
          }),
      )
    ).flat();
    return { curriculum, modules, activities, quizQuestions };
  },
});

export const publishCurriculum = mutation({
  args: { curriculumId: v.id("lmsCurricula") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const curriculum = await ctx.db.get("lmsCurricula", args.curriculumId);
    if (!curriculum || curriculum.status !== "draft") {
      throw new Error("Draft Curriculum not found");
    }
    const modules = await ctx.db
      .query("lmsModules")
      .withIndex("by_curriculumId_and_sortOrder", (q) =>
        q.eq("curriculumId", args.curriculumId),
      )
      .take(100);
    const activities = await ctx.db
      .query("lmsActivities")
      .withIndex("by_curriculumId", (q) =>
        q.eq("curriculumId", args.curriculumId),
      )
      .take(500);
    if (modules.length === 0 || activities.length === 0) {
      throw new Error("A Curriculum needs at least one Module and activity");
    }
    const moduleIds = new Set(modules.map((item) => item._id));
    if (activities.some((item) => !moduleIds.has(item.moduleId))) {
      throw new Error("Every activity must belong to this Curriculum");
    }
    if (
      activities.some(
        (item) =>
          (item.type === "media" || item.type === "external_resource") &&
          !item.rightsApproved,
      )
    ) {
      throw new Error("Media and External resources need Rights approval");
    }
    if (
      activities.some(
        (item) => item.type === "media" && !item.accessibleAlternative,
      )
    ) {
      throw new Error("Media activities need an accessible alternative");
    }
    for (const quiz of activities.filter((item) => item.type === "quiz")) {
      if (
        quiz.completionMode !== "pass" ||
        quiz.passingScore === undefined ||
        quiz.passingScore < 0 ||
        quiz.passingScore > 100
      ) {
        throw new Error("Every Quiz needs a passing score between 0 and 100");
      }
      const questions = await ctx.db
        .query("lmsQuizQuestions")
        .withIndex("by_activityId_and_sortOrder", (q) =>
          q.eq("activityId", quiz._id),
        )
        .take(100);
      if (questions.length === 0) {
        throw new Error(`Quiz “${quiz.title}” needs at least one question`);
      }
      for (const question of questions) {
        const options = await ctx.db
          .query("lmsQuizOptions")
          .withIndex("by_questionId_and_sortOrder", (q) =>
            q.eq("questionId", question._id),
          )
          .take(6);
        if (
          options.length < 2 ||
          options.filter((option) => option.isCorrect).length !== 1
        ) {
          throw new Error(`Quiz question “${question.prompt}” is incomplete`);
        }
      }
    }

    const now = Date.now();
    await ctx.db.patch("lmsCurricula", args.curriculumId, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "lms.curriculum.published",
      entityType: "lmsCurriculum",
      entityId: args.curriculumId,
      after: { version: curriculum.version, publishedAt: now },
      createdAt: now,
    });
    return { publishedAt: now };
  },
});

export const activateEnrollment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    curriculumId: v.id("lmsCurricula"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const enrollment = await ctx.db.get("enrollments", args.enrollmentId);
    const curriculum = await ctx.db.get("lmsCurricula", args.curriculumId);
    if (!enrollment || !curriculum)
      throw new Error("Enrollment or Curriculum not found");
    if (curriculum.status !== "published") {
      throw new Error("Only a Published Curriculum can be activated");
    }
    if (enrollment.courseId !== curriculum.courseId) {
      throw new Error(
        "Enrollment and Curriculum must belong to the same Course",
      );
    }
    const existing = await ctx.db
      .query("lmsEnrollmentCurricula")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", args.enrollmentId),
      )
      .unique();
    if (existing) {
      if (existing.curriculumId !== args.curriculumId) {
        throw new Error(
          "Enrollment is already pinned to another Curriculum version",
        );
      }
      return { assignmentId: existing._id, alreadyActive: true };
    }
    const now = Date.now();
    const assignmentId = await ctx.db.insert("lmsEnrollmentCurricula", {
      enrollmentId: args.enrollmentId,
      curriculumId: args.curriculumId,
      status: "active",
      activatedAt: now,
      activatedByAdminId: admin.userId,
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "lms.enrollment.activated",
      entityType: "lmsEnrollmentCurriculum",
      entityId: assignmentId,
      after: {
        enrollmentId: args.enrollmentId,
        curriculumId: args.curriculumId,
      },
      createdAt: now,
    });
    return { assignmentId, alreadyActive: false };
  },
});

export const listMyLmsEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireViewer(ctx);
    const subjectEnrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100);
    const tokenEnrollments =
      identity.tokenIdentifier === identity.subject
        ? []
        : await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) =>
              q.eq("userId", identity.tokenIdentifier),
            )
            .order("desc")
            .take(100);
    const enrollments = Array.from(
      new Map(
        [...subjectEnrollments, ...tokenEnrollments].map((enrollment) => [
          enrollment._id,
          enrollment,
        ]),
      ).values(),
    ).filter(
      (enrollment) => !enrollment.status || enrollment.status === "active",
    );

    return await Promise.all(
      enrollments.map(async (enrollment) => {
        const [course, assignment] = await Promise.all([
          ctx.db.get("courses", enrollment.courseId),
          ctx.db
            .query("lmsEnrollmentCurricula")
            .withIndex("by_enrollmentId", (q) =>
              q.eq("enrollmentId", enrollment._id),
            )
            .unique(),
        ]);
        const curriculum = assignment
          ? await ctx.db.get("lmsCurricula", assignment.curriculumId)
          : null;

        return {
          enrollmentId: enrollment._id,
          enrollmentNumber: enrollment.enrollmentNumber,
          courseId: enrollment.courseId,
          courseName: course?.name ?? enrollment.courseName ?? "Your Course",
          courseCode: course?.code,
          batchLabel: enrollment.batchLabel,
          curriculumTitle: curriculum?.title,
          curriculumVersion: curriculum?.version,
          lmsStatus:
            assignment && curriculum?.status === "published"
              ? assignment.status
              : ("awaiting_activation" as const),
        };
      }),
    );
  },
});

async function getActivityAvailability(
  ctx: ViewerCtx,
  enrollmentId: Id<"enrollments">,
  activity: Doc<"lmsActivities">,
  completedActivityIds?: ReadonlySet<Id<"lmsActivities">>,
) {
  if (
    activity.releaseMode === "date" &&
    (activity.releaseAt ?? 0) > Date.now()
  ) {
    return {
      isAvailable: false,
      lockReason: `Available ${new Date(activity.releaseAt!).toISOString()}`,
    };
  }
  if (activity.releaseMode === "prerequisite") {
    if (!activity.prerequisiteActivityId) {
      return { isAvailable: false, lockReason: "Release is being configured" };
    }
    const prerequisiteComplete = completedActivityIds
      ? completedActivityIds.has(activity.prerequisiteActivityId)
      : (
          await ctx.db
            .query("lmsActivityProgress")
            .withIndex("by_enrollmentId_and_activityId", (q) =>
              q
                .eq("enrollmentId", enrollmentId)
                .eq("activityId", activity.prerequisiteActivityId!),
            )
            .unique()
        )?.status === "completed";
    if (!prerequisiteComplete) {
      return {
        isAvailable: false,
        lockReason: "Complete the previous required activity first",
      };
    }
  }
  return { isAvailable: true, lockReason: undefined };
}

export const getMyWorkspace = query({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    const { enrollment } = await requireOwnedEnrollment(ctx, args.enrollmentId);
    const assignment = await ctx.db
      .query("lmsEnrollmentCurricula")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", args.enrollmentId),
      )
      .unique();
    if (!assignment || assignment.status === "suspended") return null;
    const curriculum = await ctx.db.get(
      "lmsCurricula",
      assignment.curriculumId,
    );
    if (!curriculum || curriculum.status !== "published") return null;
    const course = await ctx.db.get("courses", enrollment.courseId);
    const modules = await ctx.db
      .query("lmsModules")
      .withIndex("by_curriculumId_and_sortOrder", (q) =>
        q.eq("curriculumId", curriculum._id),
      )
      .take(100);
    const activities = await ctx.db
      .query("lmsActivities")
      .withIndex("by_curriculumId", (q) => q.eq("curriculumId", curriculum._id))
      .take(500);
    const progress = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", args.enrollmentId),
      )
      .take(500);
    const completedActivityIds = new Set(
      progress
        .filter((item) => item.status === "completed")
        .map((item) => item.activityId),
    );
    const safeActivities = await Promise.all(
      activities.map(async (activity) => {
        const availability = await getActivityAvailability(
          ctx,
          args.enrollmentId,
          activity,
          completedActivityIds,
        );
        const quiz =
          availability.isAvailable && activity.type === "quiz"
            ? await (async () => {
                const questions = await ctx.db
                  .query("lmsQuizQuestions")
                  .withIndex("by_activityId_and_sortOrder", (q) =>
                    q.eq("activityId", activity._id),
                  )
                  .take(100);
                const attempts = await ctx.db
                  .query("lmsQuizAttempts")
                  .withIndex("by_enrollmentId_and_activityId", (q) =>
                    q
                      .eq("enrollmentId", args.enrollmentId)
                      .eq("activityId", activity._id),
                  )
                  .order("desc")
                  .take(1);
                return {
                  questions: await Promise.all(
                    questions.map(async (question) => ({
                      questionId: question._id,
                      prompt: question.prompt,
                      sortOrder: question.sortOrder,
                      options: (
                        await ctx.db
                          .query("lmsQuizOptions")
                          .withIndex("by_questionId_and_sortOrder", (q) =>
                            q.eq("questionId", question._id),
                          )
                          .take(6)
                      ).map((option) => ({
                        optionId: option._id,
                        label: option.label,
                        sortOrder: option.sortOrder,
                      })),
                    })),
                  ),
                  latestAttempt: attempts[0]
                    ? {
                        attemptNumber: attempts[0].attemptNumber,
                        score: attempts[0].score,
                        passed: attempts[0].passed,
                        submittedAt: attempts[0].submittedAt,
                      }
                    : undefined,
                };
              })()
            : undefined;
        return {
          activityId: activity._id,
          moduleId: activity.moduleId,
          type: activity.type,
          title: activity.title,
          durationMinutes: activity.durationMinutes,
          required: activity.required,
          sortOrder: activity.sortOrder,
          completionMode: activity.completionMode,
          passingScore: activity.passingScore,
          releaseAt: activity.releaseAt,
          ...availability,
          instructions: availability.isAvailable
            ? activity.instructions
            : undefined,
          content: availability.isAvailable ? activity.content : undefined,
          externalUrl: availability.isAvailable
            ? activity.externalUrl
            : undefined,
          accessibleAlternative: availability.isAvailable
            ? activity.accessibleAlternative
            : undefined,
          quiz,
        };
      }),
    );

    return {
      enrollment: {
        enrollmentId: enrollment._id,
        enrollmentNumber: enrollment.enrollmentNumber,
        batchLabel: enrollment.batchLabel,
      },
      course: course
        ? {
            courseId: course._id,
            name: course.name,
            code: course.code,
            duration: course.duration,
          }
        : null,
      curriculum: {
        curriculumId: curriculum._id,
        title: curriculum.title,
        version: curriculum.version,
      },
      modules: modules.map((module) => ({
        moduleId: module._id,
        title: module.title,
        description: module.description,
        sortOrder: module.sortOrder,
      })),
      activities: safeActivities,
      progress: progress.map((item) => ({
        activityId: item.activityId,
        status: item.status,
        submittedAt: item.submittedAt,
        completedAt: item.completedAt,
        updatedAt: item.updatedAt,
      })),
    };
  },
});

async function assertActivityAvailable(
  ctx: ViewerCtx,
  enrollmentId: Id<"enrollments">,
  activity: Doc<"lmsActivities">,
) {
  const availability = await getActivityAvailability(
    ctx,
    enrollmentId,
    activity,
  );
  if (!availability.isAvailable) {
    throw new Error(
      availability.lockReason ?? "This activity is not available",
    );
  }
}

export const setSelfCompletion = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { curriculum } = await requireEnrollmentCurriculum(
      ctx,
      args.enrollmentId,
    );
    const activity = await ctx.db.get("lmsActivities", args.activityId);
    if (!activity || activity.curriculumId !== curriculum._id) {
      throw new Error("Activity not found in this Curriculum");
    }
    if (
      activity.completionMode !== "view" &&
      activity.completionMode !== "self_confirm"
    ) {
      throw new Error("This activity requires submitted evidence or review");
    }
    await assertActivityAvailable(ctx, args.enrollmentId, activity);
    const existing = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", args.enrollmentId)
          .eq("activityId", args.activityId),
      )
      .unique();
    const now = Date.now();
    const patch = args.completed
      ? { status: "completed" as const, completedAt: now, updatedAt: now }
      : {
          status: "in_progress" as const,
          completedAt: undefined,
          updatedAt: now,
        };
    if (existing)
      await ctx.db.patch("lmsActivityProgress", existing._id, patch);
    else {
      await ctx.db.insert("lmsActivityProgress", {
        enrollmentId: args.enrollmentId,
        activityId: args.activityId,
        startedAt: now,
        ...patch,
      });
    }
    if (args.completed)
      await maybeCreateCompletionRequest(ctx, args.enrollmentId);
    return { status: patch.status };
  },
});

export const submitQuizAttempt = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    answers: v.array(
      v.object({
        questionId: v.id("lmsQuizQuestions"),
        optionId: v.id("lmsQuizOptions"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { curriculum, identity } = await requireEnrollmentCurriculum(
      ctx,
      args.enrollmentId,
    );
    const activity = await ctx.db.get("lmsActivities", args.activityId);
    if (
      !activity ||
      activity.curriculumId !== curriculum._id ||
      activity.type !== "quiz" ||
      activity.completionMode !== "pass"
    ) {
      throw new Error("Quiz activity not found in this Curriculum");
    }
    await assertActivityAvailable(ctx, args.enrollmentId, activity);
    const questions = await ctx.db
      .query("lmsQuizQuestions")
      .withIndex("by_activityId_and_sortOrder", (q) =>
        q.eq("activityId", activity._id),
      )
      .take(100);
    if (questions.length === 0) throw new Error("This Quiz is not ready");
    if (
      args.answers.length !== questions.length ||
      new Set(args.answers.map((answer) => answer.questionId)).size !==
        questions.length
    ) {
      throw new Error("Answer every Quiz question before submitting");
    }
    const answersByQuestion = new Map(
      args.answers.map((answer) => [answer.questionId, answer.optionId]),
    );
    const gradedAnswers = [];
    let correctAnswerCount = 0;
    for (const question of questions) {
      const selectedOptionId = answersByQuestion.get(question._id);
      if (!selectedOptionId) {
        throw new Error("Answer every Quiz question before submitting");
      }
      const option = await ctx.db.get("lmsQuizOptions", selectedOptionId);
      if (!option || option.questionId !== question._id) {
        throw new Error("A selected answer does not belong to this Quiz");
      }
      if (option.isCorrect) correctAnswerCount += 1;
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: option._id,
        isCorrect: option.isCorrect,
      });
    }
    const { score, passed } = scoreLmsQuiz(
      questions.length,
      correctAnswerCount,
      activity.passingScore ?? 100,
    );
    const previousAttempts = await ctx.db
      .query("lmsQuizAttempts")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", args.enrollmentId)
          .eq("activityId", args.activityId),
      )
      .order("desc")
      .take(20);
    const now = Date.now();
    const attemptNumber = (previousAttempts[0]?.attemptNumber ?? 0) + 1;
    const attemptId = await ctx.db.insert("lmsQuizAttempts", {
      enrollmentId: args.enrollmentId,
      activityId: args.activityId,
      attemptNumber,
      score,
      correctAnswerCount,
      questionCount: questions.length,
      passed,
      submittedAt: now,
    });
    for (const answer of gradedAnswers) {
      await ctx.db.insert("lmsQuizAnswers", {
        attemptId,
        ...answer,
        createdAt: now,
      });
    }
    const progress = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", args.enrollmentId)
          .eq("activityId", args.activityId),
      )
      .unique();
    const progressPatch = {
      status: passed ? ("completed" as const) : ("in_progress" as const),
      submittedAt: now,
      completedAt: passed ? now : undefined,
      evidenceReference: attemptId,
      updatedAt: now,
    };
    if (progress) {
      await ctx.db.patch("lmsActivityProgress", progress._id, progressPatch);
    } else {
      await ctx.db.insert("lmsActivityProgress", {
        enrollmentId: args.enrollmentId,
        activityId: args.activityId,
        startedAt: now,
        ...progressPatch,
      });
    }
    if (passed) await maybeCreateCompletionRequest(ctx, args.enrollmentId);
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: identity.tokenIdentifier,
      actorEmail: identity.email,
      action: "lms.quiz_attempt.submitted",
      entityType: "lmsQuizAttempt",
      entityId: attemptId,
      after: { score, passed, attemptNumber },
      metadata: {
        enrollmentId: args.enrollmentId,
        activityId: args.activityId,
      },
      createdAt: now,
    });
    return {
      attemptId,
      attemptNumber,
      score,
      passed,
    };
  },
});

export const submitAssignment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    responseText: v.string(),
  },
  handler: async (ctx, args) => {
    const { curriculum, enrollment } = await requireEnrollmentCurriculum(
      ctx,
      args.enrollmentId,
    );
    const activity = await ctx.db.get("lmsActivities", args.activityId);
    if (!activity || activity.curriculumId !== curriculum._id) {
      throw new Error("Activity not found in this Curriculum");
    }
    if (activity.type !== "assignment") {
      throw new Error("Only Assignment activities accept this submission");
    }
    await assertActivityAvailable(ctx, args.enrollmentId, activity);
    const responseText = args.responseText.trim();
    if (!responseText) throw new Error("A response is required");
    const attempts = await ctx.db
      .query("lmsSubmissions")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", args.enrollmentId)
          .eq("activityId", args.activityId),
      )
      .order("desc")
      .take(20);
    const now = Date.now();
    const submissionId = await ctx.db.insert("lmsSubmissions", {
      enrollmentId: args.enrollmentId,
      activityId: args.activityId,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      attemptNumber: (attempts[0]?.attemptNumber ?? 0) + 1,
      responseText,
      status: "submitted",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const progress = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", args.enrollmentId)
          .eq("activityId", args.activityId),
      )
      .unique();
    const progressPatch = {
      status: "awaiting_review" as const,
      submittedAt: now,
      updatedAt: now,
      evidenceReference: submissionId,
    };
    if (progress)
      await ctx.db.patch("lmsActivityProgress", progress._id, progressPatch);
    else {
      await ctx.db.insert("lmsActivityProgress", {
        enrollmentId: args.enrollmentId,
        activityId: args.activityId,
        startedAt: now,
        ...progressPatch,
      });
    }
    return { submissionId };
  },
});

export const askQuestion = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    activityId: v.optional(v.id("lmsActivities")),
    visibility: v.union(
      v.literal("private"),
      v.literal("course"),
      v.literal("batch"),
    ),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireOwnedEnrollment(ctx, args.enrollmentId);
    const { curriculum, enrollment } = await requireEnrollmentCurriculum(
      ctx,
      args.enrollmentId,
    );
    const body = args.body.trim();
    if (!body) throw new Error("Question text is required");
    if (args.activityId) {
      const activity = await ctx.db.get("lmsActivities", args.activityId);
      if (!activity || activity.curriculumId !== curriculum._id) {
        throw new Error("Activity not found in this Curriculum");
      }
    }
    const questionId = await ctx.db.insert("lmsQuestions", {
      enrollmentId: args.enrollmentId,
      curriculumId: curriculum._id,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      activityId: args.activityId,
      authorTokenIdentifier: identity.tokenIdentifier,
      visibility: args.visibility,
      body,
      status: "open",
      createdAt: Date.now(),
    });
    return { questionId };
  },
});
