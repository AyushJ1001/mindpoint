import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageCircle, Users, Clock, Shield, Brain } from "lucide-react";
import ChooseSupervisedPlan from "@/components/therapy/choose-supervised-plan";
import type { Doc } from "@/convex/_generated/dataModel";

interface SupervisedCourseProps {
  course: Doc<"courses">;
  variants?: Doc<"courses">[];
}

export default function SupervisedCourse({
  course,
  variants = [],
}: SupervisedCourseProps) {
  return (
    <>
      {/* Course Title Section */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br via-transparent dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl" />

        <div className="relative z-10 container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                {course.name}
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Choose Plan Section */}
      <section className="py-16">
        <div className="container">
          <ChooseSupervisedPlan
            course={course}
            variants={variants}
            onBook={(payload) => {
              console.log("Booking payload:", payload);
            }}
          />
        </div>
      </section>

      {/* Supervision Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Supervision Benefits
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                How supervised learning can enhance your professional
                development
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Eye className="text-primary h-6 w-6" />
                    Expert Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn from experienced professionals who provide
                    personalized feedback and mentorship to help you develop
                    your skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <MessageCircle className="text-primary h-6 w-6" />
                    Real Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Apply theoretical knowledge in real-world scenarios with
                    hands-on experience under professional supervision.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="text-primary h-6 w-6" />
                    Safe Environment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Practice in a controlled, ethical environment where mistakes
                    become learning opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Brain className="text-primary h-6 w-6" />
                    Skill Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Develop essential therapeutic techniques and build
                    confidence in your professional abilities.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Users className="text-primary h-6 w-6" />
                    Peer Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Collaborate with fellow students and professionals in a
                    supportive learning community.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="text-primary h-6 w-6" />
                    Flexible Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Choose from various session packages and schedules that fit
                    your learning pace and availability.
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
