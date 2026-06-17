# Effect Boundary Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce Effect TS at backend boundary surfaces so expected failures are typed, converted into stable result/error DTOs, and handled at route edges.

**Architecture:** Add shared Effect data structures under `lib/effect/`, keep public JSON response contracts stable, and migrate Next API routes first. Convex functions are a second phase because their return/error shapes are consumed broadly by admin and checkout UI.

**Tech Stack:** Next.js App Router, TypeScript, Convex, Zod, Effect `3.21.3`, Node `node:test` run through `tsx`.

**Progress:** Tasks 1-5 have been implemented through the Next API boundary migration and the `redeemPoints` Convex pilot. Task 6 has been expanded across the checkout, payment, email, Mind Points, admin course, admin review, admin manager, offer, bundle, loyalty, and public review surfaces. Checkout attempt mutations now return serializable Convex results with legacy normalization at the service boundary, rate-limited email actions return tagged results, and payment action service wrappers expose typed Effect implementations. The Next root convention has also moved from `middleware.ts` to `proxy.ts`. The remaining unmigrated Convex work is concentrated in the large enrollment-management/admin recovery, Google Sheets, email-template, and legacy checkout internals.

---

### Task 1: Add Effect Dependency And Boundary Test Harness

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `test-effect-boundary.ts`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm install effect@3.21.3
npm install --save-dev tsx
```

Expected: `package.json` contains production dependency `"effect": "^3.21.3"` and dev dependency `"tsx"`.

- [ ] **Step 2: Write the failing boundary data test**

Create `test-effect-boundary.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { Effect } from "effect";
import {
  BoundaryResult,
  BoundaryValidationError,
  boundaryErrorToHttp,
  runApiEffect,
} from "./lib/effect";

test("BoundaryResult creates tagged success and failure data", () => {
  const success = BoundaryResult.Success({ value: { ok: true } });
  const failure = BoundaryResult.Failure({
    error: new BoundaryValidationError({ message: "Invalid input." }),
  });

  assert.equal(success._tag, "Success");
  assert.deepEqual(success.value, { ok: true });
  assert.equal(failure._tag, "Failure");
  assert.equal(failure.error._tag, "BoundaryValidationError");
});

test("boundaryErrorToHttp maps validation errors to public JSON", () => {
  const http = boundaryErrorToHttp(
    new BoundaryValidationError({
      message: "Missing payment verification fields.",
      details: { fields: ["razorpaySignature"] },
    }),
  );

  assert.equal(http.status, 400);
  assert.deepEqual(http.body, {
    success: false,
    error: "Missing payment verification fields.",
    code: "VALIDATION_ERROR",
    details: { fields: ["razorpaySignature"] },
  });
});

test("runApiEffect converts failed effects into NextResponse JSON", async () => {
  const response = await runApiEffect(
    Effect.fail(new BoundaryValidationError({ message: "Bad body." })),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Bad body.",
    code: "VALIDATION_ERROR",
  });
});
```

- [ ] **Step 3: Run the test and confirm RED**

Run:

```bash
npx tsx --test test-effect-boundary.ts
```

Expected: FAIL because `./lib/effect` does not exist.

### Task 2: Add Shared Effect Boundary Data Structures

**Files:**

- Create: `lib/effect/errors.ts`
- Create: `lib/effect/result.ts`
- Create: `lib/effect/http.ts`
- Create: `lib/effect/index.ts`

- [ ] **Step 1: Implement typed boundary errors**

Create `lib/effect/errors.ts` with `Data.TaggedError` classes:

```ts
import { Data } from "effect";
import { ZodError } from "zod";

export class BoundaryValidationError extends Data.TaggedError(
  "BoundaryValidationError",
)<{
  readonly message: string;
  readonly details?: unknown;
  readonly cause?: unknown;
}> {}

export class BoundaryUnauthorizedError extends Data.TaggedError(
  "BoundaryUnauthorizedError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class BoundaryForbiddenError extends Data.TaggedError(
  "BoundaryForbiddenError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class BoundaryConflictError extends Data.TaggedError(
  "BoundaryConflictError",
)<{
  readonly message: string;
  readonly details?: unknown;
  readonly cause?: unknown;
}> {}

export class BoundaryConfigurationError extends Data.TaggedError(
  "BoundaryConfigurationError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class BoundaryExternalServiceError extends Data.TaggedError(
  "BoundaryExternalServiceError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class BoundaryUnexpectedError extends Data.TaggedError(
  "BoundaryUnexpectedError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export type BoundaryError =
  | BoundaryValidationError
  | BoundaryUnauthorizedError
  | BoundaryForbiddenError
  | BoundaryConflictError
  | BoundaryConfigurationError
  | BoundaryExternalServiceError
  | BoundaryUnexpectedError;

export type BoundaryErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "CONFIGURATION_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "UNEXPECTED_ERROR";

export function zodErrorToBoundaryError(
  error: ZodError,
): BoundaryValidationError {
  return new BoundaryValidationError({
    message: error.issues[0]?.message ?? "Invalid input.",
    details: error.issues,
    cause: error,
  });
}
```

- [ ] **Step 2: Implement Result data constructors**

Create `lib/effect/result.ts`:

```ts
import { Data } from "effect";

export type BoundaryResult<E, A> = Data.TaggedEnum<{
  Failure: { readonly error: E };
  Success: { readonly value: A };
}>;

interface BoundaryResultDefinition extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: BoundaryResult<this["A"], this["B"]>;
}

export const BoundaryResult = Data.taggedEnum<BoundaryResultDefinition>();
```

- [ ] **Step 3: Implement HTTP conversion**

Create `lib/effect/http.ts` with:

```ts
import { Effect } from "effect";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  BoundaryConfigurationError,
  BoundaryError,
  BoundaryUnexpectedError,
  BoundaryValidationError,
  zodErrorToBoundaryError,
} from "./errors";

export function parseJsonEffect(
  req: Request,
): Effect.Effect<unknown, BoundaryValidationError> {
  return Effect.tryPromise({
    try: () => req.json(),
    catch: (cause) =>
      new BoundaryValidationError({
        message: "Request body must be valid JSON.",
        cause,
      }),
  });
}

export function runApiEffect<A>(
  effect: Effect.Effect<A, BoundaryError, never>,
  onSuccess: (value: A) => NextResponse = (value) => NextResponse.json(value),
): Promise<NextResponse> {
  return Effect.runPromise(
    effect.pipe(
      Effect.match({
        onFailure: (error) => {
          const http = boundaryErrorToHttp(error);
          return NextResponse.json(http.body, { status: http.status });
        },
        onSuccess,
      }),
    ),
  ).catch((cause) => {
    const http = boundaryErrorToHttp(boundaryErrorFromUnknown(cause));
    return NextResponse.json(http.body, { status: http.status });
  });
}
```

- [ ] **Step 4: Run the boundary test and confirm GREEN**

Run:

```bash
npx tsx --test test-effect-boundary.ts
```

Expected: PASS.

### Task 3: Migrate Contact And Careers Routes

**Files:**

- Modify: `lib/services/contact.server.ts`
- Modify: `lib/services/careers.server.ts`
- Modify: `app/api/contact/route.ts`
- Modify: `app/api/careers/route.ts`
- Modify: `test-effect-boundary.ts`

- [ ] **Step 1: Add failing tests for validation mapping**

Extend `test-effect-boundary.ts` with route-level checks using `Request` objects for `/api/contact` and `/api/careers`.

- [ ] **Step 2: Add `sendContactMessageEffect`**

Wrap `contactFormSchema.parse`, `getContactEmailConfig`, and `resend.emails.send` with `Effect.try` / `Effect.tryPromise`, mapping Zod failures to `BoundaryValidationError` and email failures to `BoundaryExternalServiceError`.

- [ ] **Step 3: Add `sendCareersApplicationEffect`**

Wrap role JSON parsing, `careerApplicationSchema.parse`, resume size checks, and Resend delivery with typed Effect errors.

- [ ] **Step 4: Replace route `try/catch` blocks**

Use `parseJsonEffect`, `parseFormDataEffect`, and `runApiEffect` so the route edge owns conversion from typed failures to JSON.

- [ ] **Step 5: Verify**

Run:

```bash
npx tsx --test test-effect-boundary.ts
npm run type-check
```

Expected: both commands pass.

### Task 4: Migrate Payment Verification And Order Creation Routes

**Files:**

- Modify: `lib/services/payments.server.ts`
- Modify: `lib/services/checkout-attempts.server.ts`
- Modify: `app/api/verify-payment/route.ts`
- Modify: `app/api/create-order/route.ts`
- Modify: `test-effect-boundary.ts`

- [ ] **Step 1: Add failing tests for payment input errors**

Add tests for missing payment verification fields, invalid cart payload, and invalid amount mapping.

- [ ] **Step 2: Add payment service effects**

Expose `createPaymentOrderEffect` and `verifyPaymentSignatureEffect`, preserving current async wrappers for call sites.

- [ ] **Step 3: Add checkout-attempt effects**

Expose `createCheckoutAttemptEffect` and `markCheckoutAttemptPaymentOrderedEffect`, mapping Convex infrastructure failures into `BoundaryConfigurationError` or `BoundaryExternalServiceError`.

- [ ] **Step 4: Replace route `try/catch` blocks**

Move all expected errors into the Effect error channel. Keep rate limiting wrappers unchanged.

- [ ] **Step 5: Verify**

Run:

```bash
npx tsx --test test-effect-boundary.ts
npm run type-check
npm run lint
```

Expected: all commands pass.

### Task 5: Convex Migration Pilot

**Files:**

- Create: `convex/_shared/result.ts`
- Modify: `convex/mindPoints.ts`
- Modify: the UI file that consumes the selected `mindPoints` mutation

- [ ] **Step 1: Add Convex-safe result constructors**

Convex cannot return class instances across the wire. Create serializable tagged result objects in `convex/_shared/result.ts` with `_tag`, `success`, `code`, `message`, and optional `details`.

- [ ] **Step 2: Migrate one mutation**

Start with a mutation that already returns `{ success: false, error }`, such as a `mindPoints` redemption path. Replace ad-hoc string errors with serializable tagged errors.

- [ ] **Step 3: Update the consuming UI**

Pattern-match on `_tag`/`code` instead of reading only a string `error`.

- [ ] **Step 4: Verify**

Run:

```bash
npm run type-check
npm run type-check:convex
```

Expected: both commands pass.

### Task 6: Broad Convex Function Migration

**Files:**

- Modify: `convex/adminCourses.ts`
- Modify: `convex/adminEnrollments.ts`
- Modify: `convex/adminOffers.ts`
- Modify: `convex/adminBundles.ts`
- Modify: `convex/adminManagers.ts`
- Modify: `convex/adminReviews.ts`
- Modify: `convex/checkout.ts`
- Modify: `convex/emailActions.ts`
- Modify: `convex/emailActionsWithRateLimit.ts`
- Modify: `convex/googleSheets.ts`

- [ ] **Step 1: Convert expected validation throws**

Replace expected user/admin validation `throw new Error(...)` with serializable failure results where the caller expects recoverable behavior.

- [ ] **Step 2: Keep defects exceptional**

Leave unrecoverable invariant violations and impossible states as thrown errors until a caller has a concrete recovery path.

- [ ] **Step 3: Update consuming components**

For each migrated function, update callers to handle `_tag: "Success" | "Failure"` and render the mapped public message.

- [ ] **Step 4: Verify each file group**

Run after each group:

```bash
npm run type-check:convex
npm run type-check
```

Expected: both commands pass before moving to the next group.
