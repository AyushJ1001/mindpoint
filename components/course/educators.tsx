"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";

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
    <section className="py-8">
      <div className="container">
        <h2 className="text-center font-serif text-4xl font-bold text-blue-950 md:text-5xl">
          Educators and Supervisors
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {EDUCATORS.map((p, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={
                      "/placeholder.svg?height=160&width=160&query=educator%20portrait%20avatar"
                    }
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-muted-foreground">{p.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Practical, culturally relevant training with engaging methods
                and real case insights.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
