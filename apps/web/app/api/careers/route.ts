import { NextRequest, NextResponse } from "next/server";
import {
  ResumeTooLargeError,
  sendCareersApplication,
} from "@mindpoint/services/careers/server";
import { ZodError } from "zod";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleCareersApplication(req: NextRequest) {
  try {
    const result = await sendCareersApplication(await req.formData());
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError || error instanceof ResumeTooLargeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Invalid input.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handleCareersApplication, {
  errorMessage:
    "Too many career applications. Please wait before submitting another.",
});
