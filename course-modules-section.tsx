"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function CourseModulesSection({
  modules,
}: {
  modules: Array<{
    title: string;
    description: string;
  }>;
}) {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden">
        <div className="border-primary/30 bg-primary/10 pointer-events-none absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-none border-2" />
        <Card className="border-primary bg-primary/5 rounded-none border-[3px]">
          <CardHeader>
            <CardTitle className="text-foreground font-serif text-4xl font-semibold md:text-5xl">
              Course Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {modules.map((module, index) => (
                <AccordionItem key={index} value={`module-${index + 1}`}>
                  <AccordionTrigger className="text-foreground hover:text-primary text-left hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/90 inline-flex h-7 w-7 items-center justify-center rounded-full">
                        <span className="text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </span>
                      </span>
                      <div className="text-left">
                        <div className="font-semibold">{module.title}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-10">
                      <p className="text-foreground/80 px-1 pb-4 font-serif">
                        {module.description}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
