import { v } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, query } from "./_generated/server";

// Storefront-wide switches. A single row (key "default"); if it is missing,
// registration is treated as open so nothing changes until it is switched off.

const DEFAULT_KEY = "default";
const ACTOR = "bootstrap:site-settings";

/** True when students may register. Missing row => open. */
export async function registrationIsOpen(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  const row = await ctx.db
    .query("siteSettings")
    .withIndex("by_key", (q) => q.eq("key", DEFAULT_KEY))
    .first();
  return row?.registrationsOpen ?? true;
}

/** Public read for the storefront (paused banner, disabled checkout). */
export const getPublic = query({
  args: {},
  returns: v.object({
    registrationsOpen: v.boolean(),
    note: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", DEFAULT_KEY))
      .first();
    return {
      registrationsOpen: row?.registrationsOpen ?? true,
      note: row?.note,
    };
  },
});

/**
 * Flip registrations on or off.
 *   npx convex run siteSettings:setRegistrationsOpen '{"open":false,"note":"..."}'
 */
export const setRegistrationsOpen = internalMutation({
  args: { open: v.boolean(), note: v.optional(v.string()) },
  returns: v.object({ registrationsOpen: v.boolean() }),
  handler: async (ctx, { open, note }) => {
    const now = Date.now();
    const row = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", DEFAULT_KEY))
      .first();

    if (row) {
      await ctx.db.patch(row._id, {
        registrationsOpen: open,
        note,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: DEFAULT_KEY,
        registrationsOpen: open,
        note,
        updatedAt: now,
        updatedByAdminId: ACTOR,
      });
    }

    return { registrationsOpen: open };
  },
});
