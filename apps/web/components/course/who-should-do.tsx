"use client";

import React from "react";
import { Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WhoShouldDoProps {
  title?: string;
  description?: string;
  items?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export default function WhoShouldDo({
  title = "Who Should Do This Course?",
  description = "Find out if this course is the perfect fit for your learning journey",
  items = [
    {
      icon: "🎓",
      title: "Students & Graduates",
      description:
        "Looking to build a strong foundation in psychology and mental health practices.",
    },
    {
      icon: "👨‍⚕️",
      title: "Healthcare Professionals",
      description:
        "Wanting to expand their knowledge and skills in mental health care.",
    },
    {
      icon: "💼",
      title: "Career Changers",
      description:
        "Seeking to transition into the mental health and wellness industry.",
    },
    {
      icon: "🧠",
      title: "Psychology Enthusiasts",
      description:
        "Passionate about understanding human behavior and mental processes.",
    },
  ],
}: WhoShouldDoProps) {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                  <Target className="text-primary h-10 w-10" />
                  <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                    {title}
                  </span>
                </CardTitle>
                <CardDescription className="text-lg">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="group">
                      <div className="border-primary/20 from-primary/5 to-accent/5 rounded-xl border-2 bg-gradient-to-r p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="mb-4 text-4xl">{item.icon}</div>
                        <h3 className="mb-2 text-xl font-semibold">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
