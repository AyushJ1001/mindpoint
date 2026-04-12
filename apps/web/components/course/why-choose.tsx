"use client";

import React from "react";
import { Zap, Shield, Heart, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface WhyChooseProps {
  title?: string;
  description?: string;
  items?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }>;
}

export default function WhyChoose({
  title = "Why Choose This Course?",
  description = "Discover what makes this course unique and valuable",
  items = [
    {
      icon: Zap,
      title: "Expert-Led Learning",
      description:
        "Learn from industry professionals with years of practical experience.",
    },
    {
      icon: Shield,
      title: "Comprehensive Curriculum",
      description:
        "Well-structured content covering all essential aspects of the subject.",
    },
    {
      icon: Heart,
      title: "Personalized Support",
      description:
        "Get individual attention and support throughout your learning journey.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description:
        "Gain skills that directly translate to career advancement opportunities.",
    },
  ],
}: WhyChooseProps) {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">{description}</p>
        </ScrollReveal>

        {/* Alternating feature rows instead of card grid */}
        <div className="mt-10 space-y-10">
          {items.map((item, idx) => {
            const isReversed = idx % 2 !== 0;
            return (
              <ScrollReveal key={idx}>
                <div
                  className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 ${
                    isReversed ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="bg-primary/8 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <item.icon className="text-primary h-5 w-5" />
                  </div>

                  {/* Text */}
                  <div className={isReversed ? "sm:text-right" : ""}>
                    <h3 className="text-foreground text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-md leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
