import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scoreLmsQuiz } from "./convex/_shared/lmsQuiz";

test("Quiz scoring uses a stable whole-number percentage", () => {
  assert.deepEqual(scoreLmsQuiz(3, 2, 67), { score: 67, passed: true });
  assert.deepEqual(scoreLmsQuiz(4, 2, 70), { score: 50, passed: false });
  assert.deepEqual(scoreLmsQuiz(1, 1, 100), { score: 100, passed: true });
});

test("Quiz scoring rejects invalid evidence", () => {
  assert.throws(() => scoreLmsQuiz(0, 0, 70), /at least one question/);
  assert.throws(() => scoreLmsQuiz(2, 3, 70), /outside the Quiz range/);
  assert.throws(() => scoreLmsQuiz(2, 1, 101), /between 0 and 100/);
});

test("Quiz attempts preserve evidence and keep correct answers server-side", () => {
  const schema = readFileSync("convex/schema.ts", "utf8");
  const backend = readFileSync("convex/lms.ts", "utf8");
  const student = readFileSync("components/lms/StudentLmsApp.tsx", "utf8");

  assert.match(schema, /lmsQuizAttempts: defineTable/);
  assert.match(schema, /lmsQuizAnswers: defineTable/);
  assert.match(backend, /export const submitQuizAttempt = mutation/);
  assert.match(backend, /action: "lms\.quiz_attempt\.submitted"/);
  assert.match(backend, /optionId: option\._id,[\s\S]*label: option\.label/);
  assert.doesNotMatch(
    student,
    /isCorrect/,
    "The Student UI must never receive or inspect the answer key",
  );
});
