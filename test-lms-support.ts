import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  canViewLmsQuestion,
  validateLmsQuestion,
} from "./convex/_shared/lmsDiscussion";

test("Question visibility keeps private and batch discussions scoped", () => {
  assert.equal(
    canViewLmsQuestion({
      authorTokenIdentifier: "student-a",
      viewerTokenIdentifier: "student-a",
      visibility: "private",
    }),
    true,
  );
  assert.equal(
    canViewLmsQuestion({
      authorTokenIdentifier: "student-a",
      viewerTokenIdentifier: "student-b",
      visibility: "private",
    }),
    false,
  );
  assert.equal(
    canViewLmsQuestion({
      authorTokenIdentifier: "student-a",
      viewerTokenIdentifier: "student-b",
      visibility: "batch",
      questionBatchId: "batch-1",
      viewerBatchId: "batch-2",
    }),
    false,
  );
  assert.equal(
    canViewLmsQuestion({
      authorTokenIdentifier: "student-a",
      viewerTokenIdentifier: "student-b",
      visibility: "course",
    }),
    true,
  );
});

test("Question text is normalized and bounded", () => {
  assert.equal(validateLmsQuestion("  Please help  "), "Please help");
  assert.throws(() => validateLmsQuestion("   "), /required/);
  assert.throws(() => validateLmsQuestion("x".repeat(2_001)), /2,000/);
});

test("Support outcomes create deep-linked in-app notifications", () => {
  const schema = readFileSync("convex/schema.ts", "utf8");
  const faculty = readFileSync("convex/lmsFaculty.ts", "utf8");
  assert.match(schema, /lmsNotifications: defineTable/);
  assert.match(schema, /by_recipientUserId_and_enrollmentId_and_createdAt/);
  assert.match(faculty, /kind: "question_answered"/);
  assert.match(faculty, /kind:\s*args\.decision === "accepted"/);
  assert.match(faculty, /kind: "completion_approved"/);
  assert.match(faculty, /href: "\/lms#lms-certificate"/);
});
