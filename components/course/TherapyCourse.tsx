import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Users,
  Clock,
  Shield,
  Brain,
} from "lucide-react";
import ChoosePlan from "@/components/therapy/choose-plan";
import type { Doc } from "@/convex/_generated/dataModel";

interface TherapyCourseProps {
  course: Doc<"courses">;
}

export default function TherapyCourse({ course }: TherapyCourseProps) {
  return (
    <>
      {/* Choose Plan Section */}
      <section className="py-16">
        <div className="container">
          <ChoosePlan
            onBook={(payload) => {
              console.log("Booking payload:", payload);
            }}
          />
        </div>
      </section>

      {/* Therapy Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Therapy Benefits
              </h2>
              <p className="text-muted-foreground text-lg">
                How therapy can support your mental health and well-being
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Heart className="text-primary h-6 w-6" />
                    Emotional Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive compassionate support and guidance to navigate
                    life's challenges and improve your emotional well-being.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Brain className="text-primary h-6 w-6" />
                    Coping Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn effective coping mechanisms and strategies to manage
                    stress, anxiety, and other mental health challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <MessageCircle className="text-primary h-6 w-6" />
                    Self-Understanding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gain deeper insights into your thoughts, feelings, and
                    behaviors to foster personal growth and self-awareness.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="text-primary h-6 w-6" />
                    Safe Space
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Experience a confidential, non-judgmental environment where
                    you can freely express yourself and work through challenges.
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
