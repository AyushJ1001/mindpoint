import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { SignInForm } from "@/components/SignInForm";
import { publicEnv } from "@/lib/public-env";

export default function AccountScreen() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const viewer = useQuery(
    api.viewer.getCurrentViewer,
    isAuthenticated ? {} : "skip",
  );
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated && userId ? { userId } : "skip",
  );
  const accountSummary = useQuery(
    api.mindPoints.getUserAccountSummary,
    isAuthenticated && userId
      ? { clerkUserId: userId, historyLimit: 5 }
      : "skip",
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Authenticated access</Text>
        <Text style={styles.title}>Sign in and verify Convex auth</Text>
        <Text style={styles.copy}>
          Clerk handles the session on-device and Convex receives the same
          Clerk-backed identity used by the web app.
        </Text>
      </View>

      {!publicEnv.clerkPublishableKey ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clerk is not configured</Text>
          <Text style={styles.cardCopy}>
            Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to the root env file before
            testing the account flow on mobile.
          </Text>
        </View>
      ) : null}

      {publicEnv.clerkPublishableKey && !isLoaded ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loading auth…</Text>
        </View>
      ) : null}

      {publicEnv.clerkPublishableKey && isLoaded && !isSignedIn ? (
        <SignInForm />
      ) : null}

      {publicEnv.clerkPublishableKey && isLoaded && isSignedIn ? (
        <>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.identityBlock}>
                <Text style={styles.cardTitle}>
                  {user?.fullName ||
                    user?.primaryEmailAddress?.emailAddress ||
                    "Signed in"}
                </Text>
                <Text style={styles.cardCopy}>Clerk user ID: {userId}</Text>
              </View>
              <Pressable
                onPress={() => signOut()}
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
            <Text style={styles.cardTitle}>Convex session status</Text>
            <Text style={styles.cardCopy}>
              {isLoading
                ? "Waiting for Convex auth handshake…"
                : isAuthenticated
                  ? "Authenticated"
                  : "Not authenticated"}
            </Text>
            <Text style={styles.statusValue}>
              {viewer
                ? `${viewer.name || viewer.email || viewer.subject}`
                : isAuthenticated
                  ? "Connected, loading viewer record…"
                  : "Sign in to query Convex with auth."}
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
                  <Text style={styles.historyPoints}>
                    {entry.type === "redeem" ? "-" : "+"}
                    {entry.points}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardCopy}>
                {accountSummary
                  ? "No loyalty activity yet."
                  : "Loading account summary…"}
              </Text>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
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
    color: "#0f766e",
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
