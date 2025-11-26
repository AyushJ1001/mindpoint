"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";

export function EnrollmentsTab() {
  const { user } = useUser();
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    user?.id ? { userId: user.id } : "skip",
  );

  if (!user) {
    return <div>Please sign in to view your enrollments.</div>;
  }

  if (enrollments === undefined) {
    return <div className="text-muted-foreground">Loading enrollments...</div>;
  }

  if (enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Enrollments</h2>
      <div className="grid gap-4">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          if (!course) return null;

          return (
            <Card key={enrollment._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  {enrollment.courseType && (
                    <Badge variant="secondary">
                      {enrollment.courseType.charAt(0).toUpperCase() +
                        enrollment.courseType.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {enrollment.enrollmentNumber !== "N/A" && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Enrollment Number:</span>
                      <span className="text-muted-foreground">
                        {enrollment.enrollmentNumber}
                      </span>
                    </div>
                  )}
                  {course.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(course.startDate).toLocaleDateString()} -{" "}
                        {new Date(course.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {course.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                  )}
                  {enrollment.internshipPlan && (
                    <div>
                      <Badge variant="outline">
                        {enrollment.internshipPlan === "120"
                          ? "120 hours"
                          : "240 hours"}
                      </Badge>
                    </div>
                  )}
                  {enrollment.isBogoFree && (
                    <Badge variant="default" className="bg-emerald-500">
                      BOGO Free Course
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

