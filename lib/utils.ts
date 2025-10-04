import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showRupees(amount: number) {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Schema for careers application form
export const careerApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Please enter a valid phone number"),
  location: z.string().min(2, "Location is required"),
  linkedIn: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  roles: z.array(z.string()).default([]),
  coverLetter: z.string().optional().default(""),
  // Note: Resume is handled as a File in multipart form-data on the server
});

// Offer validation and calculation utilities
export interface OfferDetails {
  offerPrice: number;
  originalPrice: number;
  offerName: string;
  discountPercentage: number;
  hasDiscount: boolean;
  hasBogo: boolean;
  bogoLabel?: string;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  };
}

type CourseOffer = {
  name: string;
  discount?: number;
  startDate?: string;
  endDate?: string;
} | null;

type CourseBogo = {
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  freeCourseId?: string;
  label?: string;
} | null;

function isWithinWindow(startDate?: string, endDate?: string): boolean {
  const now = new Date();

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

export function isDiscountActive(offer?: CourseOffer): boolean {
  if (!offer) return false;
  const discount = typeof offer.discount === "number" ? offer.discount : 0;
  if (discount <= 0) return false;
  return isWithinWindow(offer.startDate, offer.endDate);
}

export function isBogoActive(bogo?: CourseBogo): boolean {
  if (!bogo || !bogo.enabled) return false;
  return isWithinWindow(bogo.startDate, bogo.endDate);
}

export function calculateOfferPrice(
  originalPrice: number,
  discountPercentage: number,
): number {
  const discountAmount = originalPrice * (discountPercentage / 100);
  return Math.round(originalPrice - discountAmount);
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
  offer?: {
    startDate?: string;
    endDate?: string;
    discount?: number;
    name: string;
  } | null;
  bogo?: {
    enabled?: boolean;
    startDate?: string;
    endDate?: string;
    label?: string;
  } | null;
}): OfferDetails | null {
  const hasDiscount = isDiscountActive(course.offer);
  const hasBogo = isBogoActive(course.bogo);

  if (!hasDiscount && !hasBogo) {
    return null;
  }

  const originalPrice = course.price || 0;
  const discountPercentage = hasDiscount ? course.offer?.discount ?? 0 : 0;
  const offerPrice = hasDiscount
    ? calculateOfferPrice(originalPrice, discountPercentage)
    : originalPrice;

  const endCandidates: string[] = [];
  if (hasDiscount && course.offer?.endDate) {
    endCandidates.push(course.offer.endDate);
  }
  if (hasBogo && course.bogo?.endDate) {
    endCandidates.push(course.bogo.endDate);
  }

  const nextEndingPromotion = endCandidates
    .map((date) => ({ date, time: new Date(date).getTime() }))
    .filter(({ time }) => !Number.isNaN(time))
    .sort((a, b) => a.time - b.time)[0]?.date;

  const timeLeft = calculateOfferTimeLeft(nextEndingPromotion ?? null);
  const offerName = hasDiscount
    ? course.offer?.name ?? "Limited-time Offer"
    : course.bogo?.label ?? "BOGO Offer";

  return {
    offerPrice: Math.round(offerPrice),
    originalPrice: Math.round(originalPrice),
    offerName,
    discountPercentage: Math.round(discountPercentage),
    hasDiscount,
    hasBogo,
    bogoLabel: course.bogo?.label ?? undefined,
    timeLeft,
  };
}

export function getCoursePrice(course: {
  price?: number;
  offer?: {
    startDate?: string;
    endDate?: string;
    discount?: number;
    name: string;
  } | null;
  bogo?: {
    enabled?: boolean;
    startDate?: string;
    endDate?: string;
    label?: string;
  } | null;
}): number {
  const offerDetails = getOfferDetails(course);
  const price = offerDetails ? offerDetails.offerPrice : course.price || 0;
  return Math.round(price);
}

export function hasActiveBogo(course: {
  bogo?: {
    enabled?: boolean;
    startDate?: string;
    endDate?: string;
  } | null;
}): boolean {
  return isBogoActive(course.bogo);
}

export function hasActivePromotion(course: {
  offer?: CourseOffer;
  bogo?: CourseBogo;
}): boolean {
  return isDiscountActive(course.offer) || isBogoActive(course.bogo);
}
