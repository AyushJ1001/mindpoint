import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Payment service not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      },
      { status: 500 },
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const { amount } = await req.json();
  const roundedAmount = Math.round(Number(amount) || 0);

  console.log("amount", roundedAmount);

  const order = await razorpay.orders.create({
    amount: roundedAmount * 100,
    currency: "INR",
  });

  return NextResponse.json(order);
}
