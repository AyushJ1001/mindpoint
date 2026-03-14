import { NextRequest, NextResponse } from "next/server";
import { sendCareersApplication } from "@mindpoint/services/careers/server";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleCareersApplication(req: NextRequest) {
  try {
    const result = await sendCareersApplication(await req.formData());
    return NextResponse.json(result);
  } catch (error) {
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
