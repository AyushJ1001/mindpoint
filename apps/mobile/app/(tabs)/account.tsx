import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ReactNode } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { SignInForm } from "@/components/SignInForm";
import { publicEnv } from "@/lib/public-env";

// `publicEnv` is compiled into the Expo app config and treated as process-static.
export default function AccountScreen() {
  if (!publicEnv.clerkPublishableKey) {
    return (
      <AccountLayout>
        <AccountHero />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account sign-in unavailable</Text>
          <Text style={styles.cardCopy}>
            Add the Clerk publishable key to the root env file, then restart
            Metro to enable sign-in on mobile.
          </Text>
        </View>
      </AccountLayout>
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
  const { isAuthenticated, isLoading } = useConvexAuth();

  const viewer = useQuery(
    api.viewer.getCurrentViewer,
    isAuthenticated ? {} : "skip",
  );
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? {} : "skip",
  );
  const accountSummary = useQuery(
    api.mindPoints.getUserAccountSummary,
    isAuthenticated ? { historyLimit: 5 } : "skip",
  );

  return (
    <AccountLayout>
      <AccountHero />

      {!isLoaded ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loading account...</Text>
        </View>
      ) : null}

      {isLoaded && !isSignedIn ? <SignInForm /> : null}

      {isLoaded && isSignedIn ? (
        <>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.identityBlock}>
                <Text style={styles.cardTitle}>
                  {user?.fullName ||
                    user?.primaryEmailAddress?.emailAddress ||
                    "Welcome back"}
                </Text>
                <Text style={styles.cardCopy}>
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
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonLabel}>Sign out</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account status</Text>
            <Text style={styles.cardCopy}>
              {isLoading
                ? "Syncing your latest enrollments and rewards..."
                : isAuthenticated
                  ? "Your account details are up to date."
                  : "We are still connecting your account data."}
            </Text>
            <Text style={styles.statusValue}>
              {viewer?.name || viewer?.email || "Your profile is ready."}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Enrollments</Text>
              <Text style={styles.metricValue}>
                {enrollments ? enrollments.length : "…"}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Mind Points</Text>
              <Text style={styles.metricValue}>
                {accountSummary ? accountSummary.points.balance : "…"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent loyalty activity</Text>
            {accountSummary && accountSummary.history.length > 0 ? (
              accountSummary.history.map((entry) => (
                <View key={entry._id} style={styles.historyRow}>
                  <Text style={styles.historyDescription}>
                    {entry.description}
                  </Text>
                  <Text
                    style={[
                      styles.historyPoints,
                      {
                        color: entry.type === "redeem" ? "#b42318" : "#0f766e",
                      },
                    ]}
                  >
                    {entry.type === "redeem" ? "-" : "+"}
                    {Math.abs(entry.points)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardCopy}>
                {accountSummary
                  ? "No loyalty activity yet."
                  : "Loading account summary..."}
              </Text>
            )}
          </View>
        </>
      ) : null}
    </AccountLayout>
  );
}

/**
 * Renders the account screen when Convex is not configured.
 * Must only render when `clerkPublishableKey` is set so ClerkProvider exists.
 */
function AccountWithoutConvex() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <AccountLayout>
      <AccountHero />

      {!isLoaded ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loading account...</Text>
        </View>
      ) : null}

      {isLoaded && !isSignedIn ? <SignInForm /> : null}

      {isLoaded && isSignedIn ? (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.identityBlock}>
              <Text style={styles.cardTitle}>
                {user?.fullName ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "Welcome back"}
              </Text>
              <Text style={styles.cardCopy}>
                Account details are temporarily unavailable in this app build.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                void signOut().catch(() => {
                  Alert.alert("Sign out failed", "Please try again.");
                });
              }}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account details unavailable</Text>
        <Text style={styles.cardCopy}>
          Add the Convex URL to the root env file, then restart Metro to load
          enrollments and rewards on mobile.
        </Text>
      </View>
    </AccountLayout>
  );
}

function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

function AccountHero() {
  return (
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>Your account</Text>
      <Text style={styles.title}>Manage learning and rewards</Text>
      <Text style={styles.copy}>
        Sign in to review your enrollments, track Mind Points, and keep your
        account ready for the next program.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  cardCopy: {
    color: "#516170",
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    color: "#0f1720",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 40,
  },
  copy: {
    color: "#d7e7ee",
    fontSize: 15,
    lineHeight: 22,
  },
  eyebrow: {
    color: "#fef08a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  hero: {
    backgroundColor: "#1f2937",
    borderRadius: 28,
    gap: 10,
    padding: 20,
  },
  historyDescription: {
    color: "#0f1720",
    flex: 1,
    fontSize: 14,
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: "700",
  },
  historyRow: {
    alignItems: "center",
    borderTopColor: "#e5edf3",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
  },
  identityBlock: {
    flex: 1,
    gap: 2,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 18,
  },
  metricLabel: {
    color: "#516170",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#0f1720",
    fontSize: 28,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f3f7fa",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#0f766e",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 92,
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  statusValue: {
    color: "#0f1720",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
  },
});
