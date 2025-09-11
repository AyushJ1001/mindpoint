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
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export function isValidOffer(
  offer:
    | { startDate: string; endDate: string; discount: number }
    | null
    | undefined,
): boolean {
  if (!offer || !offer.startDate || !offer.endDate || !offer.discount) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);

  return now >= startDate && now <= endDate;
}

export function calculateOfferPrice(
  originalPrice: number,
  discountPercentage: number,
): number {
  // discountPercentage is stored as percentage (0-100), convert to fraction for calculation
  const discountAmount = originalPrice * (discountPercentage / 100);
  return Math.round(originalPrice - discountAmount);
}

export function calculateOfferTimeLeft(endDate: string): {
  days: number;
  hours: number;
  minutes: number;
} {
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
    startDate: string;
    endDate: string;
    discount: number;
    name: string;
  };
}): OfferDetails | null {
  if (!course.offer || !isValidOffer(course.offer)) {
    return null;
  }

  const originalPrice = course.price || 0;
  const offerPrice = calculateOfferPrice(originalPrice, course.offer.discount);
  const timeLeft = calculateOfferTimeLeft(course.offer.endDate);

  return {
    offerPrice: Math.round(offerPrice),
    originalPrice: Math.round(originalPrice),
    offerName: course.offer.name,
    discountPercentage: Math.round(course.offer.discount), // discount is already a percentage
    timeLeft,
  };
}

export function getCoursePrice(course: {
  price?: number;
  offer?: {
    startDate: string;
    endDate: string;
    discount: number;
    name: string;
  };
}): number {
  const offerDetails = getOfferDetails(course);
  const price = offerDetails ? offerDetails.offerPrice : course.price || 0;
  return Math.round(price);
}
