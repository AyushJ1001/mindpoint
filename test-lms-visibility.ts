import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classifyEnrollment,
  enrollmentGrantsAccess,
  groupEnrollments,
} from "./lib/domain/lms-visibility";

test("a January 2027 certificate is current", () => {
  assert.deepEqual(
    classifyEnrollment({ startDate: "2027-01-19", courseType: "certificate" }),
    { section: "current", missingDate: false },
  );
});

test("a February 2027 PTSD cohort is current", () => {
  assert.equal(
    classifyEnrollment({ startDate: "2027-02-02", courseType: "certificate" })
      .section,
    "current",
  );
});

test("a November 2026 workshop is current", () => {
  assert.equal(
    classifyEnrollment({ startDate: "2026-11-01", courseType: "masterclass" })
      .section,
    "current",
  );
});

test("a July 2026 certificate is previous, not hidden", () => {
  assert.deepEqual(
    classifyEnrollment({ startDate: "2026-07-28", courseType: "certificate" }),
    { section: "previous", missingDate: false },
  );
});

test("an October 2026 workshop predates the event cutoff", () => {
  assert.equal(
    classifyEnrollment({ startDate: "2026-10-06", courseType: "masterclass" })
      .section,
    "previous",
  );
});

test("a worksheet is not treated as a live event", () => {
  assert.equal(
    classifyEnrollment({ startDate: "2026-12-01", courseType: "worksheet" })
      .section,
    "previous",
  );
});

test("a missing date keeps the enrollment and flags it", () => {
  assert.deepEqual(
    classifyEnrollment({ startDate: null, courseType: "certificate" }),
    { section: "previous", missingDate: true },
  );
});

test("nothing is dropped: every enrollment lands in a section", () => {
  const grouped = groupEnrollments([
    { startDate: "2027-01-19", courseType: "certificate" },
    { startDate: "2026-02-10", courseType: "certificate" },
    { startDate: null, courseType: "internship" },
  ]);
  assert.equal(grouped.current.length, 1);
  assert.equal(grouped.previous.length, 2);
  assert.equal(grouped.missingDates.length, 1);
});

test("a transferred enrollment grants no material access", () => {
  assert.equal(
    enrollmentGrantsAccess({ status: "transferred", startDate: "2027-01-19" }),
    false,
  );
  assert.equal(
    enrollmentGrantsAccess({ status: "active", startDate: "2027-01-19" }),
    true,
  );
});
