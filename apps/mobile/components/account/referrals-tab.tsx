import { View, Text, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { Calendar, Gift, Users } from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ReferralsTab() {
  const { user } = useUser();

  const referralRewards = useQuery(
    api.myFunctions.getReferralRewards,
    user?.id ? { referrerClerkUserId: user.id } : "skip",
  );

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-muted-foreground">
          Please sign in to view your referrals.
        </Text>
      </View>
    );
  }

  if (referralRewards === undefined) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#5b7a5e" />
        <Text className="text-muted-foreground mt-3 text-sm">
          Loading referrals...
        </Text>
      </View>
    );
  }

  const totalPointsEarned = referralRewards.reduce(
    (sum, reward) => sum + reward.awardedPoints,
    0,
  );

  if (referralRewards.length === 0) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="items-center py-12">
          <Users size={48} color="#8a8279" />
          <Text className="text-muted-foreground mt-4 text-center">
            No referrals yet. Share your referral link to start earning!
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <View className="gap-3 p-4">
      <Card className="mb-1">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Gift size={20} color="#5b7a5e" />
            <CardTitle>Referral Summary</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-primary text-2xl font-bold">
                {referralRewards.length}
              </Text>
              <Text className="text-muted-foreground text-sm">
                Total Referrals
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-primary text-2xl font-bold">
                {totalPointsEarned.toLocaleString()}
              </Text>
              <Text className="text-muted-foreground text-sm">
                Points Earned
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {referralRewards.map((reward) => (
        <Card key={reward._id}>
          <CardHeader>
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <CardTitle className="text-base">
                  {reward.referredUserName || "Anonymous User"}
                </CardTitle>
                {reward.referredUserEmail && (
                  <Text className="text-muted-foreground mt-1 text-sm">
                    {reward.referredUserEmail}
                  </Text>
                )}
              </View>
              <Badge className="bg-emerald-500">
                +{reward.awardedPoints} points
              </Badge>
            </View>
          </CardHeader>
          <CardContent className="gap-2">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#8a8279" />
              <Text className="text-foreground text-sm">
                Referred on{" "}
                {new Date(reward.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            {reward.firstCourseName && (
              <View className="flex-row flex-wrap gap-1">
                <Text className="text-foreground text-sm font-medium">
                  First Purchase:
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {reward.firstCourseName}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
