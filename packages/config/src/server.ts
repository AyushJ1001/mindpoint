import "server-only";

import { readPublicEnv, type EnvSource } from "./env";

export function isClerkServerConfigured(env: EnvSource = process.env): boolean {
  return Boolean(
    readPublicEnv(env).clerkPublishableKey && env.CLERK_SECRET_KEY,
  );
}
