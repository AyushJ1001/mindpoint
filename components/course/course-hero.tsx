"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Trash2,
  BookOpen,
  Clock,
  Award,
  Video,
  Calendar,
  MapPin,
  ShoppingCart,
  Sparkles,
  HeartHandshake,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CourseImageGallery from "@/components/course/gallery";
import TrustBar from "@/components/course/trust-bar";
import type { Doc } from "@/convex/_generated/dataModel";
import { getCoursePrice, type OfferDetails } from "@/lib/utils";

const INR = "en-IN";

function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat(INR, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
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

function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return { ref, isVisible } as const;
}

type CourseVariant = Doc<"courses">;

interface CourseHeroProps {
  course: Doc<"courses">;
  variants?: CourseVariant[];
  activeCourse: Doc<"courses">;
  setActiveCourse: (course: Doc<"courses">) => void;
  hasValidOffer: boolean;
  offerDetails: OfferDetails | null;
  isOutOfStock: boolean;
  seatsLeft: number;
  shouldShowVariantSelect: boolean;
  normalizedVariants: CourseVariant[];
  variantLabel: (v: CourseVariant) => string;
  handleVariantSelect: (val: string) => void;
  handleIncreaseQuantity: (course: Doc<"courses">) => void;
  handleDecreaseQuantity: (course: Doc<"courses">) => void;
  handleBuyNow: (course: Doc<"courses">) => void;
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
  customDuration,
}: CourseHeroProps) {
  const heroAnimation = useScrollAnimation();
  const displayCourse = activeCourse ?? course;

  return (
    <section className="relative overflow-hidden py-12 md:py-20 dark:text-white">
      <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />
      <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-accent/10 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative z-10 container">
        <div className="text-muted-foreground mb-6 text-sm">
          <Link
            href="/courses"
            className="hover:text-foreground transition-colors"
          >
            Courses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{course.name}</span>
        </div>

        <div
          ref={heroAnimation.ref}
          className={`grid grid-cols-1 gap-12 transition-all duration-1000 ease-out lg:grid-cols-2 ${
            heroAnimation.isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          {/* Left Column - Course Image */}
          <div className="space-y-6">
            <div className="border-primary/20 from-primary/5 to-accent/5 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-2 shadow-2xl">
              <div className="bg-primary/20 absolute top-0 left-0 h-32 w-32 rounded-full blur-2xl" />
              <div className="bg-accent/20 absolute right-0 bottom-0 h-32 w-32 rounded-full blur-2xl" />
              <div className="relative z-10">
                <CourseImageGallery imageUrls={displayCourse.imageUrls ?? []} />
              </div>
            </div>
            <TrustBar />
          </div>

          {/* Right Column - Course Details */}
          <div className="flex flex-col gap-8">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
              {seatsLeft > 0 && seatsLeft <= 5 && (
                <Badge variant="destructive" className="animate-pulse">
                  🔥 Only {seatsLeft} seats left
                </Badge>
              )}
              {seatsLeft === 0 && (
                <Badge variant="secondary">📋 Waitlist Available</Badge>
              )}
              {offerDetails?.hasBogo && (
                <Badge className="bg-emerald-500/90 text-xs font-semibold text-white uppercase">
                  🛍️ BOGO Bonus
                </Badge>
              )}
              <Badge
                variant="outline"
                className="border-primary/50 text-primary"
              >
                {course.type ?? "Course"}
              </Badge>
            </div>

            {/* Course Title & Description */}
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  {displayCourse.name}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Guided, interactive classes with recordings and lifetime
                support.
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  label: "Study Material",
                  value: "✔︎",
                },
                {
                  icon: Video,
                  label: "Session Recordings",
                  value: "✔︎",
                },
                {
                  icon: Clock,
                  label:
                    course.type === "pre-recorded"
                      ? "Recording Duration"
                      : "Duration",
                  value:
                    course.type === "pre-recorded"
                      ? "3 months"
                      : course.duration || customDuration || "2 weeks",
                },
                { icon: Award, label: "Certificate", value: "✔︎" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <stat.icon className="text-primary h-6 w-6" />
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
                    {stat.label}
                  </div>
                  <div className="text-sm font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Pricing Card */}
            <Card className="border-primary/20 from-background to-primary/5 border-2 bg-gradient-to-br shadow-xl">
              <CardContent className="p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-primary text-4xl font-bold">
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
                          • {offerDetails.offerName}
                        </span>
                      )}
                    </p>
                    {offerDetails && (
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        {offerDetails.hasDiscount && (
                          <span className="text-orange-600">
                            🔥 {offerDetails.discountPercentage}% OFF
                          </span>
                        )}
                        <span
                          className={`${offerDetails.hasBogo ? "text-emerald-600" : "text-orange-600"}`}
                        >
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
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                        <Sparkles className="h-3 w-3" />
                        {`${offerDetails.bogoLabel || "BOGO"}: Buy one, get one free`}
                      </div>
                    )}
                  </div>

                  {shouldShowVariantSelect && (
                    <Select
                      key={displayCourse._id as unknown as string}
                      value={displayCourse._id as unknown as string}
                      onValueChange={handleVariantSelect}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {course.type === "therapy"
                              ? "Sessions"
                              : "Duration"}
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
                                — {formatINR(getCoursePrice(v))}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isOutOfStock ? (
                    <Button disabled className="h-12 w-full text-base">
                      Out of Stock
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
                      🛒 Add to Cart
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="h-12 w-full border-2 bg-transparent text-base font-semibold"
                    disabled={isOutOfStock}
                    onClick={() => handleBuyNow(displayCourse)}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Card - Only show for non-pre-recorded courses */}
            {(course.type as string) !== "pre-recorded" && (
              <Card className="border-muted border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="text-primary h-5 w-5" />
                    Schedule & Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Calendar className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Start Date</div>
                      <div className="text-muted-foreground text-sm">
                        {formatDateCommon(course.startDate)}
                      </div>
                    </div>
                  </div>
                  {course.type === "certificate" && course.endDate && (
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                        <Calendar className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">End Date</div>
                        <div className="text-muted-foreground text-sm">
                          {formatDateCommon(course.endDate)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Clock className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Time</div>
                      <div className="text-muted-foreground text-sm">
                        {course.startTime} - {course.endTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Days</div>
                      <div className="text-muted-foreground text-sm">
                        {course.daysOfWeek.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <TrendingUpIcon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-muted-foreground text-xs">
                        {(course.type as string) === "pre-recorded"
                          ? "3 months"
                          : course.duration || customDuration || "2 weeks"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-primary h-6 w-6" />
                  <span className="font-medium">
                    Practical, guided learning
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <HeartHandshake className="text-primary h-6 w-6" />
                  <span className="font-medium">Lifetime doubt clearing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
