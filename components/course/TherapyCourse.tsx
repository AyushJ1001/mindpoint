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
import TherapyFAQSection from "@/components/therapy/therapy-faq-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface TherapyCourseProps {
  course: Doc<"courses">;
  variants?: Doc<"courses">[];
}

// Function to generate a concise summary from the course description
const generateSummary = (description: string | undefined): string => {
  if (!description) {
    return "Professional therapy sessions for mental health support and personal growth.";
  }

  // Remove HTML tags if present
  const cleanText = description.replace(/<[^>]*>/g, "");

  // Split into sentences and take the first meaningful sentence
  const sentences = cleanText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 10);

  if (sentences.length === 0) {
    return "Professional therapy sessions for mental health support and personal growth.";
  }

  // Take the first sentence and limit to ~100 characters
  let summary = sentences[0].trim();

  // If it's too long, truncate it
  if (summary.length > 100) {
    summary = summary.substring(0, 97) + "...";
  }

  return summary;
};

export default function TherapyCourse({
  course,
  variants = [],
}: TherapyCourseProps) {
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
              {course.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Choose Plan Section */}
      <section className="py-16">
        <div className="container">
          <ChoosePlan
            course={course}
            variants={variants}
            onBook={(payload) => {
              console.log("Booking payload:", payload);
            }}
          />
        </div>
      </section>

      {/* Therapy Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
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

      {/* FAQ Section */}
      <TherapyFAQSection />
    </>
  );
}
