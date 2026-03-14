import { clsx, type ClassValue } from "clsx";
import {
  calculateOfferPrice,
  calculateOfferTimeLeft,
  careerApplicationSchema,
  contactFormSchema,
  getCoursePrice,
  getOfferDetails,
  hasActiveBogo,
  hasActivePromotion,
  isBogoActive,
  isDiscountActive,
  showRupees,
  type CourseBogo,
  type CourseOffer,
  type OfferDetails,
} from "@mindpoint/domain";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  calculateOfferPrice,
  calculateOfferTimeLeft,
  careerApplicationSchema,
  contactFormSchema,
  getCoursePrice,
  getOfferDetails,
  hasActiveBogo,
  hasActivePromotion,
  isBogoActive,
  isDiscountActive,
  showRupees,
};

export type { CourseBogo, CourseOffer, OfferDetails };
