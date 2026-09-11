"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calendar, Clock, RefreshCw } from "lucide-react";

export function EnrollmentsTab() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const {
    isAuthenticated,
    isLoading: isConvexAuthLoading,
  } = useConvexAuth();
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? { limit: 200 } : "skip",
  );

  if (!isClerkLoaded) {
    return <div className="text-muted-foreground">Loading your account...</div>;
  }

  if (!user) {
    return <div>Please sign in to view your enrollments.</div>;
  }

  if (isConvexAuthLoading || (isAuthenticated && enrollments === undefined)) {
    return <div className="text-muted-foreground">Loading enrollments...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Your account is signed in, but your learning data did not connect.</p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-6">
            Refresh once to retry the secure connection. If it still does not connect, the preview authentication configuration needs attention rather than your enrollment records.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Retry connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary/65 text-xs font-semibold tracking-[0.08em] lowercase">
            your courses
          </p>
          <h2 className="font-display mt-1 text-3xl font-medium">My Learning</h2>
        </div>
        <p className="text-muted-foreground max-w-lg text-sm leading-6">
          Open any registered course to access its lessons, videos, notes, and resources.
        </p>
      </div>

      <div className="grid gap-4">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          if (!course) return null;

          return (
            <Card key={enrollment._id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
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
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="space-y-2 text-sm">
                    {enrollment.enrollmentNumber !== "N/A" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Enrollment Number:</span>
                        <span className="text-muted-foreground">
                          {enrollment.enrollmentNumber}
                        </span>
                      </div>
                    )}
                    {course.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span>
                          {new Date(course.startDate).toLocaleDateString()} -{" "}
                          {course.endDate
                            ? new Date(course.endDate).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    )}
                    {course.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span>
                          {course.startTime} - {course.endTime}
                        </span>
                      </div>
                    )}
                    {enrollment.internshipPlan && (
                      <div>
                        <Badge variant="outline">
                          Legacy internship:{" "}
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

                  <Button asChild>
                    <Link href={`/learn/${course._id}`}>
                      Continue Learning
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
