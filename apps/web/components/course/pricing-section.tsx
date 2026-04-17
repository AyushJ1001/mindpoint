"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
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
import type { PublicCourse, PublicCourseBatch } from "@mindpoint/backend";

interface BatchOption extends PublicCourseBatch {
  isSelectable: boolean;
  summary: string;
}

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
  // Batch handling (optional; courses without batches simply skip the select).
  usesBatches?: boolean;
  batchOptions?: BatchOption[];
}

// Inclusions shown as a three-line list, type-aware.
function inclusionsFor(type?: string): string[] {
  switch (type) {
    case "worksheet":
      return [
        "Instant download after purchase",
        "Use in sessions or for personal practice",
        "Lifetime access to future updates",
      ];
    case "pre-recorded":
      return [
        "Full self-paced access",
        "Downloadable prompts and resources",
        "Lifetime access",
      ];
    case "therapy":
      return [
        "Sessions with a licensed therapist",
        "Flexible scheduling around your life",
        "Guided, evidence-based approaches",
      ];
    case "supervised":
      return [
        "Structured supervision on real cases",
        "Feedback you can actually use",
        "Cohort of peers at the same stage",
      ];
    case "internship":
      return [
        "Real cases under steady guidance",
        "Structured milestones and feedback",
        "A certificate at the end",
      ];
    default:
      return [
        "Live classes and practical exercises",
        "Recordings you can revisit",
        "A certificate on completion",
      ];
  }
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
  usesBatches = false,
  batchOptions = [],
}: PricingSectionProps) {
  // Therapy and supervised keep their bespoke plan pickers — we just wrap them
  // in the new calm container so they inherit the section rhythm.
  if (course.type === "therapy") {
    return (
      <section id="pricing" className="calm-section-tight">
        <div className="calm-container-wide">
          <ScrollReveal>
            <div>
              <p className="calm-section-number">Add to cart</p>
              <h2 className="calm-section-title mt-5">
                Choose the version that fits this season.
              </h2>
            </div>
            <p className="calm-section-lead mt-5 max-w-[58ch]">
              Pick the format that gives you the right level of care and
              continuity. No rush, no pressure.
            </p>
            <div className="mt-12">
              <ChoosePlan course={course} variants={variants} />
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  if (course.type === "supervised") {
    return (
      <section id="pricing" className="calm-section-tight">
        <div className="calm-container-wide">
          <ScrollReveal>
            <div>
              <p className="calm-section-number">Add to cart</p>
              <h2 className="calm-section-title mt-5">
                Choose the supervised path that fits your depth.
              </h2>
            </div>
            <p className="calm-section-lead mt-5 max-w-[58ch]">
              Clearer expectations, steadier structure, and the right amount of
              scaffolding around real clinical work.
            </p>
            <div className="mt-12">
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
  const maxQty = displayCourse.capacity ?? 1;

  const inclusions = inclusionsFor(course.type);
  const price = getCoursePrice(displayCourse);
  const mindPoints = calculatePointsEarned(displayCourse);

  return (
    <section id="pricing" className="calm-section-tight">
      <div className="calm-container-wide">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">Add to cart</p>
            <h2 className="calm-section-title mt-5">
              {usesBatches && batchOptions.length > 0
                ? "Pick a batch that fits your week."
                : "A steady next step."}
            </h2>
          </div>

          <div className="calm-pricing-stage mt-12">
          <div className="calm-card p-7 sm:p-10">
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="calm-price-big">{formatINR(price)}</span>
              {offerDetails?.hasDiscount && (
                <span className="calm-price-strike">
                  {formatINR(offerDetails.originalPrice)}
                </span>
              )}
              {hasValidOffer && offerDetails && (
                <span className="calm-kbd text-primary/90">
                  {offerDetails.offerName}
                  {offerDetails.hasDiscount
                    ? ` \u00b7 ${offerDetails.discountPercentage}% off`
                    : ""}
                </span>
              )}
            </div>

            {seatsLeft > 0 && seatsLeft <= 5 && (
              <p className="mt-3 text-sm text-foreground/55">
                Only {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left in this
                intake.
              </p>
            )}

            {shouldShowVariantSelect && (
              <div className="mt-6">
                <label className="calm-kbd mb-3 block text-foreground/55">
                  Choose duration
                </label>
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
                      <SelectLabel>Options</SelectLabel>
                      {normalizedVariants.map((v) => (
                        <SelectItem
                          key={v._id}
                          value={v._id as unknown as string}
                        >
                          <span className="font-medium">{variantLabel(v)}</span>
                          <span className="ml-2 text-foreground/55">
                            &mdash; {formatINR(getCoursePrice(v))}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mt-8">
              {isOutOfStock ? (
                <Button disabled className="h-12 w-full text-base">
                  Currently full
                </Button>
              ) : isInCart ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecreaseQuantity(displayCourse)}
                      className="h-10 w-10 p-0"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2.5rem] text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncreaseQuantity(displayCourse)}
                      disabled={quantity >= maxQty}
                      className="h-10 w-10 p-0"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(displayCourse._id)}
                      className="ml-auto text-foreground/60 hover:text-destructive"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="h-12 w-full text-base font-medium"
                    size="lg"
                    onClick={() => handleBuyNow(displayCourse)}
                  >
                    Go to checkout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => handleIncreaseQuantity(displayCourse)}
                    className="h-12 w-full text-base font-medium"
                    size="lg"
                  >
                    Add to cart
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(displayCourse)}
                    disabled={isOutOfStock}
                    className="calm-link mt-4 block w-full text-center text-sm text-foreground/60 hover:text-foreground"
                  >
                    Or go straight to checkout
                  </button>
                </>
              )}
            </div>

            <ul className="mt-9 space-y-2.5 border-t border-foreground/10 pt-7">
              {inclusions.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[0.95rem] leading-[1.55] text-foreground/70"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.7rem] h-px w-3 flex-none bg-foreground/35"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {mindPoints > 0 && (
              <p className="mt-6 text-xs text-foreground/45">
                You&rsquo;ll earn {mindPoints} Mind Points with this purchase.
              </p>
            )}
          </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
