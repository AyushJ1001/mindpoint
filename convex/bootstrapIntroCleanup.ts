import { internalMutation } from "./_generated/server";
import { activatePublishedLmsCurriculum } from "./_shared/lmsActivation";

/**
 * Backfill: attach the published LMS curriculum to any existing intro
 * enrollment that has none — for enrollments created before the curricula were
 * published, or manual ones that skipped activation. Also approves a pending
 * payment on an intro enrollment, since the ₹999 courses deliver automatically.
 *
 *   npx convex run bootstrapIntroCleanup:backfillIntroEnrollments
 */
export const backfillIntroEnrollments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const codes = ["PRCP", "PRCVCP", "PRSP", "PRPFA"];
    const courses = await ctx.db.query("courses").take(2000);
    const targetIds = new Set(
      courses.filter((c) => c.code && codes.includes(c.code)).map((c) => c._id),
    );
    if (targetIds.size === 0) return { activated: 0, approved: 0 };

    const enrollments = await ctx.db.query("enrollments").take(2000);
    let activated = 0;
    let approved = 0;

    for (const enrollment of enrollments) {
      if (!targetIds.has(enrollment.courseId)) continue;
      if (enrollment.status && enrollment.status !== "active") continue;

      const existing = await ctx.db
        .query("lmsEnrollmentCurricula")
        .withIndex("by_enrollmentId", (q) =>
          q.eq("enrollmentId", enrollment._id),
        )
        .unique();

      if (!existing) {
        const assignment = await activatePublishedLmsCurriculum(ctx, {
          enrollmentId: enrollment._id,
          courseId: enrollment.courseId,
          courseType: enrollment.courseType,
        });
        if (assignment) activated += 1;
      }

      if (enrollment.paymentVerification === "pending") {
        await ctx.db.patch(enrollment._id, {
          paymentVerification: "approved",
          paymentVerificationNote: "Auto-approved for an intro course",
        });
        approved += 1;
      }
    }

    return { activated, approved, at: now };
  },
});

// Grant a test enrollment on an intro course so the owner can walk through the
// real student LMS (video, reading, quiz, completion, certificate).
//
//   npx convex run bootstrapIntroCleanup:grantTestEnrollment \
//     '{"email":"akshajuvekar6@gmail.com","courseCode":"PRCP"}'
//
// Idempotent: if an active enrollment already exists for the email and course,
// it just re-checks LMS access and returns.

export const grantTestEnrollment = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "akshajuvekar6@gmail.com".trim().toLowerCase();
    const courseCode = "PRSP"; // Sports Psychology (7 modules, clean 1:1 videos)
    const now = Date.now();

    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === courseCode);
    if (!course) return { granted: false, reason: "course not found" };

    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_userId_and_courseId", (q) =>
        q.eq("userId", email).eq("courseId", course._id),
      )
      .first();

    let enrollmentId = existing?._id;
    if (!enrollmentId) {
      enrollmentId = await ctx.db.insert("enrollments", {
        userId: email,
        userName: "Ayush (test)",
        userEmail: email,
        courseId: course._id,
        courseName: course.name,
        courseType: course.type,
        enrollmentNumber: `TEST-${Date.now().toString(36).toUpperCase()}`,
        status: "active",
        paymentVerification: "approved",
        amountPaid: 0,
        listedPrice: course.price,
        checkoutPrice: 0,
        registrationSource: "admin_manual",
      });
    } else {
      await ctx.db.patch(enrollmentId, {
        status: "active",
        paymentVerification: "approved",
      });
    }

    const assignment = await activatePublishedLmsCurriculum(ctx, {
      enrollmentId,
      courseId: course._id,
      courseType: course.type,
    });

    return {
      granted: true,
      email,
      courseCode,
      courseName: course.name,
      enrollmentId,
      curriculumAssignmentId: assignment,
      at: now,
      next: `Sign in as ${email} and open /lms`,
    };
  },
});

// Replace a course's placeholder draft curriculum with the real one, then let
// `seedIntroRecordings` rebuild it. Used for Clinical Vs Counselling, which had
// an early scaffold (generic module titles, no notes, no recordings).
//
// Refuses to touch a published curriculum, so it can never remove something a
// student can already reach. Only the known placeholder curriculum id
// (version 1, status draft) is removed.
//
//   npx convex run bootstrapIntroCleanup:deletePlaceholderCurriculum \
//     '{"courseCode":"PRCVCP"}'

const PLACEHOLDER_CURRICULUM_IDS = new Set([
  "p972erc6ys5w8kxvd21amb9rz58f2m23",
]);

export const deletePlaceholderCurriculum = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courseCode = "PRCVCP";
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === courseCode);
    if (!course) return { deleted: false, reason: "course not found" };

    const curricula = await ctx.db
      .query("lmsCurricula")
      .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
      .take(100);

    const removed: string[] = [];
    for (const curriculum of curricula) {
      if (curriculum.status === "published") {
        removed.push(`kept published ${curriculum._id}`);
        continue;
      }
      if (!PLACEHOLDER_CURRICULUM_IDS.has(curriculum._id)) {
        removed.push(`kept unknown draft ${curriculum._id}`);
        continue;
      }

      const modules = await ctx.db
        .query("lmsModules")
        .withIndex("by_curriculumId_and_sortOrder", (q) =>
          q.eq("curriculumId", curriculum._id),
        )
        .take(500);
      for (const module of modules) {
        const activities = await ctx.db
          .query("lmsActivities")
          .withIndex("by_moduleId_and_sortOrder", (q) =>
            q.eq("moduleId", module._id),
          )
          .take(500);
        for (const activity of activities) {
          await ctx.db.delete(activity._id);
        }
        await ctx.db.delete(module._id);
      }
      await ctx.db.delete(curriculum._id);
      removed.push(`deleted placeholder ${curriculum._id}`);
    }

    return { deleted: true, courseCode, removed };
  },
});
