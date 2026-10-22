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

// Housekeeping: archive every offer campaign that is still live, so the
// storefront stops carrying stale promotions. Reversible from the admin Offers
// desk; this only flips `isArchived`.
//
//   npx convex run migrations:archiveOfferCampaigns '{"dryRun":true}'
//   npx convex run migrations:archiveOfferCampaigns '{"dryRun":false}'

export const archiveOfferCampaigns = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;

    const campaigns = await ctx.db.query("offerCampaigns").collect();
    const live = campaigns.filter((campaign) => !campaign.isArchived);

    if (!dryRun) {
      const now = Date.now();
      for (const campaign of live) {
        await ctx.db.patch(campaign._id, {
          isArchived: true,
          updatedAt: now,
          updatedByAdminId: "migration:archive-offers",
        });
      }
    }

    console.log(
      `archiveOfferCampaigns ${dryRun ? "(dry run) " : ""}complete: ${live.length} live campaign(s)${dryRun ? " would be archived" : " archived"}`,
    );

    return {
      dryRun,
      archived: dryRun ? 0 : live.length,
      candidates: live.map((campaign) => campaign.name),
    };
  },
});
