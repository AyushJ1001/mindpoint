import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

const auditPayloadValidator = v.record(v.string(), v.any());
const MAX_AUDIT_DEPTH = 4;
const MAX_AUDIT_KEYS = 50;
const MAX_AUDIT_ARRAY_LENGTH = 50;
const MAX_AUDIT_STRING_LENGTH = 2000;

function sanitizeAuditValue(value: unknown, depth = 0): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > MAX_AUDIT_STRING_LENGTH
      ? `${value.slice(0, MAX_AUDIT_STRING_LENGTH)}...[truncated]`
      : value;
  }

  if (depth >= MAX_AUDIT_DEPTH) {
    return "[truncated]";
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_AUDIT_ARRAY_LENGTH)
      .map((item) => sanitizeAuditValue(item, depth + 1));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, MAX_AUDIT_KEYS)
        .map(([key, nestedValue]) => [
          key,
          sanitizeAuditValue(nestedValue, depth + 1),
        ]),
    );
  }

  return String(value);
}

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
    before: sanitizeAuditValue(args.before),
    after: sanitizeAuditValue(args.after),
    metadata: sanitizeAuditValue(args.metadata),
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
    const scanLimit = args.search
      ? Math.min(Math.max(limit * 12, 1500), 5000)
      : Math.min(Math.max(limit * 5, 500), 2000);

    const baseQuery =
      args.entityType && args.actorAdminId
        ? ctx.db
            .query("adminAuditLogs")
            .withIndex("by_entityType_and_actorAdminId", (q) =>
              q
                .eq("entityType", args.entityType!)
                .eq("actorAdminId", args.actorAdminId!),
            )
        : args.entityType
          ? ctx.db
              .query("adminAuditLogs")
              .withIndex("by_entityType", (q) =>
                q.eq("entityType", args.entityType!),
              )
          : args.actorAdminId
            ? ctx.db
                .query("adminAuditLogs")
                .withIndex("by_actorAdminId", (q) =>
                  q.eq("actorAdminId", args.actorAdminId!),
                )
            : ctx.db.query("adminAuditLogs").withIndex("by_createdAt");

    let rows = await baseQuery.order("desc").take(scanLimit);

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

    return rows.slice(0, limit);
  },
});

export const logAuditEvent = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    before: v.optional(auditPayloadValidator),
    after: v.optional(auditPayloadValidator),
    metadata: v.optional(auditPayloadValidator),
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
