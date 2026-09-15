const assert = require("node:assert/strict");
const fs = require("node:fs");

const emailDeliverySource = fs.readFileSync(
  "convex/_shared/emailDelivery.ts",
  "utf8",
);
const emailActionsSource = fs.readFileSync("convex/emailActions.ts", "utf8");
const whatsappSource = fs.readFileSync("lib/whatsapp.ts", "utf8");
const lmsSource = fs.readFileSync("convex/lms.ts", "utf8");
const lmsPageSource = fs.readFileSync(
  "components/lms/StudentLmsApp.tsx",
  "utf8",
);
const facultyLmsSource = fs.readFileSync("convex/lmsFaculty.ts", "utf8");
const adminLmsSource = fs.readFileSync("convex/lmsAdmin.ts", "utf8");

assert.doesNotMatch(
  emailDeliverySource,
  /contact\.themindpoint@gmail\.com/i,
  "Transactional email delivery must not silently add the shared inbox",
);
assert.match(
  emailDeliverySource,
  /export async function sendEmail\(/,
  "The delivery helper should describe direct delivery, not hidden copies",
);
assert.doesNotMatch(
  `${emailDeliverySource}\n${emailActionsSource}`,
  /sendEmailWithCopy/,
  "The old copy-producing helper name must not remain",
);
assert.match(
  whatsappSource,
  /async sendMessage\(_message: WhatsAppMessage\): Promise<boolean> \{\s*return false;\s*\}/s,
  "The placeholder WhatsApp sender must fail closed",
);
assert.doesNotMatch(
  whatsappSource,
  /console\.(?:debug|info|log)\(/,
  "Disabled WhatsApp delivery must not log message details",
);
assert.match(
  lmsSource,
  /export const listMyLmsEnrollments = query\(/,
  "The Student LMS must derive its Enrollment list from the authenticated backend",
);
assert.match(
  lmsSource,
  /instructions: availability\.isAvailable[\s\S]*content: availability\.isAvailable[\s\S]*externalUrl: availability\.isAvailable/,
  "Locked activities must not expose instructions, content, or External resource URLs",
);
assert.match(
  lmsPageSource,
  /studentLmsApi\.setSelfCompletion/,
  "The Student workspace must persist eligible activity completion",
);
assert.match(
  lmsPageSource,
  /visibility: "private"/,
  "The initial Student question flow must remain private",
);
assert.match(
  facultyLmsSource,
  /by_courseId_and_facultyTokenIdentifier[\s\S]*identity\.tokenIdentifier/,
  "Faculty record access must derive scoped assignments from the authenticated identity",
);
assert.match(
  facultyLmsSource,
  /assignment\[permission\]/,
  "Faculty mutations must enforce the specific assigned permission",
);
assert.match(
  facultyLmsSource,
  /lms\.submission\.\$\{args\.decision\}/,
  "Faculty evidence decisions must create an audit event",
);
assert.match(
  facultyLmsSource,
  /by_courseId_and_batchId_and_status/,
  "Faculty work must be bounded inside assigned Course or batch scope",
);
assert.match(
  facultyLmsSource,
  /export const approveCompletion = mutation\(/,
  "Faculty with Completion permission must have an authoritative approval mutation",
);
assert.match(
  facultyLmsSource,
  /lms\.completion\.approved/,
  "Completion and Certificate issuance must create an audit event",
);
assert.match(
  adminLmsSource,
  /await requireAdmin\(ctx\)/,
  "The LMS Release desk backend must require Administrator access",
);

console.log("LMS Stage 0 containment checks passed");
