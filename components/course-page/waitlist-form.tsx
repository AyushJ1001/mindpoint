"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import {
  WAITLIST_CONSENT_TEXT,
  waitlistDeliveryLabel,
  type WaitlistCourseType,
  type WaitlistDelivery,
} from "convex/_shared/waitlist";

export interface WaitlistBatchOption {
  _id: string;
  label: string;
  startDate?: string;
}

/**
 * Early-bird pre-registration for a paused Course. Records one entry per
 * Course, Cohort and Delivery, so the owner can follow up per offering when
 * registration opens. No price is quoted here.
 */
export function WaitlistForm({
  courseTitle,
  courseType,
  courseId,
  batches = [],
  deliveries,
  source,
}: {
  courseTitle: string;
  courseType: WaitlistCourseType;
  courseId?: string;
  batches?: WaitlistBatchOption[];
  deliveries: WaitlistDelivery[];
  source: string;
}) {
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [delivery, setDelivery] = useState<WaitlistDelivery>(
    deliveries[0] ?? "live",
  );
  const [batchId, setBatchId] = useState<string>(batches[0]?._id ?? "");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCohort = batches.find((batch) => batch._id === batchId);

  if (status === "sent") {
    return (
      <div className="border-primary/25 bg-primary/[0.04] rounded-2xl border p-6 sm:p-8">
        <p className="font-display text-foreground text-2xl">
          You&rsquo;re on the early-bird list.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Thank you, {fullName}. We have you down for{" "}
          <strong className="text-foreground">{courseTitle}</strong>
          {selectedCohort ? `, ${selectedCohort.label}` : ""} (
          {waitlistDeliveryLabel(delivery).toLowerCase()}). We&rsquo;ll email{" "}
          {email} and message {whatsapp} with the early-bird discount when
          registration opens.
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
          await joinWaitlist({
            fullName,
            email,
            whatsapp,
            courseTitle,
            courseType,
            delivery,
            courseId: courseId ? (courseId as Id<"courses">) : undefined,
            batchId: batchId ? (batchId as Id<"courseBatches">) : undefined,
            cohortLabel: selectedCohort?.label,
            source,
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
      <input
        type="text"
        required
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Full name"
        aria-label="Full name"
        autoComplete="name"
        disabled={sending}
        className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          autoComplete="email"
          disabled={sending}
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
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
          className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
        />
      </div>

      {batches.length > 0 ? (
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground text-[0.72rem] font-semibold tracking-[0.16em] uppercase">
            Cohort
          </span>
          <select
            value={batchId}
            onChange={(event) => setBatchId(event.target.value)}
            disabled={sending}
            className="border-primary/30 bg-card focus-visible:ring-primary rounded-full border px-5 py-3.5 text-base outline-none focus-visible:ring-2 disabled:opacity-60"
          >
            <option value="">Any upcoming cohort</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {[batch.label, batch.startDate].filter(Boolean).join(" · ")}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {deliveries.length > 1 ? (
        <fieldset className="grid gap-2">
          <legend className="text-muted-foreground text-[0.72rem] font-semibold tracking-[0.16em] uppercase">
            Format
          </legend>
          <div className="flex flex-wrap gap-2">
            {deliveries.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                  delivery === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/30 bg-card text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option}
                  checked={delivery === option}
                  onChange={() => setDelivery(option)}
                  disabled={sending}
                  className="sr-only"
                />
                {waitlistDeliveryLabel(option)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-muted-foreground text-sm">
          Format:{" "}
          <strong className="text-foreground">
            {waitlistDeliveryLabel(delivery)}
          </strong>
        </p>
      )}

      <label className="text-muted-foreground flex items-start gap-2 text-[0.72rem] leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={sending}
          className="mt-0.5"
        />
        Also send me other The Mind Point updates and resources (optional).
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
          className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-full px-6 py-3.5 text-xs font-medium tracking-[0.16em] uppercase disabled:opacity-60"
        >
          {sending ? "Joining…" : "Join the early-bird list"}
        </button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  );
}
