import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "react-use-cart";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import {
  showRupees,
  getOfferDetails,
  type OfferDetails,
} from "@mindpoint/domain/pricing";
import { Image } from "expo-image";
import {
  ShoppingCart,
  Trash2,
  Sparkles,
  CreditCard,
  Gift,
  Check,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CartItemRow } from "@/components/CartItemRow";
import { CouponInput } from "@/components/CouponInput";
import { useNow } from "@/hooks/use-now";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateItemQuantity,
    cartTotal,
    isEmpty,
    emptyCart,
    setCartMetadata,
  } = useCart();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();

  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    courseType: string;
    pointsCost: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate coupon code
  const couponValidation = useQuery(
    api.mindPoints.validateCoupon,
    couponCode && isAuthenticated ? { code: couponCode } : "skip",
  );

  // Compute offer details for each cart item
  const now = useNow();
  const minuteKey = Math.floor(now / 60000);
  const itemOfferDetails = useMemo(() => {
    const newOfferDetails: Record<string, OfferDetails> = {};
    items.forEach((item) => {
      if (item.offer || item.bogo) {
        const offerPrice = item.price || 0;
        const discountPercentage = item.offer?.discount ?? 0;

        let originalPrice = item.originalPrice || offerPrice;
        if (
          !item.originalPrice &&
          discountPercentage > 0 &&
          discountPercentage < 100
        ) {
          const denominator = 1 - discountPercentage / 100;
          if (Math.abs(denominator) > 1e-6) {
            originalPrice = offerPrice / denominator;
          }
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
    return newOfferDetails;
  }, [items, minuteKey]);

  const hasBogoItems = items.some((item) => itemOfferDetails[item.id]?.hasBogo);

  const activeBogoTypes = useMemo(() => {
    const types = new Set<string>();
    items.forEach((item) => {
      const details = itemOfferDetails[item.id];
      if (details?.hasBogo && item.courseType) {
        types.add(item.courseType as string);
      }
    });
    return Array.from(types);
  }, [items, itemOfferDetails]);

  const bogoLabels = useMemo(() => {
    const labels = new Set<string>();
    items.forEach((item) => {
      const details = itemOfferDetails[item.id];
      if (details?.hasBogo && details.bogoLabel) {
        labels.add(details.bogoLabel);
      }
    });
    return Array.from(labels);
  }, [items, itemOfferDetails]);

  // Coupon eligibility
  const couponEligible = useMemo(() => {
    if (!appliedCoupon) return true;
    return items.some(
      (item) =>
        item.courseType === appliedCoupon.courseType &&
        Math.round(item.price ?? 0) > 0,
    );
  }, [appliedCoupon, items]);

  useEffect(() => {
    if (appliedCoupon && !couponEligible) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
  }, [appliedCoupon, couponEligible]);

  // Checkout pricing with coupon logic
  const checkoutPricing = useMemo(() => {
    const baseItems = items.map((item) => {
      const listedPrice = Math.round(item.originalPrice ?? item.price ?? 0);
      const checkoutPrice = Math.round(item.price ?? 0);
      return {
        courseId: item.id,
        listedPrice,
        checkoutPrice,
        amountPaid: checkoutPrice,
        redemptionDiscountAmount: 0,
      };
    });

    if (!appliedCoupon) {
      return {
        totalAmountPaid: baseItems.reduce(
          (total, item) => total + item.amountPaid,
          0,
        ),
        items: baseItems,
      };
    }

    // Find the most expensive eligible item for coupon
    const eligibleIndex = (() => {
      let bestIndex = -1;
      let bestPrice = -1;
      baseItems.forEach((item, index) => {
        if (
          items[index]?.courseType === appliedCoupon.courseType &&
          item.checkoutPrice > 0 &&
          item.checkoutPrice > bestPrice
        ) {
          bestIndex = index;
          bestPrice = item.checkoutPrice;
        }
      });
      return bestIndex;
    })();

    if (eligibleIndex === -1) {
      return {
        totalAmountPaid: baseItems.reduce(
          (total, item) => total + item.amountPaid,
          0,
        ),
        items: baseItems,
      };
    }

    const pricedItems = baseItems.map((item, index) => {
      if (index !== eligibleIndex) return item;
      const discountAmount = Math.min(
        item.checkoutPrice,
        Math.round(item.checkoutPrice * (appliedCoupon.discount / 100)),
      );
      const amountPaid = Math.max(0, item.checkoutPrice - discountAmount);
      return {
        ...item,
        amountPaid,
        redemptionDiscountAmount: discountAmount,
        ...(discountAmount > 0
          ? {
              couponCode: appliedCoupon.code,
              mindPointsRedeemed: appliedCoupon.pointsCost,
            }
          : {}),
      };
    });

    return {
      totalAmountPaid: pricedItems.reduce(
        (total, item) => total + item.amountPaid,
        0,
      ),
      items: pricedItems,
    };
  }, [items, appliedCoupon]);

  const discountedTotal = checkoutPricing.totalAmountPaid;

  useEffect(() => {
    setCartMetadata({
      appliedCoupon,
      checkoutPricing,
    });
  }, [appliedCoupon, checkoutPricing, setCartMetadata]);

  // Mind Points earned calculation
  const totalPointsEarned = useMemo(() => {
    if (!user?.id) return 0;
    const pricingMap = new Map(
      checkoutPricing.items.map((item) => [String(item.courseId), item]),
    );
    return items.reduce((total, item) => {
      if (item.selectedFreeCourse || !item.courseType) return total;
      const pricingItem = pricingMap.get(String(item.id));
      if (!pricingItem || pricingItem.amountPaid <= 0) return total;
      const pointsMap: Record<string, number> = {
        certificate: 120,
        diploma: 200,
        worksheet: 20,
        masterclass: 20,
        "pre-recorded": 100,
      };
      if (item.courseType === "internship") return total + 60;
      return total + (pointsMap[item.courseType as string] || 0);
    }, 0);
  }, [checkoutPricing.items, items, user?.id]);

  const handleApplyCoupon = useCallback(() => {
    if (!couponCode.trim()) return;
    if (couponValidation?.valid && couponValidation.coupon) {
      const hasEligibleCourse = items.some(
        (item) =>
          item.courseType === couponValidation.coupon!.courseType &&
          Math.round(item.price ?? 0) > 0,
      );
      if (!hasEligibleCourse) {
        Alert.alert(
          "Invalid Coupon",
          `This coupon can only be used on ${couponValidation.coupon.courseType} courses currently in your cart.`,
        );
        return;
      }
      setAppliedCoupon({
        code: couponCode,
        discount: couponValidation.coupon.discount,
        courseType: couponValidation.coupon.courseType,
        pointsCost: couponValidation.coupon.pointsCost,
      });
    } else if (couponValidation?.error) {
      Alert.alert("Invalid Coupon", couponValidation.error);
    }
  }, [couponCode, couponValidation, items]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
  }, []);

  const handleClearCart = useCallback(() => {
    emptyCart();
    setShowClearCartDialog(false);
  }, [emptyCart]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Loading state
  if (!mounted) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4338ca" />
        <Text className="text-foreground mt-4 text-lg font-semibold">
          Loading cart...
        </Text>
      </View>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <ShoppingCart size={48} color="#6b7280" />
        <Text className="text-foreground mt-4 text-xl font-semibold">
          Your cart is empty
        </Text>
        <Text className="text-muted-foreground mt-2 text-center text-sm">
          Add some courses to get started with your learning journey.
        </Text>
        <Button className="mt-6" onPress={() => router.push("/(tabs)")}>
          <Text className="text-primary-foreground font-semibold">
            Browse Courses
          </Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-8"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-foreground text-2xl font-bold tracking-tight">
          Shopping Cart
        </Text>
        <Text className="text-muted-foreground mt-1 text-sm">
          Review your selected courses and proceed to checkout.
        </Text>
      </View>

      {/* Cart Items Section */}
      <View className="px-4 pt-2">
        <Card>
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <ShoppingCart size={18} color="#6b7280" />
                <CardTitle>Cart Items ({items.length})</CardTitle>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowClearCartDialog(true)}
              >
                <View className="flex-row items-center gap-1">
                  <Trash2 size={14} color="#dc2626" />
                  <Text className="text-xs font-semibold text-red-600">
                    Clear
                  </Text>
                </View>
              </Button>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            {items.map((item) => {
              const offerDetails = itemOfferDetails[item.id];
              return (
                <CartItemRow
                  key={item.id}
                  item={item}
                  offerDetails={offerDetails}
                  onRemove={removeItem}
                  onUpdateQuantity={updateItemQuantity}
                />
              );
            })}

            {/* BOGO Free Course Display */}
            {items
              .filter((item) => item.selectedFreeCourse)
              .map((item) => {
                const freeCourse = item.selectedFreeCourse as {
                  id: string;
                  name: string;
                  price: number;
                  originalPrice?: number;
                  imageUrls?: string[];
                  courseType?: string;
                };
                const freeImageUri = freeCourse.imageUrls?.[0];

                return (
                  <View
                    key={`bogo-${item.id}`}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Free course image */}
                      <View className="h-12 w-12 overflow-hidden rounded-lg">
                        {freeImageUri ? (
                          <Image
                            source={{ uri: freeImageUri }}
                            style={{ width: 48, height: 48 }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="h-12 w-12 items-center justify-center bg-emerald-100">
                            <Sparkles size={16} color="#059669" />
                          </View>
                        )}
                      </View>

                      {/* Free course details */}
                      <View className="min-w-0 flex-1">
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Sparkles size={14} color="#059669" />
                          <Text
                            className="flex-shrink font-semibold text-emerald-800"
                            numberOfLines={2}
                          >
                            {freeCourse.name || "Free Course"}
                          </Text>
                          <Badge className="bg-emerald-200">
                            <Text className="text-xs font-semibold text-emerald-800">
                              FREE
                            </Text>
                          </Badge>
                        </View>
                        <View className="mt-1 flex-row flex-wrap items-center gap-2">
                          <Text className="text-xs text-emerald-600">
                            BOGO Free Course
                          </Text>
                          <Text className="text-xs text-emerald-600">
                            {"\u2022"}
                          </Text>
                          <Text className="text-xs text-emerald-600 line-through">
                            {showRupees(freeCourse.originalPrice || 0)}
                          </Text>
                          <Text className="text-xs font-semibold text-emerald-700">
                            {showRupees(0)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
          </CardContent>
        </Card>
      </View>

      {/* Order Summary */}
      <View className="px-4 pt-4">
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <CreditCard size={18} color="#6b7280" />
              <CardTitle>Order Summary</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {/* BOGO info banner */}
            {hasBogoItems && (
              <View className="gap-2">
                <View className="flex-row items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <Sparkles
                    size={14}
                    color="#059669"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="flex-1 text-xs font-medium text-emerald-700">
                    {bogoLabels.length > 0 ? bogoLabels.join(", ") : "BOGO"}{" "}
                    applied:{" "}
                    {activeBogoTypes.length > 0
                      ? activeBogoTypes.join(", ")
                      : "complimentary course enrollments"}{" "}
                    will be added automatically during checkout.
                  </Text>
                </View>
                {/* List specific free courses */}
                {items
                  .filter((item) => item.selectedFreeCourse)
                  .map((item) => (
                    <View
                      key={`free-summary-${item.id}`}
                      className="flex-row items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 py-1.5"
                    >
                      <Sparkles size={12} color="#059669" />
                      <Text
                        className="flex-1 text-xs text-emerald-600"
                        numberOfLines={1}
                      >
                        {(item.selectedFreeCourse as { name: string }).name}
                      </Text>
                      <Text className="text-xs font-semibold text-emerald-700">
                        FREE
                      </Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Subtotal */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm">
                Subtotal ({items.length} items)
              </Text>
              <Text className="text-foreground text-sm">
                {showRupees(Math.round(cartTotal))}
              </Text>
            </View>

            {/* Tax */}
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm">Tax</Text>
              <Text className="text-foreground text-sm">{"\u20B9"}0.00</Text>
            </View>

            {/* Coupon */}
            <View className="border-border border-t pt-4">
              <CouponInput
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                couponValidation={couponValidation ?? undefined}
                items={items}
              />
            </View>

            {/* Total */}
            <View className="border-border gap-2 border-t pt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-base font-semibold">
                  Total
                </Text>
                <Text className="text-foreground text-base font-semibold">
                  {showRupees(discountedTotal)}
                </Text>
              </View>

              {appliedCoupon && (
                <View className="flex-row items-center gap-1">
                  <Check size={14} color="#16a34a" />
                  <Text className="flex-1 text-xs text-green-600">
                    {appliedCoupon.discount === 100
                      ? `Coupon applied to one ${appliedCoupon.courseType} course`
                      : `Coupon applied - ${appliedCoupon.discount}% off one ${appliedCoupon.courseType} course`}
                  </Text>
                </View>
              )}

              {/* Mind Points earned */}
              {user?.id && totalPointsEarned > 0 && (
                <View className="flex-row items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <Gift size={16} color="#16a34a" />
                  <Text className="flex-1 text-sm font-medium text-green-700">
                    You'll earn {totalPointsEarned} Mind Points
                  </Text>
                </View>
              )}
            </View>

            {/* Checkout Button */}
            <Button className="mt-2" onPress={() => router.push("/checkout")}>
              <Text className="text-primary-foreground font-semibold">
                Proceed to Checkout
              </Text>
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* Clear Cart Dialog */}
      <Dialog
        open={showClearCartDialog}
        onClose={() => setShowClearCartDialog(false)}
      >
        <DialogHeader onClose={() => setShowClearCartDialog(false)}>
          <DialogTitle>Clear Cart</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove all items from your cart? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onPress={() => setShowClearCartDialog(false)}
          >
            <Text className="text-foreground font-semibold">Cancel</Text>
          </Button>
          <Button variant="destructive" onPress={handleClearCart}>
            <Text className="font-semibold text-white">Clear Cart</Text>
          </Button>
        </DialogFooter>
      </Dialog>
    </ScrollView>
  );
}
