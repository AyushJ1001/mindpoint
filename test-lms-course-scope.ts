import assert from "node:assert/strict";
import test from "node:test";
import {
  getLmsLearningMode,
  getLmsLearningModeLabel,
  isLmsCourseType,
} from "./convex/_shared/lmsCourseScope";

test("academic Course types receive the right LMS learning mode", () => {
  assert.equal(getLmsLearningMode("pre-recorded"), "self_paced");
  assert.equal(getLmsLearningMode("certificate"), "hybrid");
  assert.equal(getLmsLearningMode("diploma"), "cohort");
  assert.equal(getLmsLearningMode("internship"), "cohort");
  assert.equal(getLmsLearningMode("masterclass"), "event");
  assert.equal(getLmsLearningModeLabel("hybrid"), "Live + self-paced learning");
});

test("services and standalone resources stay outside the academic LMS", () => {
  for (const type of ["therapy", "supervised", "worksheet", "resume-studio"]) {
    assert.equal(isLmsCourseType(type), false);
  }
});

test("every LMS learning mode has release-desk copy", () => {
  assert.equal(getLmsLearningModeLabel("self_paced"), "Self-paced learning");
  assert.equal(getLmsLearningModeLabel("hybrid"), "Live + self-paced learning");
  assert.equal(getLmsLearningModeLabel("cohort"), "Cohort learning");
  assert.equal(getLmsLearningModeLabel("event"), "Live learning event");
});
