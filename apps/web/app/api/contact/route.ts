import { NextResponse } from "next/server";
import { sendContactMessage } from "@mindpoint/services/contact/server";
import { withStrictRateLimit } from "@/lib/with-rate-limit";

async function handleContact(req: Request) {
  try {
    const result = await sendContactMessage(await req.json());
    return NextResponse.json(result);
  } catch (error) {
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
