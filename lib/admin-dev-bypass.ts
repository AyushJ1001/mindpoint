type EnvSource = Record<string, string | undefined>;

function isTruthy(value?: string) {
  return ["1", "true", "yes", "on"].includes(
    (value || "").trim().toLowerCase(),
  );
}

export function isAdminDevBypassEnabled(env: EnvSource = process.env): boolean {
  if (
    env.VERCEL_ENV === "production" ||
    env.CONVEX_DEPLOYMENT?.startsWith("prod:") ||
    isTruthy(env.ADMIN_DEV_BYPASS_DISABLED)
  ) {
    return false;
  }

  const hasDevBackendSignal =
    env.NODE_ENV === "development" ||
    env.VERCEL_ENV === "development" ||
    env.VERCEL_ENV === "preview" ||
    env.CONVEX_DEPLOYMENT?.startsWith("dev:");

  return isTruthy(env.ADMIN_DEV_BYPASS) && Boolean(hasDevBackendSignal);
}

export function getAdminDevBypassIdentity() {
  return {
    userId: "dev-admin-bypass",
    email: "dev-admin-bypass@themindpoint.local",
    name: "Dev Admin Bypass",
  };
}
