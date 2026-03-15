import "client-only";

import type { FetchImpl } from "./http";
import { postJson } from "./http";

export type ContactFormValues = {
  email: string;
  message: string;
  name: string;
};

export type ContactSubmissionResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

type SubmitContactFormOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function submitContactForm(
  input: ContactFormValues,
  options: SubmitContactFormOptions = {},
): Promise<ContactSubmissionResult> {
  const result = await postJson<ContactFormValues, ContactSubmissionResult>(
    options.endpoint ?? "/api/contact",
    input,
    { fetchImpl: options.fetchImpl },
  );

  if (!result.success) {
    throw new Error(result.error || "Error sending message.");
  }

  return result;
}
