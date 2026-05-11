import type { Id } from "../_generated/dataModel";

export type CheckoutPricingItem = {
  courseId: Id<"courses">;
  batchId?: Id<"courseBatches">;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount?: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
  bundleCampaignId?: Id<"bundleCampaigns">;
  bundleCampaignName?: string;
};

export type CheckoutPricing = {
  totalAmountPaid: number;
  items: CheckoutPricingItem[];
};
