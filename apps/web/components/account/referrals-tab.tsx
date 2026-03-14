"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Users } from "lucide-react";

export function ReferralsTab() {
  const { user } = useUser();
  const referralRewards = useQuery(
    api.myFunctions.getReferralRewards,
    user?.id ? { referrerClerkUserId: user.id } : "skip",
  );

  if (!user) {
    return <div>Please sign in to view your referrals.</div>;
  }

  if (referralRewards === undefined) {
    return <div className="text-muted-foreground">Loading referrals...</div>;
  }

  const totalPointsEarned = referralRewards.reduce(
    (sum, reward) => sum + reward.awardedPoints,
    0,
  );

  if (referralRewards.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">My Referrals</h2>
          <p className="text-muted-foreground">
            Track the people who used your referral link and the rewards you&apos;ve earned.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No referrals yet. Share your referral link to start earning!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">My Referrals</h2>
        <p className="text-muted-foreground">
          Track the people who used your referral link and the rewards you&apos;ve earned.
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {referralRewards.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Referrals
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {totalPointsEarned.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Points Earned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Referral History</h3>
        <div className="grid gap-4">
          {referralRewards.map((reward) => (
            <Card key={reward._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {reward.referredUserName || "Anonymous User"}
                    </CardTitle>
                    {reward.referredUserEmail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {reward.referredUserEmail}
                      </p>
                    )}
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    +{reward.awardedPoints} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Referred on{" "}
                      {new Date(reward.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {reward.firstCourseName && (
                    <div>
                      <span className="font-medium">First Purchase: </span>
                      <span className="text-muted-foreground">
                        {reward.firstCourseName}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

