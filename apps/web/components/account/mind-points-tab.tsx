"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, TrendingUp, TrendingDown, Copy, Check } from "lucide-react";
import { getRedemptionOptions } from "@/lib/mind-points";
import { RedemptionModal } from "./redemption-modal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function MindPointsTab() {
  const { user } = useUser();
  const [selectedRedemption, setSelectedRedemption] = useState<string | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Single batch query instead of 3 separate queries
  const accountSummary = useQuery(
    api.mindPoints.getUserAccountSummary,
    user?.id ? { clerkUserId: user.id, historyLimit: 20 } : "skip",
  );

  const redeemPoints = useMutation(api.mindPoints.redeemPoints);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user?.id) return;
    setReferralLink(`${window.location.origin}/?ref=${user.id}`);
  }, [user?.id]);

  if (!user) {
    return <div>Please sign in to view your Mind Points.</div>;
  }

  if (accountSummary === undefined) {
    return (
      <div className="text-muted-foreground">Loading Mind Points...</div>
    );
  }

  const { points: pointsData, history: pointsHistory, coupons } = accountSummary;
  const balance = pointsData.balance || 0;
  const totalEarned = pointsData.totalEarned || 0;
  const totalRedeemed = pointsData.totalRedeemed || 0;
  const redemptionOptions = getRedemptionOptions();

  const handleRedeem = async (courseType: string, pointsRequired: number) => {
    if (!user?.id) return;

    try {
      const result = await redeemPoints({
        clerkUserId: user.id,
        courseType,
        pointsRequired,
      });

      if (result.success) {
        toast.success(
          `Successfully redeemed ${pointsRequired} points! Your coupon code is: ${result.couponCode}`,
        );
        setSelectedRedemption(null);
      } else {
        toast.error(result.error || "Failed to redeem points");
      }
    } catch (error) {
      toast.error("An error occurred while redeeming points");
      console.error(error);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Calculate progress to next redemption (using the cheapest option)
  const cheapestRedemption = Math.min(
    ...redemptionOptions.map((opt) => opt.pointsRequired),
  );
  const progressPercentage = Math.min(
    (balance / cheapestRedemption) * 100,
    100,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Mind Points</h2>
        <p className="text-muted-foreground">
          Earn points with every purchase and redeem them for free courses!
        </p>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Mind Points</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Total Earned
                </div>
                <div className="text-lg font-semibold">
                  {totalEarned.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  Total Redeemed
                </div>
                <div className="text-lg font-semibold">
                  {totalRedeemed.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Progress to next reward
                </span>
                <span className="font-medium">
                  {balance} / {cheapestRedemption} points
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle>Refer &amp; Earn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share your personal link. When a friend signs in, places their{" "}
            <span className="font-medium">first order</span> within 30 days, and
            earns Mind Points, you instantly receive the same amount.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={referralLink}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={copyReferralLink}
              disabled={!referralLink}
            >
              {copiedReferral ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- First click wins: we track the first referral link for 30 days.</li>
            <li>- Referral rewards only apply to MindPoint accounts (not guest checkouts).</li>
            <li>- Self referrals are ignored.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Redemption Options */}
      <Card>
        <CardHeader>
          <CardTitle>Redeem Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {redemptionOptions.map((option) => {
              const canAfford = balance >= option.pointsRequired;
              return (
                <div
                  key={option.courseType}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.pointsRequired} points
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      setSelectedRedemption(option.courseType + ":" + option.pointsRequired)
                    }
                    disabled={!canAfford}
                    size="sm"
                  >
                    Redeem
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Coupons */}
      {coupons && coupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-mono font-semibold text-lg">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {coupon.courseType.charAt(0).toUpperCase() +
                        coupon.courseType.slice(1)} - 100% off
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCouponCode(coupon.code)}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points History */}
      {pointsHistory && pointsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pointsHistory.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      transaction.type === "earn" ? "default" : "secondary"
                    }
                    className={
                      transaction.type === "earn"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }
                  >
                    {transaction.type === "earn" ? "+" : "-"}
                    {Math.abs(transaction.points)}
                  </Badge>
                </div>
              ))}
            </div>
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
          courseType={selectedRedemption.split(":")[0]}
          pointsRequired={parseInt(selectedRedemption.split(":")[1])}
          currentBalance={balance}
        />
      )}
    </div>
  );
}

