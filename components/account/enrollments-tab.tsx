"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Ticket, Waves } from "lucide-react";
import { hasLifetimeRecordings } from "@/lib/recording-entitlement";
import Link from "next/link";

const lmsCourseTypes = new Set([
  "pre-recorded",
  "certificate",
  "diploma",
  "internship",
  "masterclass",
]);

export function EnrollmentsTab() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? { limit: 200 } : "skip",
  );
  // Server-authoritative: returns a credit only when checkout would honour it.
  const introCredit = useQuery(
    api.introUpgrades.getMyIntroUpgradeCredit,
    isAuthenticated ? {} : "skip",
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
      <h2 className="font-display text-3xl tracking-tight">My Enrollments</h2>
      {introCredit ? (
        <Card className="border-primary/30">
          <CardContent className="flex flex-wrap items-center gap-4 py-5">
            <Ticket className="text-primary h-5 w-5" aria-hidden="true" />
            <p className="text-sm leading-relaxed">
              You have a{" "}
              <strong>₹{introCredit.credit.toLocaleString("en-IN")} credit</strong>{" "}
              from {introCredit.introName}. It comes off any certificate course
              at checkout, once, and is applied automatically when you enrol.
            </p>
          </CardContent>
        </Card>
      ) : null}
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
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>
                        {new Date(course.startDate).toLocaleDateString()} -{" "}
                        {new Date(course.endDate).toLocaleDateString()}
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
                  {hasLifetimeRecordings(enrollment) && (
                    <Badge variant="outline">
                      Lifetime recordings included
                    </Badge>
                  )}
                  {enrollment.courseType === "certificate" ||
                  enrollment.courseType === "internship" ? (
                    <div className="pt-3">
                      <Link
                        href={`/lms/course/${course._id}`}
                        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                      >
                        Notes, recordings and certificate →
                      </Link>
                    </div>
                  ) : null}
                  {lmsCourseTypes.has(enrollment.courseType ?? "") && (
                    <div className="pt-3">
                      <Button
                        asChild
                        className="rounded-xl bg-[#0c6f73] text-[#fffaf0] hover:bg-[#07575b]"
                      >
                        <Link href="/lms">
                          <Waves className="mr-2 h-4 w-4" aria-hidden="true" />
                          Open My Learning
                        </Link>
                      </Button>
                    </div>
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
