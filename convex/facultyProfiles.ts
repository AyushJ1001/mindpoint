import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { createAdminAuditLog } from "./adminAudit";

// Faculty profiles, held back until the owner supplies verified details.
// Every profile is created unpublished; publishing is a deliberate admin act,
// and the public query only ever returns published rows.

const MAX_TEXT = 2000;

function cleanList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db
      .query("facultyProfiles")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(200);

    return await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        photoUrl: profile.photoStorageId
          ? await ctx.storage.getUrl(profile.photoStorageId)
          : null,
      })),
    );
  },
});

/** Public: published profiles only, optionally for one course. */
export const listPublished = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("facultyProfiles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(100);

    const filtered = args.courseId
      ? profiles.filter((profile) =>
          (profile.courseIds ?? []).some(
            (courseId) => String(courseId) === String(args.courseId),
          ),
        )
      : profiles;

    return await Promise.all(
      filtered.map(async (profile) => ({
        _id: profile._id,
        name: profile.name,
        role: profile.role ?? null,
        qualifications: profile.qualifications,
        experience: profile.experience ?? null,
        registrationBody: profile.registrationBody ?? null,
        registrationNumber: profile.registrationNumber ?? null,
        bio: profile.bio ?? null,
        photoUrl: profile.photoStorageId
          ? await ctx.storage.getUrl(profile.photoStorageId)
          : null,
        courseIds: (profile.courseIds ?? []).map(String),
      })),
    );
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfile = mutation({
  args: {
    profileId: v.optional(v.id("facultyProfiles")),
    name: v.string(),
    role: v.optional(v.string()),
    qualifications: v.array(v.string()),
    experience: v.optional(v.string()),
    registrationBody: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    courseIds: v.optional(v.array(v.id("courses"))),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) {
      return { error: "A name is required" as const };
    }
    const bio = args.bio?.trim();
    if (bio && bio.length > MAX_TEXT) {
      return { error: "That biography is too long" as const };
    }
    if (args.published && cleanList(args.qualifications).length === 0) {
      return {
        error:
          "Add at least one verified qualification before publishing a profile" as const,
      };
    }

    const now = Date.now();
    const fields = {
      name,
      role: args.role?.trim() || undefined,
      qualifications: cleanList(args.qualifications),
      experience: args.experience?.trim() || undefined,
      registrationBody: args.registrationBody?.trim() || undefined,
      registrationNumber: args.registrationNumber?.trim() || undefined,
      bio: bio || undefined,
      photoStorageId: args.photoStorageId,
      courseIds: args.courseIds,
      published: args.published,
      updatedAt: now,
      updatedByAdminId: admin.userId,
    };

    if (args.profileId) {
      const existing = await ctx.db.get(args.profileId);
      if (!existing) return { error: "Profile not found" as const };
      await ctx.db.patch(args.profileId, fields);
      await createAdminAuditLog(ctx, {
        actorAdminId: admin.userId,
        actorEmail: admin.email,
        action: "faculty_profile.update",
        entityType: "facultyProfile",
        entityId: String(args.profileId),
        before: existing,
        after: { ...existing, ...fields },
      });
      return { profileId: args.profileId };
    }

    const profileId = await ctx.db.insert("facultyProfiles", {
      ...fields,
      createdAt: now,
      createdByAdminId: admin.userId,
    });
    await createAdminAuditLog(ctx, {
      actorAdminId: admin.userId,
      actorEmail: admin.email,
      action: "faculty_profile.create",
      entityType: "facultyProfile",
      entityId: String(profileId),
      after: { ...fields, createdAt: now },
    });
    return { profileId };
  },
});
