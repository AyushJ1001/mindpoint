"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Segment-level boundary for the admin area. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin area error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold text-slate-900">
        This admin page failed to load
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        The reason is below. No record was changed by this failure.
      </p>
      <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-slate-100 p-3 text-xs whitespace-pre-wrap text-slate-800">
        {error.message || "Unknown error"}
        {error.digest ? `\n\ndigest: ${error.digest}` : ""}
      </pre>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800"
        >
          Back to admin
        </Link>
      </div>
    </div>
  );
}
