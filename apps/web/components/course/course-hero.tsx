"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";

import type { PublicCourse } from "@mindpoint/backend";
import { getCoursePrice, type OfferDetails } from "@/lib/utils";
import { calculatePointsEarned } from "@/lib/mind-points";

const INR = "en-IN";

function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat(INR, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `\u20B9${value}`;
  }
}

function parseUTCDateOnly(dateStr: string): Date | null {
  // First try to parse as ISO format (YYYY-MM-DD)
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = isoDate.exec(dateStr);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1; // Month is 0-indexed
    const day = Number(match[3]);
    return new Date(Date.UTC(year, month, day));
  }

  // Fallback to standard Date parsing
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function getOrdinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  if (rem10 === 1) return "st";
  if (rem10 === 2) return "nd";
  if (rem10 === 3) return "rd";
  return "th";
}

function formatDateCommon(dateStr: string) {
  const d = parseUTCDateOnly(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

type CourseVariant = PublicCourse;

interface CourseHeroProps {
  course: PublicCourse;
  variants?: CourseVariant[];
  activeCourse: PublicCourse;
  setActiveCourse: (course: PublicCourse) => void;
  hasValidOffer: boolean;
  offerDetails: OfferDetails | null;
  isOutOfStock: boolean;
  seatsLeft: number;
  shouldShowVariantSelect: boolean;
  normalizedVariants: CourseVariant[];
  variantLabel: (v: CourseVariant) => string;
  handleVariantSelect: (val: string) => void;
  handleIncreaseQuantity: (course: PublicCourse) => void;
  handleDecreaseQuantity: (course: PublicCourse) => void;
  handleBuyNow: (course: PublicCourse) => void;
  getCurrentQuantity: (courseId: string) => number;
  inCart: (courseId: string) => boolean;
  removeItem: (courseId: string) => void;
  customDuration?: string;
}

export default function CourseHero({
  course,
  activeCourse,
  hasValidOffer,
  offerDetails,
  isOutOfStock,
  seatsLeft,
  shouldShowVariantSelect,
  normalizedVariants,
  variantLabel,
  handleVariantSelect,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  handleBuyNow,
  getCurrentQuantity,
  inCart,
  removeItem,
}: CourseHeroProps) {
  const displayCourse = activeCourse ?? course;

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container">
        {/* Breadcrumb */}
        <div className="text-muted-foreground mb-6 text-xs leading-relaxed break-words sm:text-sm">
          <Link
            href="/courses"
            className="hover:text-foreground transition-colors"
          >
            Courses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium break-words">
            {course.name}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Single Course Image */}
          <div>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={
                    displayCourse.imageUrls?.[0] ??
                    "/placeholder.svg?height=600&width=800&query=course"
                  }
                  alt={displayCourse.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column - Course Details */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* Course type badge */}
            <Badge variant="secondary" className="text-xs uppercase tracking-wide w-fit">
              {course.type ?? "Course"}
            </Badge>

            {/* Title */}
            <h1 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              {displayCourse.name}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mt-0 leading-relaxed">
              {course.description ||
                "Guided, interactive classes with recordings and lifetime support."}
            </p>

            {/* Price display */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-foreground text-3xl font-semibold">
                  {formatINR(getCoursePrice(displayCourse))}
                </span>
                {offerDetails?.hasDiscount && (
                  <span className="text-muted-foreground text-sm line-through">
                    {formatINR(offerDetails.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Inclusive of all taxes
                {hasValidOffer && offerDetails && (
                  <span className="text-primary font-medium">
                    {" "}
                    &middot; {offerDetails.offerName}
                  </span>
                )}
              </p>
              {offerDetails && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  {offerDetails.hasDiscount && (
                    <span className="text-muted-foreground">
                      {offerDetails.discountPercentage}% off
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {offerDetails.timeLeft.days > 0 &&
                      `${offerDetails.timeLeft.days}d `}
                    {offerDetails.timeLeft.hours > 0 &&
                      `${offerDetails.timeLeft.hours}h `}
                    {offerDetails.timeLeft.minutes > 0 &&
                      `${offerDetails.timeLeft.minutes}m`}{" "}
                    left
                  </span>
                </div>
              )}
              {offerDetails?.hasBogo && (
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  {`${offerDetails.bogoLabel || "BOGO"}: Buy one, get one free`}
                </div>
              )}
            </div>

            {/* Seats left indicator */}
            {seatsLeft > 0 && seatsLeft <= 5 && (
              <p className="text-sm text-muted-foreground">
                Only {seatsLeft} seats left
              </p>
            )}

            {/* Variant selector */}
            {shouldShowVariantSelect && (
              <Select
                key={displayCourse._id as unknown as string}
                value={displayCourse._id as unknown as string}
                onValueChange={handleVariantSelect}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Choose option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      {course.type === "therapy" ? "Sessions" : "Duration"}
                    </SelectLabel>
                    {normalizedVariants.map((v) => (
                      <SelectItem
                        key={v._id}
                        value={v._id as unknown as string}
                      >
                        <span className="font-medium">
                          {variantLabel(v)}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          &mdash; {formatINR(getCoursePrice(v))}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOutOfStock ? (
                <Button disabled className="h-12 w-full text-base">
                  Currently full
                </Button>
              ) : inCart(displayCourse._id) ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecreaseQuantity(displayCourse)}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[3rem] text-center font-medium">
                      {getCurrentQuantity(displayCourse._id)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncreaseQuantity(displayCourse)}
                      disabled={
                        getCurrentQuantity(displayCourse._id) >=
                        (displayCourse.capacity || 1)
                      }
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(displayCourse._id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleIncreaseQuantity(displayCourse)}
                  className="h-12 w-full text-base font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to your cart
                </Button>
              )}

              <Button
                variant="ghost"
                className="h-12 w-full text-base font-semibold"
                disabled={isOutOfStock}
                onClick={() => handleBuyNow(displayCourse)}
              >
                Go to checkout
              </Button>
            </div>

            {/* Mind Points note */}
            <p className="text-muted-foreground text-sm">
              Earn {calculatePointsEarned(displayCourse)} Mind Points with this
              purchase
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CourseScheduleSection — extracted from the hero for reuse          */
/* ------------------------------------------------------------------ */

export function CourseScheduleSection({
  course,
  customDuration,
}: {
  course: PublicCourse;
  customDuration?: string;
}) {
  // Only render for non-pre-recorded courses
  if ((course.type as string) === "pre-recorded") return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Schedule &amp; timing
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Start Date
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateCommon(course.startDate)}
                  </div>
                </div>
              </div>

              {course.type === "certificate" && course.endDate && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      End Date
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateCommon(course.endDate)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Time
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.startTime} - {course.endTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Days
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.daysOfWeek.join(", ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Duration
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {course.duration || customDuration || "2 weeks"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
