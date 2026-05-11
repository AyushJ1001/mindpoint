export type EnvSource = Record<string, string | undefined>;

export type PublicEnv = {
  clerkPublishableKey?: string;
  convexUrl?: string;
  posthogHost?: string;
  posthogKey?: string;
  razorpayKeyId?: string;
  siteUrl?: string;
};

export function readPublicEnv(env: EnvSource = process.env): PublicEnv {
  return {
    clerkPublishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    convexUrl: env.NEXT_PUBLIC_CONVEX_URL,
    posthogHost: env.NEXT_PUBLIC_POSTHOG_HOST,
    posthogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    razorpayKeyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
  };
}

export function hasPublicConvexUrl(env: EnvSource = process.env): boolean {
  return Boolean(readPublicEnv(env).convexUrl);
}

export function hasClerkPublishableKey(env: EnvSource = process.env): boolean {
  return Boolean(readPublicEnv(env).clerkPublishableKey);
}

export function getSiteUrl(
  env: EnvSource = process.env,
  fallback = "https://www.themindpoint.org",
): string {
  return readPublicEnv(env).siteUrl || fallback;
}
