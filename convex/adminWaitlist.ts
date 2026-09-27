import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { WaitlistCourseTypeValue, WaitlistDeliveryValue } from "./schema";

const MAX_SCAN = 2500;

/** Admin view of early-bird pre-registrations, newest first. */
export const listWaitlistEntries = query({
  args: {
    courseType: v.optional(WaitlistCourseTypeValue),
    delivery: v.optional(WaitlistDeliveryValue),
    courseId: v.optional(v.id("courses")),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500);
    const scanLimit = args.search
      ? Math.min(limit * 10, MAX_SCAN)
      : Math.min(limit * 5, MAX_SCAN);

    let rows = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_createdAt")
      .order("desc")
      .take(scanLimit);

    if (args.courseType) {
      rows = rows.filter((row) => row.courseType === args.courseType);
    }
    if (args.delivery) {
      rows = rows.filter((row) => row.delivery === args.delivery);
    }
    if (args.courseId) {
      rows = rows.filter((row) => row.courseId === args.courseId);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      rows = rows.filter((row) =>
        [
          row.fullName,
          row.email,
          row.whatsapp,
          row.courseTitle,
          row.cohortLabel,
          row.source,
        ].some(
          (part) =>
            typeof part === "string" && part.toLowerCase().includes(search),
        ),
      );
    }

    const hasMore = rows.length > limit;
    return { entries: rows.slice(0, limit), hasMore };
  },
});

/** Remove a pre-registration (duplicates, tests, withdrawal requests). */
export const removeWaitlistEntry = mutation({
  args: { id: v.id("waitlistEntries") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const row = await ctx.db.get(args.id);
    if (!row) {
      return { removed: false };
    }
    await ctx.db.delete(args.id);
    return { removed: true };
  },
});
