import assert from "node:assert/strict";
import test from "node:test";

import { toDateInputValue, withPreservedTime } from "./lib/admin-timezone";

// The live Diwali campaign fields, copied from the production course record.
const CAMPAIGN_START = "2026-10-30T12:47:53.630Z";
const CAMPAIGN_END = "2026-11-15T18:29:59.000Z";

test("a stored timestamp fills a date input with its day", () => {
  assert.equal(toDateInputValue(CAMPAIGN_START), "2026-10-30");
  assert.equal(toDateInputValue(CAMPAIGN_END), "2026-11-15");
});

test("a plain date and an empty field stay usable", () => {
  assert.equal(toDateInputValue("2026-06-05"), "2026-06-05");
  assert.equal(toDateInputValue(""), "");
  assert.equal(toDateInputValue(undefined), "");
});

test("changing the day keeps the campaign's time of day", () => {
  assert.equal(
    withPreservedTime("2026-11-20", CAMPAIGN_END, "end"),
    "2026-11-20T18:29:59.000Z",
  );
  assert.equal(
    withPreservedTime("2026-11-01", CAMPAIGN_START, "start"),
    "2026-11-01T12:47:53.630Z",
  );
});

test("a date with no stored time means the whole day in IST", () => {
  assert.equal(
    withPreservedTime("2026-11-20", "2026-11-15", "end"),
    "2026-11-20T23:59:59+05:30",
  );
  assert.equal(
    withPreservedTime("2026-11-20", undefined, "start"),
    "2026-11-20T00:00:00+05:30",
  );
});

test("an empty date clears the window rather than inventing one", () => {
  assert.equal(withPreservedTime("", CAMPAIGN_END, "end"), "");
});
