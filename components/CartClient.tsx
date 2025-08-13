"use client";

import { useCart } from "react-use-cart";
import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingCart, CreditCard, Plus, Minus } from "lucide-react";
import { showRupees } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import {
  handlePaymentSuccess,
  handleGuestUserPaymentSuccessWithData,
} from "@/app/actions/payment";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { GuestCheckoutModal } from "@/components/guest-checkout-modal";

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
  const courses = useQuery(api.courses.listCourses, { count: undefined });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const { Razorpay, error, isLoading } = useRazorpay();
  const { user, isLoaded: isUserLoaded } = useUser();

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
        body: JSON.stringify({ amount: cartTotal }), // API will convert to paise
      });

      const data = await response.json();

      const options: RazorpayOrderOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "The Mind Point",
        description: `Payment for ${items.length} course(s)`,
        order_id: data.id,
        handler: async (response) => {
          console.log("Payment successful", response);

          // Clear timeout and cleanup monitoring
          clearTimeoutAndCleanup();

          if (user?.id) {
            // Handle signed-in user
            try {
              // Get course IDs from cart items
              const courseIds = items.map((item) => item.id as Id<"courses">);

              // Call server action to handle enrollment
              const result = await handlePaymentSuccess(
                user.id,
                courseIds as Id<"courses">[],
                user.primaryEmailAddress?.emailAddress || "",
              );

              if (result.success) {
                console.log("Enrollment successful:", result.enrollments);
                // Show success message to user
                if (result.enrollments && result.enrollments.length > 0) {
                  toast.success(
                    `Payment successful! You have been enrolled in ${result.enrollments.length} course(s).`,
                    {
                      description: `Enrollment numbers: ${result.enrollments.map((e) => e.enrollmentNumber).join(", ")}`,
                    },
                  );
                } else {
                  toast.success(
                    "Payment successful! You are already enrolled in all selected courses.",
                    {
                      description:
                        "Check your email for enrollment status details.",
                    },
                  );
                }
              } else {
                console.error("Enrollment failed:", result.error);
                toast.error(
                  "Payment successful but enrollment failed. Please contact support.",
                  {
                    description: result.error,
                  },
                );
              }
            } catch (error) {
              console.error("Error handling payment success:", error);
              toast.error(
                "Payment successful but enrollment failed. Please contact support.",
              );
            }
          } else if (guestUserData) {
            // Handle guest user
            try {
              const courseIds = items.map((item) => item.id as Id<"courses">);

              const result = await handleGuestUserPaymentSuccessWithData(
                guestUserData,
                courseIds as Id<"courses">[],
              );

              if (result.success) {
                console.log("Guest enrollment successful:", result.enrollments);
                if (result.enrollments && result.enrollments.length > 0) {
                  toast.success(
                    `Payment successful! You have been enrolled in ${result.enrollments.length} course(s).`,
                    {
                      description: `Enrollment numbers: ${result.enrollments.map((e) => e.enrollmentNumber).join(", ")}`,
                    },
                  );
                } else {
                  toast.success(
                    "Payment successful! You are already enrolled in all selected courses.",
                    {
                      description:
                        "Check your email for enrollment status details.",
                    },
                  );
                }
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
          let foundElements = [];
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
            <a href="/courses">Browse Courses</a>
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
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={item.imageUrls?.[0] || "/placeholder-image.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.courseType}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateItemQuantity(item.id, (item.quantity || 1) - 1)
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
                          updateItemQuantity(item.id, (item.quantity || 1) + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {showRupees((item.price || 0) * (item.quantity || 1))}
                    </div>
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
              ))}
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
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>{showRupees(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{showRupees(cartTotal)}</span>
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
