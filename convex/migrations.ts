import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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

// The self-paced "Introduction to …" courses were stored with `type:
// "certificate"`, so they appeared in the certificate listing beside the live
// cohorts. They are self-paced, so they belong with the intro courses
// (`type: "pre-recorded"`). This reclassifies them and nothing else.
//
//   npx convex run migrations:reclassifySelfPacedCertificateCourses '{"dryRun":true}'
//   npx convex run migrations:reclassifySelfPacedCertificateCourses '{"dryRun":false}'

const SELF_PACED_CERTIFICATE_CODES = ["PRCBTI", "PRICHI", "PRPDI"] as const;

export const reclassifySelfPacedCertificateCourses = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const courses = await ctx.db.query("courses").collect();

    const targets = courses.filter(
      (course) =>
        (SELF_PACED_CERTIFICATE_CODES as readonly string[]).includes(
          course.code,
        ) && course.type === "certificate",
    );

    if (!dryRun) {
      for (const course of targets) {
        await ctx.db.patch(course._id, { type: "pre-recorded" });
      }
    }

    const changes = targets.map((course) => ({
      code: course.code,
      from: course.type,
      to: "pre-recorded" as const,
    }));

    console.log(
      `reclassifySelfPacedCertificateCourses ${dryRun ? "(dry run) " : ""}complete: ${changes.length} course(s)`,
    );

    return { dryRun, changed: dryRun ? 0 : changes.length, changes };
  },
});
