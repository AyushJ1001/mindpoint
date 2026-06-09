import { clsx, type ClassValue } from "clsx";
import {
  calculateActiveOfferPrice,
  calculateCourseOfferPrice,
  calculateOfferPrice,
  calculateOfferTimeLeft,
  careerApplicationSchema,
  contactFormSchema,
  formatOfferAdjustment,
  getCoursePrice,
  getOfferDiscountType,
  getOfferDiscountValue,
  getOfferDetails,
  getOfferSavingsAmount,
  hasActiveBogo,
  hasActivePromotion,
  isBogoActive,
  isDiscountActive,
  showRupees,
  type CourseBogo,
  type CourseOffer,
  type OfferDetails,
} from "@/lib/domain";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  calculateActiveOfferPrice,
  calculateCourseOfferPrice,
  calculateOfferPrice,
  calculateOfferTimeLeft,
  careerApplicationSchema,
  contactFormSchema,
  formatOfferAdjustment,
  getCoursePrice,
  getOfferDiscountType,
  getOfferDiscountValue,
  getOfferDetails,
  getOfferSavingsAmount,
  hasActiveBogo,
  hasActivePromotion,
  isBogoActive,
  isDiscountActive,
  showRupees,
};

export type { CourseBogo, CourseOffer, OfferDetails };
