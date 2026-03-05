export function getAdminUserIdSet(): Set<string> {
  const value = process.env.ADMIN_CLERK_USER_IDS || "";
  return new Set(
    value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminUserId(userId?: string | null): boolean {
  if (!userId) return false;
  return getAdminUserIdSet().has(userId);
}
