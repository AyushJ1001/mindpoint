import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useConvexAuth } from "convex/react";
import { SignInForm } from "@/components/SignInForm";
import { publicEnv } from "@/lib/public-env";
import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { ReferralsTab } from "@/components/account/referrals-tab";
import { LeafDecoration } from "@/components/decorative/LeafDecoration";

const TABS = ["Enrollments", "Mind Points", "Referrals"] as const;
type TabName = (typeof TABS)[number];

export default function AccountScreen() {
  if (!publicEnv.clerkPublishableKey) {
    return (
      <View className="flex-1 bg-background">
        <ScrollView
          contentContainerClassName="gap-3.5 p-5 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <AccountHero />
          <View className="gap-2 rounded-2xl border border-border bg-white p-5">
            <Text className="text-xl font-bold text-foreground">
              Account sign-in unavailable
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
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
  const [clerkLoadTimedOut, setClerkLoadTimedOut] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setClerkLoadTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setClerkLoadTimedOut(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-background">
        <ScrollView
          contentContainerClassName="gap-3.5 p-5 pb-10"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AccountHero />
          <View className="gap-2 rounded-2xl border border-border bg-white p-5">
            <Text className="text-xl font-bold text-foreground">
              Loading account...
            </Text>
            {clerkLoadTimedOut ? (
              <Text className="text-sm leading-5 text-muted-foreground">
                Account sign-in is taking longer than expected. For TestFlight
                and App Store builds, make sure the live Clerk instance has
                Native API enabled and that this iOS app's bundle ID is added on
                the Native applications page.
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View className="flex-1 bg-background">
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
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      stickyHeaderIndices={[0]}
    >
      {/* User Info Card + Segmented Control - fixed at top */}
      <View className="gap-3 bg-background px-5 pb-3 pt-5">
        {/* User Info Card */}
        <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5">
          <View className="flex-1 gap-0.5">
            <Text className="text-xl font-bold text-foreground">
              {user?.fullName ||
                user?.primaryEmailAddress?.emailAddress ||
                "Welcome back"}
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
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
            className="items-center justify-center rounded-xl border border-primary px-4"
            style={{ minHeight: 44, minWidth: 92 }}
          >
            <Text className="text-sm font-bold text-primary">Sign out</Text>
          </Pressable>
        </View>

        {/* Segmented Control */}
        <View className="flex-row rounded-xl bg-secondary p-1">
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
                    isActive ? "text-primary" : "text-muted-foreground"
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
            <Text className="text-sm text-muted-foreground">
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
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-3.5 p-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <AccountHero />

        {!isLoaded && (
          <View className="gap-2 rounded-2xl border border-border bg-white p-5">
            <Text className="text-xl font-bold text-foreground">
              Loading account...
            </Text>
          </View>
        )}

        {isLoaded && !isSignedIn && <SignInForm />}

        {isLoaded && isSignedIn && (
          <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5">
            <View className="flex-1 gap-0.5">
              <Text className="text-xl font-bold text-foreground">
                {user?.fullName ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "Welcome back"}
              </Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                Account details are temporarily unavailable in this app build.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                void signOut().catch(() => {
                  Alert.alert("Sign out failed", "Please try again.");
                });
              }}
              className="items-center justify-center rounded-xl border border-primary px-4"
              style={{ minHeight: 44, minWidth: 92 }}
            >
              <Text className="text-sm font-bold text-primary">
                Sign out
              </Text>
            </Pressable>
          </View>
        )}

        <View className="gap-2 rounded-2xl border border-border bg-white p-5">
          <Text className="text-xl font-bold text-foreground">
            Account details unavailable
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
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
    <View className="overflow-hidden rounded-3xl">
      <LinearGradient
        colors={["#5b7a5e", "#4a6a4d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <LeafDecoration
          size={48}
          color="#ffffff"
          variant={3}
          opacity={0.15}
          style={{ position: "absolute", top: 10, right: 14 }}
        />
        <Text className="text-xs font-bold uppercase tracking-wider text-sage-light/80">
          Your account
        </Text>
        <Text className="mt-1 text-3xl font-bold text-white">
          Manage learning and rewards
        </Text>
        <Text className="mt-1 text-[15px] leading-[22px] text-white/80">
          Sign in to review your enrollments, track Mind Points, and keep your
          account ready for the next program.
        </Text>
      </LinearGradient>
    </View>
  );
}
