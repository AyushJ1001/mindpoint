import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

export async function createAdminAuditLog(
  ctx: MutationCtx,
  args: {
    actorAdminId: string;
    actorEmail?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    metadata?: unknown;
  },
) {
  await ctx.db.insert("adminAuditLogs", {
    actorAdminId: args.actorAdminId,
    actorEmail: args.actorEmail,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId,
    before: args.before,
    after: args.after,
    metadata: args.metadata,
    createdAt: Date.now(),
  });
}

export const listAuditLogs = query({
  args: {
    search: v.optional(v.string()),
    entityType: v.optional(v.string()),
    actorAdminId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);

    let rows = await ctx.db
      .query("adminAuditLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);

    if (args.entityType) {
      rows = rows.filter((row) => row.entityType === args.entityType);
    }

    if (args.actorAdminId) {
      rows = rows.filter((row) => row.actorAdminId === args.actorAdminId);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      rows = rows.filter((row) => {
        const parts = [
          row.action,
          row.entityType,
          row.entityId,
          row.actorEmail || "",
          row.actorAdminId,
        ];
        return parts.some((part) => part.toLowerCase().includes(search));
      });
    }

    return rows;
  },
});

export const logAuditEvent = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      before: args.before,
      after: args.after,
      metadata: args.metadata,
    });

    return { success: true };
  },
});
