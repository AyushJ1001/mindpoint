"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BookOpen, Check } from "lucide-react";

// Module icons mapping
const MODULE_ICONS = [
  "🎯",
  "🧠",
  "📚",
  "🔬",
  "💡",
  "🛠️",
  "📊",
  "🎨",
  "🔍",
  "⚡",
  "🌟",
  "🚀",
  "💎",
  "🎪",
  "🎭",
  "🎲",
];

export default function CourseModulesSection({
  modules,
}: {
  modules: Array<{
    title: string;
    description: string;
  }>;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(),
  );

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-16">
      {/* Section Header */}
      <div className="text-center">
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
          <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
                <BookOpen className="text-primary h-12 w-12" />
                Course Modules
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive curriculum designed for progressive learning
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => {
          const isExpanded = expandedModules.has(index);
          const moduleIcon = MODULE_ICONS[index % MODULE_ICONS.length];

          return (
            <div
              key={index}
              className="group transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden rounded-xl">
                {/* Shadow Effect */}
                <div className="border-primary/30 bg-primary/10 absolute -inset-1 -z-10 translate-x-2 translate-y-2 rounded-xl border-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />

                {/* Main Card */}
                <Card className="border-primary from-primary/5 to-background h-full border-2 bg-gradient-to-br transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <CardHeader className="pb-4 text-center">
                    {/* Module Number Badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="bg-primary/90 text-primary-foreground px-3 py-1 font-bold"
                      >
                        Module {index + 1}
                      </Badge>
                      <div className="text-4xl">{moduleIcon}</div>
                    </div>

                    {/* Module Title */}
                    <CardTitle className="text-left text-lg leading-tight font-semibold">
                      {module.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Module Description */}
                    <div
                      className={`transition-all duration-300 ${
                        isExpanded ? "max-h-none" : "max-h-20 overflow-hidden"
                      }`}
                    >
                      <p className="text-muted-foreground font-serif text-sm leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    {/* Expand/Collapse Button */}
                    {module.description.length > 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModule(index)}
                        className="text-primary hover:text-primary hover:bg-primary/10 mt-4 w-full transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Read More
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Heading */}
      <div className="mb-16 text-center">
        <h2 className="text-5xl font-light text-gray-800 md:text-6xl lg:text-7xl">
          What will you learn?
        </h2>
      </div>

      {/* Course Modules List */}
      <div className="space-y-8">
        {modules.map((module, index) => (
          <div key={index} className="group">
            <div className="flex items-start gap-6 pb-8">
              {/* Content */}
              <div className="flex-1">
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                  - {module.title}: {module.description}
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
            {index < modules.length - 1 && (
              <div className="h-px bg-gray-300"></div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Info Card */}
      <div className="mt-12">
        <Card className="border-primary/20 from-primary/5 to-accent/5 border-2 bg-gradient-to-r">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
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
