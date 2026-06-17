import "client-only";

import { Effect } from "effect";

import type { JsonValue } from "../effect/errors";
import type { FetchImpl } from "./http";
import { postJsonEffect } from "./http";

export type ContactFormValues = {
  email: string;
  message: string;
  name: string;
};

export type ContactSubmissionResult = {
  data?: JsonValue;
  error?: string;
  success: boolean;
};

type SubmitContactFormOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function submitContactForm(
  input: ContactFormValues,
  options: SubmitContactFormOptions = {},
): Promise<ContactSubmissionResult> {
  return Effect.runPromise(
    postJsonEffect<ContactFormValues, ContactSubmissionResult>(
      options.endpoint ?? "/api/contact",
      input,
      { fetchImpl: options.fetchImpl },
    ).pipe(
      Effect.match({
        onFailure: (error) => ({
          error: error.message || "Error sending message.",
          success: false,
        }),
        onSuccess: (result) =>
          result.success
            ? result
            : {
                error: result.error || "Error sending message.",
                success: false,
              },
      }),
    ),
  );
}
