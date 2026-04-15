import { readPublicEnv, type EnvSource } from "./env";

/**
 * Whether Clerk middleware should run on the edge.
 * Uses only the publishable key so preview deployments still get session cookies
 * when `CLERK_SECRET_KEY` is present at runtime (required for full server auth).
 */
export function isClerkMiddlewareEnabled(
  env: EnvSource = process.env,
): boolean {
  return Boolean(readPublicEnv(env).clerkPublishableKey);
}
