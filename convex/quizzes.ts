import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { isViewerEnrolled, resolveViewer } from "./_shared/viewer";

// ---------------------------------------------------------------------------
// Quizzes: one optional end-of-course quiz per course. Correct answers are
// never sent to learners — grading happens server-side in submitQuizAttempt.
// ---------------------------------------------------------------------------

const quizQuestionInput = v.object({
  _id: v.optional(v.id("quizQuestions")),
  prompt: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
  explanation: v.optional(v.string()),
});

const adminQuestionValue = v.object({
  _id: v.id("quizQuestions"),
  prompt: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
  explanation: v.union(v.string(), v.null()),
});

async function getPublishedQuizWithQuestions(
  ctx: Parameters<typeof requireAdmin>[0],
  courseId: Doc<"courses">["_id"],
) {
  const quiz = await ctx.db
    .query("quizzes")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .first();
  if (!quiz || !quiz.isPublished) return null;
  const questions = await ctx.db
    .query("quizQuestions")
    .withIndex("by_quizId_and_sortOrder", (q) => q.eq("quizId", quiz._id))
    .collect();
  if (questions.length === 0) return null;
  return { quiz, questions };
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const getQuizForAdmin = query({
  args: { courseId: v.id("courses") },
  returns: v.union(
    v.object({
      quiz: v.object({
        _id: v.id("quizzes"),
        title: v.string(),
        description: v.union(v.string(), v.null()),
        passingScore: v.number(),
        isPublished: v.boolean(),
      }),
      questions: v.array(adminQuestionValue),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();
    if (!quiz) return null;
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId_and_sortOrder", (q) => q.eq("quizId", quiz._id))
      .collect();
    return {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description ?? null,
        passingScore: quiz.passingScore,
        isPublished: quiz.isPublished,
      },
      questions: questions.map((question) => ({
        _id: question._id,
        prompt: question.prompt,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation ?? null,
      })),
    };
  },
});

export const saveQuiz = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(),
    isPublished: v.boolean(),
    questions: v.array(quizQuestionInput),
  },
  returns: v.id("quizzes"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const title = args.title.trim();
    if (!title) throw new Error("Quiz title is required");
    const passingScore = Math.max(0, Math.min(100, Math.round(args.passingScore)));

    const cleaned = args.questions.map((question, index) => {
      const prompt = question.prompt.trim();
      if (!prompt) throw new Error(`Question ${index + 1} needs a prompt`);
      const options = question.options
        .map((option) => option.trim())
        .filter((option) => option.length > 0);
      if (options.length < 2) {
        throw new Error(`Question ${index + 1} needs at least two options`);
      }
      if (
        question.correctIndex < 0 ||
        question.correctIndex >= options.length
      ) {
        throw new Error(`Question ${index + 1} has an invalid correct answer`);
      }
      return {
        _id: question._id,
        prompt,
        options,
        correctIndex: question.correctIndex,
        explanation: question.explanation?.trim() || undefined,
      };
    });

    const now = Date.now();
    const existing = await ctx.db
      .query("quizzes")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();

    let quizId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        title,
        description: args.description?.trim() || undefined,
        passingScore,
        isPublished: args.isPublished,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
      quizId = existing._id;
    } else {
      quizId = await ctx.db.insert("quizzes", {
        courseId: args.courseId,
        title,
        description: args.description?.trim() || undefined,
        passingScore,
        isPublished: args.isPublished,
        updatedAt: now,
        updatedByAdminId: admin.userId,
      });
    }

    const existingQuestions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", quizId))
      .collect();
    const keepIds = new Set(
      cleaned.filter((question) => question._id).map((q) => String(q._id)),
    );
    for (const question of existingQuestions) {
      if (!keepIds.has(String(question._id))) {
        await ctx.db.delete(question._id);
      }
    }

    for (let index = 0; index < cleaned.length; index++) {
      const question = cleaned[index];
      if (question._id) {
        await ctx.db.patch(question._id, {
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          sortOrder: index,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("quizQuestions", {
          quizId,
          courseId: args.courseId,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return quizId;
  },
});

export const deleteQuiz = mutation({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .first();
    if (!quiz) return null;
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", quiz._id))
      .collect();
    for (const question of questions) {
      await ctx.db.delete(question._id);
    }
    await ctx.db.delete(quiz._id);
    return null;
  },
});

// ---------------------------------------------------------------------------
// Learner
// ---------------------------------------------------------------------------

export const getCourseQuiz = query({
  args: { courseId: v.id("courses") },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(
      v.literal("unauthorized"),
      v.literal("not_enrolled"),
      v.null(),
    ),
    quiz: v.union(
      v.object({
        title: v.string(),
        description: v.union(v.string(), v.null()),
        passingScore: v.number(),
        questionCount: v.number(),
      }),
      v.null(),
    ),
    questions: v.array(
      v.object({
        _id: v.id("quizQuestions"),
        prompt: v.string(),
        options: v.array(v.string()),
      }),
    ),
    bestAttempt: v.union(
      v.object({
        score: v.number(),
        passed: v.boolean(),
        correctCount: v.number(),
        totalCount: v.number(),
        createdAt: v.number(),
      }),
      v.null(),
    ),
    passed: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const none = {
      allowed: false,
      reason: "unauthorized" as const,
      quiz: null,
      questions: [],
      bestAttempt: null,
      passed: false,
    };

    const viewer = await resolveViewer(ctx);
    if (!viewer) return none;

    const enrolled = await isViewerEnrolled(ctx, viewer, args.courseId);
    if (!enrolled) return { ...none, reason: "not_enrolled" as const };

    const found = await getPublishedQuizWithQuestions(ctx, args.courseId);
    if (!found) {
      return {
        allowed: true,
        reason: null,
        quiz: null,
        questions: [],
        bestAttempt: null,
        passed: false,
      };
    }

    const { quiz, questions } = found;
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_userId_and_quizId", (q) =>
        q.eq("userId", viewer.userId).eq("quizId", quiz._id),
      )
      .collect();
    const best = attempts.reduce<(typeof attempts)[number] | null>(
      (current, attempt) =>
        !current || attempt.score > current.score ? attempt : current,
      null,
    );

    return {
      allowed: true,
      reason: null,
      quiz: {
        title: quiz.title,
        description: quiz.description ?? null,
        passingScore: quiz.passingScore,
        questionCount: questions.length,
      },
      questions: questions.map((question) => ({
        _id: question._id,
        prompt: question.prompt,
        options: question.options,
      })),
      bestAttempt: best
        ? {
            score: best.score,
            passed: best.passed,
            correctCount: best.correctCount,
            totalCount: best.totalCount,
            createdAt: best.createdAt,
          }
        : null,
      passed: attempts.some((attempt) => attempt.passed),
    };
  },
});

export const submitQuizAttempt = mutation({
  args: {
    courseId: v.id("courses"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedIndex: v.number(),
      }),
    ),
  },
  returns: v.object({
    score: v.number(),
    passed: v.boolean(),
    correctCount: v.number(),
    totalCount: v.number(),
    results: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedIndex: v.number(),
        correctIndex: v.number(),
        correct: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const viewer = await resolveViewer(ctx);
    if (!viewer) throw new Error("Unauthorized: sign in required");

    const enrolled = await isViewerEnrolled(ctx, viewer, args.courseId);
    if (!enrolled) throw new Error("Forbidden: enrollment required");

    const found = await getPublishedQuizWithQuestions(ctx, args.courseId);
    if (!found) throw new Error("This course has no quiz");
    const { quiz, questions } = found;

    const answerByQuestion = new Map(
      args.answers.map((answer) => [String(answer.questionId), answer.selectedIndex]),
    );

    const results = questions.map((question) => {
      const selectedIndex = answerByQuestion.get(String(question._id)) ?? -1;
      return {
        questionId: question._id,
        selectedIndex,
        correctIndex: question.correctIndex,
        correct: selectedIndex === question.correctIndex,
      };
    });

    const correctCount = results.filter((result) => result.correct).length;
    const totalCount = questions.length;
    const score =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const passed = score >= quiz.passingScore;

    await ctx.db.insert("quizAttempts", {
      userId: viewer.userId,
      quizId: quiz._id,
      courseId: args.courseId,
      score,
      passed,
      correctCount,
      totalCount,
      answers: results.map((result) => ({
        questionId: result.questionId,
        selectedIndex: result.selectedIndex,
      })),
      createdAt: Date.now(),
    });

    return {
      score,
      passed,
      correctCount,
      totalCount,
      results: results.map((result) => ({
        questionId: result.questionId,
        selectedIndex: result.selectedIndex,
        correctIndex: result.correctIndex,
        correct: result.correct,
      })),
    };
  },
});
