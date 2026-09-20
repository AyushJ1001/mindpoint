import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

const MAX_SCAN = 2500;

export const listLeads = query({
  args: {
    search: v.optional(v.string()),
    consentOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500);
    const scanLimit = args.search
      ? Math.min(limit * 10, MAX_SCAN)
      : Math.min(limit * 5, MAX_SCAN);

    let rows = await ctx.db
      .query("leads")
      .withIndex("by_createdAt")
      .order("desc")
      .take(scanLimit);

    if (args.consentOnly) {
      rows = rows.filter((row) => row.marketingConsent);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      rows = rows.filter((row) =>
        [
          row.email,
          row.name,
          row.phone,
          row.city,
          row.educationStatus,
          row.interest,
          row.message,
          row.source,
        ].some(
          (part) =>
            typeof part === "string" && part.toLowerCase().includes(search),
        ),
      );
    }

    const hasMore = rows.length > limit;
    return { leads: rows.slice(0, limit), hasMore };
  },
});
