"use client";

import { useState } from "react";
import { ctaVariants } from "@/components/coastal/cta";

const INTERESTS = [
  "Relationship Psychology cohort",
  "Inner Child Healing cohort",
  "Self-paced course",
  "A therapy session",
  "Supervision",
  "Something else",
];

export function JoinForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          Your name
        </label>
        <input
          required
          placeholder="Your name"
          className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          Email
        </label>
        <input
          type="email"
          required
          placeholder="you@email.com"
          className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          I&apos;m interested in
        </label>
        <select className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2">
          {INTERESTS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          Message
        </label>
        <textarea
          placeholder="Tell us a little about where you are."
          className="border-border bg-card focus-visible:ring-primary min-h-32 rounded border px-4 py-3 outline-none focus-visible:ring-2"
        />
      </div>
      <button type="submit" className={ctaVariants({ layout: "self" })}>
        {sent ? "Thank you — we'll be in touch" : "Send message →"}
      </button>
    </form>
  );
}
