import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizePhoneNumber } from "./lib/domain/phone";

test("an Indian mobile number becomes E.164", () => {
  assert.equal(normalizePhoneNumber("9876543210"), "+919876543210");
  assert.equal(normalizePhoneNumber("+91 98765 43210"), "+919876543210");
});

test("an international number is accepted", () => {
  assert.equal(normalizePhoneNumber("+14155552671"), "+14155552671");
  assert.equal(normalizePhoneNumber("+442071838750"), "+442071838750");
});

test("rubbish is rejected rather than stored", () => {
  assert.equal(normalizePhoneNumber("12345"), null);
  assert.equal(normalizePhoneNumber("not a phone"), null);
  assert.equal(normalizePhoneNumber(""), null);
  assert.equal(normalizePhoneNumber(undefined), null);
});
