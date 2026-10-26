"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { EightWeekJourney } from "@/components/course-page/eight-week-journey";

const TABS = [
  { key: "live", label: "Live cohorts" },
  { key: "self", label: "Self-paced" },
  { key: "therapy", label: "Therapy & supervision" },
] as const;

const LIVE = [
  {
    name: "CBT, REBT and CBMT",
    href: "/programs/cbt-rebt-cbmt",
    type: "Certificate · 8 weeks · Live online",
    when: "Starts Tue 19 Jan 2027 · Tue & Thu",
    image: "/coastal/shore.jpg",
  },
  {
    name: "Personality Disorders",
    href: "/programs/personality-disorders",
    type: "Certificate · 8 weeks · Live online",
    when: "Starts Thu 21 Jan 2027 · Tue & Thu",
    image: "/coastal/hero.jpg",
  },
  {
    name: "Inner Child Healing & Therapy",
    href: "/programs/inner-child-healing",
    type: "Certificate · 8 weeks · Live online",
    when: "Starts Thu 28 Jan 2027 · Tue & Thu",
    image: "/coastal/calm.jpg",
  },
];

const LIVE_PRICE = "₹3,499";

const ROWS = {
  self: [
    {
      title: "Self-paced intro courses",
      copy: "Psychological First Aid, Criminal Psychology, Sports Psychology, and Clinical vs Counselling Psychology. Study at your own pace.",
      price: "₹999 each",
      href: "/courses/intro",
    },
    {
      title: "Free masterclass",
      copy: "One full session, free. Not released yet; leave your email to hear when it is.",
      price: "Coming soon",
      href: "/masterclass",
    },
    {
      title: "Free guides",
      copy: "Short reads and exercises you can use today.",
      price: "Free",
      href: "/resources",
    },
  ],
  therapy: [
    {
      title: "One calm conversation",
      copy: "A single session with a licensed professional. No commitment.",
      price: "₹600",
      href: "/courses/therapy",
    },
    {
      title: "Ongoing counselling",
      copy: "A steadier rhythm of support, booked session by session.",
      price: "Enquire",
      href: "/contact",
    },
    {
      title: "Supervision for practitioners",
      copy: "Structured supervision and peer community for practising therapists.",
      price: "Enquire",
      href: "/contact",
    },
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
                    Registration open
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h3 className="font-display text-xl leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{c.type}</p>
                  <p className="text-muted-foreground text-sm">{c.when}</p>
                  <EightWeekJourney compact className="mt-3 mb-4" />
                  <div className="border-border mt-auto flex items-center justify-between border-t border-dashed pt-4">
                    <span className="font-display text-lg">{LIVE_PRICE}</span>
                    <Link
                      href={c.href}
                      className="text-primary text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
                    >
                      Enrol →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-primary border-t-2">
            {ROWS[tab].map(({ title, copy, price, href }) => (
              <Link
                key={title}
                href={href}
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
