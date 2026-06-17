import "client-only";

import { Effect } from "effect";

import type { JsonValue } from "../effect/errors";
import type { FetchImpl } from "./http";
import { postFormDataEffect } from "./http";

export type CareersSubmissionResult = {
  data?: JsonValue;
  error?: string;
  success: boolean;
};

type SubmitCareersApplicationOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function submitCareersApplication(
  formData: FormData,
  options: SubmitCareersApplicationOptions = {},
): Promise<CareersSubmissionResult> {
  return Effect.runPromise(
    postFormDataEffect<CareersSubmissionResult>(
      options.endpoint ?? "/api/careers",
      formData,
      { fetchImpl: options.fetchImpl },
    ).pipe(
      Effect.match({
        onFailure: (error) => ({
          error: error.message || "Failed to submit application",
          success: false,
        }),
        onSuccess: (result) =>
          result.success
            ? result
            : {
                error: result.error || "Failed to submit application",
                success: false,
              },
      }),
    ),
  );
}
