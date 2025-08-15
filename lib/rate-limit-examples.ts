import { NextRequest, NextResponse } from "next/server";
import {
  withRateLimit,
  withStrictRateLimit,
  withAuthRateLimit,
} from "./with-rate-limit";
import { ratelimit } from "./rate-limit";

// Example 1: Basic rate limiting (10 requests per 10 seconds)
async function basicHandler() {
  // Your API logic here
  return NextResponse.json({ message: "Success" });
}

export const basicRoute = withRateLimit(basicHandler);

// Example 2: Strict rate limiting (5 requests per minute)
async function sensitiveHandler() {
  // Your sensitive API logic here
  return NextResponse.json({ message: "Sensitive operation completed" });
}

export const sensitiveRoute = withStrictRateLimit(sensitiveHandler);

// Example 3: Authentication rate limiting (3 requests per 5 minutes)
async function authHandler() {
  // Your authentication logic here
  return NextResponse.json({ message: "Authentication successful" });
}

export const authRoute = withAuthRateLimit(authHandler);

// Example 4: Custom rate limiting with specific options
async function customHandler() {
  // Your custom API logic here
  return NextResponse.json({ message: "Custom operation completed" });
}

export const customRoute = withRateLimit(customHandler, {
  limiter: ratelimit, // Use default limiter
  errorMessage:
    "Custom rate limit exceeded. Please try again in a few minutes.",
  statusCode: 429,
});

// Example 5: Different rate limits for different HTTP methods
async function getHandler() {
  return NextResponse.json({ data: "GET data" });
}

async function postHandler() {
  return NextResponse.json({ message: "POST successful" });
}

// GET requests: standard rate limit
export const GET = withRateLimit(getHandler);

// POST requests: strict rate limit
export const POST = withStrictRateLimit(postHandler);

// Example 6: Rate limiting with custom identifier
async function customIdentifierHandler(req: NextRequest) {
  // You can also implement custom rate limiting logic directly
  const userId = req.headers.get("x-user-id") || "anonymous";

  // Use the rate limiter directly for custom scenarios
  const result = await ratelimit.limit(userId);

  if (!result.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  return NextResponse.json({ message: "Success with custom identifier" });
}

export const customIdentifierRoute = customIdentifierHandler;
