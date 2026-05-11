"use client";

import React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

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
      icon: "\uD83C\uDF93",
      title: "Students & Graduates",
      description:
        "Looking to build a strong foundation in psychology and mental health practices.",
    },
    {
      icon: "\uD83D\uDC68\u200D\u2695\uFE0F",
      title: "Healthcare Professionals",
      description:
        "Wanting to expand their knowledge and skills in mental health care.",
    },
    {
      icon: "\uD83D\uDCBC",
      title: "Career Changers",
      description:
        "Seeking to transition into the mental health and wellness industry.",
    },
    {
      icon: "\uD83E\uDDE0",
      title: "Psychology Enthusiasts",
      description:
        "Passionate about understanding human behavior and mental processes.",
    },
  ],
}: WhoShouldDoProps) {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">{description}</p>
        </ScrollReveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((item, idx) => (
            <ScrollReveal key={idx}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
