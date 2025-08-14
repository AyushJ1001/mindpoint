import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Edit, Target, Award, Users, Zap } from "lucide-react";
import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface ResumeStudioCourseProps {
  course: Doc<"courses">;
}

export default function ResumeStudioCourse({
  course,
}: ResumeStudioCourseProps) {
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

      {/* Resume Studio Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Resume Studio Benefits
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Why choose professional resume building services
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="text-primary h-6 w-6" />
                    Professional Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get a professionally crafted resume that stands out to
                    employers and increases your chances of landing interviews.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="text-primary h-6 w-6" />
                    ATS Optimized
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ensure your resume passes through Applicant Tracking Systems
                    and reaches human recruiters with optimized formatting and
                    keywords.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Edit className="text-primary h-6 w-6" />
                    Expert Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive personalized feedback from career experts who
                    understand what employers are looking for in your industry.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Users className="text-primary h-6 w-6" />
                    Career Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get strategic career advice and guidance to help you
                    position yourself effectively in the job market.
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
