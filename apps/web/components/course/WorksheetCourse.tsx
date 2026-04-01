"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import {
  FileText,
  Download,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  BookOpen,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StickyCTA from "@/components/course/sticky-cta";
import ReviewsSection from "@/components/course/reviews-section";
import type { PublicCourse } from "@mindpoint/backend";
import {
  getOfferDetails,
  getCoursePrice,
  hasActivePromotion,
} from "@/lib/utils";

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

interface WorksheetCourseProps {
  course: PublicCourse;
}

export default function WorksheetCourse({ course }: WorksheetCourseProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);

  const { addItem, inCart, updateItemQuantity, removeItem, items } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if course has a valid offer using utility function
  const hasValidOffer = useMemo(() => {
    return hasActivePromotion({
      offer: course.offer ?? null,
      bogo: course.bogo ?? null,
    });
  }, [course.offer, course.bogo]);

  // Calculate offer details using utility function
  const offerDetails = useMemo(() => {
    return getOfferDetails(course);
  }, [course]);

  // Helper function to get current quantity of a course in cart
  const getCurrentQuantity = (courseId: string) => {
    const cartItem = items.find((item) => item.id === courseId);
    return cartItem?.quantity || 0;
  };

  // Helper function to handle buy now
  const handleBuyNow = () => {
    // Check if cart has any items (including this course)
    if (items.length > 0) {
      // Cart has items, show confirmation dialog
      setShowBuyNowDialog(true);
    } else {
      // Cart is empty, proceed directly
      handleBuyNowConfirm();
    }
  };

  // Helper function to confirm buy now action
  const handleBuyNowConfirm = () => {
    const priceToUse = getCoursePrice(course);

    // Remove all items from cart except the current course
    items.forEach((item) => {
      if (item.id !== course._id) {
        removeItem(item.id);
      }
    });

    // If the current course is not in cart, add it
    if (!inCart(course._id)) {
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: priceToUse,
        originalPrice: course.price,
        imageUrls: course.imageUrls || [],
        capacity: course.capacity || 1,
        quantity: 1,
        offer: course.offer,
        bogo: course.bogo,
        courseType: course.type,
      });
    } else {
      // If it's already in cart, ensure it has the correct price and quantity
      updateItemQuantity(course._id, 1);
    }

    // Navigate to cart
    router.push("/cart");
  };

  // Helper function to handle quantity increase
  const handleIncreaseQuantity = () => {
    const currentQuantity = getCurrentQuantity(course._id);
    const maxQuantity = course.capacity || 1;
    const priceToUse = getCoursePrice(course);

    if (currentQuantity === 0) {
      addItem({
        id: course._id,
        name: course.name,
        description: course.description,
        price: priceToUse,
        originalPrice: course.price,
        imageUrls: course.imageUrls || [],
        capacity: course.capacity || 1,
        quantity: 1,
        offer: course.offer,
        bogo: course.bogo,
        courseType: course.type,
      });
    } else if (currentQuantity < maxQuantity) {
      updateItemQuantity(course._id, currentQuantity + 1);
    }
  };

  // Helper function to handle quantity decrease
  const handleDecreaseQuantity = () => {
    const currentQuantity = getCurrentQuantity(course._id);

    if (currentQuantity > 1) {
      updateItemQuantity(course._id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeItem(course._id);
    }
  };

  const isOutOfStock = (course.capacity ?? 0) === 0;
  const isInCart = mounted ? inCart(course._id) : false;

  return (
    <>
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container">
          {/* Breadcrumb */}
          <div className="text-muted-foreground mb-6 text-sm">
            <Link
              href="/courses"
              className="hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/courses/worksheet"
              className="hover:text-foreground transition-colors"
            >
              Worksheets
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{course.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Image */}
            <div>
              <div className="border-border overflow-hidden rounded-2xl border">
                <div className="relative aspect-[9/16] w-full">
                  <Image
                    src={
                      course.imageUrls?.[0] ??
                      "/placeholder.svg?height=1600&width=900&query=worksheet"
                    }
                    alt={course.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                    quality={95}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col gap-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="secondary"
                  className="text-xs tracking-wide uppercase"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Instant Download
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs tracking-wide uppercase"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  PDF Format
                </Badge>
                {offerDetails?.hasDiscount && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {offerDetails.discountPercentage}% off
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                {course.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                A comprehensive worksheet designed to support your mental health
                journey.
              </p>

              {/* Quick Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Download, label: "Instant Access" },
                  { icon: FileText, label: "Printable PDF" },
                  { icon: BookOpen, label: "Self-Guided" },
                  { icon: Zap, label: "Evidence-Based" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-card rounded-2xl border p-4 text-center"
                  >
                    <stat.icon className="text-primary mx-auto h-5 w-5" />
                    <p className="text-foreground mt-2 text-sm font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Card */}
              <div className="border-border bg-card rounded-2xl border p-6">
                <div className="mb-6 space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-foreground text-3xl font-semibold">
                      {formatINR(getCoursePrice(course))}
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
                  {offerDetails && offerDetails.hasDiscount && (
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span>{offerDetails.discountPercentage}% off</span>
                      <span>
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
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isOutOfStock ? (
                    <Button disabled className="h-12 w-full text-base">
                      Currently full
                    </Button>
                  ) : isInCart ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDecreaseQuantity}
                          className="h-10 w-10 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[3rem] text-center font-medium">
                          {getCurrentQuantity(course._id)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleIncreaseQuantity}
                          disabled={
                            getCurrentQuantity(course._id) >=
                            (course.capacity || 1)
                          }
                          className="h-10 w-10 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(course._id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleIncreaseQuantity}
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
                    onClick={handleBuyNow}
                  >
                    Go to checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Worksheet Description Section */}
      {course.worksheetDescription && (
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="border-border bg-card rounded-2xl border p-8">
                <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  About This Worksheet
                </div>
                <h3 className="font-display text-foreground text-2xl font-semibold tracking-tight">
                  What&apos;s inside?
                </h3>
                <p className="text-muted-foreground mt-3 text-lg leading-relaxed whitespace-pre-line">
                  {course.worksheetDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Target Audience Section */}
      {course.targetAudience && course.targetAudience.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center">
                <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                  Who is this worksheet for?
                </h2>
                <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
                  This worksheet is designed to support various individuals on
                  their mental health journey
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {course.targetAudience.map((audience, index) => (
                  <div
                    key={index}
                    className="border-border bg-card flex items-center gap-4 rounded-2xl border p-5"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    </div>
                    <span className="text-foreground font-medium">
                      {audience}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ReviewsSection courseId={course._id} courseType="worksheet" />

      {/* Buy Now Confirmation Dialog */}
      <Dialog open={showBuyNowDialog} onOpenChange={setShowBuyNowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cart Already Has Items</DialogTitle>
            <DialogDescription>
              Your cart currently contains items. Would you like to:
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setShowBuyNowDialog(false);
                handleBuyNowConfirm();
              }}
              className="w-full sm:w-auto"
            >
              Buy Only This Worksheet
            </Button>
            <Button
              onClick={() => {
                setShowBuyNowDialog(false);
                // If worksheet is not in cart, add it; if it is, just proceed to checkout
                if (!isInCart) {
                  handleIncreaseQuantity();
                }
                router.push("/cart");
              }}
              className="w-full sm:w-auto"
            >
              Keep All Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky CTA */}
      <StickyCTA
        price={getCoursePrice(course)}
        onPrimary={handleIncreaseQuantity}
        onBuyNow={handleBuyNow}
        disabled={
          isOutOfStock ||
          (isInCart && getCurrentQuantity(course._id) >= (course.capacity || 1))
        }
        inCart={isInCart}
        quantity={getCurrentQuantity(course._id)}
        isOutOfStock={isOutOfStock}
      />
    </>
  );
}
