import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createAdminAuditLog } from "./adminAudit";
import { requireAdmin } from "./adminAuth";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
} from "./_shared/result";

type AdminManagerFailure = ConvexFailure<
  "CONFLICT" | "NOT_FOUND" | "VALIDATION_ERROR"
>;

function adminManagerFailure(
  message: string,
  code:
    | "CONFLICT"
    | "NOT_FOUND"
    | "VALIDATION_ERROR" = convexResultErrorCode.VALIDATION_ERROR,
): AdminManagerFailure {
  return convexFailure({ code, message });
}

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
    const scanLimit = args.search
      ? Math.min(Math.max(limit * 12, 1000), 2000)
      : Math.min(Math.max(limit * 5, 500), 1000);

    const dbRows = await ctx.db
      .query("adminManagers")
      .withIndex("by_addedAt")
      .order("desc")
      .take(scanLimit);

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

      if (merged.has(mergeKey)) {
        continue;
      }

      const next = {
        key: mergeKey,
        clerkUserId: row.clerkUserId,
        adminEmail: normalizedEmail || undefined,
        adminName:
          row.adminName ||
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
      return adminManagerFailure("Valid email is required");
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
    if (!after) {
      return adminManagerFailure(
        "Admin access could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

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

    return convexSuccess({ admin: after });
  },
});

export const removeAdmin = mutation({
  args: {
    email: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const targetInput = args.email.trim();
    if (!targetInput) {
      return adminManagerFailure("Valid email or Clerk user ID is required");
    }

    const targetIsEmail = targetInput.includes("@");
    const targetEmail = targetIsEmail ? normalizeEmail(targetInput) : "";
    const targetClerkUserId = targetIsEmail
      ? ""
      : normalizeClerkUserId(targetInput);

    if (
      (targetIsEmail && normalizeEmail(admin.email) === targetEmail) ||
      (!targetIsEmail && admin.userId === targetClerkUserId)
    ) {
      return adminManagerFailure(
        "You cannot remove your own admin access.",
        convexResultErrorCode.CONFLICT,
      );
    }

    let existing = targetIsEmail
      ? await ctx.db
          .query("adminManagers")
          .withIndex("by_adminEmail", (q) => q.eq("adminEmail", targetEmail))
          .first()
      : null;

    if ((!existing || !existing.isActive) && targetClerkUserId) {
      existing = await ctx.db
        .query("adminManagers")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", targetClerkUserId),
        )
        .first();
    }

    if (!existing || !existing.isActive) {
      return adminManagerFailure(
        "Admin access is not active for this user.",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    if (
      admin.userId === existing.clerkUserId ||
      (!!admin.email && normalizeEmail(admin.email) === existing.adminEmail)
    ) {
      return adminManagerFailure(
        "You cannot remove your own admin access.",
        convexResultErrorCode.CONFLICT,
      );
    }

    const activeAdmins = await ctx.db
      .query("adminManagers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(2);

    if (activeAdmins.length <= 1) {
      return adminManagerFailure(
        "Cannot remove the last active admin. Add another admin first.",
        convexResultErrorCode.CONFLICT,
      );
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      isActive: false,
      removedAt: now,
      removedByAdminId: admin.userId,
      removedByEmail: admin.email,
      removalNote: args.reason,
    });

    const after = await ctx.db.get(existing._id);
    if (!after) {
      return adminManagerFailure(
        "Admin access could not be reloaded",
        convexResultErrorCode.NOT_FOUND,
      );
    }

    const entityId = existing.adminEmail ?? existing.clerkUserId ?? targetInput;

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "admin_access.revoke",
      entityType: "admin",
      entityId,
      before: existing,
      after,
      metadata: {
        source: "admin_manager",
        reason: args.reason,
      },
    });

    return convexSuccess({ admin: after });
  },
});
