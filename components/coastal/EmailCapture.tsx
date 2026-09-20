"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/backend/api";

interface EmailCaptureProps {
  source: string;
  label?: string;
  className?: string;
}

export function EmailCapture({
  source,
  label = "Send it to me",
  className = "mt-2 flex w-full max-w-lg flex-col gap-3",
}: EmailCaptureProps) {
  const submitLead = useMutation(api.leads.submitLead);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const disabled = status === "sending" || status === "sent";

  return (
    <form
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        if (disabled) return;
        setStatus("sending");
        setError(null);
        try {
          await submitLead({
            email,
            source,
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
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email"
          disabled={disabled}
          className="border-primary bg-card focus-visible:ring-primary flex-1 rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="bg-primary text-primary-foreground rounded-full px-6 py-3.5 text-xs font-medium tracking-[0.16em] uppercase disabled:opacity-60"
        >
          {status === "sent"
            ? "Sent ✓"
            : status === "sending"
              ? "Sending…"
              : label}
        </button>
      </div>
      <label className="text-muted-foreground flex items-start gap-2 text-left text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={disabled}
          className="accent-primary mt-0.5"
        />
        <span>
          Yes, email me free resources and course updates. No spam, unsubscribe
          any time.
        </span>
      </label>
      {error && (
        <p role="alert" className="text-destructive text-left text-[0.72rem]">
          {error}
        </p>
      )}
      {status === "sent" && (
        <p role="status" className="text-primary text-left text-[0.72rem]">
          Thank you — check your inbox.
        </p>
      )}
    </form>
  );
}
