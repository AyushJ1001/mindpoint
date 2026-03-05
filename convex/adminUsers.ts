import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, normalizeEnrollmentStatus } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

function toUserKey(row: {
  userId: string;
  isGuestUser?: boolean;
  userEmail?: string;
}) {
  if (row.isGuestUser || row.userId.includes("@")) {
    return `guest:${(row.userEmail || row.userId).toLowerCase()}`;
  }
  return `clerk:${row.userId}`;
}

function parseUserKey(
  userKey: string,
): { kind: "guest"; id: string } | { kind: "clerk"; id: string } {
  if (userKey.startsWith("guest:")) {
    return { kind: "guest", id: userKey.slice("guest:".length) };
  }
  if (userKey.startsWith("clerk:")) {
    return { kind: "clerk", id: userKey.slice("clerk:".length) };
  }

  if (userKey.includes("@")) {
    return { kind: "guest", id: userKey.toLowerCase() };
  }

  return { kind: "clerk", id: userKey };
}

const USER_DETAIL_LIMIT = 500;

export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 200, 500);
    const userScanLimit = 3000;
    const enrollmentScanLimit = 3000;
    const pointsScanLimit = 3000;
    const [guestUsers, enrollments, pointsRows] = await Promise.all([
      ctx.db.query("guestUsers").order("desc").take(userScanLimit),
      ctx.db.query("enrollments").order("desc").take(enrollmentScanLimit),
      ctx.db.query("mindPoints").order("desc").take(pointsScanLimit),
    ]);

    const pointsMap = new Map(pointsRows.map((row) => [row.clerkUserId, row]));

    const rows = new Map<
      string,
      {
        userKey: string;
        userId: string;
        kind: "guest" | "clerk";
        displayName: string;
        email?: string;
        phone?: string;
        enrollmentCount: number;
        activeEnrollmentCount: number;
        latestEnrollmentAt: number;
        mindPointsBalance?: number;
      }
    >();

    for (const guest of guestUsers) {
      const userKey = `guest:${guest.email.toLowerCase()}`;
      rows.set(userKey, {
        userKey,
        userId: guest.email,
        kind: "guest",
        displayName: guest.name,
        email: guest.email,
        phone: guest.phone,
        enrollmentCount: 0,
        activeEnrollmentCount: 0,
        latestEnrollmentAt: 0,
      });
    }

    for (const enrollment of enrollments) {
      const userKey = toUserKey(enrollment);
      const parsed = parseUserKey(userKey);
      const existing = rows.get(userKey);

      const next = existing ?? {
        userKey,
        userId: parsed.id,
        kind: parsed.kind,
        displayName:
          enrollment.userName || enrollment.userEmail || enrollment.userId,
        email: enrollment.userEmail,
        phone: enrollment.userPhone,
        enrollmentCount: 0,
        activeEnrollmentCount: 0,
        latestEnrollmentAt: 0,
        mindPointsBalance:
          parsed.kind === "clerk"
            ? (pointsMap.get(parsed.id)?.balance ?? 0)
            : undefined,
      };

      next.enrollmentCount += 1;
      if (normalizeEnrollmentStatus(enrollment.status) === "active") {
        next.activeEnrollmentCount += 1;
      }
      next.latestEnrollmentAt = Math.max(
        next.latestEnrollmentAt,
        enrollment._creationTime,
      );

      if (!next.email && enrollment.userEmail)
        next.email = enrollment.userEmail;
      if (!next.phone && enrollment.userPhone)
        next.phone = enrollment.userPhone;
      if (!next.displayName && enrollment.userName)
        next.displayName = enrollment.userName;

      rows.set(userKey, next);
    }

    let users = Array.from(rows.values());

    if (args.search) {
      const search = args.search.toLowerCase();
      users = users.filter((row) => {
        const parts = [
          row.displayName,
          row.userId,
          row.email ?? "",
          row.phone ?? "",
          row.userKey,
        ];
        return parts.some((part) => part.toLowerCase().includes(search));
      });
    }

    users.sort((a, b) => b.latestEnrollmentAt - a.latestEnrollmentAt);
    return users.slice(0, limit);
  },
});

export const getUserDetail = query({
  args: {
    userKey: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const parsed = parseUserKey(args.userKey);

    if (parsed.kind === "guest") {
      const [guestUser, enrollments] = await Promise.all([
        ctx.db
          .query("guestUsers")
          .withIndex("by_email", (q) => q.eq("email", parsed.id))
          .first(),
        ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", parsed.id))
          .order("desc")
          .take(USER_DETAIL_LIMIT),
      ]);

      return {
        userKey: args.userKey,
        kind: "guest" as const,
        id: parsed.id,
        guestUser,
        enrollments: enrollments.map((row) => ({
          ...row,
          status: normalizeEnrollmentStatus(row.status),
        })),
        userProfile: null,
        mindPoints: null,
        coupons: [],
        referralRewards: [],
      };
    }

    const [enrollments, userProfile, mindPoints, coupons, referralRewards] =
      await Promise.all([
        ctx.db
          .query("enrollments")
          .withIndex("by_userId", (q) => q.eq("userId", parsed.id))
          .order("desc")
          .take(USER_DETAIL_LIMIT),
        ctx.db
          .query("userProfiles")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", parsed.id))
          .first(),
        ctx.db
          .query("mindPoints")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", parsed.id))
          .first(),
        ctx.db
          .query("coupons")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", parsed.id))
          .order("desc")
          .take(100),
        ctx.db
          .query("referralRewards")
          .withIndex("by_referrerClerkUserId", (q) =>
            q.eq("referrerClerkUserId", parsed.id),
          )
          .order("desc")
          .take(USER_DETAIL_LIMIT),
      ]);

    return {
      userKey: args.userKey,
      kind: "clerk" as const,
      id: parsed.id,
      guestUser: null,
      enrollments: enrollments.map((row) => ({
        ...row,
        status: normalizeEnrollmentStatus(row.status),
      })),
      userProfile,
      mindPoints,
      coupons,
      referralRewards,
    };
  },
});

export const updateUserAppData = mutation({
  args: {
    userKey: v.string(),
    displayName: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const parsed = parseUserKey(args.userKey);

    if (parsed.kind === "guest") {
      const existingGuest = await ctx.db
        .query("guestUsers")
        .withIndex("by_email", (q) => q.eq("email", parsed.id))
        .first();

      const before = existingGuest;

      if (existingGuest) {
        await ctx.db.patch(existingGuest._id, {
          name: args.displayName ?? existingGuest.name,
          phone: args.phone ?? existingGuest.phone,
        });
      } else {
        await ctx.db.insert("guestUsers", {
          name: args.displayName ?? "Guest User",
          email: parsed.id,
          phone: args.phone ?? "",
        });
      }

      const after = await ctx.db
        .query("guestUsers")
        .withIndex("by_email", (q) => q.eq("email", parsed.id))
        .first();

      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "user.update_guest",
        entityType: "user",
        entityId: args.userKey,
        before,
        after,
      });

      return after;
    }

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", parsed.id))
      .first();

    const beforeProfile = existingProfile;

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        whatsappNumber:
          args.whatsappNumber !== undefined
            ? args.whatsappNumber
            : existingProfile.whatsappNumber,
      });
    } else if (args.whatsappNumber !== undefined) {
      await ctx.db.insert("userProfiles", {
        clerkUserId: parsed.id,
        whatsappNumber: args.whatsappNumber,
      });
    }

    const ENROLLMENT_PATCH_LIMIT = 500;
    let updatedEnrollments = 0;

    if (args.displayName !== undefined || args.phone !== undefined) {
      const enrollments = await ctx.db
        .query("enrollments")
        .withIndex("by_userId", (q) => q.eq("userId", parsed.id))
        .order("desc")
        .take(ENROLLMENT_PATCH_LIMIT);

      for (const enrollment of enrollments) {
        const patch: { userName?: string; userPhone?: string } = {};

        if (
          args.displayName !== undefined &&
          enrollment.userName !== args.displayName
        ) {
          patch.userName = args.displayName;
        }
        if (args.phone !== undefined && enrollment.userPhone !== args.phone) {
          patch.userPhone = args.phone;
        }

        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(enrollment._id, patch);
          updatedEnrollments += 1;
        }
      }
    }

    const afterProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", parsed.id))
      .first();

    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "user.update_clerk",
      entityType: "user",
      entityId: args.userKey,
      before: beforeProfile,
      after: afterProfile,
      metadata: {
        displayName: args.displayName,
        phone: args.phone,
      },
    });

    return {
      userProfile: afterProfile,
      updatedEnrollments,
    };
  },
});
