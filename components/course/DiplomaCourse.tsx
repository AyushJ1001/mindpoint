import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Award, Target } from "lucide-react";
import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface DiplomaCourseProps {
  course: Doc<"courses">;
}

export default function DiplomaCourse({ course }: DiplomaCourseProps) {
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

      {/* Diploma Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Diploma Benefits
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Advantages of earning a diploma in this field
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <GraduationCap className="text-primary h-6 w-6" />
                    Advanced Knowledge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gain comprehensive knowledge and expertise that goes beyond
                    basic certification, preparing you for advanced roles in
                    your field.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Award className="text-primary h-6 w-6" />
                    Professional Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Earn a diploma that demonstrates your commitment to
                    professional development and advanced skill acquisition.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="text-primary h-6 w-6" />
                    Career Advancement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Open doors to higher-level positions and increased earning
                    potential with your advanced qualifications.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Users className="text-primary h-6 w-6" />
                    Networking Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with fellow professionals and industry experts to
                    expand your professional network and opportunities.
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
