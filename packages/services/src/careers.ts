import "client-only";

import type { FetchImpl } from "./http";
import { postFormData } from "./http";

export type CareersSubmissionResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

type SubmitCareersApplicationOptions = {
  endpoint?: string;
  fetchImpl?: FetchImpl;
};

export async function submitCareersApplication(
  formData: FormData,
  options: SubmitCareersApplicationOptions = {},
): Promise<CareersSubmissionResult> {
  const result = await postFormData<CareersSubmissionResult>(
    options.endpoint ?? "/api/careers",
    formData,
    { fetchImpl: options.fetchImpl },
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to submit application");
  }

  return result;
}
