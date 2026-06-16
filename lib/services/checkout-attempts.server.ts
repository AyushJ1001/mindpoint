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

type CheckoutAttemptServiceOptions = {
  convexUrl?: string;
  convexAuthToken?: string;
  checkoutServerSecret?: string;
  buyerUserId?: string;
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

function createAuthedConvexClient(options: CheckoutAttemptServiceOptions) {
  const convex = new ConvexHttpClient(resolveConvexUrl(options.convexUrl));
  if (options.convexAuthToken) {
    convex.setAuth(options.convexAuthToken);
  }

  return convex;
}

export async function createCheckoutAttempt(
  input: CreatePaymentOrderInput,
  options: CheckoutAttemptServiceOptions = {},
): Promise<CreateCheckoutAttemptResult> {
  const convex = createAuthedConvexClient(options);
  const cartIntent = {
    items: input.cartIntent.items.map((item) => ({
      ...item,
      courseId: item.courseId as never,
      batchId: item.batchId as never,
      selectedFreeCourseId: item.selectedFreeCourseId as never,
      selectedFreeBatchId: item.selectedFreeBatchId as never,
    })),
  };

  if (options.checkoutServerSecret && options.buyerUserId) {
    return (await convex.mutation(
      api.checkout.createCheckoutAttemptFromServer,
      {
        serverSecret: options.checkoutServerSecret,
        buyerUserId: options.buyerUserId,
        cartIntent,
        buyerEmail: input.buyerEmail,
        referrerClerkUserId: input.referrerClerkUserId,
      },
    )) as CreateCheckoutAttemptResult;
  }

  return (await convex.mutation(api.checkout.createCheckoutAttempt, {
    cartIntent,
    buyerEmail: input.buyerEmail,
    referrerClerkUserId: input.referrerClerkUserId,
  })) as CreateCheckoutAttemptResult;
}
