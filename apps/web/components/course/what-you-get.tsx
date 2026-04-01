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
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">What you get</h2>
        </ScrollReveal>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <ScrollReveal key={item.label}>
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <item.icon className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.value}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
