import assert from "node:assert/strict";
import test from "node:test";
import { resolveConvexUrlForBuild } from "./lib/config/deployment";

test("preview builds use the isolated development Convex deployment", () => {
  assert.equal(
    resolveConvexUrlForBuild({
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_CONVEX_URL: "https://production.convex.cloud",
    }),
    "https://healthy-wolf-897.convex.cloud",
  );
});

test("production builds keep the configured production Convex deployment", () => {
  assert.equal(
    resolveConvexUrlForBuild({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_CONVEX_URL: "https://production.convex.cloud",
    }),
    "https://production.convex.cloud",
  );
});

test("an explicit preview URL overrides the project default", () => {
  assert.equal(
    resolveConvexUrlForBuild({
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_CONVEX_PREVIEW_URL: "https://custom-preview.convex.cloud",
      NEXT_PUBLIC_CONVEX_URL: "https://production.convex.cloud",
    }),
    "https://custom-preview.convex.cloud",
  );
});
