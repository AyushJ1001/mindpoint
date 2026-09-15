import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  anonymousFeedbackDelayMs,
  summarizeLmsFeedback,
  validateAnonymousMinimumGroupSize,
  validateLmsFeedbackInput,
} from "./convex/_shared/lmsFeedback";

test("Feedback input accepts a bounded rating and normalizes comments", () => {
  assert.deepEqual(validateLmsFeedbackInput(4, "  Calm and clear.  "), {
    rating: 4,
    comment: "Calm and clear.",
  });
  assert.deepEqual(validateLmsFeedbackInput(1, "   "), {
    rating: 1,
    comment: undefined,
  });
  assert.throws(() => validateLmsFeedbackInput(0, ""), /rating from 1 to 5/);
  assert.throws(
    () => validateLmsFeedbackInput(5, "x".repeat(1_501)),
    /1,500 characters or fewer/,
  );
});

test("Anonymous reports enforce a real minimum group", () => {
  assert.equal(validateAnonymousMinimumGroupSize(3), 3);
  assert.equal(validateAnonymousMinimumGroupSize(50), 50);
  assert.throws(() => validateAnonymousMinimumGroupSize(2), /between 3 and 50/);
  assert.deepEqual(summarizeLmsFeedback([5, 4, 4]), {
    responseCount: 3,
    averageRating: 4.3,
  });
  const delay = anonymousFeedbackDelayMs("receipt-seed");
  assert.ok(delay >= 60_000 && delay <= 300_000);
});

test("Anonymous response evidence contains no Student or Enrollment link", () => {
  const schema = readFileSync("convex/schema.ts", "utf8");
  const backend = readFileSync("convex/lms.ts", "utf8");

  assert.match(schema, /lmsFeedbackResponses: defineTable/);
  assert.match(schema, /lmsFeedbackReceipts: defineTable/);
  const anonymousWriter = backend.slice(
    backend.indexOf("export const recordAnonymousFeedback"),
    backend.indexOf("export const submitFeedback"),
  );
  assert.match(anonymousWriter, /recordAnonymousFeedback = internalMutation/);
  assert.doesNotMatch(
    anonymousWriter,
    /enrollmentId|submittedAt/,
    "The delayed anonymous writer must receive no identifying or exact-time field",
  );
  assert.match(backend, /internal\.lms\.recordAnonymousFeedback/);
  assert.match(
    backend,
    /entityId:[\s\S]*activity\.feedbackMode === "anonymous"[\s\S]*\? receiptId[\s\S]*: \(responseId \?\? receiptId\)/,
    "Anonymous audits must reference the separate receipt, never the response",
  );
});
