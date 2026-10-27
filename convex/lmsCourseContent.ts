import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";

// Materials, recordings and manual certificate files for certificate courses
// and internships.
//
// Access model, enforced server-side on every read:
//   - a learner sees published rows for a course they are enrolled in;
//   - a faculty member sees and writes rows for the courses they are assigned
//     to (matched on the email Clerk puts on the identity);
//   - an admin can do everything.
//
// Certificate files are per student: the download URL is only minted after the
// caller is proven to be that student, their faculty or an admin, so a guessed
// storage id is not enough on its own. Introduction courses are untouched —
// they keep their existing delivery.

const MAX_TITLE = 140;
const MAX_SESSION = 120;

function normalizeEmail(value?: string | null): string | undefined {
  const email = value?.trim().toLowerCase();
  return email ? email : undefined;
}

function isActiveEnrollment(enrollment: Doc<"enrollments">): boolean {
  if (enrollment.status === "cancelled") return false;
  return (enrollment.status ?? "active") === "active";
}

async function loadIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return {
    userId: identity?.subject ?? null,
    email: normalizeEmail(identity?.email),
  };
}

async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  try {
    await requireAdmin(ctx);
    return true;
  } catch {
    return false;
  }
}

/**
 * What a faculty member may touch on a course.
 *
 * `null` means the whole course (an assignment with no batch, or an admin).
 * Otherwise these are the batch ids they are assigned to, and they only see and
 * write rows for those batches — a batch-scoped tutor does not get the rest of
 * the cohort.
 */
async function facultyBatchScope(
  ctx: QueryCtx | MutationCtx,
  courseId: Id<"courses">,
  email?: string,
): Promise<{ scoped: false } | { scoped: true; batchIds: string[] } | null> {
  if (!email) return null;
  const assignments = await ctx.db
    .query("lmsFacultyAssignments")
    .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
    .take(200);
  const mine = assignments.filter(
    (assignment) => normalizeEmail(assignment.facultyEmail) === email,
  );
  if (mine.length === 0) return null;
  if (mine.some((assignment) => !assignment.batchId)) return { scoped: false };
  return {
    scoped: true,
    batchIds: mine
      .map((assignment) => assignment.batchId)
      .filter((id): id is NonNullable<typeof id> => Boolean(id))
      .map(String),
  };
}

function inScope(
  scope: { scoped: false } | { scoped: true; batchIds: string[] },
  row: { batchId?: Id<"courseBatches"> | null },
): boolean {
  if (!scope.scoped) return true;
  return Boolean(row.batchId) && scope.batchIds.includes(String(row.batchId));
}

async function getEnrollmentForCourse(
  ctx: QueryCtx | MutationCtx,
  courseId: Id<"courses">,
  userId: string,
): Promise<Doc<"enrollments"> | null> {
  const rows = await ctx.db
    .query("enrollments")
    .withIndex("by_userId_and_courseId", (q) =>
      q.eq("userId", userId).eq("courseId", courseId),
    )
    .take(20);
  return rows.find(isActiveEnrollment) ?? null;
}

async function assertCanManage(
  ctx: MutationCtx,
  courseId: Id<"courses">,
): Promise<{ userId: string; role: "admin" | "faculty" }> {
  const { userId, email } = await loadIdentity(ctx);
  if (!userId) throw new Error("Unauthenticated");
  if (await facultyBatchScope(ctx, courseId, email)) {
    return { userId, role: "faculty" };
  }
  await requireAdmin(ctx);
  return { userId, role: "admin" };
}

function cleanTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new Error("A title is required");
  if (title.length > MAX_TITLE) throw new Error("That title is too long");
  return title;
}

/** Only Google Drive links: anything else is not a recording we can support. */
export function normalizeDriveUrl(value: string): string {
  const trimmed = value.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Enter a full https link");
  }
  if (url.protocol !== "https:") {
    throw new Error("Recordings must use https");
  }
  const host = url.hostname.toLowerCase();
  if (host !== "drive.google.com" && host !== "docs.google.com") {
    throw new Error("Only Google Drive links are supported");
  }
  return url.toString();
}

export const getCourseResources = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const { userId, email } = await loadIdentity(ctx);
    const admin = userId ? await isAdmin(ctx) : false;
    const facultyScope =
      userId && email ? await facultyBatchScope(ctx, args.courseId, email) : null;
    const faculty = Boolean(facultyScope);
    const enrollment = userId
      ? await getEnrollmentForCourse(ctx, args.courseId, userId)
      : null;

    if (!admin && !faculty && !enrollment) return null;

    const canManage = admin || faculty;

    const materials = await ctx.db
      .query("lmsMaterials")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .take(200);
    const recordings = await ctx.db
      .query("lmsRecordings")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .take(200);

    const visibleMaterials = materials
      .filter((material) => canManage || material.published)
      .filter(
        (material) =>
          admin || !facultyScope || inScope(facultyScope, material),
      )
      .sort((a, b) => (a.week ?? 99) - (b.week ?? 99) || a.createdAt - b.createdAt)
      .map((material) => ({
        _id: material._id,
        title: material.title,
        week: material.week,
        fileName: material.fileName,
        published: material.published,
        createdAt: material.createdAt,
      }));

    const visibleRecordings = recordings
      .filter((recording) => canManage || recording.published)
      .filter(
        (recording) =>
          admin || !facultyScope || inScope(facultyScope, recording),
      )
      .sort((a, b) => (a.week ?? 99) - (b.week ?? 99) || a.createdAt - b.createdAt)
      .map((recording) => ({
        _id: recording._id,
        sessionLabel: recording.sessionLabel,
        week: recording.week,
        driveUrl: recording.driveUrl,
        published: recording.published,
        createdAt: recording.createdAt,
      }));

    const certificateFile = enrollment
      ? await ctx.db
          .query("lmsCertificateFiles")
          .withIndex("by_enrollmentId", (q) =>
            q.eq("enrollmentId", enrollment._id),
          )
          .take(20)
          .then((rows) => rows.find((row) => row.status === "published") ?? null)
      : null;

    return {
      course: {
        _id: course._id,
        name: course.name,
        code: course.code,
        type: course.type,
      },
      role: admin ? ("admin" as const) : faculty ? ("faculty" as const) : ("student" as const),
      enrollmentId: enrollment?._id ?? null,
      materials: visibleMaterials,
      recordings: visibleRecordings,
      certificateFile: certificateFile
        ? {
            _id: certificateFile._id,
            fileName: certificateFile.fileName,
            uploadedAt: certificateFile.uploadedAt,
          }
        : null,
    };
  },
});

/** A short-lived download URL, after the caller is authorised for that file. */
export const getMaterialUrl = query({
  args: { materialId: v.id("lmsMaterials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) return null;
    const { userId, email } = await loadIdentity(ctx);
    if (!userId) return null;

    const admin = await isAdmin(ctx);
    const scope = await facultyBatchScope(ctx, material.courseId, email);
    const faculty = Boolean(scope) && inScope(scope!, material);
    const enrolled = await getEnrollmentForCourse(ctx, material.courseId, userId);
    if (!admin && !faculty && !enrolled) return null;
    if (!material.published && !admin && !faculty) return null;

    return await ctx.storage.getUrl(material.storageId);
  },
});

export const getCertificateFileUrl = query({
  args: { fileId: v.id("lmsCertificateFiles") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file || file.status !== "published") return null;
    const { userId, email } = await loadIdentity(ctx);
    if (!userId) return null;

    const admin = await isAdmin(ctx);
    const own = file.userId === userId;
    const scope = await facultyBatchScope(ctx, file.courseId, email);
    let faculty = false;
    if (scope && !scope.scoped) {
      faculty = true;
    } else if (scope && scope.scoped) {
      const enrollment = await ctx.db.get(file.enrollmentId);
      faculty = Boolean(enrollment?.batchId) &&
        scope.batchIds.includes(String(enrollment?.batchId));
    }
    if (!own && !admin && !faculty) return null;

    return await ctx.storage.getUrl(file.storageId);
  },
});

export const generateUploadUrl = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await assertCanManage(ctx, args.courseId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateCertificateUploadUrl = mutation({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    await assertCanManage(ctx, enrollment.courseId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMaterial = mutation({
  args: {
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    week: v.optional(v.number()),
    title: v.string(),
    fileName: v.string(),
    mimeType: v.optional(v.string()),
    storageId: v.id("_storage"),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await assertCanManage(ctx, args.courseId);
    const { email } = await loadIdentity(ctx);
    const scope = await facultyBatchScope(ctx, args.courseId, email);
    if (scope && scope.scoped && !inScope(scope, { batchId: args.batchId })) {
      throw new Error("You can only add material for your own batch");
    }
    const now = Date.now();
    const id = await ctx.db.insert("lmsMaterials", {
      courseId: args.courseId,
      batchId: args.batchId,
      week: args.week,
      title: cleanTitle(args.title),
      fileName: args.fileName,
      mimeType: args.mimeType,
      storageId: args.storageId,
      published: args.published,
      uploadedBy: actor.userId,
      createdAt: now,
      updatedAt: now,
    });
    return { materialId: id };
  },
});

export const setMaterialPublished = mutation({
  args: { materialId: v.id("lmsMaterials"), published: v.boolean() },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) throw new Error("Material not found");
    await assertCanManage(ctx, material.courseId);
    await ctx.db.patch(material._id, {
      published: args.published,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const saveRecording = mutation({
  args: {
    courseId: v.id("courses"),
    batchId: v.optional(v.id("courseBatches")),
    week: v.optional(v.number()),
    sessionLabel: v.string(),
    driveUrl: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actor = await assertCanManage(ctx, args.courseId);
    const { email } = await loadIdentity(ctx);
    const scope = await facultyBatchScope(ctx, args.courseId, email);
    if (scope && scope.scoped && !inScope(scope, { batchId: args.batchId })) {
      throw new Error("You can only add recordings for your own batch");
    }
    const label = args.sessionLabel.trim();
    if (!label) throw new Error("A session label is required");
    if (label.length > MAX_SESSION) throw new Error("That label is too long");

    const now = Date.now();
    const id = await ctx.db.insert("lmsRecordings", {
      courseId: args.courseId,
      batchId: args.batchId,
      week: args.week,
      sessionLabel: label,
      driveUrl: normalizeDriveUrl(args.driveUrl),
      published: args.published,
      uploadedBy: actor.userId,
      createdAt: now,
      updatedAt: now,
    });
    return { recordingId: id };
  },
});

export const setRecordingPublished = mutation({
  args: { recordingId: v.id("lmsRecordings"), published: v.boolean() },
  handler: async (ctx, args) => {
    const recording = await ctx.db.get(args.recordingId);
    if (!recording) throw new Error("Recording not found");
    await assertCanManage(ctx, recording.courseId);
    await ctx.db.patch(recording._id, {
      published: args.published,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/** Manual, per-student certificate upload. Replacing keeps the old row. */
export const uploadCertificateFile = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    const actor = await assertCanManage(ctx, enrollment.courseId);

    const now = Date.now();
    const previous = await ctx.db
      .query("lmsCertificateFiles")
      .withIndex("by_enrollmentId", (q) =>
        q.eq("enrollmentId", args.enrollmentId),
      )
      .take(50)
      .then((rows) => rows.filter((row) => row.status === "published"));

    const fileId = await ctx.db.insert("lmsCertificateFiles", {
      enrollmentId: enrollment._id,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      storageId: args.storageId,
      fileName: args.fileName,
      status: "published",
      uploadedBy: actor.userId,
      uploadedAt: now,
    });

    for (const row of previous) {
      await ctx.db.patch(row._id, {
        status: "replaced",
        replacedAt: now,
        replacedByFileId: fileId,
      });
    }

    return { fileId };
  },
});

export const listCertificatesForCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const { userId, email } = await loadIdentity(ctx);
    if (!userId) return [];
    const admin = await isAdmin(ctx);
    const scope = await facultyBatchScope(ctx, args.courseId, email);
    if (!admin && !scope) throw new Error("Not allowed");

    const allEnrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .take(500);
    const enrollments = allEnrollments
      .filter(isActiveEnrollment)
      .filter(
        (enrollment) =>
          admin || !scope || !scope.scoped || inScope(scope, enrollment),
      );

    const files = await ctx.db
      .query("lmsCertificateFiles")
      .withIndex("by_courseId_and_status", (q) =>
        q.eq("courseId", args.courseId).eq("status", "published"),
      )
      .take(500);

    const byEnrollment = new Map(files.map((file) => [String(file.enrollmentId), file]));

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment._id,
      batchId: enrollment.batchId ?? null,
      userId: enrollment.userId,
      userName: enrollment.userName ?? null,
      enrollmentNumber: enrollment.enrollmentNumber,
      status: enrollment.status ?? "active",
      certificate: byEnrollment.get(String(enrollment._id))
        ? {
            fileId: byEnrollment.get(String(enrollment._id))!._id,
            fileName: byEnrollment.get(String(enrollment._id))!.fileName,
            uploadedAt: byEnrollment.get(String(enrollment._id))!.uploadedAt,
          }
        : null,
    }));
  },
});
