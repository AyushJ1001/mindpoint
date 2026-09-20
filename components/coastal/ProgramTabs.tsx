"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TABS = [
  { key: "live", label: "Live cohorts" },
  { key: "self", label: "Self-paced" },
  { key: "therapy", label: "Therapy & supervision" },
] as const;

const LIVE = [
  {
    name: "Relationship Psychology: Marital & Family Therapy",
    type: "Certificate · 8 weeks · Live",
    when: "Starts Tue 22 Sep · Tue & Thu · 7:30 pm",
    price: "₹5,000",
    image: "/coastal/shore.jpg",
    badge: "Upcoming",
  },
  {
    name: "Inner Child Healing Certification",
    type: "Certificate · Live cohort",
    when: "Starts Tue 6 Oct · Tue & Thu · 6:30 pm",
    price: "₹5,000",
    image: "/coastal/calm.jpg",
    badge: "Upcoming",
  },
  {
    name: "Advanced Certificate in Counselling Practice",
    type: "Certificate · Live cohort",
    when: "Details to be announced",
    price: "TBA",
    image: "/coastal/hero.jpg",
    badge: "Coming soon",
  },
];

const ROWS = {
  self: [
    [
      "Recorded introduction",
      "A short, self-paced taste of how we teach — credits toward a cohort.",
      "₹999",
    ],
    [
      "Free recorded masterclass",
      "One full session, free. No card required.",
      "Free",
    ],
    [
      "Worksheet & tool pack",
      "Downloadable exercises you can use today.",
      "Free",
    ],
  ],
  therapy: [
    [
      "One calm conversation",
      "A single session with a licensed professional. No commitment.",
      "₹600",
    ],
    [
      "Ongoing counselling",
      "A steadier rhythm of support, booked session by session.",
      "Enquire",
    ],
    [
      "Supervision for practitioners",
      "Structured supervision and peer community for practising therapists.",
      "Enquire",
    ],
  ],
} as const;

export function ProgramTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("live");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Program types"
        className="mb-8 flex flex-wrap gap-3"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`program-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`program-panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.14em] uppercase transition-colors ${
              tab === t.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-primary hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`program-panel-${tab}`}
        aria-labelledby={`program-tab-${tab}`}
      >
        {tab === "live" ? (
          <div className="grid gap-7 md:grid-cols-3">
            {LIVE.map((c) => (
              <article
                key={c.name}
                className="group border-border bg-card flex flex-col overflow-hidden rounded border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_70px_-46px_rgba(19,46,43,0.6)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="bg-background/90 text-primary absolute top-4 left-4 rounded-full px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
                    {c.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h3 className="font-display text-xl leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{c.type}</p>
                  <p className="text-muted-foreground text-sm">{c.when}</p>
                  <div className="border-border mt-auto flex items-center justify-between border-t border-dashed pt-4">
                    <span className="font-display text-lg">{c.price}</span>
                    <Link
                      href="/contact"
                      className="text-primary text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
                    >
                      Enroll →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-primary border-t-2">
            {ROWS[tab].map(([title, copy, price]) => (
              <Link
                key={title}
                href="/contact"
                className="border-border hover:bg-card flex items-center justify-between gap-4 border-b border-dashed py-6 transition-colors"
              >
                <div>
                  <h3 className="font-display text-xl">{title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{copy}</p>
                </div>
                <span className="text-primary text-[0.7rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                  {price}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
