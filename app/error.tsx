"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Root error boundary. Without one, Next renders "Application error: a
 * client-side exception has occurred" and nothing else, which tells nobody
 * which component failed. This shows the message so the fault is identifiable.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center px-6">
      <div className="border-border bg-card w-full rounded-2xl border p-8 shadow-sm">
        <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.28em] uppercase">
          Something went wrong
        </p>
        <h1 className="font-display mt-3 text-2xl">
          This page failed to load.
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          The error is shown below so it can be reported. Nothing was saved or
          changed by this failure.
        </p>
        <pre className="bg-muted text-foreground mt-4 max-h-48 overflow-auto rounded-lg p-3 text-xs whitespace-pre-wrap">
          {error.message || "Unknown error"}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-border text-foreground rounded-full border px-5 py-2.5 text-sm font-semibold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
