"use client";

import React from "react";
import { Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CertificationProps {
  title?: string;
  description?: string;
  items?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export default function Certification({
  title = "Certification & Its Applications",
  description = "Understand the value and applications of your certification",
  items = [
    {
      icon: "🎯",
      title: "Professional Recognition",
      description:
        "Gain industry-recognized certification that validates your expertise.",
    },
    {
      icon: "💼",
      title: "Career Opportunities",
      description:
        "Open doors to new job opportunities and career advancement.",
    },
    {
      icon: "🌍",
      title: "Global Applicability",
      description:
        "Certification recognized and valued worldwide in the field.",
    },
    {
      icon: "📈",
      title: "Skill Validation",
      description:
        "Demonstrate your practical skills and theoretical knowledge.",
    },
  ],
}: CertificationProps) {
  return (
    <section className="from-background to-muted/20 bg-gradient-to-br py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
            <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
                  <Award className="text-primary h-10 w-10" />
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
