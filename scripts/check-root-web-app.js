#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_SCRIPTS = {
  dev: "next dev",
  build: "next build",
  start: "next start",
  lint: "eslint .",
  "type-check": "tsc --noEmit",
  "type-check:convex": "tsc --project convex/tsconfig.json --noEmit",
  doctor: "node scripts/check-root-web-app.js",
};

const REQUIRED_DEPENDENCIES = ["server-only", "client-only"];
const REQUIRED_PATHS = [
  "app/page.tsx",
  "convex/schema.ts",
  "next.config.ts",
  "proxy.ts",
  "tsconfig.json",
  ".env.example",
];
const FORBIDDEN_PATHS = ["apps/web", "apps/mobile", "packages/", "turbo.json"];
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

function parseJson(readText, file, messages) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    messages.push(`${file} must be valid JSON: ${error.message}`);
    return null;
  }
}

function checkRepositoryShape({ exists, readText, listFiles, env = {} }) {
  const messages = [];
  const files = listFiles();

  for (const requiredPath of REQUIRED_PATHS) {
    if (!exists(requiredPath)) {
      messages.push(`Missing required root web app file: ${requiredPath}`);
    }
  }

  for (const forbiddenPath of FORBIDDEN_PATHS) {
    if (
      exists(forbiddenPath) ||
      files.some(
        (file) => file === forbiddenPath || file.startsWith(forbiddenPath),
      )
    ) {
      messages.push(`Remove stale monorepo/mobile path: ${forbiddenPath}`);
    }
  }

  if (exists("middleware.ts") || exists("middleware.js")) {
    messages.push(
      "Use Next proxy.ts convention instead of deprecated middleware.ts",
    );
  }

  if (exists("package.json")) {
    const packageJson = parseJson(readText, "package.json", messages);
    if (packageJson) {
      if (packageJson.workspaces) {
        messages.push("package.json must not declare npm workspaces");
      }

      const scripts = packageJson.scripts ?? {};
      for (const [scriptName, expectedCommand] of Object.entries(
        REQUIRED_SCRIPTS,
      )) {
        if (scripts[scriptName] !== expectedCommand) {
          messages.push(
            `package.json script "${scriptName}" must be "${expectedCommand}"`,
          );
        }
      }

      for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
        if (
          /mobile|dev:web|build:turbo|turbo/.test(
            `${scriptName} ${scriptCommand}`,
          )
        ) {
          messages.push(
            `Remove stale script "${scriptName}" containing mobile/Turbo/web-workspace plumbing`,
          );
        }
      }

      const dependencies = packageJson.dependencies ?? {};
      for (const dependency of REQUIRED_DEPENDENCIES) {
        if (!dependencies[dependency]) {
          messages.push(`package.json dependencies must include ${dependency}`);
        }
      }

      if (packageJson.devDependencies?.turbo) {
        messages.push("Remove Turbo from package.json devDependencies");
      }
    }
  }

  if (exists("vercel.json")) {
    const vercelJson = parseJson(readText, "vercel.json", messages);
    if (vercelJson) {
      const vercelText = JSON.stringify(vercelJson);
      if (/apps\/web|build:turbo|turbo/i.test(vercelText)) {
        messages.push("Vercel config must not reference apps/web or Turbo");
      }
      if (vercelJson.outputDirectory !== ".next") {
        messages.push('Vercel outputDirectory must be ".next"');
      }
    }
  }

  for (const file of files) {
    const extension = path.extname(file);
    if (!TEXT_EXTENSIONS.has(extension)) {
      continue;
    }

    if (
      file.startsWith("node_modules/") ||
      file.startsWith(".next/") ||
      file.startsWith(".git/") ||
      file.startsWith("docs/obsolete/") ||
      file.startsWith("output/")
    ) {
      continue;
    }

    if (
      file === "scripts/check-root-web-app.js" ||
      file === "test-root-web-doctor.js"
    ) {
      continue;
    }

    const text = readText(file);
    if (text.includes("@mindpoint/")) {
      messages.push(`Replace stale @mindpoint workspace import in ${file}`);
    }
  }

  return { ok: messages.length === 0, messages };
}

function listRepoFiles(root) {
  const output = [];

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
      } else {
        output.push(relativePath);
      }
    }
  }

  walk("");
  return output;
}

function runCli() {
  const root = process.cwd();
  const result = checkRepositoryShape({
    exists: (relativePath) => fs.existsSync(path.join(root, relativePath)),
    readText: (relativePath) =>
      fs.readFileSync(path.join(root, relativePath), "utf8"),
    listFiles: () => listRepoFiles(root),
    env: process.env,
  });

  if (result.ok) {
    console.log("Root web app structure looks clean.");
    return;
  }

  console.error("Root web app structure check failed:");
  for (const message of result.messages) {
    console.error(`- ${message}`);
  }
  process.exitCode = 1;
}

if (require.main === module) {
  runCli();
}

module.exports = { checkRepositoryShape };
