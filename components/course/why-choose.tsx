"use client";

import React from "react";
import { Star, Zap, Shield, Heart, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <section className="from-muted/20 to-background bg-gradient-to-br py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                  <Star className="text-primary h-10 w-10" />
                  {title}
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
                        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                          <item.icon className="text-primary h-6 w-6" />
                        </div>
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
