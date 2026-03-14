import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  createRateLimitHeaders,
  strictRatelimit,
  authRatelimit,
} from "./rate-limit";
import { Ratelimit } from "@upstash/ratelimit";

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

interface RateLimitOptions {
  limiter?: Ratelimit;
  errorMessage?: string;
  statusCode?: number;
}

export function withRateLimit(
  handler: ApiHandler,
  options: RateLimitOptions = {},
) {
  const {
    limiter,
    errorMessage = "Too many requests. Please try again later.",
    statusCode = 429,
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check rate limit
      const rateLimitResult = await checkRateLimit(req, limiter);

      // Add rate limit headers to response
      const headers = createRateLimitHeaders(
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset,
      );

      // If rate limit exceeded, return error response
      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            error: errorMessage,
            retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
          },
          {
            status: statusCode,
            headers: {
              ...headers,
              "Retry-After": Math.ceil(
                (rateLimitResult.reset - Date.now()) / 1000,
              ).toString(),
            },
          },
        );
      }

      // Call the original handler
      const response = await handler(req);

      // Add rate limit headers to successful response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error("Rate limiting error:", error);

      // If rate limiting fails, still allow the request to proceed
      // but log the error for monitoring
      return await handler(req);
    }
  };
}

// Convenience functions for different rate limit levels
export function withStrictRateLimit(handler: ApiHandler) {
  return withRateLimit(handler, {
    limiter: strictRatelimit,
    errorMessage: "Rate limit exceeded. Please wait before trying again.",
  });
}

export function withAuthRateLimit(handler: ApiHandler) {
  return withRateLimit(handler, {
    limiter: authRatelimit,
    errorMessage:
      "Too many authentication attempts. Please wait before trying again.",
  });
}
