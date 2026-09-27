"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { WAITLIST_CONSENT_TEXT } from "convex/_shared/waitlist";

export interface TherapyOffering {
  id: string;
  title: string;
}

/**
 * Therapy waitlist. Warmer than the course form: the person picks what they'd
 * like support with, and we keep the note in the entry so the first reply can
 * be personal.
 */
export function TherapyWaitlistForm({
  offerings,
  offeringId,
  onOfferingChange,
}: {
  offerings: TherapyOffering[];
  offeringId: string;
  onOfferingChange: (id: string) => void;
}) {
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const selected = offerings.find((o) => o.id === offeringId);

  if (status === "sent") {
    return (
      <div className="border-primary/25 bg-primary/[0.04] rounded-3xl border p-8 sm:p-10">
        <p className="font-display text-foreground text-2xl sm:text-3xl">
          Thank you for reaching out.
        </p>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          We have your details{selected ? ` for ${selected.title}` : ""}. A
          person — not an autoresponder — will email {email} and message{" "}
          {whatsapp} as soon as we can offer you a time. You don&rsquo;t need to
          do anything else.
        </p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (sending) return;
        setStatus("sending");
        setError(null);
        try {
          await joinWaitlist({
            fullName,
            email,
            whatsapp,
            courseTitle: selected?.title ?? "Therapy",
            courseType: "therapy",
            delivery: "live",
            courseId: selected ? (selected.id as Id<"courses">) : undefined,
            source: "therapy",
            marketingConsent: consent,
            company,
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
      <label className="grid gap-1.5">
        <span className="text-muted-foreground text-[0.72rem] font-semibold tracking-[0.16em] uppercase">
          What would you like support with?
        </span>
        <select
          required
          value={offeringId}
          onChange={(event) => onOfferingChange(event.target.value)}
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-2xl border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        >
          {offerings.map((offering) => (
            <option key={offering.id} value={offering.id}>
              {offering.title}
            </option>
          ))}
          <option value="">I&rsquo;m not sure yet</option>
        </select>
      </label>

      <input
        type="text"
        required
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        autoComplete="name"
        disabled={sending}
        className="border-primary/30 bg-card focus-visible:ring-primary rounded-2xl border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-2xl border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <input
          type="tel"
          required
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          placeholder="WhatsApp number"
          aria-label="WhatsApp number"
          autoComplete="tel"
          inputMode="tel"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-2xl border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>

      <label className="text-muted-foreground flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={sending}
          className="mt-0.5"
        />
        Also send me The Mind Point updates and resources (optional).
      </label>
      <p className="text-muted-foreground text-[0.72rem] leading-relaxed">
        {WAITLIST_CONSENT_TEXT}
      </p>

      {/* Honeypot. Real people never see or fill this. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        className="hidden"
      />

      <div>
        <button
          type="submit"
          disabled={sending}
          className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-full px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase disabled:opacity-60"
        >
          {sending ? "Sending…" : "Join the waitlist"}
        </button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  );
}
