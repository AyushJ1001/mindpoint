/**
 * Scheduled promotional campaigns.
 *
 * A campaign is a rule: an occasion, a discount, a window, a priority and the
 * courses it may touch. This module is the single place that decides which rule
 * wins for a course and what offer shape gets written onto the course. Both the
 * reconciler and the admin preview call it, so what an admin previews is what
 * shoppers see.
 *
 * Prices stay in the existing `course.offer` path on purpose: cards, detail
 * pages, cart, checkout and payment records all read that one field, so a single
 * write keeps them consistent. Nothing here touches historical enrollments.
 */

export type OfferDiscountType = "percentage" | "fixedPrice" | "flatOff";

export type OfferOccasion =
  | "early-bird"
  | "diwali"
  | "christmas"
  | "new-year"
  | "general";

export type CampaignOffer = {
  name?: string;
  discount?: number;
  discountType?: OfferDiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
};

export type CampaignRule = {
  _id: string;
  name: string;
  occasion?: OfferOccasion;
  enabled?: boolean;
  priority?: number;
  headline?: string;
  lead?: string;
  bannerImageUrl?: string;
  startDate?: string;
  endDate?: string;
  eligibleCourseIds?: string[];
  isArchived?: boolean;
  createdAt: number;
  offer?: CampaignOffer;
};

export type CampaignCourse = {
  _id: string;
  price: number;
  offer?: {
    name: string;
    campaignId?: string;
    discount?: number;
    discountType?: OfferDiscountType;
    discountValue?: number;
    startDate?: string;
    endDate?: string;
  };
};

export type ResolvedCampaignOffer = {
  name: string;
  campaignId: string;
  occasion: OfferOccasion;
  discountType: OfferDiscountType;
  discountValue: number;
  startDate?: string;
  endDate?: string;
  headline?: string;
  lead?: string;
  bannerImageUrl?: string;
  standardPrice: number;
  offerPrice: number;
};

export const OCCASION_LABEL: Record<OfferOccasion, string> = {
  "early-bird": "Early Bird",
  diwali: "Diwali Offer",
  christmas: "Christmas Offer",
  "new-year": "New Year Offer",
  general: "Special Price",
};

/** General offers never show a campaign name; they say "Special Price". */
export function occasionLabel(occasion?: OfferOccasion): string {
  return OCCASION_LABEL[occasion ?? "general"];
}

function toTimestamp(value?: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function isCampaignActive(
  campaign: CampaignRule,
  now: number,
): boolean {
  if (campaign.isArchived) return false;
  if (campaign.enabled === false) return false;
  if (!campaign.offer) return false;
  if ((campaign.eligibleCourseIds ?? []).length === 0) return false;

  const start = toTimestamp(campaign.startDate);
  const end = toTimestamp(campaign.endDate);
  if (start !== null && now < start) return false;
  if (end !== null && now > end) return false;

  return true;
}

export function campaignDiscount(
  campaign: CampaignRule,
): { type: OfferDiscountType; value: number } | null {
  const offer = campaign.offer;
  if (!offer) return null;
  const type = offer.discountType ?? "percentage";
  const value =
    typeof offer.discountValue === "number"
      ? offer.discountValue
      : offer.discount;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  if (type === "percentage" && value > 100) return null;
  return { type, value };
}

/** The price this discount produces from a genuine standard fee. */
export function priceWithDiscount(
  standardPrice: number,
  discount: { type: OfferDiscountType; value: number },
): number {
  const standard = Math.max(0, Math.round(standardPrice));
  let price: number;
  if (discount.type === "percentage") {
    price = standard - (standard * discount.value) / 100;
  } else {
    // fixedPrice is the new headline price; flatOff is an amount removed.
    price = discount.type === "fixedPrice" ? discount.value : standard - discount.value;
  }
  return Math.max(0, Math.round(price));
}

/**
 * Pick the winning campaign for a course.
 *
 * Order: higher priority first, then the larger rupee saving, then the campaign
 * created earlier (so a long-running campaign is not displaced by a tie). Only
 * one campaign can apply to a course at a time; this is what keeps overlapping
 * seasonal campaigns from stacking.
 */
export function pickCampaignForCourse(
  course: CampaignCourse,
  campaigns: CampaignRule[],
  now: number,
): { campaign: CampaignRule; discount: { type: OfferDiscountType; value: number } } | null {
  let winner:
    | { campaign: CampaignRule; discount: { type: OfferDiscountType; value: number }; saving: number }
    | null = null;

  for (const campaign of campaigns) {
    if (!isCampaignActive(campaign, now)) continue;
    if (!(campaign.eligibleCourseIds ?? []).includes(course._id)) continue;
    const discount = campaignDiscount(campaign);
    if (!discount) continue;

    const price = priceWithDiscount(course.price, discount);
    const saving = Math.max(0, Math.round(course.price) - price);
    if (saving <= 0) continue;

    if (!winner) {
      winner = { campaign, discount, saving };
      continue;
    }

    const priority = campaign.priority ?? 0;
    const winnerPriority = winner.campaign.priority ?? 0;
    if (priority > winnerPriority) {
      winner = { campaign, discount, saving };
      continue;
    }
    if (priority === winnerPriority && saving > winner.saving) {
      winner = { campaign, discount, saving };
      continue;
    }
    if (
      priority === winnerPriority &&
      saving === winner.saving &&
      campaign.createdAt < winner.campaign.createdAt
    ) {
      winner = { campaign, discount, saving };
    }
  }

  return winner ? { campaign: winner.campaign, discount: winner.discount } : null;
}

export function buildOfferFromCampaign(
  course: CampaignCourse,
  campaign: CampaignRule,
  discount: { type: OfferDiscountType; value: number },
): ResolvedCampaignOffer {
  const occasion = campaign.occasion ?? "general";
  return {
    name: occasion === "general" ? "" : campaign.name,
    campaignId: campaign._id,
    occasion,
    discountType: discount.type,
    discountValue: discount.value,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    headline: campaign.headline,
    lead: campaign.lead,
    bannerImageUrl: campaign.bannerImageUrl,
    standardPrice: Math.round(course.price),
    offerPrice: priceWithDiscount(course.price, discount),
  };
}

/** True when the course's current offer is the one this campaign would write. */
export function offerMatches(
  course: CampaignCourse,
  offer: ResolvedCampaignOffer,
): boolean {
  const current = course.offer;
  if (!current) return false;
  return (
    current.campaignId === offer.campaignId &&
    current.name === offer.name &&
    (current.discountType ?? "percentage") === offer.discountType &&
    (current.discountValue ?? current.discount ?? 0) === offer.discountValue &&
    current.startDate === offer.startDate &&
    current.endDate === offer.endDate
  );
}

/**
 * Which courses should carry which offer right now, and which stale offers to
 * clear. Clearing only touches offers this reconciler wrote (`campaignId`).
 */
export function planReconciliation(
  courses: CampaignCourse[],
  campaigns: CampaignRule[],
  now: number,
): {
  apply: { courseId: string; offer: ResolvedCampaignOffer }[];
  clear: string[];
} {
  const apply: { courseId: string; offer: ResolvedCampaignOffer }[] = [];
  const clear: string[] = [];

  for (const course of courses) {
    const winner = pickCampaignForCourse(course, campaigns, now);
    if (winner) {
      const offer = buildOfferFromCampaign(course, winner.campaign, winner.discount);
      if (!offerMatches(course, offer)) {
        apply.push({ courseId: course._id, offer });
      }
      continue;
    }

    if (course.offer?.campaignId) {
      clear.push(course._id);
    }
  }

  return { apply, clear };
}
