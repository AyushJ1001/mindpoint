import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

export const getReleaseDesk = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [
      courses,
      curricula,
      activeEnrollments,
      legacyActiveEnrollments,
      facultyAssignments,
    ] = await Promise.all([
      ctx.db.query("courses").order("desc").take(200),
      ctx.db.query("lmsCurricula").order("desc").take(200),
      ctx.db
        .query("enrollments")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(200),
      ctx.db
        .query("enrollments")
        .withIndex("by_status", (q) => q.eq("status", undefined))
        .order("desc")
        .take(200),
      ctx.db.query("lmsFacultyAssignments").order("desc").take(200),
    ]);
    const eligibleEnrollments = Array.from(
      new Map(
        [...activeEnrollments, ...legacyActiveEnrollments].map((enrollment) => [
          enrollment._id,
          enrollment,
        ]),
      ).values(),
    );
    const enrollmentRows = await Promise.all(
      eligibleEnrollments.map(async (enrollment) => {
        const assignment = await ctx.db
          .query("lmsEnrollmentCurricula")
          .withIndex("by_enrollmentId", (q) =>
            q.eq("enrollmentId", enrollment._id),
          )
          .unique();
        return {
          enrollmentId: enrollment._id,
          enrollmentNumber: enrollment.enrollmentNumber,
          courseId: enrollment.courseId,
          courseName:
            enrollment.courseName ??
            courses.find((course) => course._id === enrollment.courseId)
              ?.name ??
            "Course",
          studentName: enrollment.userName ?? "Student",
          batchLabel: enrollment.batchLabel,
          assignmentId: assignment?._id,
          curriculumId: assignment?.curriculumId,
          lmsStatus: assignment?.status ?? ("awaiting_activation" as const),
        };
      }),
    );
    return {
      courses: courses.map((course) => ({
        courseId: course._id,
        name: course.name,
        code: course.code,
      })),
      curricula: curricula.map((curriculum) => ({
        curriculumId: curriculum._id,
        courseId: curriculum.courseId,
        title: curriculum.title,
        version: curriculum.version,
        status: curriculum.status,
        updatedAt: curriculum.updatedAt,
        publishedAt: curriculum.publishedAt,
      })),
      enrollments: enrollmentRows,
      facultyAssignments: facultyAssignments.map((assignment) => ({
        assignmentId: assignment._id,
        courseId: assignment.courseId,
        batchId: assignment.batchId,
        facultyTokenIdentifier: assignment.facultyTokenIdentifier,
        canGrade: assignment.canGrade,
        canAnswerQuestions: assignment.canAnswerQuestions,
        canApproveCompletion: assignment.canApproveCompletion,
      })),
    };
  },
});

export const assignFaculty = mutation({
  args: {
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    facultyTokenIdentifier: v.string(),
    canGrade: v.boolean(),
    canAnswerQuestions: v.boolean(),
    canApproveCompletion: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const token = args.facultyTokenIdentifier.trim();
    if (!token) throw new Error("Faculty token identifier is required");
    const course = await ctx.db.get("courses", args.courseId);
    if (!course) throw new Error("Course not found");
    if (args.batchId) {
      const batch = await ctx.db.get("courseBatches", args.batchId);
      if (!batch || batch.courseId !== args.courseId)
        throw new Error("Batch does not belong to this Course");
    }
    const existing = await ctx.db
      .query("lmsFacultyAssignments")
      .withIndex("by_courseId_and_facultyTokenIdentifier", (q) =>
        q.eq("courseId", args.courseId).eq("facultyTokenIdentifier", token),
      )
      .take(100);
    const sameScope = existing.find((item) => item.batchId === args.batchId);
    const values = {
      canGrade: args.canGrade,
      canAnswerQuestions: args.canAnswerQuestions,
      canApproveCompletion: args.canApproveCompletion,
    };
    if (sameScope) {
      await ctx.db.patch("lmsFacultyAssignments", sameScope._id, values);
      await ctx.db.insert("adminAuditLogs", {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "lms.faculty_assignment.updated",
        entityType: "lmsFacultyAssignment",
        entityId: sameScope._id,
        after: values,
        createdAt: Date.now(),
      });
      return { assignmentId: sameScope._id, updated: true };
    }
    const assignmentId = await ctx.db.insert("lmsFacultyAssignments", {
      courseId: args.courseId,
      batchId: args.batchId,
      facultyTokenIdentifier: token,
      ...values,
      assignedByAdminId: admin.userId,
      createdAt: Date.now(),
    });
    await ctx.db.insert("adminAuditLogs", {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "lms.faculty_assignment.created",
      entityType: "lmsFacultyAssignment",
      entityId: assignmentId,
      after: { courseId: args.courseId, batchId: args.batchId, ...values },
      createdAt: Date.now(),
    });
    return { assignmentId, updated: false };
  },
});
