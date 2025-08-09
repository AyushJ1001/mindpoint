"use client";

import { Clock, ShieldCheck, Users } from "lucide-react";

export default function TrustBar() {
  const items = [
    { icon: <Users className="h-6 w-6" />, label: "2,500+ Learners" },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      label: "IAOTH-Ready Certificate",
    },
    { icon: <Clock className="h-6 w-6" />, label: "3 Months Recording Access" },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-blue-900 bg-blue-50 p-6">
      <div className="absolute top-[-50%] right-[-25%] h-64 w-64 rotate-12 rounded-full bg-blue-300/40 blur-3xl" />
      <div className="absolute bottom-[-50%] left-[-15%] h-56 w-56 -rotate-12 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center justify-center gap-3 rounded-lg bg-white/70 px-4 py-3 text-blue-950 shadow-sm ring-2 ring-blue-200 transition-shadow hover:shadow-md"
          >
            {it.icon}
            <span className="text-base font-semibold">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
