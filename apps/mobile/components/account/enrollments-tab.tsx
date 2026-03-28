import { View, Text, ActivityIndicator } from "react-native";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { Calendar, Clock, BookOpen } from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EnrollmentsTab() {
  const { isAuthenticated } = useConvexAuth();

  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? { limit: 200 } : "skip",
  );

  if (enrollments === undefined) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4338ca" />
        <Text className="text-muted-foreground mt-3 text-sm">
          Loading enrollments...
        </Text>
      </View>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="items-center py-12">
          <BookOpen size={48} color="#64748b" />
          <Text className="text-muted-foreground mt-4 text-center">
            You haven't enrolled in any courses yet.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <View className="gap-3 p-4">
      {enrollments.map((enrollment) => {
        const course = enrollment.course;
        if (!course) return null;

        return (
          <Card key={enrollment._id}>
            <CardHeader>
              <View className="flex-row items-start justify-between gap-2">
                <CardTitle className="flex-1 text-base">
                  {course.name}
                </CardTitle>
                {enrollment.courseType ? (
                  <Badge variant="secondary">
                    {enrollment.courseType.charAt(0).toUpperCase() +
                      enrollment.courseType.slice(1)}
                  </Badge>
                ) : null}
              </View>
            </CardHeader>
            <CardContent className="gap-2">
              {enrollment.enrollmentNumber &&
              enrollment.enrollmentNumber !== "N/A" ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-foreground text-sm font-medium">
                    Enrollment Number:
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {enrollment.enrollmentNumber}
                  </Text>
                </View>
              ) : null}

              {course.startDate ? (
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color="#64748b" />
                  <Text className="text-foreground text-sm">
                    {new Date(course.startDate).toLocaleDateString()} -{" "}
                    {new Date(course.endDate).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}

              {course.startTime ? (
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#64748b" />
                  <Text className="text-foreground text-sm">
                    {course.startTime} - {course.endTime}
                  </Text>
                </View>
              ) : null}

              {enrollment.internshipPlan ? (
                <Badge variant="outline">
                  {enrollment.internshipPlan === "120"
                    ? "120 hours"
                    : "240 hours"}
                </Badge>
              ) : null}

              {enrollment.isBogoFree ? (
                <Badge className="bg-emerald-500">BOGO Free Course</Badge>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </View>
  );
}
