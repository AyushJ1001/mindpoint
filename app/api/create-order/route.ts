import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import { createCheckoutAttempt } from "@/lib/services/checkout-attempts.server";
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
    if (!isClerkServerConfigured()) {
      return NextResponse.json(
        { error: "Checkout authentication is not configured." },
        { status: 401 },
      );
    }

    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in before checkout." },
        { status: 401 },
      );
    }

    const checkoutServerSecret = process.env.CHECKOUT_SERVER_SECRET;
    if (!checkoutServerSecret) {
      return NextResponse.json(
        { error: "Checkout server authorization is not configured." },
        { status: 500 },
      );
    }

    const sessionEmail = await resolveAuthEmail(sessionClaims);
    const buyerEmail =
      sessionEmail ||
      (typeof body?.buyerEmail === "string" ? body.buyerEmail : undefined);

    const attempt = await createCheckoutAttempt(
      {
        cartIntent,
        buyerEmail,
        referrerClerkUserId:
          typeof body?.referrerClerkUserId === "string"
            ? body.referrerClerkUserId
            : undefined,
      },
      { checkoutServerSecret, buyerUserId: userId },
    );

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

    return NextResponse.json({
      id: String(attempt.checkoutAttemptId),
      amount,
      currency: "INR",
      checkoutAttemptId: attempt.checkoutAttemptId,
      reconciliation: attempt.reconciliation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to prepare payment.",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handleCreateOrder, {
  errorMessage: "Too many payment requests. Please wait before trying again.",
});
