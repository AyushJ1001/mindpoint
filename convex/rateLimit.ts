import { action } from "./_generated/server";
import { v } from "convex/values";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiters for Convex functions
export const convexRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/convex",
});

export const convexStrictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/convex/strict",
});

export const convexEmailRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "5 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/convex/email",
});

// Helper function to check rate limit in Convex actions
export async function checkConvexRateLimit(
  identifier: string,
  limiter: Ratelimit = convexRatelimit,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Example action with rate limiting
export const rateLimitedAction = action({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Use a unique identifier (could be user ID, IP, etc.)
    const identifier = "example-user-id";

    // Check rate limit
    const rateLimitResult = await checkConvexRateLimit(identifier);

    if (!rateLimitResult.success) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      );
    }

    // Your action logic here
    console.log("Action executed successfully");

    return null;
  },
});

// Higher-order function to wrap actions with rate limiting
export function withConvexRateLimit<T extends any[], R>(
  actionFn: (...args: T) => Promise<R>,
  limiter: Ratelimit = convexRatelimit,
  getIdentifier: (...args: T) => string,
) {
  return async (...args: T): Promise<R> => {
    const identifier = getIdentifier(...args);
    const rateLimitResult = await checkConvexRateLimit(identifier, limiter);

    if (!rateLimitResult.success) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
      );
    }

    return actionFn(...args);
  };
}
