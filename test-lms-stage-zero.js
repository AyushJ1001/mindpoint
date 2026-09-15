const assert = require("node:assert/strict");
const fs = require("node:fs");

const emailDeliverySource = fs.readFileSync(
  "convex/_shared/emailDelivery.ts",
  "utf8",
);
const emailActionsSource = fs.readFileSync("convex/emailActions.ts", "utf8");
const whatsappSource = fs.readFileSync("lib/whatsapp.ts", "utf8");

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

console.log("LMS Stage 0 containment checks passed");
