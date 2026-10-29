/* eslint-disable @typescript-eslint/no-explicit-any -- fake Convex context */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getCertificateFileUrl,
  getCourseResources,
  getMaterialUrl,
  listCertificatesForCourse,
  normalizeDriveUrl,
} from "./convex/lmsCourseContent";

type Row = Record<string, any> & { _id: string };

/**
 * The smallest Convex query surface these handlers use: table rows filtered by
 * the eq() pairs the handler asks for. Anything the handler does not touch is
 * absent on purpose, so a new dependency shows up as a failing test rather than
 * passing silently.
 */
function makeCtx(tables: Record<string, Row[]>, identity?: { subject: string; email?: string }) {
  const db = {
    get: async (id: string) =>
      Object.values(tables).flat().find((row) => row._id === id) ?? null,
    query: (table: string) => ({
      withIndex: (_index: string, build: (q: any) => any) => {
        const conditions: [string, unknown][] = [];
        const q = {
          eq: (field: string, value: unknown) => {
            conditions.push([field, value]);
            return q;
          },
        };
        build(q);
        const rows = (tables[table] ?? []).filter((row) =>
          conditions.every(([field, value]) => row[field] === value),
        );
        return {
          take: async (n: number) => rows.slice(0, n),
          collect: async () => rows,
          first: async () => rows[0] ?? null,
        };
      },
    }),
  };
  return {
    db,
    auth: { getUserIdentity: async () => (identity ? { ...identity, name: "Test" } : null) },
    storage: { getUrl: async (id: string) => `https://files.example/${id}` },
  } as any;
}

const COURSE = "course_1";
const OTHER_COURSE = "course_2";

function baseTables(): Record<string, Row[]> {
  return {
    courses: [
      { _id: COURSE, name: "CBT, REBT and CBMT", code: "CCCBT", type: "certificate" },
      { _id: OTHER_COURSE, name: "Other", code: "OTHER", type: "certificate" },
    ],
    enrollments: [
      {
        _id: "enr_a",
        userId: "user_a",
        courseId: COURSE,
        enrollmentNumber: "EN-1",
        userName: "Student A",
        status: "active",
      },
      {
        _id: "enr_b",
        userId: "user_b",
        courseId: COURSE,
        enrollmentNumber: "EN-2",
        userName: "Student B",
        status: "active",
      },
    ],
    lmsFacultyAssignments: [],
    lmsMaterials: [
      {
        _id: "mat_pub",
        courseId: COURSE,
        title: "Published notes",
        fileName: "notes.pdf",
        storageId: "storage_pub",
        published: true,
        uploadedBy: "faculty",
        createdAt: 1,
      },
      {
        _id: "mat_draft",
        courseId: COURSE,
        title: "Draft notes",
        fileName: "draft.pdf",
        storageId: "storage_draft",
        published: false,
        uploadedBy: "faculty",
        createdAt: 2,
      },
    ],
    lmsRecordings: [
      {
        _id: "rec_pub",
        courseId: COURSE,
        sessionLabel: "Week 1",
        driveUrl: "https://drive.google.com/file/d/abc/view",
        published: true,
        uploadedBy: "faculty",
        createdAt: 1,
      },
      {
        _id: "rec_draft",
        courseId: COURSE,
        sessionLabel: "Week 2",
        driveUrl: "https://drive.google.com/file/d/def/view",
        published: false,
        uploadedBy: "faculty",
        createdAt: 2,
      },
    ],
    lmsCertificateFiles: [
      {
        _id: "cert_a",
        enrollmentId: "enr_a",
        courseId: COURSE,
        userId: "user_a",
        storageId: "storage_cert_a",
        fileName: "student-a.pdf",
        status: "published",
        uploadedBy: "faculty",
        uploadedAt: 1,
      },
      {
        _id: "cert_b",
        enrollmentId: "enr_b",
        courseId: COURSE,
        userId: "user_b",
        storageId: "storage_cert_b",
        fileName: "student-b.pdf",
        status: "published",
        uploadedBy: "faculty",
        uploadedAt: 1,
      },
    ],
  };
}

test("a learner sees only a published subset of their own course", async () => {
  const ctx = makeCtx(baseTables(), { subject: "user_a" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });

  assert.ok(result);
  assert.equal(result.role, "student");
  assert.deepEqual(result.materials.map((m: any) => m._id), ["mat_pub"]);
  assert.deepEqual(result.recordings.map((r: any) => r._id), ["rec_pub"]);
  assert.equal(result.certificateFile?._id, "cert_a");
});

test("a learner enrolled elsewhere gets nothing for this course", async () => {
  const tables = baseTables();
  tables.enrollments[0].courseId = OTHER_COURSE;
  const ctx = makeCtx(tables, { subject: "user_a" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result, null);
});

test("a signed-out visitor gets nothing", async () => {
  const ctx = makeCtx(baseTables());
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result, null);
});

test("a learner cannot open another learner's certificate file", async () => {
  const ctx = makeCtx(baseTables(), { subject: "user_a" });
  const denied = await (getCertificateFileUrl as any)._handler(ctx, { fileId: "cert_b" });
  assert.equal(denied, null);

  const allowed = await (getCertificateFileUrl as any)._handler(ctx, { fileId: "cert_a" });
  assert.equal(allowed, "https://files.example/storage_cert_a");
});

test("a draft material is not downloadable by a learner", async () => {
  const ctx = makeCtx(baseTables(), { subject: "user_a" });
  assert.equal(await (getMaterialUrl as any)._handler(ctx, { materialId: "mat_pub" }), "https://files.example/storage_pub");
  assert.equal(await (getMaterialUrl as any)._handler(ctx, { materialId: "mat_draft" }), null);
});

test("faculty see drafts on their own course", async () => {
  const tables = baseTables();
  tables.lmsFacultyAssignments = [
    { _id: "fa_1", courseId: COURSE, facultyEmail: "teacher@example.com" },
  ];
  const ctx = makeCtx(tables, { subject: "user_teacher", email: "teacher@example.com" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result.role, "faculty");
  assert.deepEqual(result.materials.map((m: any) => m._id).sort(), ["mat_draft", "mat_pub"]);
});

test("only Google Drive https links are accepted as recordings", () => {
  assert.equal(
    normalizeDriveUrl("https://drive.google.com/file/d/abc/view"),
    "https://drive.google.com/file/d/abc/view",
  );
  assert.throws(() => normalizeDriveUrl("http://drive.google.com/file/d/abc/view"));
  assert.throws(() => normalizeDriveUrl("https://example.com/recording.mp4"));
  assert.throws(() => normalizeDriveUrl("not a url"));
});

test("a batch-scoped faculty member is limited to their batch", async () => {
  const tables = baseTables();
  tables.enrollments[0].batchId = "batch_a";
  tables.enrollments[1].batchId = "batch_b";
  tables.lmsFacultyAssignments = [
    { _id: "fa_2", courseId: COURSE, facultyEmail: "tutor@example.com", batchId: "batch_a" },
  ];
  tables.lmsMaterials[0].batchId = "batch_a";
  tables.lmsMaterials[1].batchId = "batch_b";
  tables.lmsCertificateFiles[1].batchId = "batch_b";

  const ctx = makeCtx(tables, { subject: "user_tutor", email: "tutor@example.com" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result.role, "faculty");
  assert.deepEqual(result.materials.map((m: any) => m._id), ["mat_pub"]);

  // Batch B's certificate is not theirs to open.
  assert.equal(
    await (getCertificateFileUrl as any)._handler(ctx, { fileId: "cert_b" }),
    null,
  );
});

test("inactive enrolments are not on the certificate desk", async () => {
  const tables = baseTables();
  tables.enrollments[1].status = "cancelled";
  tables.lmsFacultyAssignments = [
    { _id: "fa_3", courseId: COURSE, facultyEmail: "teacher@example.com" },
  ];
  const ctx = makeCtx(tables, { subject: "user_teacher", email: "teacher@example.com" });
  const rows = await (listCertificatesForCourse as any)._handler(ctx, { courseId: COURSE });
  assert.deepEqual(rows.map((row: any) => row.enrollmentId), ["enr_a"]);
});

test("a transferred enrollment cannot open course resources", async () => {
  const tables = baseTables();
  tables.enrollments[0].status = "transferred";
  const ctx = makeCtx(tables, { subject: "user_a" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result, null);
});

test("a cancelled enrollment cannot open course resources", async () => {
  const tables = baseTables();
  tables.enrollments[0].status = "cancelled";
  const ctx = makeCtx(tables, { subject: "user_a" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.equal(result, null);
});

test("an active enrollment still opens resources after a grandfathered past cohort", async () => {
  const tables = baseTables();
  tables.enrollments[0]._creationTime = Date.parse("2026-02-10");
  tables.lmsMaterials[0].published = true;
  const ctx = makeCtx(tables, { subject: "user_a" });
  const result = await (getCourseResources as any)._handler(ctx, { courseId: COURSE });
  assert.ok(result);
  assert.deepEqual(result.materials.map((m: any) => m._id), ["mat_pub"]);
});
