import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";
import {
  getSiteContentKind,
  sanitizeSiteContent,
  SITE_CONTENT_OPTIONS,
} from "../lib/site-content";

// Public read: the storefront fetches an override and merges it over the code
// defaults. Returns null when there is no override, so callers keep defaults.
export const getSiteContent = query({
  args: { key: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    if (!getSiteContentKind(args.key)) return null;
    const row = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return row?.data ?? null;
  },
});

// Admin: which keys currently have an override (used to show "customised").
export const listSiteContentOverrides = query({
  args: {},
  returns: v.array(
    v.object({
      key: v.string(),
      updatedAt: v.number(),
      updatedByEmail: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("siteContent").take(100);
    const known = new Set(SITE_CONTENT_OPTIONS.map((option) => option.key));
    return rows
      .filter((row) => known.has(row.key))
      .map((row) => ({
        key: row.key,
        updatedAt: row.updatedAt,
        updatedByEmail: row.updatedByEmail ?? null,
      }));
  },
});

export const upsertSiteContent = mutation({
  args: {
    key: v.string(),
    data: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const sanitized = sanitizeSiteContent(args.key, args.data);
    const now = Date.now();

    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: sanitized,
        updatedAt: now,
        updatedByAdminId: admin.userId,
        updatedByEmail: admin.email,
      });
    } else {
      await ctx.db.insert("siteContent", {
        key: args.key,
        data: sanitized,
        updatedAt: now,
        updatedByAdminId: admin.userId,
        updatedByEmail: admin.email,
      });
    }

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: existing ? "update" : "create",
      entityType: "siteContent",
      entityId: args.key,
      before: existing?.data,
      after: sanitized,
    });

    return null;
  },
});

export const resetSiteContent = mutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (!existing) return null;

    await ctx.db.delete(existing._id);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "delete",
      entityType: "siteContent",
      entityId: args.key,
      before: existing.data,
    });

    return null;
  },
});
