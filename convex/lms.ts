import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import {
  getEnrollmentAccess,
  hasActiveEnrollment,
  resolveViewer,
  type Viewer,
} from "./_shared/viewer";

// ---------------------------------------------------------------------------
// LMS: authored lessons per course + per-learner completion tracking.
// Lesson content is only returned to enrolled learners (or admins), and that
// gate is enforced here, not just in the UI.
// ---------------------------------------------------------------------------

const lessonKind = v.union(
  v.literal("video"),
  v.literal("pdf"),
  v.literal("link"),
  v.literal("text"),
);

function makeVerificationCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  return `TMP-${time}${random}`;
}

function shapeCertificate(cert: Doc<"certificates">) {
  return {
    verificationCode: cert.verificationCode,
    userName: cert.userName,
    courseName: cert.courseName,
    enrollmentNumber: cert.enrollmentNumber ?? null,
    issuedAt: cert.issuedAt,
  };
}

const certificateValue = v.object({
  verificationCode: v.string(),
  userName: v.string(),
  courseName: v.string(),
  enrollmentNumber: v.union(v.string(), v.null()),
  issuedAt: v.number(),
});

// Issue a certificate once every published lesson for the course is complete.
// Idempotent: returns the existing certificate if one was already issued.
async function ensureCertificate(
  ctx: MutationCtx,
  viewer: Viewer,
  courseId: Doc<"courses">["_id"],
): Promise<Doc<"certificates"> | null> {
  const existing = await ctx.db
    .query("certificates")
    .withIndex("by_userId_and_courseId", (q) =>
      q.eq("userId", viewer.userId).eq("courseId", courseId),
    )
    .first();
  if (existing) return existing;

  const course = await ctx.db.get(courseId);
  if (!course) return null;

  const lessons = (
    await ctx.db
      .query("lessons")
      .withIndex("by_courseId_and_sortOrder", (q) =>
        q.eq("courseId", courseId),
      )
      .collect()
  ).filter((lesson) => lesson.isPublished);
  if (lessons.length === 0) return null;

  const progress = await ctx.db
    .query("lessonProgress")
    .withIndex("by_userId_and_courseId", (q) =>
      q.eq("userId", viewer.userId).eq("courseId", courseId),
    )
    .collect();
  const completedIds = new Set(
    progress.filter((row) => row.completed).map((row) => String(row.lessonId)),
  );
  if (!lessons.every((lesson) => completedIds.has(String(lesson._id)))) {
    return null;
  }

  // If the course has a published quiz with questions, it must also be passed.
  const quiz = await ctx.db
    .query("quizzes")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .first();
  if (quiz?.isPublished) {
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", quiz._id))
      .collect();
    if (questions.length > 0) {
      const attempts = await ctx.db
        .query("quizAttempts")
        .withIndex("by_userId_and_quizId", (q) =>
          q.eq("userId", viewer.userId).eq("quizId", quiz._id),
        )
        .collect();
      if (!attempts.some((attempt) => attempt.passed)) return null;
    }
  }

  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_userId_and_courseId", (q) =>
      q.eq("userId", viewer.userId).eq("courseId", courseId),
    )
    .first();

  const certificateId = await ctx.db.insert("certificates", {
    userId: viewer.userId,
    userName: viewer.name ?? viewer.email ?? "Learner",
    courseId,
    courseName: course.name,
    enrollmentNumber: enrollment?.enrollmentNumber,
    verificationCode: makeVerificationCode(),
    issuedAt: Date.now(),
  });

  const certificate = await ctx.db.get(certificateId);

  // Email the learner their certificate (non-blocking; failure is logged by
  // the action and never blocks issuance).
  if (certificate && viewer.email) {
    await ctx.scheduler.runAfter(
      0,
      internal.emailActions.sendCertificateIssuedEmail,
      {
        userEmail: viewer.email,
        userName: certificate.userName,
        courseName: certificate.courseName,
        verificationCode: certificate.verificationCode,
        courseId: String(courseId),
      },
    );
  }

  return certificate;
}

function shapeAdminLesson(lesson: Doc<"lessons">) {
  return {
    _id: lesson._id,
    courseId: lesson.courseId,
    moduleTitle: lesson.moduleTitle ?? null,
    title: lesson.title,
    description: lesson.description ?? null,
    kind: lesson.kind,
    contentUrl: lesson.contentUrl ?? null,
    textContent: lesson.textContent ?? null,
    durationMinutes: lesson.durationMinutes ?? null,
    sortOrder: lesson.sortOrder,
    isPublished: lesson.isPublished,
  };
}

const adminLessonValue = v.object({
  _id: v.id("lessons"),
  courseId: v.id("courses"),
  moduleTitle: v.union(v.string(), v.null()),
  title: v.string(),
  description: v.union(v.string(), v.null()),
  kind: lessonKind,
  contentUrl: v.union(v.string(), v.null()),
  textContent: v.union(v.string(), v.null()),
  durationMinutes: v.union(v.number(), v.null()),
  sortOrder: v.number(),
  isPublished: v.boolean(),
});

// ---------------------------------------------------------------------------
// Admin: authoring
// ---------------------------------------------------------------------------

async function getSequentialModules(
  ctx: MutationCtx | Parameters<typeof requireAdmin>[0],
  courseId: Doc<"courses">["_id"],
): Promise<boolean> {
  const settings = await ctx.db
    .query("lmsSettings")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .first();
  return settings?.sequentialModules ?? false;
}

// A module is locked when any earlier module still has incomplete lessons.
function computeLockedLessonIds(
  lessons: Doc<"lessons">[],
  completedIds: Set<string>,
): Set<string> {
  const modules: Doc<"lessons">[][] = [];
  let currentTitle: string | null | undefined;
  for (const lesson of lessons) {
    const title = lesson.moduleTitle ?? null;
    if (modules.length === 0 || title !== currentTitle) {
      modules.push([]);
      currentTitle = title;
    }
    modules[modules.length - 1].push(lesson);
  }

  const locked = new Set<string>();
  let sawIncompleteModule = false;
  for (const module of modules) {
    if (sawIncompleteModule) {
      for (const lesson of module) locked.add(String(lesson._id));
    }
    const complete = module.every((lesson) =>
      completedIds.has(String(lesson._id)),
    );
    if (!complete) sawIncompleteModule = true;
  }
  return locked;
}

export const getLmsSettings = query({
  args: { courseId: v.id("courses") },
  returns: v.object({ sequentialModules: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return {
      sequentialModules: await getSequentialModules(ctx, args.courseId),
    };
  },
});

export const setLmsSettings = mutation({
  args: {
    courseId: v.id("courses"),
    sequentialModules: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("lmsSettings")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        sequentialModules: args.sequentialModules,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
    } else {
      await ctx.db.insert("lmsSettings", {
        courseId: args.courseId,
        sequentialModules: args.sequentialModules,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
    }
    return null;
  },
});

export const listLessonsForAdmin = query({
  args: { courseId: v.id("courses") },
  returns: v.array(adminLessonValue),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_courseId_and_sortOrder", (q) =>
        q.eq("courseId", args.courseId),
      )
      .collect();
    return lessons.map(shapeAdminLesson);
  },
});

function validateLessonContent(input: {
  kind: "video" | "pdf" | "link" | "text";
  contentUrl?: string;
  textContent?: string;
}) {
  const url = input.contentUrl?.trim();
  const text = input.textContent?.trim();
  if (input.kind === "text") {
    if (!text) throw new Error("Text lessons need body content");
    return;
  }
  if (!url) {
    throw new Error("This lesson type needs a URL");
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Lesson URL must start with http:// or https://");
  }
}

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    kind: lessonKind,
    contentUrl: v.optional(v.string()),
    textContent: v.optional(v.string()),
    moduleTitle: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Lesson title is required");
    validateLessonContent(args);

    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_courseId_and_sortOrder", (q) =>
        q.eq("courseId", args.courseId),
      )
      .collect();
    const now = Date.now();

    return await ctx.db.insert("lessons", {
      courseId: args.courseId,
      moduleTitle: args.moduleTitle?.trim() || undefined,
      title,
      description: args.description?.trim() || undefined,
      kind: args.kind,
      contentUrl: args.contentUrl?.trim() || undefined,
      textContent: args.textContent || undefined,
      durationMinutes: args.durationMinutes,
      sortOrder:
        existing.reduce((max, lesson) => Math.max(max, lesson.sortOrder), -1) +
        1,
      isPublished: args.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
      createdByAdminId: admin.userId,
    });
  },
});

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    kind: v.optional(lessonKind),
    contentUrl: v.optional(v.string()),
    textContent: v.optional(v.string()),
    moduleTitle: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const nextKind = args.kind ?? lesson.kind;
    const nextUrl =
      args.contentUrl !== undefined ? args.contentUrl : lesson.contentUrl;
    const nextText =
      args.textContent !== undefined ? args.textContent : lesson.textContent;
    validateLessonContent({
      kind: nextKind,
      contentUrl: nextUrl,
      textContent: nextText,
    });

    await ctx.db.patch(args.lessonId, {
      title: args.title !== undefined ? args.title.trim() : lesson.title,
      description:
        args.description !== undefined
          ? args.description.trim() || undefined
          : lesson.description,
      kind: nextKind,
      contentUrl:
        args.contentUrl !== undefined
          ? args.contentUrl.trim() || undefined
          : lesson.contentUrl,
      textContent:
        args.textContent !== undefined ? args.textContent : lesson.textContent,
      moduleTitle:
        args.moduleTitle !== undefined
          ? args.moduleTitle.trim() || undefined
          : lesson.moduleTitle,
      durationMinutes:
        args.durationMinutes !== undefined
          ? args.durationMinutes
          : lesson.durationMinutes,
      isPublished:
        args.isPublished !== undefined ? args.isPublished : lesson.isPublished,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_lessonId", (q) => q.eq("lessonId", args.lessonId))
      .collect();
    for (const row of progress) {
      await ctx.db.delete(row._id);
    }
    await ctx.db.delete(args.lessonId);
    return null;
  },
});

export const reorderLessons = mutation({
  args: {
    courseId: v.id("courses"),
    orderedLessonIds: v.array(v.id("lessons")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    for (let index = 0; index < args.orderedLessonIds.length; index++) {
      await ctx.db.patch(args.orderedLessonIds[index], {
        sortOrder: index,
        updatedAt: now,
      });
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Learner: enrolled users (or admins) only
// ---------------------------------------------------------------------------

const learnerLessonValue = v.object({
  _id: v.id("lessons"),
  moduleTitle: v.union(v.string(), v.null()),
  title: v.string(),
  description: v.union(v.string(), v.null()),
  kind: lessonKind,
  contentUrl: v.union(v.string(), v.null()),
  textContent: v.union(v.string(), v.null()),
  durationMinutes: v.union(v.number(), v.null()),
  completed: v.boolean(),
  locked: v.boolean(),
});

export const listCourseLessons = query({
  args: { courseId: v.id("courses") },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(
      v.literal("unauthorized"),
      v.literal("not_enrolled"),
      v.literal("pending_verification"),
      v.null(),
    ),
    courseName: v.union(v.string(), v.null()),
    completedCount: v.number(),
    totalCount: v.number(),
    sequentialModules: v.boolean(),
    lessons: v.array(learnerLessonValue),
  }),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    const empty = {
      allowed: false,
      courseName: course?.name ?? null,
      completedCount: 0,
      totalCount: 0,
      sequentialModules: false,
      lessons: [],
    };

    const viewer = await resolveViewer(ctx);
    if (!viewer) return { ...empty, reason: "unauthorized" as const };

    if (!viewer.isAdmin) {
      const access = await getEnrollmentAccess(
        ctx,
        viewer.userId,
        args.courseId,
      );
      if (access === "pending") {
        return { ...empty, reason: "pending_verification" as const };
      }
      if (access !== "active") {
        return { ...empty, reason: "not_enrolled" as const };
      }
    }

    const lessons = (
      await ctx.db
        .query("lessons")
        .withIndex("by_courseId_and_sortOrder", (q) =>
          q.eq("courseId", args.courseId),
        )
        .collect()
    ).filter((lesson) => lesson.isPublished || viewer.isAdmin);

    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId_and_courseId", (q) =>
        q.eq("userId", viewer.userId).eq("courseId", args.courseId),
      )
      .collect();
    const completedIds = new Set(
      progress.filter((row) => row.completed).map((row) => String(row.lessonId)),
    );

    const sequentialModules = await getSequentialModules(ctx, args.courseId);
    const lockedIds = sequentialModules
      ? computeLockedLessonIds(lessons, completedIds)
      : new Set<string>();

    return {
      allowed: true,
      reason: null,
      courseName: course?.name ?? null,
      completedCount: lessons.filter((lesson) =>
        completedIds.has(String(lesson._id)),
      ).length,
      totalCount: lessons.length,
      sequentialModules,
      lessons: lessons.map((lesson) => ({
        _id: lesson._id,
        moduleTitle: lesson.moduleTitle ?? null,
        title: lesson.title,
        description: lesson.description ?? null,
        kind: lesson.kind,
        contentUrl: lesson.contentUrl ?? null,
        textContent: lesson.textContent ?? null,
        durationMinutes: lesson.durationMinutes ?? null,
        completed: completedIds.has(String(lesson._id)),
        locked: lockedIds.has(String(lesson._id)),
      })),
    };
  },
});

export const setLessonComplete = mutation({
  args: {
    lessonId: v.id("lessons"),
    completed: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) throw new Error("Unauthorized: sign in required");

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const enrolled =
      viewer.isAdmin ||
      (await hasActiveEnrollment(ctx, viewer.userId, lesson.courseId));
    if (!enrolled) throw new Error("Forbidden: enrollment required");

    if (args.completed) {
      const sequential = await getSequentialModules(ctx, lesson.courseId);
      if (sequential) {
        const publishedLessons = (
          await ctx.db
            .query("lessons")
            .withIndex("by_courseId_and_sortOrder", (q) =>
              q.eq("courseId", lesson.courseId),
            )
            .collect()
        ).filter((item) => item.isPublished);
        const allProgress = await ctx.db
          .query("lessonProgress")
          .withIndex("by_userId_and_courseId", (q) =>
            q.eq("userId", viewer.userId).eq("courseId", lesson.courseId),
          )
          .collect();
        const completedIds = new Set(
          allProgress
            .filter((row) => row.completed)
            .map((row) => String(row.lessonId)),
        );
        const locked = computeLockedLessonIds(publishedLessons, completedIds);
        if (locked.has(String(lesson._id))) {
          throw new Error("Complete the earlier module first");
        }
      }
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId_and_lessonId", (q) =>
        q.eq("userId", viewer.userId).eq("lessonId", args.lessonId),
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("lessonProgress", {
        userId: viewer.userId,
        lessonId: args.lessonId,
        courseId: lesson.courseId,
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        updatedAt: now,
      });
    }

    if (args.completed) {
      await ensureCertificate(ctx, viewer, lesson.courseId);
    }
    return null;
  },
});

export const getMyLearning = query({
  args: {},
  returns: v.array(
    v.object({
      courseId: v.id("courses"),
      courseName: v.string(),
      courseType: v.union(v.string(), v.null()),
      imageUrl: v.union(v.string(), v.null()),
      totalLessons: v.number(),
      completedLessons: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", viewer.userId))
      .take(200);
    const activeCourseIds = [
      ...new Set(
        enrollments
          .filter(
            (row) =>
              (row.status ?? "active") === "active" &&
              row.paymentVerification !== "pending" &&
              row.paymentVerification !== "rejected",
          )
          .map((row) => String(row.courseId)),
      ),
    ];

    const result = [];
    for (const courseId of activeCourseIds) {
      const course = await ctx.db.get(courseId as Doc<"courses">["_id"]);
      if (!course) continue;

      const lessons = (
        await ctx.db
          .query("lessons")
          .withIndex("by_courseId_and_sortOrder", (q) =>
            q.eq("courseId", course._id),
          )
          .collect()
      ).filter((lesson) => lesson.isPublished);

      const progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_userId_and_courseId", (q) =>
          q.eq("userId", viewer.userId).eq("courseId", course._id),
        )
        .collect();
      const completedIds = new Set(
        progress
          .filter((row) => row.completed)
          .map((row) => String(row.lessonId)),
      );

      result.push({
        courseId: course._id,
        courseName: course.name,
        courseType: course.type ?? null,
        imageUrl: course.imageUrls?.[0] ?? null,
        totalLessons: lessons.length,
        completedLessons: lessons.filter((lesson) =>
          completedIds.has(String(lesson._id)),
        ).length,
      });
    }
    return result;
  },
});

// Live-class schedule and join links for the batches a learner is enrolled in.
export const getMyLiveSessions = query({
  args: {},
  returns: v.array(
    v.object({
      courseId: v.id("courses"),
      courseName: v.string(),
      batchId: v.id("courseBatches"),
      batchLabel: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      daysOfWeek: v.array(v.string()),
      meetingUrl: v.union(v.string(), v.null()),
      meetingNote: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", viewer.userId))
      .take(200);

    const seen = new Set<string>();
    const result = [];
    for (const enrollment of enrollments) {
      if ((enrollment.status ?? "active") !== "active") continue;
      if (
        enrollment.paymentVerification === "pending" ||
        enrollment.paymentVerification === "rejected"
      ) {
        continue;
      }
      if (!enrollment.batchId) continue;
      const key = String(enrollment.batchId);
      if (seen.has(key)) continue;

      const batch = await ctx.db.get(enrollment.batchId);
      if (!batch) continue;
      seen.add(key);

      const course = await ctx.db.get(batch.courseId);
      result.push({
        courseId: batch.courseId,
        courseName: course?.name ?? "Course",
        batchId: batch._id,
        batchLabel: batch.label,
        startDate: batch.startDate,
        endDate: batch.endDate,
        startTime: batch.startTime,
        endTime: batch.endTime,
        daysOfWeek: batch.daysOfWeek,
        meetingUrl: batch.meetingUrl ?? null,
        meetingNote: batch.meetingNote ?? null,
      });
    }

    return result.sort((a, b) => a.startDate.localeCompare(b.startDate));
  },
});

export const getMyCertificate = query({
  args: { courseId: v.id("courses") },
  returns: v.union(certificateValue, v.null()),
  handler: async (ctx, args) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) return null;
    const cert = await ctx.db
      .query("certificates")
      .withIndex("by_userId_and_courseId", (q) =>
        q.eq("userId", viewer.userId).eq("courseId", args.courseId),
      )
      .first();
    return cert ? shapeCertificate(cert) : null;
  },
});

// Idempotently issues a certificate if the learner has completed the course.
export const ensureMyCertificate = mutation({
  args: { courseId: v.id("courses") },
  returns: v.union(certificateValue, v.null()),
  handler: async (ctx, args) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) return null;
    const enrolled =
      viewer.isAdmin ||
      (await hasActiveEnrollment(ctx, viewer.userId, args.courseId));
    if (!enrolled) throw new Error("Forbidden: enrollment required");
    const cert = await ensureCertificate(ctx, viewer, args.courseId);
    return cert ? shapeCertificate(cert) : null;
  },
});

// Public verification: no auth required, returns only non-sensitive fields.
export const getCertificateByCode = query({
  args: { code: v.string() },
  returns: v.union(certificateValue, v.null()),
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    if (!code) return null;
    const cert = await ctx.db
      .query("certificates")
      .withIndex("by_verificationCode", (q) => q.eq("verificationCode", code))
      .first();
    return cert ? shapeCertificate(cert) : null;
  },
});

// Admin: per-learner progress for a course (lessons, quiz, certificate).
export const getCourseProgressForAdmin = query({
  args: { courseId: v.id("courses") },
  returns: v.array(
    v.object({
      userId: v.string(),
      userName: v.union(v.string(), v.null()),
      userEmail: v.union(v.string(), v.null()),
      enrollmentNumber: v.union(v.string(), v.null()),
      completedLessons: v.number(),
      totalLessons: v.number(),
      certificateCode: v.union(v.string(), v.null()),
      quizScore: v.union(v.number(), v.null()),
      quizPassed: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const lessons = (
      await ctx.db
        .query("lessons")
        .withIndex("by_courseId_and_sortOrder", (q) =>
          q.eq("courseId", args.courseId),
        )
        .collect()
    ).filter((lesson) => lesson.isPublished);
    const totalLessons = lessons.length;

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .take(1000);
    const active = enrollments.filter(
      (enrollment) => (enrollment.status ?? "active") === "active",
    );

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    const rows = [];
    for (const enrollment of active) {
      const progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_userId_and_courseId", (q) =>
          q.eq("userId", enrollment.userId).eq("courseId", args.courseId),
        )
        .collect();
      const completedLessons = progress.filter((row) => row.completed).length;

      const certificate = await ctx.db
        .query("certificates")
        .withIndex("by_userId_and_courseId", (q) =>
          q.eq("userId", enrollment.userId).eq("courseId", args.courseId),
        )
        .first();

      let quizScore: number | null = null;
      let quizPassed = false;
      if (quiz) {
        const attempts = await ctx.db
          .query("quizAttempts")
          .withIndex("by_userId_and_quizId", (q) =>
            q.eq("userId", enrollment.userId).eq("quizId", quiz._id),
          )
          .collect();
        if (attempts.length > 0) {
          quizScore = Math.max(...attempts.map((attempt) => attempt.score));
          quizPassed = attempts.some((attempt) => attempt.passed);
        }
      }

      rows.push({
        userId: enrollment.userId,
        userName: enrollment.userName ?? null,
        userEmail: enrollment.userEmail ?? null,
        enrollmentNumber: enrollment.enrollmentNumber ?? null,
        completedLessons,
        totalLessons,
        certificateCode: certificate?.verificationCode ?? null,
        quizScore,
        quizPassed,
      });
    }

    return rows;
  },
});
