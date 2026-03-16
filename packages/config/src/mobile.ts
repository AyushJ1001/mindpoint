import type { PublicEnv } from "./env";

type ExpoExtra = {
  publicEnv?: Partial<Record<keyof PublicEnv, string | undefined>>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function readExpoPublicEnv(extra: unknown): PublicEnv {
  const extraRecord = asRecord(extra);
  const publicEnv = asRecord(extraRecord?.publicEnv) as ExpoExtra["publicEnv"];

  return {
    clerkPublishableKey: asString(publicEnv?.clerkPublishableKey),
    convexUrl: asString(publicEnv?.convexUrl),
    posthogHost: asString(publicEnv?.posthogHost),
    posthogKey: asString(publicEnv?.posthogKey),
    razorpayKeyId: asString(publicEnv?.razorpayKeyId),
    siteUrl: asString(publicEnv?.siteUrl),
  };
}
