import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createAdminAuditLog } from "./adminAudit";
import { requireAdmin } from "./adminAuth";

function normalizeClerkUserId(input: string): string {
  return input.trim();
}

function normalizeEmail(input?: string): string {
  return (input || "").trim().toLowerCase();
}

function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || email;
  const words = localPart
    .split(/[._-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.join(" ") || email;
}

export const isUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject
      ? normalizeClerkUserId(identity.subject)
      : "";
    const email = normalizeEmail(identity?.email);

    if (!userId && !email) {
      return false;
    }

    if (userId) {
      const managedAdminById = await ctx.db
        .query("adminManagers")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", userId))
        .first();
      if (managedAdminById?.isActive) {
        return true;
      }
    }

    if (email) {
      const managedAdminByEmail = await ctx.db
        .query("adminManagers")
        .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
        .first();
      if (managedAdminByEmail?.isActive) {
        return true;
      }
    }

    return false;
  },
});

export const listAdmins = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 200, 500);

    const dbRows = await ctx.db
      .query("adminManagers")
      .withIndex("by_addedAt")
      .order("desc")
      .take(1000);

    const merged = new Map<
      string,
      {
        key: string;
        clerkUserId?: string;
        adminEmail?: string;
        adminName: string;
        isDatabaseAdmin: boolean;
        hasAccess: boolean;
        note?: string;
        addedAt?: number;
        addedByAdminId?: string;
        addedByEmail?: string;
        removedAt?: number;
        removedByAdminId?: string;
        removedByEmail?: string;
      }
    >();

    for (const row of dbRows) {
      const normalizedEmail = normalizeEmail(row.adminEmail);
      const mergeKey = row.clerkUserId
        ? `clerk:${row.clerkUserId}`
        : normalizedEmail
          ? `email:${normalizedEmail}`
          : `db:${row._id}`;

      const existing = merged.get(mergeKey);
      const next = {
        key: mergeKey,
        clerkUserId: row.clerkUserId,
        adminEmail: normalizedEmail || undefined,
        adminName:
          row.adminName ||
          existing?.adminName ||
          (normalizedEmail
            ? deriveNameFromEmail(normalizedEmail)
            : row.clerkUserId || "Unknown Admin"),
        isDatabaseAdmin: row.isActive,
        hasAccess: row.isActive,
        note: row.note,
        addedAt: row.addedAt,
        addedByAdminId: row.addedByAdminId,
        addedByEmail: row.addedByEmail,
        removedAt: row.removedAt,
        removedByAdminId: row.removedByAdminId,
        removedByEmail: row.removedByEmail,
      };
      merged.set(mergeKey, next);
    }

    let admins = Array.from(merged.values());

    if (args.search) {
      const search = args.search.toLowerCase();
      admins = admins.filter((row) =>
        [
          row.adminName,
          row.adminEmail ?? "",
          row.clerkUserId ?? "",
          row.addedByEmail ?? "",
          row.note ?? "",
        ].some((part) => part.toLowerCase().includes(search)),
      );
    }

    admins.sort((a, b) => {
      if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
      const aAdded = a.addedAt ?? 0;
      const bAdded = b.addedAt ?? 0;
      if (aAdded !== bAdded) return bAdded - aAdded;
      return a.adminName.localeCompare(b.adminName);
    });

    return {
      viewerAdminId: admin.userId,
      viewerAdminEmail: normalizeEmail(admin.email),
      admins: admins.slice(0, limit),
    };
  },
});

export const addAdminByEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    const existing = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    const before = existing;
    const now = Date.now();
    const adminName = args.name?.trim() || deriveNameFromEmail(email);

    if (existing) {
      await ctx.db.patch(existing._id, {
        isActive: true,
        adminName,
        note: args.note ?? existing.note,
        addedAt: now,
        addedByAdminId: admin.userId,
        addedByEmail: admin.email,
        removedAt: undefined,
        removedByAdminId: undefined,
        removedByEmail: undefined,
      });
    } else {
      await ctx.db.insert("adminManagers", {
        adminEmail: email,
        adminName,
        isActive: true,
        note: args.note,
        addedAt: now,
        addedByAdminId: admin.userId,
        addedByEmail: admin.email,
      });
    }

    const after = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "admin_access.grant",
      entityType: "admin",
      entityId: email,
      before,
      after,
      metadata: {
        source: "admin_manager",
        wasExistingRecord: !!before,
      },
    });

    return after;
  },
});

export const removeAdmin = mutation({
  args: {
    email: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const email = normalizeEmail(args.email);
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    if (normalizeEmail(admin.email) === email) {
      throw new Error("You cannot remove your own admin access.");
    }

    const existing = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    if (!existing || !existing.isActive) {
      throw new Error("Admin access is not active for this user.");
    }

    if (admin.userId === existing.clerkUserId) {
      throw new Error("You cannot remove your own admin access.");
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      isActive: false,
      removedAt: now,
      removedByAdminId: admin.userId,
      removedByEmail: admin.email,
      note: args.reason ?? existing.note,
    });

    const after = await ctx.db
      .query("adminManagers")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", email))
      .first();

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "admin_access.revoke",
      entityType: "admin",
      entityId: email,
      before: existing,
      after,
      metadata: {
        source: "admin_manager",
        reason: args.reason,
      },
    });

    return after;
  },
});
