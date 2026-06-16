import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Effect } from "effect";
import {
  BoundaryExternalServiceError,
  BoundaryResult,
  BoundaryValidationError,
  boundaryErrorToHttp,
  runApiEffect,
} from "./lib/effect";

const effectSourceFiles = [
  "lib/effect/errors.ts",
  "lib/effect/http.ts",
  "lib/effect/result.ts",
  "lib/effect/index.ts",
] as const;

test("Effect boundary modules do not expose any or unknown", () => {
  for (const file of effectSourceFiles) {
    const source = readFileSync(file, "utf8");

    assert.doesNotMatch(source, /\bany\b|\bunknown\b/, file);
  }
});

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
      message: "Checkout requires a current cart.",
      details: { fields: ["cartIntent"] },
    }),
  );

  assert.equal(http.status, 400);
  assert.deepEqual(http.body, {
    success: false,
    error: "Checkout requires a current cart.",
    code: "VALIDATION_ERROR",
    details: { fields: ["cartIntent"] },
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

test("boundaryErrorToHttp maps external service errors to gateway failures", () => {
  const http = boundaryErrorToHttp(
    new BoundaryExternalServiceError({
      message: "Checkout authentication service is unavailable.",
    }),
  );

  assert.equal(http.status, 502);
  assert.deepEqual(http.body, {
    success: false,
    error: "Checkout authentication service is unavailable.",
    code: "EXTERNAL_SERVICE_ERROR",
  });
});

test("contact route maps validation errors through the Effect boundary", async () => {
  const { POST } = await import("./app/api/contact/route");
  const response = await POST(
    new Request("http://localhost/api/contact", {
      body: JSON.stringify({ email: "bad", message: "short", name: "A" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }) as never,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Name must be at least 2 characters",
    code: "VALIDATION_ERROR",
  });
});

test("careers route maps invalid role payloads through the Effect boundary", async () => {
  const { POST } = await import("./app/api/careers/route");
  const formData = new FormData();
  formData.set("roles", "not-json");

  const response = await POST(
    new Request("http://localhost/api/careers", {
      body: formData,
      method: "POST",
    }) as never,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "The 'roles' field must be a valid JSON array.",
    code: "VALIDATION_ERROR",
  });
});

test("create order boundary maps missing cart intent through the Effect boundary", async () => {
  const { validateCreateOrderBodyEffect } = await import(
    "./lib/services/create-order-boundary"
  );
  const response = await runApiEffect(validateCreateOrderBodyEffect({}));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Checkout requires a current cart.",
    code: "VALIDATION_ERROR",
  });
});

test("checkout service exposes an Effect implementation for authenticated cart checkout", () => {
  const source = readFileSync("lib/services/checkout.ts", "utf8");
  const checkoutSlice = source.slice(
    source.indexOf("export async function handlePaymentSuccess"),
    source.indexOf("export async function handleGuestUserPaymentSuccess"),
  );

  assert.match(source, /export function handlePaymentSuccessEffect/);
  assert.doesNotMatch(checkoutSlice, /try\s*\{/);
});

test("checkout service exposes Effect implementations for all payment action wrappers", () => {
  const source = readFileSync("lib/services/checkout.ts", "utf8");
  const names = [
    "handleGuestUserPaymentSuccess",
    "handleGuestUserPaymentSuccessWithData",
    "handleSingleCourseEnrollment",
    "handleGuestUserSingleEnrollment",
    "handleSupervisedTherapyEnrollment",
    "handleGuestUserSupervisedTherapyEnrollment",
  ] as const;

  for (const name of names) {
    const wrapperStart = source.indexOf(`export async function ${name}`);
    const nextWrapperStart = source.indexOf(
      "export async function",
      wrapperStart + 1,
    );
    const wrapperSource = source.slice(
      wrapperStart,
      nextWrapperStart === -1 ? source.length : nextWrapperStart,
    );

    assert.match(source, new RegExp(`export function ${name}Effect`), name);
    assert.doesNotMatch(wrapperSource, /try\s*\{/, name);
  }
});

test("checkout attempt boundary normalizes legacy Convex ok tuples", async () => {
  const { normalizeCreateCheckoutAttemptResultEffect } = await import(
    "./lib/services/checkout-attempts.server"
  );

  const createResult = await Effect.runPromise(
    normalizeCreateCheckoutAttemptResultEffect({
      checkoutAttemptId: "attempt_123",
      ok: true,
      reconciliation: {
        totalAmountPaid: 123,
      },
    }),
  );

  assert.deepEqual(createResult, {
    _tag: "Success",
    checkoutAttemptId: "attempt_123",
    reconciliation: {
      totalAmountPaid: 123,
    },
    success: true,
  });

  const conflictResponse = await runApiEffect(
    normalizeCreateCheckoutAttemptResultEffect({
      ok: false,
      reconciliation: {
        status: "invalid",
        totalAmountPaid: 0,
      },
    }),
  );
  assert.equal(conflictResponse.status, 409);
  assert.deepEqual(await conflictResponse.json(), {
    success: false,
    error: "Your cart changed. Review it before checkout.",
    code: "CONFLICT",
    details: {
      reconciliation: {
        status: "invalid",
        totalAmountPaid: 0,
      },
    },
  });
});
