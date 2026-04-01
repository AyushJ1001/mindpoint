"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import StructuredContent from "@/components/course/structured-content";
import { ScrollReveal } from "@/components/ScrollReveal";

interface CourseOverviewProps {
  description: string;
}

export default function CourseOverview({ description }: CourseOverviewProps) {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
          <div className="rounded-2xl">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="font-display text-foreground text-3xl font-bold md:text-4xl">
                  Course Overview
                </CardTitle>
                <CardDescription className="text-lg">
                  Comprehensive learning experience designed for your success
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert mx-auto max-w-none">
                <StructuredContent text={description} />
              </CardContent>
            </Card>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
