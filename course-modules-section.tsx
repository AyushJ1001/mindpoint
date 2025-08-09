"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, CheckCircle } from "lucide-react";

export default function CourseModulesSection({
  modules,
}: {
  modules: { title: string; description: string }[];
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2 border-blue-800 bg-blue-300" />
        <Card className="rounded-none border-[3px] border-blue-900 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-4xl font-semibold text-blue-950 md:text-5xl">
              Course Modules
            </CardTitle>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge variant="secondary" className="text-sm">
                {modules.length} Modules
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Starry gradient divider */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"
        role="img"
        aria-label="Starry divider for course modules"
      >
        <div className="absolute inset-0 flex items-center justify-between px-4 text-xs">
          {modules.map((module) => (
            <span key={module.title} className="text-white/70">
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Accordion list of modules */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2 border-blue-800 bg-blue-300" />
        <Card className="rounded-none border-[3px] border-blue-900 bg-blue-50">
          <CardContent className="p-0">
            <Accordion
              type="single"
              collapsible
              className="divide-y divide-blue-900/20"
            >
              {modules.map((module) => (
                <AccordionItem
                  key={module.title}
                  value={`module-${module.title}`}
                  className="px-4"
                >
                  <AccordionTrigger className="text-left text-blue-950 hover:text-blue-900 hover:no-underline">
                    <div className="flex w-full items-center gap-3">
                      <span className="font-semibold text-purple-700">
                        {module.title}.
                      </span>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-900/90">
                        <Star
                          className="h-4 w-4 text-blue-50"
                          role="img"
                          aria-label="Star icon for course modules"
                        />
                      </span>
                      <h3 className="text-lg font-semibold md:text-xl">
                        {module.title}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="px-1 pb-4 font-serif text-blue-900/80">
                      {module.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Summary card */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2 border-blue-800 bg-blue-300" />
        <Card className="rounded-none border-[3px] border-blue-900 bg-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="mb-4 font-serif text-2xl font-semibold text-blue-950">
              Complete Learning Journey
            </h3>
            <p className="mb-4 font-serif text-lg text-blue-900/80">
              Progress through {modules.length} comprehensive modules designed
              to take you from beginner to confident dream analysis practitioner
              with practical, India-focused learning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-blue-950">
                <CheckCircle className="h-5 w-5 text-blue-900" />
                <span className="font-semibold">Hands-on Practice</span>
              </div>
              <div className="flex items-center gap-2 text-blue-950">
                <CheckCircle className="h-5 w-5 text-blue-900" />
                <span className="font-semibold">Expert Supervision</span>
              </div>
              <div className="flex items-center gap-2 text-blue-950">
                <CheckCircle className="h-5 w-5 text-blue-900" />
                <span className="font-semibold">Real Case Studies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
