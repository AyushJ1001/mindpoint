"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/lib/backend/api";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * Lead capture for a free resource. Email is required; a WhatsApp number is
 * encouraged because it out-opens email in India. Honeypot included.
 */
export function LeadCaptureForm({ source }: { source: string }) {
  const submitLead = useMutation(api.leads.submitLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const sending = status === "sending";

  if (status === "sent") {
    return (
      <div className="border-primary/25 bg-primary/[0.04] mx-auto max-w-xl rounded-2xl border p-6 text-left sm:p-8">
        <p className="font-display text-foreground text-2xl">
          It&rsquo;s on its way.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          We&rsquo;ve sent the masterclass to {email}. Keep an eye on your inbox
          — and we&rsquo;ll nudge you on WhatsApp too.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto grid max-w-xl gap-4 text-left"
      onSubmit={async (event) => {
        event.preventDefault();
        if (sending) return;
        setStatus("sending");
        setError(null);
        try {
          await submitLead({
            email,
            name: name || undefined,
            phone: phone || undefined,
            source,
            marketingConsent: consent,
            company,
          });
          trackEvent(ANALYTICS_EVENTS.leadCaptured, { source });
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
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="First name (optional)"
          aria-label="First name"
          autoComplete="given-name"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="WhatsApp (optional)"
          aria-label="WhatsApp number"
          autoComplete="tel"
          inputMode="tel"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          aria-label="Email"
          autoComplete="email"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary flex-1 rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-primary text-primary-foreground rounded-full px-6 py-3.5 text-xs font-medium tracking-[0.16em] uppercase disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send me the masterclass"}
        </button>
      </div>

      <label className="text-muted-foreground flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={sending}
          className="accent-primary mt-0.5"
        />
        <span>
          Yes, send me the masterclass and course updates. No spam, unsubscribe
          any time.
        </span>
      </label>

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

      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </form>
  );
}
