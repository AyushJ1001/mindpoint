import type { Id } from "@mindpoint/backend/data-model";

export type CheckoutPricingItem = {
  courseId: Id<"courses">;
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
