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

// One-off normalisation: certificate Courses now run for eight weeks, so their
// `duration` string is set to one canonical value. `duration` is rendered
// verbatim as a chip on the course page and in the cart (`course-hero.tsx`,
// `course-journey.tsx`, `bogo-selection-modal.tsx`), so the stored string is
// the copy.
//
// Defaults to a DRY RUN and reports every change it would make, so the blast
// radius is visible before anything is written. Run it for real with:
//   npx convex run migrations:normalizeCertificateCourseDuration '{"dryRun":false}'
// It self-reschedules in batches to stay within mutation transaction limits.

const CERTIFICATE_DURATION = "8 weeks";
const COURSE_BATCH_SIZE = 200;

export const normalizeCertificateCourseDuration = internalMutation({
  args: {
    duration: v.optional(v.string()),
    dryRun: v.optional(v.boolean()),
    cursor: v.optional(v.union(v.string(), v.null())),
    scanned: v.optional(v.number()),
    changes: v.optional(
      v.array(
        v.object({
          code: v.string(),
          from: v.union(v.string(), v.null()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const duration = args.duration ?? CERTIFICATE_DURATION;
    const dryRun = args.dryRun ?? true;

    const page = await ctx.db.query("courses").paginate({
      numItems: COURSE_BATCH_SIZE,
      cursor: args.cursor ?? null,
    });

    const changes = [...(args.changes ?? [])];
    for (const row of page.page) {
      if (row.type !== "certificate") continue;
      if (row.duration === duration) continue;

      changes.push({ code: row.code, from: row.duration ?? null });
      if (!dryRun) {
        await ctx.db.patch(row._id, { duration });
      }
    }

    const scanned = (args.scanned ?? 0) + page.page.length;

    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.normalizeCertificateCourseDuration,
        { duration, dryRun, cursor: page.continueCursor, scanned, changes },
      );
      return { done: false, dryRun, scanned, changes };
    }

    console.log(
      `normalizeCertificateCourseDuration ${dryRun ? "(dry run) " : ""}complete: scanned ${scanned}, ${changes.length} certificate course(s) set to "${duration}"`,
    );
    return { done: true, dryRun, scanned, changes };
  },
});
