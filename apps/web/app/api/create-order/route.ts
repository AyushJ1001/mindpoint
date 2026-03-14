import { NextResponse } from "next/server";
import { createPaymentOrder } from "@mindpoint/services/payments/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    const order = await createPaymentOrder({ amount });

    return NextResponse.json(order);
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
