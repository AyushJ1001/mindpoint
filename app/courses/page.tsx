"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const data = useQuery(api.courses.listCourses, {});

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Courses</h2>
          <p className="text-muted-foreground">
            Explore our complete range of courses and programs
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-4 h-20 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { courses } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Courses</h2>
        <p className="text-muted-foreground">
          Explore our complete range of courses and programs ({courses.length}{" "}
          courses available)
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="py-12 text-center">
          <h3 className="text-lg font-semibold">No courses available</h3>
          <p className="text-muted-foreground">
            Check back later for new courses.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="text-sm font-medium">
                      Code: {course.code}
                    </CardDescription>
                  </div>
                  {course.type && (
                    <Badge variant="secondary" className="capitalize">
                      {course.type.replace("-", " ")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {course.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                    {course.description}
                  </p>
                )}

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">
                      ₹{course.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span>
                      {course.enrolledUsers.length}/{course.capacity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>
                      {course.startDate} - {course.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>
                  {course.daysOfWeek.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days:</span>
                      <span>{course.daysOfWeek.join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <Button className="w-full">
                    {course.enrolledUsers.length >= course.capacity
                      ? "Full"
                      : "Enroll Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
