import { NextResponse } from "next/server";
import { sendContactMessage } from "@mindpoint/services/contact/server";
import { ZodError } from "zod";
import { withStrictRateLimit } from "@/lib/with-rate-limit";

async function handleContact(req: Request) {
  try {
    const result = await sendContactMessage(await req.json());
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error sending message.",
      },
      { status: 500 },
    );
  }
}

export const POST = withStrictRateLimit(handleContact);
