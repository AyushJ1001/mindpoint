#!/usr/bin/env node
/**
 * Launch readiness check.
 *
 * Reads process.env plus .env.local (if present) and reports which required
 * environment variables are still missing. It cannot see the Convex
 * deployment's env vars, so it prints a reminder for those too.
 *
 *   npm run check:launch
 */
const fs = require("node:fs");
const path = require("node:path");

function loadDotEnvLocal() {
  const values = {};
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return values;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

const fileEnv = loadDotEnvLocal();
const get = (name) => process.env[name] ?? fileEnv[name];
const has = (name) => Boolean(get(name) && get(name) !== "");

const REQUIRED = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_JWT_ISSUER_DOMAIN",
  "CHECKOUT_SERVER_SECRET",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "TO_EMAIL",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_TOKEN",
];

const RECOMMENDED = [
  "NEXT_PUBLIC_SITE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const OPTIONAL = [
  "CAREERS_TO_EMAIL",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
  "GOOGLE_SHEETS_SPREADSHEET_ID",
  "GOOGLE_SHEETS_SHEET_NAME",
];

function report(title, names) {
  console.log(`\n${title}`);
  let missing = 0;
  for (const name of names) {
    const ok = has(name);
    if (!ok) missing += 1;
    console.log(`  ${ok ? "✓" : "✗"} ${name}`);
  }
  return missing;
}

console.log("MindPoint launch readiness\n==========================");
const missingRequired = report("Required", REQUIRED);
const missingRecommended = report("Recommended", RECOMMENDED);
report("Optional", OPTIONAL);

console.log("\nReminders");
if (get("CLERK_SKIP_KEY_VALIDATION") === "true") {
  console.log("  ! CLERK_SKIP_KEY_VALIDATION is true — set it to false in production.");
} else {
  console.log("  ✓ CLERK_SKIP_KEY_VALIDATION is not set to true");
}
console.log(
  "  • These must ALSO be set in the Convex deployment env:",
  "CLERK_JWT_ISSUER_DOMAIN, CHECKOUT_SERVER_SECRET, RESEND_API_KEY,",
  "NEXT_PUBLIC_SITE_URL, UPSTASH_REDIS_REST_URL/TOKEN, GOOGLE_*",
);
console.log("  • Deploy Convex before the Next app: npx convex deploy --prod");
console.log("  • Seed the first admin row in the adminManagers table.");
console.log("\nSee docs/go-live-2027.md for the full ordered runbook.");

if (missingRequired > 0) {
  console.log(`\n${missingRequired} required variable(s) missing.`);
} else {
  console.log("\nAll required variables are present.");
}
if (missingRecommended > 0) {
  console.log(`${missingRecommended} recommended variable(s) missing.`);
}
