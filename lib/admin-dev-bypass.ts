type EnvSource = Record<string, string | undefined>;

function isTruthy(value?: string) {
  return ["1", "true", "yes", "on"].includes(
    (value || "").trim().toLowerCase(),
  );
}

export function isAdminDevBypassEnabled(env: EnvSource = process.env): boolean {
  if (
    env.VERCEL_ENV === "production" ||
    isTruthy(env.ADMIN_DEV_BYPASS_DISABLED)
  ) {
    return false;
  }

  if (isTruthy(env.ADMIN_DEV_BYPASS)) {
    return true;
  }

  return (
    env.NODE_ENV === "development" ||
    env.VERCEL_ENV === "development" ||
    env.VERCEL_ENV === "preview"
  );
}

export function getAdminDevBypassIdentity() {
  return {
    userId: "dev-admin-bypass",
    email: "dev-admin-bypass@themindpoint.local",
    name: "Dev Admin Bypass",
  };
}
