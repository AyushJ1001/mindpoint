import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { Id } from "@mindpoint/backend/data-model";
import { showRupees } from "@mindpoint/domain/pricing";
import { Image } from "expo-image";
import {
  ShoppingCart,
  CreditCard,
  Sparkles,
  Gift,
  User,
  Mail,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPaymentOrder, verifyRazorpayPayment } from "@/lib/api-client";
import { getReferralCode, clearReferralCode } from "@/lib/referral-storage";
import { publicEnv } from "@/lib/public-env";
import { showToast } from "@/lib/toast";

type CheckoutPricingItem = {
  courseId: Id<"courses">;
  listedPrice: number;
  checkoutPrice: number;
  amountPaid: number;
  redemptionDiscountAmount: number;
  couponCode?: string;
  mindPointsRedeemed?: number;
};

type CheckoutPricing = {
  totalAmountPaid: number;
  items: CheckoutPricingItem[];
};

type AppliedCoupon = {
  code: string;
  discount: number;
  courseType: string;
  pointsCost: number;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, cartTotal, isEmpty, emptyCart, metadata, clearCartMetadata } =
    useCart();
  const { user, isLoaded: isUserLoaded } = useUser();
  useConvexAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Guest checkout state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const handleCartCheckout = useMutation(api.myFunctions.handleCartCheckout);
  const handleGuestCheckout = useMutation(
    api.myFunctions.handleGuestUserCartCheckoutWithData,
  );
  const markCouponUsed = useMutation(api.mindPoints.markCouponUsed);

  // Query user profile for WhatsApp number
  const userProfile = useQuery(
    api.myFunctions.getUserProfile,
    user?.id ? { clerkUserId: user.id } : "skip",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build checkout pricing from cart items
  const fallbackCheckoutPricing = useMemo<CheckoutPricing>(() => {
    const pricedItems = items.map((item) => {
      const listedPrice = Math.round(item.originalPrice ?? item.price ?? 0);
      const checkoutPrice = Math.round(item.price ?? 0);

      return {
        courseId: item.id as Id<"courses">,
        listedPrice,
        checkoutPrice,
        amountPaid: checkoutPrice,
        redemptionDiscountAmount: 0,
      };
    });

    return {
      totalAmountPaid: pricedItems.reduce((t, i) => t + i.amountPaid, 0),
      items: pricedItems,
    };
  }, [items]);

  const checkoutPricing = useMemo<CheckoutPricing>(() => {
    const storedPricing = metadata?.checkoutPricing as
      | CheckoutPricing
      | undefined;
    if (!storedPricing) {
      return fallbackCheckoutPricing;
    }

    const cartIds = items.map((item) => String(item.id)).sort();
    const pricingIds = storedPricing.items
      .map((item) => String(item.courseId))
      .sort();

    if (
      cartIds.length !== pricingIds.length ||
      cartIds.some((id, index) => id !== pricingIds[index])
    ) {
      return fallbackCheckoutPricing;
    }

    return storedPricing;
  }, [fallbackCheckoutPricing, items, metadata]);

  const appliedCoupon = metadata?.appliedCoupon as
    | AppliedCoupon
    | null
    | undefined;

  const totalAmount = checkoutPricing.totalAmountPaid;
  const usesLiveNativePayments =
    !__DEV__ && Constants.executionEnvironment === "standalone";
  const isDemoPaymentMode = !usesLiveNativePayments;

  const completeCheckout = useCallback(
    async (payerInfo: {
      clerkUserId?: string;
      email: string;
      name?: string;
      phone?: string;
    }) => {
      const courseIds = items.map((item) => item.id as Id<"courses">);
      const bogoSelections = items
        .filter((item) => item.selectedFreeCourse)
        .map((item) => ({
          sourceCourseId: item.id as Id<"courses">,
          selectedFreeCourseId: item.selectedFreeCourse!.id as Id<"courses">,
        }));

      const referralCode = await getReferralCode();
      const referrerClerkUserId =
        referralCode && referralCode !== payerInfo.clerkUserId
          ? referralCode
          : undefined;

      if (payerInfo.clerkUserId) {
        const enrollments = await handleCartCheckout({
          userId: payerInfo.clerkUserId,
          courseIds,
          userEmail: payerInfo.email,
          userPhone: payerInfo.phone,
          studentName: payerInfo.name,
          bogoSelections:
            bogoSelections.length > 0 ? bogoSelections : undefined,
          referrerClerkUserId,
          checkoutPricing,
        });

        if (enrollments && enrollments.length > 0) {
          const couponCode = checkoutPricing.items.find(
            (item) => item.couponCode,
          )?.couponCode;
          if (couponCode) {
            await markCouponUsed({ couponCode });
          }

          showToast(
            "Payment successful!",
            isDemoPaymentMode
              ? "Demo checkout completed in Expo Go. Your enrollment was created without processing a live payment."
              : "Your enrollment has been confirmed. Check your email for details.",
          );
        } else {
          Alert.alert(
            "Enrollment issue",
            "Payment was successful but enrollment may have failed. Please contact support.",
          );
        }
      } else {
        const enrollments = await handleGuestCheckout({
          userData: {
            name: payerInfo.name || "Guest",
            email: payerInfo.email,
            phone: payerInfo.phone || "",
          },
          courseIds,
          bogoSelections:
            bogoSelections.length > 0 ? bogoSelections : undefined,
          checkoutPricing,
        });

        if (enrollments && enrollments.length > 0) {
          showToast(
            "Payment successful!",
            isDemoPaymentMode
              ? "Demo checkout completed in Expo Go. Your enrollment was created without processing a live payment."
              : "Your enrollment has been confirmed. Check your email for details.",
          );
        } else {
          Alert.alert(
            "Enrollment issue",
            "Payment was successful but enrollment may have failed. Please contact support.",
          );
        }
      }

      if (referralCode) await clearReferralCode();
      emptyCart();
      clearCartMetadata();
      router.replace("/(tabs)/account");
    },
    [
      checkoutPricing,
      clearCartMetadata,
      emptyCart,
      handleCartCheckout,
      handleGuestCheckout,
      isDemoPaymentMode,
      items,
      router,
    ],
  );

  const processPayment = useCallback(
    async (payerInfo: {
      clerkUserId?: string;
      email: string;
      name?: string;
      phone?: string;
    }) => {
      setIsProcessing(true);

      try {
        if (isDemoPaymentMode) {
          await completeCheckout(payerInfo);
          return;
        }

        // Create Razorpay order
        const orderData = await createPaymentOrder(totalAmount);

        // Try to import and use react-native-razorpay
        let RazorpayCheckout: {
          open: (options: Record<string, unknown>) => Promise<{
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }>;
        };
        try {
          RazorpayCheckout = require("react-native-razorpay").default;
        } catch {
          // If Razorpay native module isn't available, show alert
          Alert.alert(
            "Payment unavailable",
            "Native payment module is not available in this build. Please use the web version for payments.",
          );
          setIsProcessing(false);
          return;
        }

        const razorpayOptions = {
          key: publicEnv.razorpayKeyId || "",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "The Mind Point",
          description: `Payment for ${items.length} course(s)`,
          order_id: orderData.id,
          prefill: {
            name: payerInfo.name || "",
            email: payerInfo.email,
            contact: payerInfo.phone || "",
          },
          theme: {
            color: "#5b7a5e",
          },
        };

        // Open Razorpay checkout
        const paymentResult = await RazorpayCheckout.open(razorpayOptions);
        await verifyRazorpayPayment({
          razorpayOrderId: paymentResult.razorpay_order_id,
          razorpayPaymentId: paymentResult.razorpay_payment_id,
          razorpaySignature: paymentResult.razorpay_signature,
        });
        await completeCheckout(payerInfo);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Payment failed";
        if (!message.includes("cancelled") && !message.includes("canceled")) {
          Alert.alert("Payment failed", message);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [completeCheckout, isDemoPaymentMode, totalAmount, items],
  );

  const handleCheckout = useCallback(() => {
    if (user) {
      processPayment({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || undefined,
        phone: userProfile?.whatsappNumber || undefined,
      });
    } else {
      // Show guest checkout modal
      setShowGuestModal(true);
    }
  }, [user, userProfile, processPayment]);

  const handleGuestSubmit = () => {
    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setShowGuestModal(false);
    processPayment({
      email: guestEmail.trim(),
      name: guestName.trim() || undefined,
      phone: guestPhone.trim() || undefined,
    });
  };

  if (!mounted) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#5b7a5e" />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <ShoppingCart size={48} color="#8a8279" />
        <Text className="text-foreground mt-4 text-lg font-semibold">
          Your cart is empty
        </Text>
        <Text className="text-muted-foreground mt-2 text-center text-sm">
          Add some courses to get started.
        </Text>
        <Button onPress={() => router.replace("/(tabs)")} className="mt-6">
          <Text className="font-semibold text-white">Browse Courses</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* Order Summary */}
          <Text className="text-foreground mb-4 text-2xl font-bold">
            Order Summary
          </Text>

          {/* Items */}
          <Card className="mb-4">
            <CardContent className="gap-4 p-4">
              {items.map((item) => {
                const itemPrice = Math.round(
                  (item.price || 0) * (item.quantity || 1),
                );

                return (
                  <View key={item.id}>
                    <View className="flex-row gap-3">
                      <Image
                        source={{ uri: item.imageUrls?.[0] }}
                        style={{ width: 56, height: 56, borderRadius: 8 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <Text
                          className="text-foreground font-semibold"
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-muted-foreground text-xs capitalize">
                          {item.courseType}
                        </Text>
                      </View>
                      <Text className="text-foreground font-semibold">
                        {showRupees(itemPrice)}
                      </Text>
                    </View>

                    {/* BOGO free course */}
                    {item.selectedFreeCourse && (
                      <View className="mt-2 ml-14 flex-row items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                        <Sparkles size={14} color="#059669" />
                        <Text
                          className="flex-1 text-xs font-medium text-emerald-700"
                          numberOfLines={1}
                        >
                          {item.selectedFreeCourse.name}
                        </Text>
                        <Badge variant="default">
                          <Text className="text-[10px] font-bold text-white">
                            FREE
                          </Text>
                        </Badge>
                      </View>
                    )}
                  </View>
                );
              })}
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card className="mb-4">
            <CardContent className="gap-3 p-4">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">
                  Subtotal ({items.length} items)
                </Text>
                <Text className="text-foreground">
                  {showRupees(Math.round(cartTotal))}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Tax</Text>
                <Text className="text-foreground">₹0.00</Text>
              </View>

              <View className="border-border border-t pt-3">
                <View className="flex-row justify-between">
                  <Text className="text-foreground text-lg font-bold">
                    Total
                  </Text>
                  <Text className="text-primary text-lg font-bold">
                    {showRupees(totalAmount)}
                  </Text>
                </View>
                {appliedCoupon ? (
                  <Text className="mt-1 text-xs text-green-600">
                    {appliedCoupon.discount === 100
                      ? `Coupon applied to one ${appliedCoupon.courseType} course`
                      : `Coupon applied - ${appliedCoupon.discount}% off one ${appliedCoupon.courseType} course`}
                  </Text>
                ) : null}
              </View>
            </CardContent>
          </Card>

          {/* User Info */}
          {user && (
            <Card className="mb-4">
              <CardContent className="gap-2 p-4">
                <Text className="text-foreground mb-1 font-semibold">
                  Paying as
                </Text>
                <View className="flex-row items-center gap-2">
                  <User size={16} color="#8a8279" />
                  <Text className="text-foreground text-sm">
                    {user.fullName || "User"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Mail size={16} color="#8a8279" />
                  <Text className="text-muted-foreground text-sm">
                    {user.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          {!user && isUserLoaded && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Text className="text-muted-foreground text-sm">
                  You&apos;re checking out as a guest. You&apos;ll be asked for
                  your details before payment.
                </Text>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Pay Button */}
      <View className="border-border absolute right-0 bottom-0 left-0 border-t bg-white px-4 pt-4 pb-8">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-foreground text-lg font-bold">Total</Text>
          <Text className="text-primary text-xl font-bold">
            {showRupees(totalAmount)}
          </Text>
        </View>
        <Button
          onPress={handleCheckout}
          disabled={isProcessing}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <CreditCard size={18} color="#ffffff" />
            <Text className="text-base font-bold text-white">
              {isProcessing ? "Processing..." : "Pay Now"}
            </Text>
          </View>
        </Button>
      </View>

      {/* Guest Checkout Modal */}
      <Dialog open={showGuestModal} onClose={() => setShowGuestModal(false)}>
        <DialogHeader>
          <DialogTitle>Guest Checkout</DialogTitle>
          <DialogDescription>
            Enter your details to complete the purchase.
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label>Name</Label>
            <Input
              placeholder="Your name"
              value={guestName}
              onChangeText={setGuestName}
              autoCapitalize="words"
            />
          </View>

          <View className="gap-2">
            <Label>Email *</Label>
            <Input
              placeholder="your.email@example.com"
              value={guestEmail}
              onChangeText={setGuestEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="gap-2">
            <Label>Phone</Label>
            <Input
              placeholder="+91 98765 43210"
              value={guestPhone}
              onChangeText={setGuestPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={() => setShowGuestModal(false)}>
            <Text className="text-foreground font-semibold">Cancel</Text>
          </Button>
          <Button onPress={handleGuestSubmit}>
            <Text className="font-semibold text-white">Continue to Pay</Text>
          </Button>
        </DialogFooter>
      </Dialog>
    </KeyboardAvoidingView>
  );
}
