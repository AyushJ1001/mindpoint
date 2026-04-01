"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import type { PublicCourse } from "@mindpoint/backend";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Internship({
  internship,
  variants = [],
  onVariantSelect,
}: {
  internship: PublicCourse;
  variants?: PublicCourse[];
  onVariantSelect?: (hours: 120 | 240) => void;
}) {
  const [selectedHours, setSelectedHours] = useState<120 | 240>(120);

  // Find the 120 and 240 hour variants
  const courseVariants = useMemo(() => {
    console.log("InternshipSection variants:", variants);
    console.log("InternshipSection internship:", internship);

    // Sort variants by price (ascending) - lower price = 120 hours, higher price = 240 hours
    const sortedVariants = [...variants].sort(
      (a, b) => (a.price || 0) - (b.price || 0),
    );

    // If we have at least 2 variants, use the first (lowest price) as 120 hours and second (higher price) as 240 hours
    let variant120 = internship;
    let variant240 = internship;

    if (sortedVariants.length >= 2) {
      variant120 = sortedVariants[0]; // Lower price = 120 hours
      variant240 = sortedVariants[1]; // Higher price = 240 hours
    } else if (sortedVariants.length === 1) {
      // If only one variant, compare with current course
      const currentPrice = internship.price || 0;
      const variantPrice = sortedVariants[0].price || 0;

      if (variantPrice < currentPrice) {
        variant120 = sortedVariants[0];
        variant240 = internship;
      } else {
        variant120 = internship;
        variant240 = sortedVariants[0];
      }
    }

    console.log("Found variant120 (lower price):", variant120);
    console.log("Found variant240 (higher price):", variant240);

    // Return the variants
    return {
      120: variant120,
      240: variant240,
    };
  }, [variants, internship]);

  // Handle hour selection and trigger variant selection
  const handleHourSelection = (hours: 120 | 240) => {
    setSelectedHours(hours);
    onVariantSelect?.(hours);
  };

  // Helper function to render allocation breakdown
  const renderAllocationBreakdown = (
    course: PublicCourse,
    colorClass: string,
  ) => {
    const allocation = course.allocation || [];
    const totalHours = allocation.reduce((sum, item) => sum + item.hours, 0);

    return (
      <div className="mb-8 space-y-3">
        {allocation.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <span className="font-medium text-foreground">{item.topic}</span>
            <span className="mx-3 flex-1 border-b border-dotted border-lavender-200"></span>
            <span className={`font-semibold ${colorClass}`}>
              {item.hours} {item.hours === 1 ? "hour" : "hours"}
            </span>
          </div>
        ))}

        {/* Total hours display */}
        <div className="mb-6 border-t border-lavender-200 pt-4">
          <div className="font-display text-foreground text-center text-xl font-bold">
            {totalHours} hours
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScrollReveal>
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Curriculum Breakdown Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="font-display text-foreground mb-4 text-4xl font-bold">
              Curriculum Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              Comprehensive topics covered in our clinical psychology training
              programs
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Curriculum */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 120
                  ? "border-primary bg-lavender-50 shadow-2xl"
                  : "border-lavender-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(120)}
            >
              {selectedHours === 120 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="font-display text-foreground text-5xl font-bold">
                    120 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {courseVariants[120].learningOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lavender-100">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {outcome.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 240 Hours Curriculum */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 240
                  ? "border-purple-500 bg-purple-50 shadow-2xl"
                  : "border-lavender-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(240)}
            >
              {selectedHours === 240 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="font-display text-foreground text-5xl font-bold">
                    240 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {courseVariants[240].learningOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lavender-100">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {outcome.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Infographic Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="font-display text-foreground mb-4 text-4xl font-bold">
              Program Structure Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              Detailed hourly allocation for each training component to ensure
              comprehensive skill development
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Infographic */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 120
                  ? "border-primary bg-lavender-50 shadow-2xl"
                  : "border-lavender-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(120)}
            >
              {selectedHours === 120 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  THE MIND POINT&apos;S
                </div>
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="font-display text-foreground text-6xl font-bold">
                    120
                  </span>
                  <span className="ml-2 text-4xl font-bold text-foreground">
                    HOURS
                  </span>
                </div>
              </div>

              {renderAllocationBreakdown(courseVariants[120], "text-primary")}

              <div className="rounded-xl border border-lavender-200 bg-gradient-to-r from-lavender-50 to-cream-50 p-6">
                <h4 className="mb-3 text-center font-bold text-foreground">
                  Beginner to Intermediate Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  Choose the{" "}
                  <span className="font-semibold text-primary">
                    120-hour program
                  </span>{" "}
                  if you&apos;re new to psychology, currently in high school, or
                  in your first year of a bachelor&apos;s degree and want to
                  build a strong foundation in the field.
                </p>
              </div>
            </div>

            {/* 240 Hours Infographic */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 240
                  ? "border-purple-500 bg-purple-50 shadow-2xl"
                  : "border-lavender-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(240)}
            >
              {selectedHours === 240 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  THE MIND POINT&apos;S
                </div>
                <div className="mb-4 text-sm font-medium text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="font-display text-foreground text-6xl font-bold">
                    240
                  </span>
                  <span className="ml-2 text-4xl font-bold text-foreground">
                    HOURS
                  </span>
                </div>
              </div>

              {renderAllocationBreakdown(
                courseVariants[240],
                "text-purple-600",
              )}

              <div className="rounded-xl border border-lavender-200 bg-gradient-to-r from-cream-50 to-lavender-50 p-6">
                <h4 className="mb-3 text-center font-bold text-foreground">
                  Advanced Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  Choose the{" "}
                  <span className="font-semibold text-purple-600">
                    240-hour program
                  </span>{" "}
                  if you&apos;re pursuing a bachelor&apos;s or master&apos;s in
                  psychology and want an in-depth experience—this program
                  includes everything from the 120-hour course and much more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ScrollReveal>
  );
}
