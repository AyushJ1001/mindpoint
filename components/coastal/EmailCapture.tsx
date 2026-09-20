"use client";

import { useState } from "react";

export function EmailCapture() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="mt-2 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="you@email.com"
        aria-label="Email"
        className="flex-1 rounded-full border border-primary bg-card px-5 py-3.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <button
        type="submit"
        className="rounded-full bg-primary px-6 py-3.5 text-xs font-medium tracking-[0.16em] text-primary-foreground uppercase"
      >
        {sent ? "Sent ✓" : "Send it to me"}
      </button>
    </form>
  );
}
