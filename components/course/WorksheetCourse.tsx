"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import {
  FileText,
  Users,
  Download,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  BookOpen,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import TrustBar from "@/components/course/trust-bar";
import type { Doc } from "@/convex/_generated/dataModel";
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
  course: Doc<"courses">;
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
      <section className="relative overflow-hidden py-12 md:py-20 dark:text-white">
        <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" />

        <div className="relative z-10 container">
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
            <div className="space-y-6">
              <div className="border-primary/20 from-primary/5 to-accent/5 relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-2 shadow-2xl">
                <div className="bg-primary/20 absolute top-0 left-0 h-32 w-32 rounded-full blur-2xl" />
                <div className="bg-accent/20 absolute right-0 bottom-0 h-32 w-32 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="bg-muted/20 border-primary/20 relative overflow-hidden rounded-lg border-2">
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
              </div>
              <TrustBar />
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col gap-8">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Instant Download
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  PDF Format
                </Badge>
                {offerDetails?.hasDiscount && (
                  <Badge className="animate-pulse bg-orange-500/90 text-xs font-semibold text-white uppercase">
                    🔥 {offerDetails.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                  <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                    {course.name}
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  A comprehensive worksheet designed to support your mental
                  health journey.
                </p>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Download, label: "Instant Access", value: "✔︎" },
                  { icon: FileText, label: "Printable PDF", value: "✔︎" },
                  { icon: BookOpen, label: "Self-Guided", value: "✔︎" },
                  { icon: Zap, label: "Evidence-Based", value: "✔︎" },
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
                            • {offerDetails.offerName}
                          </span>
                        )}
                      </p>
                      {offerDetails && offerDetails.hasDiscount && (
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                          <span className="text-orange-600">
                            🔥 {offerDetails.discountPercentage}% OFF
                          </span>
                          <span className="text-orange-600">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isOutOfStock ? (
                      <Button disabled className="h-12 w-full text-base">
                        Currently Unavailable
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
                        🛒 Add to Cart
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="h-12 w-full border-2 bg-transparent text-base font-semibold"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Banner */}
              <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-primary h-6 w-6" />
                    <span className="font-medium">Professionally designed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary h-6 w-6" />
                    <span className="font-medium">
                      Ready to use immediately
                    </span>
                  </div>
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
              <div className="relative overflow-hidden rounded-2xl">
                <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
                <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br p-8">
                  <CardHeader className="pb-6">
                    <div className="bg-primary/10 text-primary mb-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      About This Worksheet
                    </div>
                    <CardTitle className="text-3xl font-bold">
                      <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                        What&apos;s Inside?
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                      {course.worksheetDescription}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Target Audience Section */}
      {course.targetAudience && course.targetAudience.length > 0 && (
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950" />
          <div className="bg-primary/5 absolute top-0 left-0 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-accent/5 absolute right-0 bottom-0 h-96 w-96 rounded-full blur-3xl" />

          <div className="relative z-10 container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Perfect For
                </div>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                    Who Is This Worksheet For?
                  </span>
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                  This worksheet is designed to support various individuals on
                  their mental health journey
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {course.targetAudience.map((audience, index) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50"
                  >
                    <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="from-primary to-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <span className="text-lg font-medium">{audience}</span>
                    </div>
                  </Card>
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
        gradientClass="!bg-gradient-to-br !from-amber-50 !to-orange-50 dark:!from-oklch(0.1_0.02_240) dark:!to-oklch(0.14_0.02_240)"
      />
    </>
  );
}
