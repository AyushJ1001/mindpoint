import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { getRedemptionOptions } from "@mindpoint/domain/mind-points";
import * as Clipboard from "expo-clipboard";
import {
  Gift,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  Share2,
} from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RedemptionModal } from "./redemption-modal";
import { showToast, showErrorToast } from "@/lib/toast";

export function MindPointsTab() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const accountSummary = useQuery(
    api.mindPoints.getUserAccountSummary,
    isAuthenticated ? { historyLimit: 20 } : "skip",
  );

  const redeemPoints = useMutation(api.mindPoints.redeemPoints);

  const referralLink = user?.id
    ? `https://themindpoint.com/?ref=${user.id}`
    : "";

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-muted-foreground">
          Please sign in to view your Mind Points.
        </Text>
      </View>
    );
  }

  if (accountSummary === undefined) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4338ca" />
        <Text className="mt-3 text-sm text-muted-foreground">
          Loading Mind Points...
        </Text>
      </View>
    );
  }

  const {
    points: pointsData,
    history: pointsHistory,
    coupons,
  } = accountSummary;
  const balance = pointsData.balance || 0;
  const totalEarned = pointsData.totalEarned || 0;
  const totalRedeemed = pointsData.totalRedeemed || 0;
  const redemptionOptions = getRedemptionOptions();

  const cheapestRedemption = Math.min(
    ...redemptionOptions.map((opt) => opt.pointsRequired),
  );
  const progressPercentage = Math.min(
    (balance / cheapestRedemption) * 100,
    100,
  );

  const handleRedeem = async (courseType: string, pointsRequired: number) => {
    if (!user?.id) return;

    try {
      const result = await redeemPoints({ courseType, pointsRequired });

      if (result.success) {
        showToast(
          "Redemption Successful",
          `You redeemed ${pointsRequired} points! Your coupon code is: ${result.couponCode}`,
        );
        setSelectedRedemption(null);
      } else {
        Alert.alert("Redemption Failed", result.error || "Failed to redeem points");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while redeeming points");
      console.error(error);
    }
  };

  const copyCouponCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    showToast("Copied", "Coupon code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyReferralLink = async () => {
    if (!referralLink) return;
    await Clipboard.setStringAsync(referralLink);
    setCopiedReferral(true);
    showToast("Copied", "Referral link copied to clipboard!");
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;
    try {
      await Share.share({ message: referralLink });
    } catch {
      // User cancelled share
    }
  };

  return (
    <ScrollView
      contentContainerClassName="gap-4 p-4 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Gift size={20} color="#4338ca" />
            <CardTitle>Your Balance</CardTitle>
          </View>
        </CardHeader>
        <CardContent className="gap-4">
          <View>
            <Text className="text-4xl font-bold text-primary">
              {balance.toLocaleString()}
            </Text>
            <Text className="text-sm text-muted-foreground">Mind Points</Text>
          </View>

          {/* Earned / Redeemed Grid */}
          <View className="flex-row gap-4 border-t border-border pt-4">
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <TrendingUp size={16} color="#22c55e" />
                <Text className="text-sm text-muted-foreground">
                  Total Earned
                </Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                {totalEarned.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="mb-1 flex-row items-center gap-2">
                <TrendingDown size={16} color="#f97316" />
                <Text className="text-sm text-muted-foreground">
                  Total Redeemed
                </Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                {totalRedeemed.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="border-t border-border pt-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">
                Progress to next reward
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {balance} / {cheapestRedemption} points
              </Text>
            </View>
            <Progress value={progressPercentage} />
          </View>
        </CardContent>
      </Card>

      {/* Refer & Earn Card */}
      <Card>
        <CardHeader>
          <CardTitle>Refer & Earn</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Text className="text-sm text-muted-foreground">
            Share your personal link. When a friend signs in, places their first
            order within 30 days, and earns Mind Points, you instantly receive
            the same amount.
          </Text>

          <View className="rounded-lg border border-border bg-secondary/30 p-3">
            <Text
              className="font-mono text-xs text-foreground"
              numberOfLines={1}
            >
              {referralLink}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onPress={copyReferralLink}
              disabled={!referralLink}
            >
              <View className="flex-row items-center gap-2">
                {copiedReferral ? (
                  <Check size={16} color="#4338ca" />
                ) : (
                  <Copy size={16} color="#4338ca" />
                )}
                <Text className="text-sm font-semibold text-foreground">
                  {copiedReferral ? "Copied" : "Copy"}
                </Text>
              </View>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onPress={shareReferralLink}
              disabled={!referralLink}
            >
              <View className="flex-row items-center gap-2">
                <Share2 size={16} color="#4338ca" />
                <Text className="text-sm font-semibold text-foreground">
                  Share
                </Text>
              </View>
            </Button>
          </View>

          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">
              - First click wins: we track the first referral link for 30 days.
            </Text>
            <Text className="text-sm text-muted-foreground">
              - Referral rewards only apply to MindPoint accounts (not guest
              checkouts).
            </Text>
            <Text className="text-sm text-muted-foreground">
              - Self referrals are ignored.
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Redemption Options */}
      <Card>
        <CardHeader>
          <CardTitle>Redeem Points</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          {redemptionOptions.map((option) => {
            const canAfford = balance >= option.pointsRequired;
            return (
              <View
                key={option.courseType}
                className="flex-row items-center justify-between rounded-lg border border-border p-4"
              >
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {option.pointsRequired} points
                  </Text>
                </View>
                <Button
                  size="sm"
                  onPress={() =>
                    setSelectedRedemption(
                      option.courseType + ":" + option.pointsRequired,
                    )
                  }
                  disabled={!canAfford}
                >
                  Redeem
                </Button>
              </View>
            );
          })}
        </CardContent>
      </Card>

      {/* Active Coupons */}
      {coupons && coupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Coupons</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {coupons.map((coupon) => (
              <View
                key={coupon._id}
                className="flex-row items-center justify-between rounded-lg border border-border p-4"
              >
                <View className="flex-1">
                  <Text className="font-mono text-lg font-semibold text-foreground">
                    {coupon.code}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {coupon.courseType.charAt(0).toUpperCase() +
                      coupon.courseType.slice(1)}{" "}
                    - 100% off
                  </Text>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => copyCouponCode(coupon.code)}
                >
                  <View className="flex-row items-center gap-2">
                    {copiedCode === coupon.code ? (
                      <Check size={16} color="#4338ca" />
                    ) : (
                      <Copy size={16} color="#4338ca" />
                    )}
                    <Text className="text-sm font-semibold text-foreground">
                      {copiedCode === coupon.code ? "Copied" : "Copy"}
                    </Text>
                  </View>
                </Button>
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {pointsHistory && pointsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {pointsHistory.map((transaction) => (
              <View
                key={transaction._id}
                className="flex-row items-center justify-between border-b border-border py-2 last:border-0"
              >
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    {transaction.description}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Badge
                  className={
                    transaction.type === "earn"
                      ? "bg-emerald-500"
                      : "bg-orange-500"
                  }
                >
                  {transaction.type === "earn" ? "+" : "-"}
                  {Math.abs(transaction.points)}
                </Badge>
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Redemption Modal */}
      {selectedRedemption && (
        <RedemptionModal
          isOpen={!!selectedRedemption}
          onClose={() => setSelectedRedemption(null)}
          onConfirm={(courseType, pointsRequired) =>
            handleRedeem(courseType, pointsRequired)
          }
          courseType={selectedRedemption.split(":")[0]!}
          pointsRequired={parseInt(selectedRedemption.split(":")[1]!, 10)}
          currentBalance={balance}
        />
      )}
    </ScrollView>
  );
}
