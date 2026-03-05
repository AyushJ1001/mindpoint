import "server-only";

import { currentUser } from "@clerk/nextjs/server";

function normalizeEmail(email?: string | null): string | undefined {
  const normalized = (email || "").trim().toLowerCase();
  return normalized || undefined;
}

function readEmailFromClaims(sessionClaims: unknown): string | undefined {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return undefined;
  }

  const claims = sessionClaims as Record<string, unknown>;
  const email =
    (typeof claims.email === "string" && claims.email) ||
    (typeof claims.email_address === "string" && claims.email_address) ||
    undefined;

  return normalizeEmail(email);
}

export async function resolveAuthEmail(
  sessionClaims: unknown,
): Promise<string | undefined> {
  const claimEmail = readEmailFromClaims(sessionClaims);
  if (claimEmail) {
    return claimEmail;
  }

  const user = await currentUser();
  if (!user) {
    return undefined;
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress || user.emailAddresses[0]?.emailAddress;

  return normalizeEmail(primaryEmail);
}
