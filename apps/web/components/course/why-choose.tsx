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
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((item, idx) => (
            <ScrollReveal key={idx}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
                  <item.icon className="text-primary h-5 w-5" />
                </div>
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
