import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// One-off backfill: normalize legacy enrollments that predate the `status`
// field. The codebase treats `status === undefined` as active everywhere via
// `(status ?? "active")` / `normalizeEnrollmentStatus`, so writing it down is a
// semantic no-op for current consumers — but it's a prerequisite for any future
// switch to index-based active-enrollment counts (`eq("status", "active")`),
// which would otherwise silently miss every undefined-status row and undercount
// seats (oversell risk).
//
// Safety guard: only normalize rows that show NO sign of cancellation or
// transfer. Any legacy row that was inactivated by a long-removed code path but
// left a companion field set (cancelledAt / transferredAt / *ByAdminId /
// statusReason) is skipped, so the backfill can never resurrect an inactive
// enrollment. The patch direction (undefined -> "active") is also the
// under-sell-safe direction.
//
// Run manually once: `npx convex run migrations:normalizeEnrollmentStatus`.
// It self-reschedules in batches to stay within mutation transaction limits.

const BACKFILL_BATCH_SIZE = 200;

export const normalizeEnrollmentStatus = internalMutation({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
    scanned: v.optional(v.number()),
    patched: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.query("enrollments").paginate({
      numItems: BACKFILL_BATCH_SIZE,
      cursor: args.cursor ?? null,
    });

    let patched = args.patched ?? 0;
    for (const row of page.page) {
      const looksInactivated =
        row.status !== undefined ||
        row.statusReason !== undefined ||
        row.cancelledAt !== undefined ||
        row.transferredAt !== undefined ||
        row.cancelledByAdminId !== undefined ||
        row.transferredByAdminId !== undefined;

      if (!looksInactivated) {
        await ctx.db.patch(row._id, { status: "active" });
        patched += 1;
      }
    }

    const scanned = (args.scanned ?? 0) + page.page.length;

    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.normalizeEnrollmentStatus,
        { cursor: page.continueCursor, scanned, patched },
      );
      return { done: false, scanned, patched };
    }

    console.log(
      `normalizeEnrollmentStatus complete: scanned ${scanned}, patched ${patched}`,
    );
    return { done: true, scanned, patched };
  },
});

// Seed a published Curriculum for each January certificate cohort and activate
// LMS access for the enrollments that already exist, so an approved payment does
// not land the learner in an empty workspace.
//
// The structure comes from the Course's own data: its `modules` when present,
// otherwise its `learningOutcomes` plus a practical block. Bodies stay thin until
// the Release desk enriches them into a new draft version — authoring is
// append-only, so publishing a new version is the intended path.
//
//   npx convex run migrations:seedJanuaryCurricula '{"dryRun":true}'
//   npx convex run migrations:seedJanuaryCurricula '{"dryRun":false}'

const JANUARY_CERTIFICATE_CODES = ["CCCBT", "CCICH", "CCPD"] as const;

export const seedJanuaryCurricula = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const now = Date.now();
    const courses = await ctx.db.query("courses").collect();

    const report: Array<{
      code: string;
      curriculumId?: string;
      modules: number;
      activities: number;
      enrollmentsActivated: number;
      note?: string;
    }> = [];

    for (const code of JANUARY_CERTIFICATE_CODES) {
      const course = courses.find((row) => row.code === code);
      if (!course) {
        report.push({
          code,
          modules: 0,
          activities: 0,
          enrollmentsActivated: 0,
          note: "course not found",
        });
        continue;
      }

      const published = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId_and_status", (q) =>
          q.eq("courseId", course._id).eq("status", "published"),
        )
        .first();

      if (published) {
        report.push({
          code,
          curriculumId: published._id,
          modules: 0,
          activities: 0,
          enrollmentsActivated: 0,
          note: "curriculum already published",
        });
        continue;
      }

      const versions = await ctx.db
        .query("lmsCurricula")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect();
      const version =
        versions.reduce((max, row) => Math.max(max, row.version), 0) + 1;

      const hasModules = Boolean(course.modules && course.modules.length > 0);
      const modules: Array<{ title: string; description: string }> = hasModules
        ? [...(course.modules ?? [])]
        : (course.learningOutcomes ?? []).map((outcome) => ({
            title: outcome.title,
            description: "",
          }));

      if (!hasModules) {
        modules.push({
          title: "Practical training",
          description:
            "Two weeks of supervised practice with feedback on your own work.",
        });
      }

      let curriculumId: Id<"lmsCurricula"> | undefined;
      let activityCount = 0;

      if (!dryRun) {
        curriculumId = await ctx.db.insert("lmsCurricula", {
          courseId: course._id,
          version,
          title: `${course.name} — January 2027`,
          status: "published",
          createdByAdminId: "migration:seed-january",
          createdAt: now,
          updatedAt: now,
          publishedAt: now,
        });

        for (const [index, module] of modules.entries()) {
          const moduleId = await ctx.db.insert("lmsModules", {
            curriculumId,
            title: module.title,
            description: module.description || undefined,
            sortOrder: index,
            createdAt: now,
            updatedAt: now,
          });
          const isPractical = module.title === "Practical training";

          await ctx.db.insert("lmsActivities", {
            curriculumId,
            moduleId,
            type: isPractical ? "assignment" : "reading",
            title: isPractical ? "Reflect on your practice" : module.title,
            instructions: isPractical
              ? "Name the technique you practised, what happened, and what you would do differently next time."
              : undefined,
            content:
              !isPractical && module.description
                ? module.description
                : undefined,
            required: true,
            sortOrder: 0,
            releaseMode: "immediate",
            completionMode: isPractical ? "submit" : "self_confirm",
            gradingCriteria: isPractical
              ? "A short reflection that names the technique and what you learned from the feedback."
              : undefined,
            rightsApproved: true,
            createdAt: now,
            updatedAt: now,
          });
          activityCount += 1;
        }
      }

      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_courseId", (q) => q.eq("courseId", course._id))
        .collect();
      const active = enrollments.filter(
        (row) => !row.status || row.status === "active",
      );
      let activated = 0;
      for (const enrollment of active) {
        const existing = await ctx.db
          .query("lmsEnrollmentCurricula")
          .withIndex("by_enrollmentId", (q) =>
            q.eq("enrollmentId", enrollment._id),
          )
          .first();
        if (existing) continue;
        activated += 1;
        if (!dryRun && curriculumId) {
          await ctx.db.insert("lmsEnrollmentCurricula", {
            enrollmentId: enrollment._id,
            curriculumId,
            status: "active",
            activatedAt: now,
            activatedByAdminId: "migration:seed-january",
          });
        }
      }

      report.push({
        code,
        curriculumId,
        modules: modules.length,
        activities: activityCount,
        enrollmentsActivated: activated,
      });
    }

    console.log(
      `seedJanuaryCurricula ${dryRun ? "(dry run) " : ""}complete: ${JSON.stringify(report)}`,
    );
    return { dryRun, report };
  },
});
