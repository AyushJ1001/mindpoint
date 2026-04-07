"use client";

import { Plus, Minus, Trash2, Gift } from "lucide-react";
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
import { formatINR } from "@/components/course/course-hero";
import { getCoursePrice, type OfferDetails } from "@/lib/utils";
import { calculatePointsEarned } from "@/lib/mind-points";
import ChoosePlan from "@/components/therapy/choose-plan";
import ChooseSupervisedPlan from "@/components/therapy/choose-supervised-plan";
import type { PublicCourse } from "@mindpoint/backend";

interface PricingSectionProps {
  course: PublicCourse;
  activeCourse: PublicCourse;
  variants: PublicCourse[];
  isOutOfStock: boolean;
  seatsLeft: number;
  hasValidOffer: boolean;
  offerDetails: OfferDetails | null;
  shouldShowVariantSelect: boolean;
  normalizedVariants: PublicCourse[];
  variantLabel: (v: PublicCourse) => string;
  handleVariantSelect: (val: string) => void;
  handleIncreaseQuantity: (course: PublicCourse) => void;
  handleDecreaseQuantity: (course: PublicCourse) => void;
  handleBuyNow: (course: PublicCourse) => void;
  getCurrentQuantity: (courseId: string) => number;
  inCart: (id: string) => boolean;
  removeItem: (id: string) => void;
  mounted: boolean;
}

export default function PricingSection({
  course,
  activeCourse,
  variants,
  isOutOfStock,
  seatsLeft,
  hasValidOffer,
  offerDetails,
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
  mounted,
}: PricingSectionProps) {
  const formatDeliveryLabel = () => {
    if (course.type === "pre-recorded") return "Self-paced with repeat access";
    if (course.type === "worksheet")
      return "A practical resource you can revisit";
    if (course.type === "therapy")
      return "Guided sessions tailored to your pace";
    if (course.type === "supervised")
      return "Live supervision with room for reflection";
    return "Live guidance with practical takeaways";
  };

  const reassuranceItems = [
    {
      title: "What this includes",
      value:
        course.type === "worksheet"
          ? "Structured prompts and a resource you can keep returning to."
          : "Clear teaching, useful materials, and a pace built for real people.",
    },
    {
      title: course.type === "worksheet" ? "How to use it" : "How it works",
      value: formatDeliveryLabel(),
    },
    {
      title: "Why it feels worth it",
      value:
        course.type === "therapy" || course.type === "supervised"
          ? "You are paying for attentive guidance, not just access."
          : "You leave with something more usable than a folder of notes.",
    },
  ];

  // Therapy courses get their own plan selection UI
  if (course.type === "therapy") {
    return (
      <section id="pricing" className="course-section-lg pt-5 sm:pt-6">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-6xl px-2 sm:px-4">
              <div className="mb-8 max-w-2xl">
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  Reserve your spot
                </span>
                <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Choose the version of support that fits the season you are in.
                </h2>
                <p className="text-muted-foreground mt-3 text-base leading-7 sm:text-lg">
                  The next step should feel reassuring, not rushed. Pick the
                  format that gives you the right level of care and continuity.
                </p>
              </div>
              <ChoosePlan course={course} variants={variants} />
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  // Supervised courses get their own plan selection UI
  if (course.type === "supervised") {
    return (
      <section id="pricing" className="course-section-lg pt-5 sm:pt-6">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-6xl px-2 sm:px-4">
              <div className="mb-8 max-w-2xl">
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  Reserve your spot
                </span>
                <h2 className="font-display text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Choose the supervised path that matches the depth you need.
                </h2>
                <p className="text-muted-foreground mt-3 text-base leading-7 sm:text-lg">
                  This is meant to feel like a thoughtful commitment, with
                  clearer expectations and the right amount of structure around
                  you.
                </p>
              </div>
              <ChooseSupervisedPlan course={course} variants={variants} />
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  const displayCourse = activeCourse ?? course;
  const isInCart = mounted && inCart(displayCourse._id);
  const quantity = mounted ? getCurrentQuantity(displayCourse._id) : 0;

  return (
    <section id="pricing" className="course-section-lg pt-5 sm:pt-6">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <div className="rounded-2xl bg-card/50 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8 lg:text-left">
                <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                  Reserve your spot
                </span>
                <h2 className="font-display text-foreground mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  A steady next step, without the hard sell.
                </h2>
                <p className="text-muted-foreground mt-3 text-base leading-7">
                  If this already feels like the right fit, you can keep the
                  next move simple. Everything below is here to make the
                  decision clearer.
                </p>

                <div className="mt-7 space-y-2">
                  <div className="flex items-baseline justify-center gap-3 lg:justify-start">
                    <span className="text-foreground text-4xl font-semibold">
                      {formatINR(getCoursePrice(displayCourse))}
                    </span>
                    {offerDetails?.hasDiscount && (
                      <span className="text-muted-foreground text-lg line-through">
                        {formatINR(offerDetails.originalPrice)}
                      </span>
                    )}
                  </div>

                  {hasValidOffer && offerDetails && (
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full text-xs"
                      >
                        {offerDetails.offerName}
                        {offerDetails.hasDiscount &&
                          ` · ${offerDetails.discountPercentage}% off`}
                      </Badge>
                    </div>
                  )}
                </div>

                {seatsLeft > 0 && seatsLeft <= 5 && (
                  <p className="text-muted-foreground mt-4 text-sm">
                    Only {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left in
                    this intake.
                  </p>
                )}

                {shouldShowVariantSelect && (
                  <div className="mt-6">
                    <Select
                      key={displayCourse._id as unknown as string}
                      value={displayCourse._id as unknown as string}
                      onValueChange={handleVariantSelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Duration</SelectLabel>
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
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {isOutOfStock ? (
                    <Button disabled className="h-12 w-full text-base">
                      Currently full
                    </Button>
                  ) : isInCart ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 lg:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecreaseQuantity(displayCourse)}
                          className="h-10 w-10 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[3rem] text-center font-medium">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncreaseQuantity(displayCourse)}
                          disabled={quantity >= (displayCourse.capacity || 1)}
                          className="h-10 w-10 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(displayCourse._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="h-12 w-full text-base font-semibold"
                        size="lg"
                        disabled
                      >
                        In your cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleIncreaseQuantity(displayCourse)}
                      className="h-12 w-full text-base font-semibold"
                      size="lg"
                    >
                      Reserve your spot
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

                <p className="text-muted-foreground mt-6 flex items-center justify-center gap-1.5 text-sm lg:justify-start">
                  <Gift className="h-3.5 w-3.5" />
                  Earn {calculatePointsEarned(displayCourse)} Mind Points with
                  this purchase
                </p>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-primary/70 text-xs font-semibold tracking-[0.28em] uppercase">
                    Why people feel comfortable saying yes
                  </span>
                  <p className="text-foreground mt-3 text-lg leading-8 sm:text-xl">
                    The value here is not just access. It is the feeling of
                    being held by a clearer structure, better questions, and
                    learning you can actually use.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  {reassuranceItems.map((item) => (
                    <div
                      key={item.title}
                      className="border-primary/8 border-l-2 py-3 pl-5"
                    >
                      <p className="text-primary/75 text-xs font-semibold tracking-[0.22em] uppercase">
                        {item.title}
                      </p>
                      <p className="text-foreground mt-3 text-sm leading-6 sm:text-base">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
