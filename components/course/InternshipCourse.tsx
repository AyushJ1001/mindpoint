import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Building,
  Users,
  Target,
  Clock,
  MapPin,
} from "lucide-react";
import InternshipSection from "./internship-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface InternshipCourseProps {
  course: Doc<"courses">;
}

export default function InternshipCourse({ course }: InternshipCourseProps) {
  return (
    <>
      {/* Internship Details Section */}
      <section className="py-16">
        <div className="container">
          <InternshipSection internship={course} />
        </div>
      </section>

      {/* Internship Benefits */}
      <section className="from-background to-muted/20 bg-gradient-to-br py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Internship Benefits
              </h2>
              <p className="text-muted-foreground text-lg">
                What you'll gain from this internship experience
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="text-primary h-6 w-6" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gain valuable real-world experience that will set you apart
                    in the job market and help you build a strong professional
                    portfolio.
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
                    Connect with industry professionals, mentors, and fellow
                    interns to expand your professional network and career
                    opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Target className="text-primary h-6 w-6" />
                    Career Clarity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discover your strengths, interests, and career path through
                    hands-on experience in a real work environment.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <Building className="text-primary h-6 w-6" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn about industry trends, best practices, and the
                    day-to-day operations of professional organizations.
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
