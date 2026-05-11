import { BookOpen, Video, Clock, Award } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface WhatYouGetProps {
  duration?: string;
  isPreRecorded?: boolean;
}

export default function WhatYouGet({ duration, isPreRecorded }: WhatYouGetProps) {
  const items = [
    { icon: BookOpen, label: "Study Material", value: "Included" },
    { icon: Video, label: "Session Recordings", value: "Included" },
    { icon: Clock, label: "Duration", value: duration || (isPreRecorded ? "3 months access" : "2 weeks") },
    { icon: Award, label: "Certificate", value: "On completion" },
  ];

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            What you get
          </h2>
        </ScrollReveal>

        {/* Feature items as a clean horizontal row, no card borders */}
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item) => (
            <ScrollReveal key={item.label}>
              <div className="text-center">
                <div className="bg-primary/8 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-foreground text-sm font-medium">
                  {item.label}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.value}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
