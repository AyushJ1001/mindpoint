import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Target, Zap } from "lucide-react";
import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface MasterclassCourseProps {
  course: Doc<"courses">;
}

export default function MasterclassCourse({ course }: MasterclassCourseProps) {
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

      {/* Masterclass Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Masterclass Benefits
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Why choose an intensive masterclass experience
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Star className="text-primary h-6 w-6" />
                    Expert Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn directly from industry leaders and experts who share
                    their real-world experiences and proven strategies.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="text-primary h-6 w-6" />
                    Rapid Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Intensive format allows you to quickly acquire new skills
                    and knowledge in a focused, efficient manner.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Users className="text-primary h-6 w-6" />
                    Networking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with like-minded professionals and build valuable
                    relationships in your industry.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="text-primary h-6 w-6" />
                    Practical Application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Focus on practical, actionable skills that you can
                    immediately apply in your work or projects.
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
