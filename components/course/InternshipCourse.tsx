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
  onVariantSelect?: (hours: 120 | 240) => void;
}

export default function InternshipCourse({
  course,
  onVariantSelect,
}: InternshipCourseProps) {
  return (
    <>
      {/* Internship Details Section */}
      <section className="py-16">
        <div className="container">
          <InternshipSection
            internship={course}
            onVariantSelect={onVariantSelect}
          />
        </div>
      </section>
    </>
  );
}
