import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Clock, Users } from "lucide-react";
import CourseModulesSection from "./course-modules-section";
import type { Doc } from "@/convex/_generated/dataModel";

interface CertificateCourseProps {
  course: Doc<"courses">;
}

export default function CertificateCourse({ course }: CertificateCourseProps) {
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
    </>
  );
}
