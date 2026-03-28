import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useConvexAuth } from "convex/react";
import { SignInForm } from "@/components/SignInForm";
import { publicEnv } from "@/lib/public-env";
import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { ReferralsTab } from "@/components/account/referrals-tab";

const TABS = ["Enrollments", "Mind Points", "Referrals"] as const;
type TabName = (typeof TABS)[number];

export default function AccountScreen() {
  if (!publicEnv.clerkPublishableKey) {
    return (
      <View className="flex-1 bg-[#f5f7fa]">
        <ScrollView
          contentContainerClassName="gap-3.5 p-5 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <AccountHero />
          <View className="gap-2 rounded-2xl border border-[#d9e2ec] bg-white p-5">
            <Text className="text-xl font-bold text-[#1a1f2e]">
              Account sign-in unavailable
            </Text>
            <Text className="text-sm leading-5 text-[#64748b]">
              Add the Clerk publishable key to the root env file, then restart
              Metro to enable sign-in on mobile.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!publicEnv.convexUrl) {
    return <AccountWithoutConvex />;
  }

  return <ConnectedAccountScreen />;
}

function ConnectedAccountScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoading } = useConvexAuth();
  const [activeTab, setActiveTab] = useState<TabName>("Enrollments");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-[#f5f7fa]">
        <ScrollView
          contentContainerClassName="gap-3.5 p-5 pb-10"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AccountHero />
          <View className="gap-2 rounded-2xl border border-[#d9e2ec] bg-white p-5">
            <Text className="text-xl font-bold text-[#1a1f2e]">
              Loading account...
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View className="flex-1 bg-[#f5f7fa]">
        <ScrollView
          contentContainerClassName="gap-3.5 p-5 pb-10"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AccountHero />
          <SignInForm />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f5f7fa]"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      stickyHeaderIndices={[0]}
    >
      {/* User Info Card + Segmented Control - fixed at top */}
      <View className="gap-3 bg-[#f5f7fa] px-5 pb-3 pt-5">
        {/* User Info Card */}
        <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-[#d9e2ec] bg-white p-5">
          <View className="flex-1 gap-0.5">
            <Text className="text-xl font-bold text-[#1a1f2e]">
              {user?.fullName ||
                user?.primaryEmailAddress?.emailAddress ||
                "Welcome back"}
            </Text>
            <Text className="text-sm leading-5 text-[#64748b]">
              {user?.primaryEmailAddress?.emailAddress ||
                "Your learning account is ready."}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              void signOut().catch(() => {
                Alert.alert("Sign out failed", "Please try again.");
              });
            }}
            className="items-center justify-center rounded-xl border border-[#4338ca] px-4"
            style={{ minHeight: 44, minWidth: 92 }}
          >
            <Text className="text-sm font-bold text-[#4338ca]">Sign out</Text>
          </Pressable>
        </View>

        {/* Segmented Control */}
        <View className="flex-row rounded-xl bg-[#e2e8f0] p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 items-center rounded-lg px-3 py-2.5 ${
                  isActive ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? "text-[#4338ca]" : "text-[#64748b]"
                  }`}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-[#64748b]">
              Syncing your latest enrollments and rewards...
            </Text>
          </View>
        ) : (
          <TabContent activeTab={activeTab} />
        )}
      </View>
    </ScrollView>
  );
}

function TabContent({ activeTab }: { activeTab: TabName }) {
  switch (activeTab) {
    case "Enrollments":
      return <EnrollmentsTab />;
    case "Mind Points":
      return <MindPointsTab />;
    case "Referrals":
      return <ReferralsTab />;
  }
}

function AccountWithoutConvex() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View className="flex-1 bg-[#f5f7fa]">
      <ScrollView
        contentContainerClassName="gap-3.5 p-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <AccountHero />

        {!isLoaded && (
          <View className="gap-2 rounded-2xl border border-[#d9e2ec] bg-white p-5">
            <Text className="text-xl font-bold text-[#1a1f2e]">
              Loading account...
            </Text>
          </View>
        )}

        {isLoaded && !isSignedIn && <SignInForm />}

        {isLoaded && isSignedIn && (
          <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-[#d9e2ec] bg-white p-5">
            <View className="flex-1 gap-0.5">
              <Text className="text-xl font-bold text-[#1a1f2e]">
                {user?.fullName ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "Welcome back"}
              </Text>
              <Text className="text-sm leading-5 text-[#64748b]">
                Account details are temporarily unavailable in this app build.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                void signOut().catch(() => {
                  Alert.alert("Sign out failed", "Please try again.");
                });
              }}
              className="items-center justify-center rounded-xl border border-[#4338ca] px-4"
              style={{ minHeight: 44, minWidth: 92 }}
            >
              <Text className="text-sm font-bold text-[#4338ca]">
                Sign out
              </Text>
            </Pressable>
          </View>
        )}

        <View className="gap-2 rounded-2xl border border-[#d9e2ec] bg-white p-5">
          <Text className="text-xl font-bold text-[#1a1f2e]">
            Account details unavailable
          </Text>
          <Text className="text-sm leading-5 text-[#64748b]">
            Add the Convex URL to the root env file, then restart Metro to load
            enrollments and rewards on mobile.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AccountHero() {
  return (
    <View className="gap-2.5 rounded-3xl bg-[#1f2937] p-5">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#fef08a]">
        Your account
      </Text>
      <Text className="text-3xl font-bold text-white">
        Manage learning and rewards
      </Text>
      <Text className="text-[15px] leading-[22px] text-[#d7e7ee]">
        Sign in to review your enrollments, track Mind Points, and keep your
        account ready for the next program.
      </Text>
    </View>
  );
}
