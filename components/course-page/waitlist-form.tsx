"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/lib/backend/api";

/**
 * Pre-registration capture for a paused course. Submits a lead (so it lands in
 * the owner's inbox and /admin/leads) with the course recorded as the interest.
 */
export function WaitlistForm({
  courseTitle,
  slug,
}: {
  courseTitle: string;
  slug: string;
}) {
  const submitLead = useMutation(api.leads.submitLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  if (status === "sent") {
    return (
      <div className="border-primary/25 bg-primary/[0.04] rounded-2xl border p-6 sm:p-8">
        <p className="font-display text-foreground text-2xl">
          You&rsquo;re on the list.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Thank you, {name || "friend"}. We&rsquo;ll email you at {email} as
          soon as registration for {courseTitle} opens.
        </p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      className="grid gap-4 sm:max-w-xl"
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
            interest: courseTitle,
            message: `Pre-registration interest for ${courseTitle}.`,
            source: `waitlist:${slug}`,
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
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          aria-label="Email"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>
      <input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone / WhatsApp (optional)"
        aria-label="Phone or WhatsApp"
        disabled={sending}
        className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
      />
      <label className="text-muted-foreground flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={sending}
          className="mt-0.5"
        />
        Email me when registration for this course opens.
      </label>
      <div>
        <button
          type="submit"
          disabled={sending}
          className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-full px-6 py-3.5 text-xs font-medium tracking-[0.16em] uppercase disabled:opacity-60"
        >
          {sending ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  );
}
