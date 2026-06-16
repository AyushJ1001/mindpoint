const assert = require("node:assert/strict");

const { checkRepositoryShape } = require("./scripts/check-root-web-app");

function runCase(name, files, options = {}) {
  const result = checkRepositoryShape({
    exists: (path) => Boolean(files[path]),
    readText: (path) => {
      if (!(path in files)) {
        throw new Error(`Missing fixture file: ${path}`);
      }
      return files[path];
    },
    listFiles: () => Object.keys(files),
    env: options.env ?? {},
  });

  return { name, ...result };
}

const validPackage = JSON.stringify({
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "eslint .",
    "type-check": "tsc --noEmit",
    "type-check:convex": "tsc --project convex/tsconfig.json --noEmit",
    doctor: "node scripts/check-root-web-app.js",
  },
  dependencies: {
    "server-only": "^0.0.1",
    "client-only": "^0.0.1",
  },
});

const validFiles = {
  "package.json": validPackage,
  "tsconfig.json": JSON.stringify({ compilerOptions: {}, include: [] }),
  "next.config.ts": "export default {};",
  "proxy.ts": "export function proxy() { return null; }",
  "vercel.json": JSON.stringify({
    buildCommand: "NEXT_TELEMETRY_DISABLED=1 npm run build",
    outputDirectory: ".next",
  }),
  ".env.example": "NEXT_PUBLIC_CONVEX_URL=\n",
  "app/page.tsx": "export default function Page() { return null; }",
  "convex/schema.ts": "export default {};",
  "lib/domain/cart.ts": "export const x = 1;",
  "scripts/check-root-web-app.js": "",
};

const passing = runCase("valid root web app", validFiles, {
  env: { NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud" },
});

assert.equal(passing.ok, true, passing.messages.join("\n"));

const failing = runCase("stale monorepo leftovers", {
  ...validFiles,
  "apps/web/app/page.tsx": "",
  "apps/mobile/package.json": "{}",
  "packages/domain/package.json": "{}",
  "turbo.json": "{}",
  "package.json": JSON.stringify({
    workspaces: ["apps/*", "packages/*"],
    scripts: {
      dev: "npm-run-all --parallel dev:web dev:mobile",
      "type-check:mobile": "turbo run type-check --filter=@mindpoint/mobile",
    },
    dependencies: {},
  }),
  "vercel.json": JSON.stringify({
    buildCommand: "npm run build:turbo",
    outputDirectory: "apps/web/.next",
  }),
  "app/page.tsx": "import { api } from '@mindpoint/backend/api';",
});

assert.equal(failing.ok, false);
assert.match(failing.messages.join("\n"), /apps\/web/);
assert.match(failing.messages.join("\n"), /apps\/mobile/);
assert.match(failing.messages.join("\n"), /packages\//);
assert.match(failing.messages.join("\n"), /turbo/);
assert.match(failing.messages.join("\n"), /@mindpoint/);
assert.match(failing.messages.join("\n"), /server-only/);
assert.match(failing.messages.join("\n"), /Vercel/);

const deprecatedMiddleware = runCase("deprecated middleware convention", {
  ...validFiles,
  "middleware.ts": "export default function middleware() {}",
});

assert.equal(deprecatedMiddleware.ok, false);
assert.match(deprecatedMiddleware.messages.join("\n"), /proxy\.ts/);

console.log("root web doctor tests passed");
