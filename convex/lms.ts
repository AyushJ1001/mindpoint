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
  await requireOwnedEnrollment(ctx, enrollmentId);
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
  return { assignment, curriculum };
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
    await requireAdmin(ctx);
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
    return { activityId };
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
    return { curriculum, modules, activities };
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
    return { assignmentId, alreadyActive: false };
  },
});

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
    return { enrollment, course, curriculum, modules, activities, progress };
  },
});

async function assertActivityAvailable(
  ctx: ViewerCtx,
  enrollmentId: Id<"enrollments">,
  activity: Doc<"lmsActivities">,
) {
  if (
    activity.releaseMode === "date" &&
    (activity.releaseAt ?? 0) > Date.now()
  ) {
    throw new Error("This activity has not been released yet");
  }
  if (activity.releaseMode === "prerequisite") {
    if (!activity.prerequisiteActivityId) {
      throw new Error("Activity prerequisite is not configured");
    }
    const prerequisite = await ctx.db
      .query("lmsActivityProgress")
      .withIndex("by_enrollmentId_and_activityId", (q) =>
        q
          .eq("enrollmentId", enrollmentId)
          .eq("activityId", activity.prerequisiteActivityId!),
      )
      .unique();
    if (prerequisite?.status !== "completed") {
      throw new Error("Complete the prerequisite activity first");
    }
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
    return { status: patch.status };
  },
});

export const submitAssignment = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    activityId: v.id("lmsActivities"),
    responseText: v.string(),
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
    const { curriculum } = await requireEnrollmentCurriculum(
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
