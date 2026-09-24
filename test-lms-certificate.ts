import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  normalizeCertificateName,
  normalizeVerificationCode,
} from "./convex/_shared/lmsCertificate";

test("Certificate names are normalized and bounded", () => {
  assert.equal(normalizeCertificateName("  Aisha   Khan "), "Aisha Khan");
  assert.equal(normalizeCertificateName("डॉ. आशा"), "डॉ. आशा");
  assert.throws(() => normalizeCertificateName("x"), /between 2 and 120/);
  assert.throws(() => normalizeCertificateName("---"), /letter or number/);
});

test("Verification codes are canonical and reject unsafe input", () => {
  assert.equal(normalizeVerificationCode(" tmp-101-abcd "), "TMP-101-ABCD");
  assert.throws(() => normalizeVerificationCode("<script>"), /invalid/);
});

test("Issuance requires confirmed name and verification is consent controlled", () => {
  const completion = readFileSync("convex/lmsCompletion.ts", "utf8");
  const faculty = readFileSync("convex/lmsFaculty.ts", "utf8");
  const backend = readFileSync("convex/lms.ts", "utf8");

  assert.match(completion, /status: "awaiting_name"/);
  assert.match(faculty, /if \(!request\.confirmedRecipientName\)/);
  assert.match(faculty, /recipientName: request\.confirmedRecipientName/);
  assert.match(faculty, /publicVerificationEnabled: false/);
  assert.match(
    backend,
    /recipientName: certificate\.publicVerificationEnabled[\s\S]*\? certificate\.recipientName[\s\S]*: undefined/,
  );
});
