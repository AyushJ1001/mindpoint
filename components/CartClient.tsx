"use client";

import { useCart } from "react-use-cart";
import { Suspense } from "react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  ShoppingCart,
  CreditCard,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { showRupees, getOfferDetails, type OfferDetails } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import {
  handlePaymentSuccess,
  handleGuestUserPaymentSuccessWithData,
} from "@/app/actions/payment";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { GuestCheckoutModal } from "@/components/guest-checkout-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CartContent = () => {
  const {
    items,
    removeItem,
    updateItemQuantity,
    cartTotal,
    isEmpty,
    emptyCart,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const { Razorpay, isLoading } = useRazorpay();
  const { user, isLoaded: isUserLoaded } = useUser();

  // State to track offer details for each item
  const [itemOfferDetails, setItemOfferDetails] = useState<
    Record<string, OfferDetails>
  >({});

  // Update offer details for cart items
  useEffect(() => {
    const updateOfferDetails = () => {
      const newOfferDetails: Record<string, OfferDetails> = {};
      items.forEach((item) => {
        if (item.offer || item.bogo) {
          const offerPrice = item.price || 0;
          const discountPercentage = item.offer?.discount ?? 0;

          // Handle 100% discount case - we can't calculate original price from offer price
          let originalPrice = offerPrice;
          if (discountPercentage > 0 && discountPercentage < 100) {
            const denominator = 1 - discountPercentage / 100;
            if (Math.abs(denominator) > 1e-6) {
              originalPrice = offerPrice / denominator;
            }
          } else if (discountPercentage === 100) {
            // For 100% discount, we need to get the original price from the course data
            // This should be handled by the backend or we need to store original price separately
            originalPrice = offerPrice; // Fallback to offer price if original not available
          }

          const offerDetails = getOfferDetails({
            price: originalPrice,
            offer: item.offer ?? null,
            bogo: item.bogo ?? null,
          });
          if (offerDetails) {
            newOfferDetails[item.id] = offerDetails;
          }
        }
      });
      setItemOfferDetails(newOfferDetails);
    };

    updateOfferDetails();
    const interval = setInterval(updateOfferDetails, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [items]);

  const hasBogoItems = items.some((item) => itemOfferDetails[item.id]?.hasBogo);

  const activeBogoLabels = useMemo(() => {
    const labels = new Set<string>();
    items.forEach((item) => {
      const details = itemOfferDetails[item.id];
      if (details?.hasBogo && details.bogoLabel) {
        labels.add(details.bogoLabel);
      }
    });
    return Array.from(labels);
  }, [items, itemOfferDetails]);

  const showEnrollmentToast = (
    enrollments:
      | Array<{
          enrollmentNumber: string;
          isBogoFree?: boolean;
        }>
      | undefined,
  ) => {
    if (!enrollments || enrollments.length === 0) {
      toast.success(
        "Payment successful! Check your email for enrollment confirmation.",
      );
      return;
    }

    const bonusCount = enrollments.filter((e) => e.isBogoFree).length;
    const paidCount = enrollments.length - bonusCount;
    const parts: string[] = [];
    if (paidCount > 0) {
      parts.push(`${paidCount} course${paidCount === 1 ? "" : "s"}`);
    }
    if (bonusCount > 0) {
      parts.push(`${bonusCount} bonus course${bonusCount === 1 ? "" : "s"}`);
    }

    const message = parts.length
      ? `Payment successful! ${parts.join(" + ")} added to your account.`
      : "Payment successful!";

    const enrollmentNumbers = enrollments
      .filter((e) => e.enrollmentNumber && e.enrollmentNumber !== "N/A")
      .map((e) => e.enrollmentNumber);

    const hasValidEnrollments = enrollmentNumbers.length > 0;

    toast.success(message, {
      description: hasValidEnrollments
        ? `Enrollment numbers: ${enrollmentNumbers.join(", ")}`
        : "Check your email for enrollment confirmation.",
    });
  };

  const handleClearCart = () => {
    emptyCart();
    setShowClearCartDialog(false);
    toast.success("Cart cleared successfully");
  };

  // Reset processing state when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsProcessing(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User navigated away or closed tab, reset processing state
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setIsProcessing(false);
    };
  }, []);

  const handlePayment = async (guestUserData?: {
    name: string;
    email: string;
    phone: string;
  }) => {
    if (isEmpty) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(cartTotal) }), // API will convert to paise
      });

      const data = await response.json();

      const options: RazorpayOrderOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "The Mind Point",
        description: `Payment for ${items.length} course(s)`,
        order_id: data.id,
        handler: async () => {
          // Add event handlers for payment modal

          if (user?.id) {
            // Handle signed-in user
            try {
              // Get course IDs from cart items
              const courseIds = items.map((item) => item.id as Id<"courses">);

              // Extract BOGO selections from cart items
              const bogoSelections = items
                .filter((item) => item.selectedFreeCourse)
                .map((item) => ({
                  sourceCourseId: item.id as Id<"courses">,
                  selectedFreeCourseId: item.selectedFreeCourse!.id,
                }));

              // Call server action to handle enrollment
              const result = await handlePaymentSuccess(
                user.id,
                courseIds as Id<"courses">[],
                user.primaryEmailAddress?.emailAddress || "",
                undefined, // userPhone
                undefined, // studentName
                undefined, // sessionType
                bogoSelections.length > 0 ? bogoSelections : undefined,
              );

              if (result.success) {
                showEnrollmentToast(result.enrollments);
              } else {
                toast.error(
                  "Payment successful but enrollment failed. Please contact support.",
                  {
                    description: result.error,
                  },
                );
              }
            } catch {
              toast.error(
                "Payment successful but enrollment failed. Please contact support.",
              );
            }
          } else if (guestUserData) {
            // Handle guest user
            try {
              const courseIds = items.map((item) => item.id as Id<"courses">);

              // Extract BOGO selections from cart items
              const bogoSelections = items
                .filter((item) => item.selectedFreeCourse)
                .map((item) => ({
                  sourceCourseId: item.id as Id<"courses">,
                  selectedFreeCourseId: item.selectedFreeCourse!.id,
                }));

              const result = await handleGuestUserPaymentSuccessWithData(
                guestUserData,
                courseIds as Id<"courses">[],
                undefined, // sessionType
                bogoSelections.length > 0 ? bogoSelections : undefined,
              );

              if (result.success) {
                console.log("Guest enrollment successful:", result.enrollments);
                showEnrollmentToast(result.enrollments);
              } else {
                console.error("Guest enrollment failed:", result.error);
                toast.error(
                  "Payment successful but enrollment failed. Please contact support.",
                  {
                    description: result.error,
                  },
                );
              }
            } catch (error) {
              console.error("Error handling guest payment success:", error);
              toast.error(
                "Payment successful but enrollment failed. Please contact support.",
              );
            }
          }

          // Clear cart after successful payment
          emptyCart();
          setIsProcessing(false);
        },
        prefill: {
          name: user?.fullName || guestUserData?.name || "",
          email:
            user?.primaryEmailAddress?.emailAddress ||
            guestUserData?.email ||
            "",
          contact: guestUserData?.phone || "",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new Razorpay(options);

      // Add event handlers for payment modal
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Please try again.");
        setIsProcessing(false);
        if (modalCheckInterval) clearInterval(modalCheckInterval);
        if (observer) observer.disconnect();
      });

      // Note: These event handlers are commented out as they may not be supported in the current version
      // The payment success is handled in the main handler function above

      // Add a timeout to reset processing state in case events don't fire
      const timeoutId = setTimeout(() => {
        console.log("Payment timeout - resetting processing state");
        setIsProcessing(false);
      }, 60000); // 1 minute timeout

      // Clear timeout when payment is successful (handled in main handler)
      const clearTimeoutAndCleanup = () => {
        clearTimeout(timeoutId);
        if (modalCheckInterval) clearInterval(modalCheckInterval);
        if (observer) observer.disconnect();
      };

      // Monitor Razorpay modal state with comprehensive detection
      let modalCheckInterval: NodeJS.Timeout;
      let observer: MutationObserver;

      const startModalMonitoring = () => {
        console.log("Starting Razorpay modal monitoring...");

        // More comprehensive selectors for Razorpay elements
        const razorpaySelectors = [
          "#razorpay-payment-button",
          ".razorpay-container",
          'iframe[src*="razorpay"]',
          'iframe[src*="checkout"]',
          '[id*="razorpay"]',
          '[class*="razorpay"]',
          ".razorpay-checkout",
          "#razorpay-checkout",
          'div[style*="position: fixed"][style*="z-index"]', // Common modal styling
          'div[style*="position: fixed"][style*="top: 0"]', // Full screen modal
        ];

        const checkForRazorpayModal = () => {
          const foundElements = [];
          razorpaySelectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              foundElements.push(...Array.from(elements));
            }
          });

          // Also check for any iframe that might be Razorpay
          const allIframes = document.querySelectorAll("iframe");
          const razorpayIframes = Array.from(allIframes).filter((iframe) => {
            const src = (iframe as HTMLIFrameElement).src || "";
            return (
              src.includes("razorpay") ||
              src.includes("checkout") ||
              src.includes("pay")
            );
          });
          foundElements.push(...razorpayIframes);

          console.log(
            `Found ${foundElements.length} potential Razorpay elements:`,
            foundElements,
          );

          // Check if any of the found elements are actually visible and interactive
          const visibleElements = foundElements.filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();

            // Check if element is visible (not hidden, has dimensions, not transparent)
            const isVisible =
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0 &&
              parseFloat(style.opacity) > 0;

            // Check if element is in viewport
            const isInViewport =
              rect.top < window.innerHeight &&
              rect.bottom > 0 &&
              rect.left < window.innerWidth &&
              rect.right > 0;

            return isVisible && isInViewport;
          });

          console.log(
            `Found ${visibleElements.length} visible Razorpay elements:`,
            visibleElements,
          );

          // If no visible elements, consider modal closed
          if (visibleElements.length === 0) {
            console.log(
              "No visible Razorpay elements found - resetting processing state",
            );
            setIsProcessing(false);
            clearTimeoutAndCleanup();
            return true; // Modal is closed
          }

          // Additional check: look for modal backdrop/overlay
          const modalBackdrop = document.querySelector(
            '.razorpay-backdrop, div[style*="position: fixed"][style*="background"]',
          );
          if (modalBackdrop) {
            const backdropStyle = window.getComputedStyle(modalBackdrop);
            const backdropRect = modalBackdrop.getBoundingClientRect();

            // Check if backdrop is visible and covers the screen
            const isBackdropVisible =
              backdropStyle.display !== "none" &&
              backdropStyle.visibility !== "hidden" &&
              backdropRect.width > 0 &&
              backdropRect.height > 0 &&
              parseFloat(backdropStyle.opacity) > 0;

            console.log(
              `Modal backdrop visible: ${isBackdropVisible}`,
              backdropStyle,
            );

            if (!isBackdropVisible) {
              console.log(
                "Modal backdrop not visible - resetting processing state",
              );
              setIsProcessing(false);
              clearTimeoutAndCleanup();
              return true; // Modal is closed
            }
          }

          return false; // Modal is still open
        };

        // Interval-based monitoring
        modalCheckInterval = setInterval(() => {
          checkForRazorpayModal();
        }, 1000); // Check every second for faster response

        // DOM mutation observer for immediate detection
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
              // Check if any removed nodes were Razorpay elements
              const removedNodes = Array.from(mutation.removedNodes);
              const hadRazorpayElements = removedNodes.some((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  return (
                    razorpaySelectors.some((selector) =>
                      element.matches(selector),
                    ) ||
                    (element.tagName === "IFRAME" &&
                      ((element as HTMLIFrameElement).src?.includes(
                        "razorpay",
                      ) ||
                        (element as HTMLIFrameElement).src?.includes(
                          "checkout",
                        )))
                  );
                }
                return false;
              });

              if (hadRazorpayElements) {
                console.log(
                  "Razorpay elements removed from DOM - checking if modal is closed",
                );
                setTimeout(() => {
                  if (checkForRazorpayModal()) {
                    console.log("Confirmed: Razorpay modal is closed");
                  }
                }, 500); // Small delay to ensure DOM is updated
              }
            }
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
      };

      // Start monitoring after modal opens
      setTimeout(startModalMonitoring, 2000);

      rzp.open();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!isUserLoaded) {
      // Still loading user state
      return;
    }

    if (user) {
      // User is signed in, proceed with payment
      handlePayment();
    } else {
      // User is not signed in, show guest modal
      setShowGuestModal(true);
    }
  };

  const handleGuestProceed = (userData: {
    name: string;
    email: string;
    phone: string;
  }) => {
    setShowGuestModal(false);
    handlePayment(userData);
  };

  if (isEmpty) {
    return (
      <div className="container mx-auto py-16 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
        <div className="text-center">
          <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some courses to get started with your learning journey.
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your selected courses and proceed to checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({items.length})
              </CardTitle>
              <div className="flex justify-end">
                <Dialog
                  open={showClearCartDialog}
                  onOpenChange={setShowClearCartDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Cart</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove all items from your
                        cart? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowClearCartDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearCart}>
                        Clear Cart
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const offerDetails = itemOfferDetails[item.id];
                const itemTotal = Math.round(
                  (item.price || 0) * (item.quantity || 1),
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrls?.[0] || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.courseType}
                      </p>
                      {offerDetails && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          {offerDetails.hasDiscount && (
                            <span className="rounded bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-800">
                              🔥 {offerDetails.discountPercentage}% OFF
                            </span>
                          )}
                          <span
                            className={`font-medium ${offerDetails.hasBogo ? "text-emerald-600" : "text-muted-foreground"}`}
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
                        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Sparkles className="h-3 w-3" />
                          {offerDetails.bogoLabel ??
                            "Bonus enrollment included"}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(
                              item.id,
                              (item.quantity || 1) - 1,
                            )
                          }
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateItemQuantity(
                              item.id,
                              (item.quantity || 1) + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {showRupees(itemTotal)}
                      </div>
                      {offerDetails?.hasDiscount && (
                        <div className="text-muted-foreground text-xs">
                          <span className="line-through">
                            {showRupees(
                              (offerDetails.originalPrice || 0) *
                                (item.quantity || 1),
                            )}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="mt-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasBogoItems && (
                <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    BOGO applied:{" "}
                    {activeBogoLabels.length > 0
                      ? `${activeBogoLabels.join(", ")}`
                      : "complimentary course enrollments"}
                    {" will be added automatically during checkout."}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>{showRupees(Math.round(cartTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{showRupees(Math.round(cartTotal))}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckoutClick}
                disabled={isProcessing || isLoading}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <GuestCheckoutModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onProceed={handleGuestProceed}
      />
    </div>
  );
};

const CartPage = () => {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <CartContent />
    </Suspense>
  );
};

export default CartPage;
