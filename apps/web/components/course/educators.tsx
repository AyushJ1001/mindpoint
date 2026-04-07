"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

type Educator = { name: string; role: string };

const EDUCATORS: Array<Educator> = [
  {
    name: "Ms. Kiranjot Kour, Chief Resource Faculty",
    role: "Counselling Psychologist",
  },
  {
    name: "Ms. Kashfiya Anam Khan, Head Resource Faculty",
    role: "Counselling Psychologist",
  },
  {
    name: "Ms. Gazala Patel, Senior Resource Faculty",
    role: "Counselling Psychologist",
  },
  { name: "Mr. Arjun Mehta, Guest Faculty", role: "Neuroscience Researcher" },
];

export default function Educators() {
  return (
    <div className="mx-auto max-w-4xl">
      <ScrollReveal>
        {/* Section header – no Card wrapper */}
        <div className="mb-8 text-center">
          <div className="bg-primary/8 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="font-display text-foreground text-3xl font-bold md:text-4xl">
            Educators and Supervisors
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Learn from experienced professionals in the field
          </p>
        </div>

        {/* Educator list – simple items with avatars, no nested cards */}
        <div className="space-y-6">
          {EDUCATORS.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 sm:items-center"
            >
              {/* Avatar */}
              <div className="bg-primary/8 relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/placeholder.svg?height=160&width=160&query=educator%20portrait%20avatar"
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h3 className="text-foreground text-base font-semibold">
                  {p.name}
                </h3>
                <p className="text-muted-foreground text-sm">{p.role}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Practical, culturally relevant training with engaging
                  methods and real case insights.
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
