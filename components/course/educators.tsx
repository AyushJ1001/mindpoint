"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-2xl">
        <div className="border-primary/30 bg-primary/10 absolute -inset-2 -z-10 translate-x-3 translate-y-3 rounded-2xl border-2" />
        <Card className="border-primary from-primary/5 to-background border-2 bg-gradient-to-br">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl">
              <Users className="text-primary h-10 w-10" />
              Educators and Supervisors
            </CardTitle>
            <CardDescription className="text-lg">
              Learn from experienced professionals in the field
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {EDUCATORS.map((p, idx) => (
                <Card
                  key={idx}
                  className="border-muted border-2 shadow-lg transition-shadow hover:shadow-xl"
                >
                  <CardContent className="p-6">
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
                      Practical, culturally relevant training with engaging
                      methods and real case insights.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
