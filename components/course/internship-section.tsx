"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

export default function Internship({
  internship,
  variants = [],
  onVariantSelect,
}: {
  internship: Doc<"courses">;
  variants?: Doc<"courses">[];
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

  // Get the currently selected course data
  const selectedCourse = courseVariants[selectedHours];

  // Handle hour selection and trigger variant selection
  const handleHourSelection = (hours: 120 | 240) => {
    setSelectedHours(hours);
    onVariantSelect?.(hours);
  };

  // Helper function to render allocation breakdown
  const renderAllocationBreakdown = (
    course: Doc<"courses">,
    colorClass: string,
  ) => {
    const allocation = course.allocation || [];
    const totalHours = allocation.reduce((sum, item) => sum + item.hours, 0);

    return (
      <div className="mb-8 space-y-3">
        {allocation.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <span className="font-medium text-slate-700">{item.topic}</span>
            <span className="mx-3 flex-1 border-b border-dotted border-slate-300"></span>
            <span className={`font-semibold ${colorClass}`}>
              {item.hours} {item.hours === 1 ? "hour" : "hours"}
            </span>
          </div>
        ))}

        {/* Total hours display */}
        <div className="mb-6 border-t border-slate-200 pt-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-xl font-bold text-transparent">
            {totalHours} hours
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Curriculum Breakdown Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Curriculum Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Comprehensive topics covered in our clinical psychology training
              programs
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Curriculum */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 120
                  ? "border-blue-500 bg-blue-50 shadow-2xl"
                  : "border-slate-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(120)}
            >
              {selectedHours === 120 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
                    120 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {courseVariants[120].learningOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                      <CheckCircle className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
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
                  : "border-slate-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(240)}
            >
              {selectedHours === 240 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  Topics to be covered in
                </div>
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
                    240 hours
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {courseVariants[240].learningOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                      <CheckCircle className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
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
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Program Structure Breakdown
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              Detailed hourly allocation for each training component to ensure
              comprehensive skill development
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* 120 Hours Infographic */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 120
                  ? "border-blue-500 bg-blue-50 shadow-2xl"
                  : "border-slate-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(120)}
            >
              {selectedHours === 120 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  THE MIND POINT'S
                </div>
                <div className="mb-4 text-sm font-medium text-slate-600">
                  <span className="font-semibold text-slate-800">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                    120
                  </span>
                  <span className="ml-2 text-4xl font-bold text-slate-700">
                    HOURS
                  </span>
                </div>
              </div>

              {renderAllocationBreakdown(courseVariants[120], "text-blue-600")}

              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                <h4 className="mb-3 text-center font-bold text-slate-800">
                  Beginner to Intermediate Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  Choose the{" "}
                  <span className="font-semibold text-blue-600">
                    120-hour program
                  </span>{" "}
                  if you're new to psychology, currently in high school, or in
                  your first year of a bachelor's degree and want to build a
                  strong foundation in the field.
                </p>
              </div>
            </div>

            {/* 240 Hours Infographic */}
            <div
              className={`relative cursor-pointer rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 ${
                selectedHours === 240
                  ? "border-purple-500 bg-purple-50 shadow-2xl"
                  : "border-slate-200 bg-white hover:shadow-2xl"
              }`}
              onClick={() => handleHourSelection(240)}
            >
              {selectedHours === 240 && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-slate-500 uppercase">
                  THE MIND POINT'S
                </div>
                <div className="mb-4 text-sm font-medium text-slate-600">
                  <span className="font-semibold text-slate-800">
                    ONLINE TRAINING BASED INTERNSHIP
                  </span>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Segregation of Hourly Structure
                </h3>
                <div className="mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                    240
                  </span>
                  <span className="ml-2 text-4xl font-bold text-slate-700">
                    HOURS
                  </span>
                </div>
              </div>

              {renderAllocationBreakdown(
                courseVariants[240],
                "text-purple-600",
              )}

              <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
                <h4 className="mb-3 text-center font-bold text-slate-800">
                  Advanced Level
                </h4>
                <p className="text-center text-sm leading-relaxed text-slate-600">
                  Choose the{" "}
                  <span className="font-semibold text-purple-600">
                    240-hour program
                  </span>{" "}
                  if you're pursuing a bachelor's or master's in psychology and
                  want an in-depth experience—this program includes everything
                  from the 120-hour course and much more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
