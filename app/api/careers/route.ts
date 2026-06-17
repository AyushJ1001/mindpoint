import { parseFormDataEffect, runApiEffect } from "@/lib/effect";
import { sendCareersApplicationEffect } from "@/lib/services/careers.server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { Effect } from "effect";
import type { NextRequest } from "next/server";

async function handleCareersApplication(req: NextRequest) {
  return runApiEffect(
    Effect.gen(function* () {
      const formData = yield* parseFormDataEffect(req);
      return yield* sendCareersApplicationEffect(formData);
    }),
  );
}

export const POST = withRateLimit(handleCareersApplication, {
  errorMessage:
    "Too many career applications. Please wait before submitting another.",
});
