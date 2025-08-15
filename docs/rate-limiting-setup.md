# Rate Limiting Setup with Upstash

This project uses Upstash Redis for rate limiting across API routes. The setup provides flexible rate limiting with different levels of protection.

## Prerequisites

1. **Upstash Account**: Sign up at [upstash.com](https://upstash.com)
2. **Redis Database**: Create a Redis database in your Upstash dashboard
3. **Environment Variables**: Add the following to your `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

4. **Convex Environment Variables**: Add the same variables to your Convex project:

```bash
# Using Convex CLI
npx convex env set UPSTASH_REDIS_REST_URL "your_redis_rest_url"
npx convex env set UPSTASH_REDIS_REST_TOKEN "your_redis_rest_token"

# Or add them via the Convex Dashboard
```

## Rate Limiting Levels

### 1. Standard Rate Limit

- **Limit**: 10 requests per 10 seconds
- **Use Case**: General API endpoints
- **Implementation**: `withRateLimit()`

### 2. Strict Rate Limit

- **Limit**: 5 requests per minute
- **Use Case**: Sensitive operations, form submissions
- **Implementation**: `withStrictRateLimit()`

### 3. Authentication Rate Limit

- **Limit**: 3 requests per 5 minutes
- **Use Case**: Login attempts, password resets
- **Implementation**: `withAuthRateLimit()`

## Usage Examples

### Next.js API Routes

#### Basic Implementation

```typescript
import { withRateLimit } from "@/lib/with-rate-limit";

async function myApiHandler(req: NextRequest) {
  // Your API logic here
  return NextResponse.json({ message: "Success" });
}

export const POST = withRateLimit(myApiHandler);
```

### Convex Functions

#### Rate Limiting in Actions

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkConvexRateLimit, convexEmailRatelimit } from "./rateLimit";

export const rateLimitedAction = action({
  args: {
    userEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Use email as identifier for rate limiting
    const identifier = `email:${args.userEmail}`;

    // Check rate limit before proceeding
    const rateLimitResult = await checkConvexRateLimit(
      identifier,
      convexEmailRatelimit,
    );

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
```

#### Wrapping Existing Actions

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { checkConvexRateLimit, convexEmailRatelimit } from "./rateLimit";

export const sendEmailWithRateLimit = action({
  args: {
    userEmail: v.string(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check rate limit
    const identifier = `email:${args.userEmail}`;
    const rateLimitResult = await checkConvexRateLimit(
      identifier,
      convexEmailRatelimit,
    );

    if (!rateLimitResult.success) {
      throw new Error(`Email rate limit exceeded for ${args.userEmail}`);
    }

    // Call original email function
    await ctx.runAction(api.emailActions.sendTestEmail, {
      userEmail: args.userEmail,
    });

    return null;
  },
});
```

### Strict Rate Limiting

```typescript
import { withStrictRateLimit } from "@/lib/with-rate-limit";

async function sensitiveHandler(req: NextRequest) {
  // Sensitive operation logic
  return NextResponse.json({ message: "Operation completed" });
}

export const POST = withStrictRateLimit(sensitiveHandler);
```

### Convex Strict Rate Limiting

```typescript
import { checkConvexRateLimit, convexStrictRatelimit } from "./rateLimit";

// Use strict rate limiting for sensitive operations
const rateLimitResult = await checkConvexRateLimit(
  identifier,
  convexStrictRatelimit,
);
```

### Custom Rate Limiting

```typescript
import { withRateLimit } from "@/lib/with-rate-limit";
import { ratelimit } from "@/lib/rate-limit";

async function customHandler(req: NextRequest) {
  // Custom logic
  return NextResponse.json({ message: "Custom operation" });
}

export const POST = withRateLimit(customHandler, {
  limiter: ratelimit,
  errorMessage: "Custom rate limit exceeded",
  statusCode: 429,
});
```

### Different Limits for Different Methods

```typescript
import { withRateLimit, withStrictRateLimit } from "@/lib/with-rate-limit";

async function getHandler(req: NextRequest) {
  return NextResponse.json({ data: "GET data" });
}

async function postHandler(req: NextRequest) {
  return NextResponse.json({ message: "POST successful" });
}

// GET: standard rate limit
export const GET = withRateLimit(getHandler);

// POST: strict rate limit
export const POST = withStrictRateLimit(postHandler);
```

## Response Headers

Rate-limited responses include the following headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying

## Error Response Format

When rate limit is exceeded:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

## Custom Rate Limiters

You can create custom rate limiters for specific use cases:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const customLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 requests per hour
  analytics: true,
  prefix: "@upstash/ratelimit/custom",
});
```

## Monitoring

Rate limiting analytics are enabled by default. You can monitor rate limiting activity in your Upstash dashboard.

## Best Practices

1. **Choose Appropriate Limits**: Use stricter limits for sensitive operations
2. **Custom Error Messages**: Provide clear, user-friendly error messages
3. **Monitor Usage**: Regularly check rate limiting analytics
4. **Graceful Degradation**: Ensure your app handles rate limit errors gracefully
5. **Testing**: Test rate limiting in development with different scenarios

## Troubleshooting

### Rate Limiting Not Working

1. Check environment variables are set correctly
2. Verify Upstash Redis connection
3. Check browser console for errors

### Too Many False Positives

1. Adjust rate limit thresholds
2. Check if you're behind a proxy/load balancer
3. Verify IP detection logic

### Performance Issues

1. Monitor Redis connection performance
2. Consider using connection pooling for high-traffic applications
3. Check Upstash dashboard for any service issues
