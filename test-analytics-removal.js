const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const FORBIDDEN = /posthog/i;
const ALLOWED_FILES = new Set(["test-analytics-removal.js"]);
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
]);

function listTextFiles(root) {
  const files = [];

  function walk(relativeDir) {
    const absoluteDir = path.join(root, relativeDir);
    for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
      const relativePath = path
        .join(relativeDir, entry.name)
        .replaceAll(path.sep, "/");

      if (
        entry.name === ".git" ||
        entry.name === "node_modules" ||
        relativePath.startsWith(".next/") ||
        relativePath.startsWith("output/")
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(relativePath);
      } else if (TEXT_EXTENSIONS.has(path.extname(relativePath))) {
        files.push(relativePath);
      }
    }
  }

  walk("");
  return files;
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(packageJson.dependencies?.["posthog-js"], undefined);
assert.equal(packageJson.dependencies?.["posthog-node"], undefined);

const offenders = listTextFiles(process.cwd()).filter((file) => {
  if (ALLOWED_FILES.has(file)) {
    return false;
  }

  return FORBIDDEN.test(fs.readFileSync(file, "utf8"));
});

assert.deepEqual(offenders, []);

console.log("PostHog removal guard passed");
