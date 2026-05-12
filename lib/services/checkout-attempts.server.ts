import "server-only";

import { api } from "@/lib/backend/api";
import { ConvexHttpClient } from "convex/browser";

import type { CreatePaymentOrderInput } from "./payments";

type CreateCheckoutAttemptResult =
  | {
      ok: true;
      checkoutAttemptId: string;
      reconciliation: {
        totalAmountPaid: number;
      };
    }
  | {
      ok: false;
      reconciliation: unknown;
    };

function resolveConvexUrl(convexUrl?: string): string {
  const resolvedConvexUrl = convexUrl || process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!resolvedConvexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL environment variable is not set. Cannot execute Convex mutation.",
    );
  }

  return resolvedConvexUrl;
}

export async function createCheckoutAttempt(
  input: CreatePaymentOrderInput,
  options: { convexUrl?: string } = {},
): Promise<CreateCheckoutAttemptResult> {
  const convex = new ConvexHttpClient(resolveConvexUrl(options.convexUrl));

  return (await convex.mutation(api.checkout.createCheckoutAttempt, {
    cartIntent: {
      items: input.cartIntent.items.map((item) => ({
        ...item,
        courseId: item.courseId as never,
        batchId: item.batchId as never,
        selectedFreeCourseId: item.selectedFreeCourseId as never,
        selectedFreeBatchId: item.selectedFreeBatchId as never,
      })),
    },
    buyerUserId: input.buyerUserId,
    buyerEmail: input.buyerEmail,
    referrerClerkUserId: input.referrerClerkUserId,
  })) as CreateCheckoutAttemptResult;
}

export async function markCheckoutAttemptPaymentOrdered(
  input: {
    checkoutAttemptId: string;
    razorpayOrderId: string;
  },
  options: { convexUrl?: string } = {},
) {
  const convex = new ConvexHttpClient(resolveConvexUrl(options.convexUrl));

  return await convex.mutation(api.checkout.markCheckoutAttemptPaymentOrdered, {
    checkoutAttemptId: input.checkoutAttemptId as never,
    razorpayOrderId: input.razorpayOrderId,
  });
}
