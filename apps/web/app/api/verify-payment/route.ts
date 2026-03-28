import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@mindpoint/services/payments/server";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleVerifyPayment(req: NextRequest) {
  try {
    const body = await req.json();
    const razorpayOrderId = String(body?.razorpayOrderId ?? "");
    const razorpayPaymentId = String(body?.razorpayPaymentId ?? "");
    const razorpaySignature = String(body?.razorpaySignature ?? "");

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 },
      );
    }

    if (
      !verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      })
    ) {
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to verify payment.",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handleVerifyPayment, {
  errorMessage:
    "Too many payment verification requests. Please wait before trying again.",
});
