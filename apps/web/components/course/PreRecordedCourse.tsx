import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, Download, Repeat } from "lucide-react";
import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface PreRecordedCourseProps {
  course: Doc<"courses">;
}

export default function PreRecordedCourse({ course }: PreRecordedCourseProps) {
  return (
    <>
      {/* Learning Outcomes Section */}
      <section className="py-16">
        <div className="container">
          <CourseModulesSection
            learningOutcomes={course.learningOutcomes ?? []}
          />
        </div>
      </section>

      {/* Pre-recorded Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Pre-recorded Course Benefits
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Why choose self-paced learning with recorded content
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="text-primary h-6 w-6" />
                    Flexible Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn at your own pace and schedule, fitting education
                    around your work, family, and other commitments.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Repeat className="text-primary h-6 w-6" />
                    Better Retention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Review difficult concepts multiple times and pause to take
                    notes, leading to better understanding and retention.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Video className="text-primary h-6 w-6" />
                    High-Quality Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access professionally produced content with clear audio,
                    visuals, and comprehensive explanations.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Download className="text-primary h-6 w-6" />
                    Resource Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Download supplementary materials, slides, and resources to
                    support your learning journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
