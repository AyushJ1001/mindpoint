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
    </>
  );
}
