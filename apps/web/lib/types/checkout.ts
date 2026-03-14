import type { Id } from "../../../../convex/_generated/dataModel";

export type CheckoutPricingItem = {
  courseId: Id<"courses">;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
};

export type CheckoutPricing = {
  totalAmountPaid: number;
  items: CheckoutPricingItem[];
};
