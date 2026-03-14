import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimiter = {
  limit(identifier: string): Promise<RateLimitResult>;
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRateLimitConfigured = Boolean(upstashUrl && upstashToken);

function createNoopLimiter(): RateLimiter {
  return {
    async limit() {
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: Date.now(),
      };
    },
  };
}

function createRateLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
): RateLimiter {
  if (!isRateLimitConfigured) {
    return createNoopLimiter();
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
}

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = createRateLimiter(10, "10 s", "@upstash/ratelimit");

// Create a more strict ratelimiter for sensitive endpoints
export const strictRatelimit = createRateLimiter(
  5,
  "1 m",
  "@upstash/ratelimit/strict",
);

// Create a very strict ratelimiter for authentication endpoints
export const authRatelimit = createRateLimiter(
  3,
  "5 m",
  "@upstash/ratelimit/auth",
);

// Helper function to get client identifier
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  // Use the first available IP, or fallback to a default
  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";

  return ip;
}

// Helper function to check rate limit
export async function checkRateLimit(
  req: Request,
  limiter: RateLimiter = ratelimit,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const identifier = getClientIdentifier(req);
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Helper function to create rate limit headers
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };
}
