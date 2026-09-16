export type DeploymentEnv = Record<string, string | undefined>;

export const DEFAULT_PREVIEW_CONVEX_URL =
  "https://healthy-wolf-897.convex.cloud";

export function resolveConvexUrlForBuild(
  env: DeploymentEnv = process.env,
): string | undefined {
  if (env.VERCEL_ENV === "preview") {
    return env.NEXT_PUBLIC_CONVEX_PREVIEW_URL || DEFAULT_PREVIEW_CONVEX_URL;
  }

  return env.NEXT_PUBLIC_CONVEX_URL;
}
