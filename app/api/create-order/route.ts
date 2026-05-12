import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/services/payments.server";
import {
  createCheckoutAttempt,
  markCheckoutAttemptPaymentOrdered,
} from "@/lib/services/checkout-attempts.server";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleCreateOrder(req: NextRequest) {
  try {
    const body = await req.json();
    const cartIntent = body?.cartIntent;

    if (
      !cartIntent ||
      !Array.isArray(cartIntent.items) ||
      cartIntent.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Checkout requires a current cart." },
        { status: 400 },
      );
    }

    const attempt = await createCheckoutAttempt({
      cartIntent,
      buyerUserId:
        typeof body?.buyerUserId === "string" ? body.buyerUserId : undefined,
      buyerEmail:
        typeof body?.buyerEmail === "string" ? body.buyerEmail : undefined,
      referrerClerkUserId:
        typeof body?.referrerClerkUserId === "string"
          ? body.referrerClerkUserId
          : undefined,
    });

    if (!attempt.ok) {
      return NextResponse.json(
        {
          error: "Your cart changed. Review it before checkout.",
          reconciliation: attempt.reconciliation,
        },
        { status: 409 },
      );
    }

    const amount = Number(attempt.reconciliation.totalAmountPaid);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const order = await createPaymentOrder({
      amount,
      receipt: String(attempt.checkoutAttemptId).slice(0, 40),
    });

    await markCheckoutAttemptPaymentOrdered({
      checkoutAttemptId: attempt.checkoutAttemptId,
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      ...order,
      checkoutAttemptId: attempt.checkoutAttemptId,
      reconciliation: attempt.reconciliation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order.",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handleCreateOrder, {
  errorMessage: "Too many order requests. Please wait before trying again.",
});
