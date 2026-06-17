import type { CheckoutReconciliationPayload } from "./payments";

export type CartReconciliationItemUpdate = {
  readonly cartItemId: string;
  readonly payload: {
    readonly originalPrice: number;
    readonly price: number;
    readonly selectedFreeCourse?: undefined;
  };
};

export type CartReconciliationApplication = {
  readonly clearCoupon: boolean;
  readonly notice: string;
  readonly removedItemIds: readonly string[];
  readonly reviewRequired: boolean;
  readonly toastDescription: string;
  readonly toastTitle: string;
  readonly updatedItems: readonly CartReconciliationItemUpdate[];
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function firstRemovalMessage(
  reconciliation: CheckoutReconciliationPayload,
): string | undefined {
  return reconciliation.removedItems?.find((item) => item.message)?.message;
}

function updateReasonMessage(
  reconciliation: CheckoutReconciliationPayload,
): string | undefined {
  const reason = reconciliation.updatedItems?.[0]?.reasons[0];

  switch (reason) {
    case "BOGO_EXPIRED":
      return "A buy-one-get-one offer expired.";
    case "BOGO_SELECTION_INVALID":
      return "A selected free course is no longer eligible.";
    case "BUNDLE_EXPIRED":
      return "A bundle campaign expired.";
    case "COUPON_ALREADY_USED":
      return "The applied coupon has already been used.";
    case "COUPON_INVALID":
      return "The applied coupon is no longer valid.";
    case "COUPON_NOT_OWNED":
      return "The applied coupon is not available for this account.";
    case "COUPON_TYPE_MISMATCH":
      return "The applied coupon no longer matches this course.";
    case "DISCOUNT_EXPIRED":
      return "A course discount expired.";
    case "PRICE_CHANGED":
      return "A course price changed.";
    default:
      return undefined;
  }
}

export function buildCartReconciliationApplication(
  reconciliation: CheckoutReconciliationPayload,
): CartReconciliationApplication | null {
  if (!reconciliation.status || reconciliation.status === "valid") {
    return null;
  }

  const removedItemIds = (reconciliation.removedItems ?? []).map(
    (item) => item.cartItemId,
  );
  const updatedItems = (reconciliation.items ?? [])
    .filter((item) =>
      (reconciliation.updatedItems ?? []).some(
        (updated) => updated.cartItemId === item.cartItemId,
      ),
    )
    .map((item) => ({
      cartItemId: item.cartItemId,
      payload: {
        originalPrice: item.listedPrice,
        price: item.checkoutPrice,
        ...(item.selectedFreeCourseId ? {} : { selectedFreeCourse: undefined }),
      },
    }));
  const clearCoupon = (reconciliation.updatedItems ?? []).some((updated) =>
    updated.reasons.some((reason) => reason.startsWith("COUPON_")),
  );
  const removedCount = removedItemIds.length;
  const updatedCount = updatedItems.length;
  const cause =
    firstRemovalMessage(reconciliation) ??
    updateReasonMessage(reconciliation) ??
    "Pricing or availability changed.";

  if (removedCount > 0) {
    return {
      clearCoupon,
      notice: `${removedCount} ${pluralize(removedCount, "item")} ${removedCount === 1 ? "was" : "were"} removed because it is no longer available. ${cause}`,
      removedItemIds,
      reviewRequired: true,
      toastDescription: cause,
      toastTitle: `Removed ${removedCount} unavailable ${pluralize(removedCount, "item")}`,
      updatedItems,
    };
  }

  if (updatedCount > 0 || clearCoupon) {
    return {
      clearCoupon,
      notice: `${Math.max(updatedCount, 1)} ${pluralize(Math.max(updatedCount, 1), "item")} updated because pricing or promotions changed. ${cause}`,
      removedItemIds,
      reviewRequired: true,
      toastDescription: cause,
      toastTitle: "Your cart was updated",
      updatedItems,
    };
  }

  return {
    clearCoupon,
    notice: cause,
    removedItemIds,
    reviewRequired: true,
    toastDescription: cause,
    toastTitle: "Review your cart before checkout",
    updatedItems,
  };
}
