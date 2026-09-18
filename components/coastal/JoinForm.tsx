"use client";

import { useState } from "react";

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
        <label className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
          Your name
        </label>
        <input
          required
          placeholder="Your name"
          className="rounded border border-border bg-card px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
          Email
        </label>
        <input
          type="email"
          required
          placeholder="you@email.com"
          className="rounded border border-border bg-card px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
          I&apos;m interested in
        </label>
        <select className="rounded border border-border bg-card px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {INTERESTS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
          Message
        </label>
        <textarea
          placeholder="Tell us a little about where you are."
          className="min-h-32 rounded border border-border bg-card px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="justify-self-start rounded-full bg-primary px-7 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase transition-transform hover:-translate-y-0.5"
      >
        {sent ? "Thank you — we'll be in touch" : "Send message →"}
      </button>
    </form>
  );
}
