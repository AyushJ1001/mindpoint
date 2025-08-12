import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Users,
  Clock,
  Shield,
  Brain,
  Award,
  CheckCircle,
  Star,
  Zap,
  Globe,
  BookOpen,
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

      {/* Why Choose Us Section */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950" />
        <div className="bg-primary/5 absolute top-0 left-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/5 absolute right-0 bottom-0 h-96 w-96 rounded-full blur-3xl" />

        <div className="relative z-10 container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Star className="h-4 w-4" />
                Trusted by 1000+ Clients
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                Why Choose{" "}
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  The Mind Point
                </span>{" "}
                for Therapy?
              </h2>
              <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
                Experience professional therapy with a difference. We combine
                expertise, compassion, and innovation to provide you with the
                best mental health support.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Licensed Professionals */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <Award className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">
                    Licensed Professionals
                  </h3>
                  <p className="text-muted-foreground">
                    Our therapists are certified mental health professionals
                    with extensive training and experience in evidence-based
                    therapeutic approaches.
                  </p>
                </div>
              </Card>

              {/* Flexible Scheduling */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <Clock className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">
                    Flexible Scheduling
                  </h3>
                  <p className="text-muted-foreground">
                    Appointments will be booked based on your and therapist
                    convenience. No more waiting weeks for appointments or
                    rushing to make it on time.
                  </p>
                </div>
              </Card>

              {/* Evidence-Based Approaches */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">
                    Evidence-Based Approaches
                  </h3>
                  <p className="text-muted-foreground">
                    We use scientifically proven therapeutic methods including
                    CBT, DBT, and positive psychology to ensure effective
                    treatment outcomes.
                  </p>
                </div>
              </Card>

              {/* Affordable Pricing */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <Zap className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Affordable Pricing</h3>
                  <p className="text-muted-foreground">
                    Quality therapy shouldn't break the bank. Our transparent
                    pricing starts from just ₹600 per session with bulk
                    discounts available.
                  </p>
                </div>
              </Card>

              {/* Confidential & Secure */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">
                    Confidential & Secure
                  </h3>
                  <p className="text-muted-foreground">
                    Your privacy is our priority. All sessions are completely
                    confidential and conducted through secure, HIPAA-compliant
                    platforms.
                  </p>
                </div>
              </Card>

              {/* Global Accessibility */}
              <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800/50">
                <div className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="from-primary to-accent mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                    <Globe className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">
                    Global Accessibility
                  </h3>
                  <p className="text-muted-foreground">
                    Access therapy from anywhere in the world. Our online
                    platform connects you with qualified therapists regardless
                    of your location.
                  </p>
                </div>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="from-primary/10 to-accent/10 mt-16 rounded-2xl bg-gradient-to-r p-8 text-center dark:from-slate-800 dark:to-slate-700">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center">
                  <div className="text-primary mb-2 text-3xl font-bold">
                    1000+
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Happy Clients
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-primary mb-2 text-3xl font-bold">
                    4.9★
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Client Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
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
