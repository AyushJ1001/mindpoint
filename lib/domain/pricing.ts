export function showRupees(amount: number) {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface OfferDetails {
  offerPrice: number;
  originalPrice: number;
  offerName: string;
  discountPercentage: number;
  discountType: OfferDiscountType;
  discountValue: number;
  discountLabel: string;
  savingsAmount: number;
  hasDiscount: boolean;
  hasBogo: boolean;
  bogoLabel?: string;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export type OfferDiscountType = "percentage" | "fixedPrice" | "flatOff";

export type CourseOffer = {
  name: string;
  discount?: number;
  discountType?: OfferDiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
} | null;

export type CourseBogo = {
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  label?: string;
} | null;

function isWithinWindow(startDate?: string, endDate?: string): boolean {
  const now = new Date();

  if (!startDate && !endDate) {
    return true;
  }

  if (startDate) {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime()) || now < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime()) || now > end) {
      return false;
    }
  }

  return true;
}

export function getOfferDiscountType(offer?: CourseOffer): OfferDiscountType {
  return offer?.discountType ?? "percentage";
}

export function getOfferDiscountValue(offer?: CourseOffer): number {
  if (!offer) {
    return 0;
  }

  if (typeof offer.discountValue === "number") {
    return offer.discountValue;
  }

  return typeof offer.discount === "number" ? offer.discount : 0;
}

export function isDiscountActive(offer?: CourseOffer): boolean {
  if (!offer) {
    return false;
  }

  const discountValue = getOfferDiscountValue(offer);
  if (discountValue <= 0) {
    return false;
  }

  return isWithinWindow(offer.startDate, offer.endDate);
}

export function isBogoActive(bogo?: CourseBogo): boolean {
  if (!bogo) {
    return false;
  }

  const isEnabled = bogo.enabled ?? true;
  if (!isEnabled) {
    return false;
  }

  return isWithinWindow(bogo.startDate, bogo.endDate);
}

export function calculateOfferPrice(
  originalPrice: number,
  discountPercentage: number,
): number {
  const discountAmount = originalPrice * (discountPercentage / 100);
  return Math.round(originalPrice - discountAmount);
}

export function calculateActiveOfferPrice(
  originalPrice: number,
  offer?: CourseOffer,
): number {
  if (!offer) {
    return Math.round(originalPrice);
  }

  const discountType = getOfferDiscountType(offer);
  const discountValue = getOfferDiscountValue(offer);

  if (discountType === "fixedPrice") {
    return Math.max(0, Math.round(Math.min(originalPrice, discountValue)));
  }

  if (discountType === "flatOff") {
    return Math.max(0, Math.round(originalPrice - discountValue));
  }

  const boundedPercentage = Math.min(100, Math.max(0, discountValue));
  return Math.max(0, calculateOfferPrice(originalPrice, boundedPercentage));
}

export function calculateCourseOfferPrice(
  originalPrice: number,
  offer?: CourseOffer,
): number {
  if (!isDiscountActive(offer)) {
    return Math.round(originalPrice);
  }

  return calculateActiveOfferPrice(originalPrice, offer);
}

export function getOfferSavingsAmount(
  originalPrice: number,
  offer?: CourseOffer,
): number {
  return Math.max(
    0,
    Math.round(originalPrice) - calculateCourseOfferPrice(originalPrice, offer),
  );
}

export function formatOfferAdjustment(
  offer?: CourseOffer,
  originalPrice?: number,
): string {
  if (!offer) {
    return "";
  }

  const discountType = getOfferDiscountType(offer);
  const discountValue = getOfferDiscountValue(offer);

  if (discountType === "fixedPrice") {
    return `Fixed at ${showRupees(discountValue)}`;
  }

  if (discountType === "flatOff") {
    const savings =
      typeof originalPrice === "number"
        ? Math.min(Math.round(originalPrice), Math.round(discountValue))
        : Math.round(discountValue);
    return `${showRupees(savings)} off`;
  }

  return `${Math.round(discountValue)}% off`;
}

export function calculateOfferTimeLeft(endDate?: string | null): {
  days: number;
  hours: number;
  minutes: number;
} {
  if (!endDate) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const now = new Date();
  const end = new Date(endDate);
  const timeLeft = end.getTime() - now.getTime();

  if (timeLeft <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

export function getOfferDetails(course: {
  price?: number;
  offer?: CourseOffer;
  bogo?: CourseBogo;
}): OfferDetails | null {
  const hasActiveDiscount = isDiscountActive(course.offer);
  const hasBogo = isBogoActive(course.bogo);

  if (!hasActiveDiscount && !hasBogo) {
    return null;
  }

  const originalPrice = course.price || 0;
  const offerPrice = hasActiveDiscount
    ? calculateCourseOfferPrice(originalPrice, course.offer)
    : originalPrice;
  const savingsAmount = Math.max(
    0,
    Math.round(originalPrice) - Math.round(offerPrice),
  );
  const hasDiscount = hasActiveDiscount && savingsAmount > 0;
  if (!hasDiscount && !hasBogo) {
    return null;
  }

  const discountPercentage =
    originalPrice > 0 ? Math.round((savingsAmount / originalPrice) * 100) : 0;
  const discountType = getOfferDiscountType(course.offer);
  const discountValue = hasActiveDiscount
    ? getOfferDiscountValue(course.offer)
    : 0;
  const discountLabel = hasActiveDiscount
    ? formatOfferAdjustment(course.offer, originalPrice)
    : "";

  const activeEndDates: string[] = [];
  if (hasDiscount && course.offer?.endDate) {
    const endDate = new Date(course.offer.endDate);
    const now = new Date();
    if (!Number.isNaN(endDate.getTime()) && endDate > now) {
      activeEndDates.push(course.offer.endDate);
    }
  }
  if (hasBogo && course.bogo?.endDate) {
    const endDate = new Date(course.bogo.endDate);
    const now = new Date();
    if (!Number.isNaN(endDate.getTime()) && endDate > now) {
      activeEndDates.push(course.bogo.endDate);
    }
  }

  const earliestEndingActivePromotion = activeEndDates
    .map((date) => ({ date, time: new Date(date).getTime() }))
    .filter(({ time }) => !Number.isNaN(time))
    .sort((a, b) => a.time - b.time)[0]?.date;

  const timeLeft = calculateOfferTimeLeft(
    earliestEndingActivePromotion ?? null,
  );

  const bogoLabel = course.bogo?.label || "BOGO";
  const offerName =
    hasDiscount && hasBogo
      ? `${course.offer?.name ?? "Limited-time Offer"} + ${bogoLabel}`
      : hasDiscount
        ? (course.offer?.name ?? "Limited-time Offer")
        : `${bogoLabel} Offer`;

  return {
    offerPrice: Math.round(offerPrice),
    originalPrice: Math.round(originalPrice),
    offerName,
    discountPercentage: Math.round(discountPercentage),
    discountType,
    discountValue: Math.round(discountValue),
    discountLabel,
    savingsAmount,
    hasDiscount,
    hasBogo,
    bogoLabel,
    timeLeft,
  };
}

export function getCoursePrice(course: {
  price?: number;
  offer?: CourseOffer;
  bogo?: CourseBogo;
}): number {
  const offerDetails = getOfferDetails(course);
  const price = offerDetails ? offerDetails.offerPrice : course.price || 0;
  return Math.round(price);
}

export function hasActiveBogo(course: { bogo?: CourseBogo }): boolean {
  return isBogoActive(course.bogo);
}

export function hasActivePromotion(course: {
  offer?: CourseOffer;
  bogo?: CourseBogo;
}): boolean {
  return isDiscountActive(course.offer) || isBogoActive(course.bogo);
}
