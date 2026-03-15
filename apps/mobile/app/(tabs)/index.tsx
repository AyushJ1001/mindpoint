import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { CourseCard } from "@/components/CourseCard";
import { publicEnv } from "@/lib/public-env";

export default function BrowseScreen() {
  const courses = useQuery(api.courses.listCourses, { count: 24 });
  const courseCountLabel = useMemo(() => {
    if (!courses) {
      return "Loading courses from Convex…";
    }

    return `${courses.length} published courses loaded without authentication`;
  }, [courses]);

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={courses ?? []}
        keyExtractor={(course) => course._id}
        ListEmptyComponent={
          courses ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptyCopy}>
                Convex is reachable, but the current dataset did not return any
                published courses.
              </Text>
            </View>
          ) : (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#0f766e" />
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Phase 4 mobile bootstrap</Text>
            <Text style={styles.title}>Browse courses as a guest</Text>
            <Text style={styles.copy}>
              This screen reads from the shared Convex backend through the
              workspace packages and works before sign-in.
            </Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Public backend status</Text>
              <Text style={styles.statusValue}>{courseCountLabel}</Text>
              <Text style={styles.statusMeta}>
                {publicEnv.convexUrl
                  ? `Convex URL configured: ${publicEnv.convexUrl}`
                  : "Convex URL is not set in the root .env. Add it and restart Metro."}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <CourseCard course={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyCopy: {
    color: "#516170",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  emptyTitle: {
    color: "#0f1720",
    fontSize: 18,
    fontWeight: "700",
  },
  eyebrow: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  hero: {
    backgroundColor: "#0f4c5c",
    borderRadius: 28,
    gap: 10,
    padding: 20,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  screen: {
    flex: 1,
    backgroundColor: "#f3f7fa",
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    gap: 4,
    marginTop: 10,
    padding: 16,
  },
  statusLabel: {
    color: "#516170",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statusMeta: {
    color: "#516170",
    fontSize: 12,
    lineHeight: 18,
  },
  statusValue: {
    color: "#0f1720",
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
  },
});
