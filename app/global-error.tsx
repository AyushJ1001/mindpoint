"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: the root layout itself failed.
 *
 * Next's default here is "Application error: a client-side exception has
 * occurred" and nothing else, which is unusable for diagnosis. Show the message
 * and the digest so the failure can be identified, and offer a reload.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f7f5",
          color: "#173f3a",
        }}
      >
        <main style={{ maxWidth: "40rem", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", margin: 0 }}>
            This page could not be displayed
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
            The page shell failed to load. Nothing was saved or changed.
          </p>
          <pre
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "#e7ece8",
              fontSize: "0.75rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message || "Unknown error"}
            {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
          <div
            style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: "999px",
                border: "none",
                background: "#173f3a",
                color: "#fff",
                padding: "0.6rem 1.25rem",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              style={{
                borderRadius: "999px",
                border: "1px solid #c7d3cd",
                background: "transparent",
                color: "#173f3a",
                padding: "0.6rem 1.25rem",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Back to home
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
