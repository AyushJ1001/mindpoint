import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse } from "@mindpoint/backend";
import { CourseCard } from "@/components/CourseCard";
import { CourseCardSkeleton } from "@/components/CourseCardSkeleton";
import { publicEnv } from "@/lib/public-env";
import { BookOpen } from "lucide-react-native";

const COURSE_TYPES = [
  { label: "All", value: "all" },
  { label: "Certificate", value: "certificate" },
  { label: "Diploma", value: "diploma" },
  { label: "Therapy", value: "therapy" },
  { label: "Internship", value: "internship" },
  { label: "Masterclass", value: "masterclass" },
  { label: "Pre-Recorded", value: "pre-recorded" },
  { label: "Supervised", value: "supervised" },
  { label: "Resume Studio", value: "resume-studio" },
  { label: "Worksheet", value: "worksheet" },
] as const;

export default function BrowseScreen() {
  if (!publicEnv.convexUrl) {
    return <BrowseUnavailableScreen />;
  }

  return <BrowseCatalogScreen />;
}

function BrowseCatalogScreen() {
  const courses = useQuery(api.courses.listCourses, { count: 100 });
  const [selectedType, setSelectedType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Build BOGO courses lookup by type
  const bogoCoursesByType = useMemo(() => {
    if (!courses) return {};
    const map: Record<string, PublicCourse[]> = {};
    for (const course of courses) {
      if (course.bogo && course.type) {
        if (!map[course.type]) map[course.type] = [];
        map[course.type].push(course);
      }
    }
    return map;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (selectedType === "all") return courses;
    return courses.filter((c) => c.type === selectedType);
  }, [courses, selectedType]);

  const courseCountLabel = useMemo(() => {
    if (!courses) return "Loading available programs...";
    const count = filteredCourses.length;
    return count === 1 ? "1 program available" : `${count} programs available`;
  }, [courses, filteredCourses]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Convex queries auto-refresh; we just need to indicate we're done
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        data={filteredCourses}
        keyExtractor={(course) => course._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          courses ? (
            <View className="items-center rounded-xl border border-border bg-card p-6">
              <BookOpen size={32} color="#6b7280" />
              <Text className="mt-3 text-lg font-semibold text-foreground">
                No programs available yet
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                New cohorts and self-paced options will appear here as soon as
                they are published.
              </Text>
            </View>
          ) : (
            <View className="gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </View>
          )
        }
        ListHeaderComponent={
          <View className="gap-4">
            {/* Hero section */}
            <View className="rounded-2xl bg-primary p-5">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                Explore
              </Text>
              <Text className="mt-2 text-2xl font-bold text-primary-foreground">
                Upcoming Courses
              </Text>
              <Text className="mt-1 text-sm leading-5 text-primary-foreground/80">
                Don't miss out on these exciting courses starting soon. Secure
                your spot today!
              </Text>
              <View className="mt-3 rounded-xl bg-card p-4">
                <Text className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Course catalog
                </Text>
                <Text className="mt-1 text-lg font-bold text-foreground">
                  {courseCountLabel}
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Sign in from the Account tab to view enrollments and rewards.
                </Text>
              </View>
            </View>

            {/* Category filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {COURSE_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  className={`rounded-[999px] px-4 py-2 ${
                    selectedType === type.value
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedType === type.value
                        ? "text-primary-foreground"
                        : "text-secondary-foreground"
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <CourseCard course={item} bogoCoursesByType={bogoCoursesByType} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function BrowseUnavailableScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="p-5">
        <View className="rounded-2xl bg-primary p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
            Explore
          </Text>
          <Text className="mt-2 text-2xl font-bold text-primary-foreground">
            Upcoming Courses
          </Text>
          <Text className="mt-1 text-sm leading-5 text-primary-foreground/80">
            Browse current courses, check pricing, and find the format that fits
            your next step.
          </Text>
        </View>
        <View className="mt-4 items-center rounded-xl border border-border bg-card p-6">
          <Text className="text-lg font-semibold text-foreground">
            Course catalog unavailable
          </Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            The app is missing its course service configuration. Add the Convex
            URL to the root .env, then restart Metro.
          </Text>
        </View>
      </View>
    </View>
  );
}
