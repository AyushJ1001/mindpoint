"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BookOpen, Check } from "lucide-react";

export default function CourseModulesSection({
  learningOutcomes,
}: {
  learningOutcomes: Array<{
    icon: string;
    title: string;
  }>;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
        <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-bold md:text-4xl">
              What Will You Learn?
            </CardTitle>
            <CardDescription className="text-lg">
              Essential skills and knowledge you'll gain from this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Learning Outcomes List */}
            <div className="space-y-6">
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-6 pb-6">
                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                        <span className="mr-3 text-2xl">{outcome.icon}</span>
                        {outcome.title}
                      </p>
                    </div>

                    {/* Checkmark */}
                    <div className="mt-1 flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800 bg-white transition-all duration-200 group-hover:bg-gray-800">
                        <Check className="h-4 w-4 text-gray-800 transition-colors duration-200 group-hover:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Separator Line */}
                  {index < learningOutcomes.length - 1 && (
                    <div className="h-px bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Progressive Learning</div>
                  <div className="text-muted-foreground text-sm">
                    Step-by-step curriculum
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Practical Focus</div>
                  <div className="text-muted-foreground text-sm">
                    Real-world applications
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-xl">💡</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Expert Guidance</div>
                  <div className="text-muted-foreground text-sm">
                    Industry professionals
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
