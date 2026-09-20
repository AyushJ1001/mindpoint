"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/backend/api";
import { ctaVariants } from "@/components/coastal/cta";

const INTERESTS = [
  "CBT, REBT, CBMT cohort",
  "Inner Child Healing cohort",
  "Personality Disorders cohort",
  "Self-paced course",
  "A therapy session",
  "Supervision",
  "Something else",
];

export function JoinForm() {
  const submitLead = useMutation(api.leads.submitLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const disabled = status === "sending" || status === "sent";

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (disabled) return;
        setStatus("sending");
        setError(null);
        try {
          await submitLead({
            email,
            name,
            interest,
            message,
            source: "join",
            marketingConsent: consent,
            company: "",
          });
          setStatus("sent");
        } catch (err) {
          setStatus("error");
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          );
        }
      }}
    >
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          Your name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          disabled={disabled}
          className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          disabled={disabled}
          className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-muted-foreground text-[0.68rem] tracking-[0.2em] uppercase">
          I&apos;m interested in
        </label>
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          disabled={disabled}
          className="border-border bg-card focus-visible:ring-primary rounded border px-4 py-3 outline-none focus-visible:ring-2 disabled:opacity-60"
        >
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about where you are."
          disabled={disabled}
          className="border-border bg-card focus-visible:ring-primary min-h-32 rounded border px-4 py-3 outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>
      <label className="text-muted-foreground flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={disabled}
          className="accent-primary mt-0.5"
        />
        <span>
          Yes, email me course updates and resources. No spam, unsubscribe any
          time.
        </span>
      </label>
      <button
        type="submit"
        disabled={disabled}
        className={`${ctaVariants({ layout: "self" })} disabled:opacity-60`}
      >
        {status === "sent"
          ? "Thank you — we'll be in touch"
          : status === "sending"
            ? "Sending…"
            : "Send message →"}
      </button>
      {error && (
        <p role="alert" className="text-destructive text-[0.72rem]">
          {error}
        </p>
      )}
    </form>
  );
}
