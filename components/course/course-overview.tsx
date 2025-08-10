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

interface CourseOverviewProps {
  description: string;
}

export default function CourseOverview({ description }: CourseOverviewProps) {
  return (
    <section className="from-muted/20 to-background bg-gradient-to-br py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-3xl font-bold md:text-4xl">
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
        </div>
      </div>
    </section>
  );
}
