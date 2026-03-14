import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentOrder,
  InvalidPaymentAmountError,
} from "@mindpoint/services/payments/server";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleCreateOrder(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const order = await createPaymentOrder({ amount });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof InvalidPaymentAmountError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
