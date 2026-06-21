"use client";

import { useEffect } from "react";
import { addNextjsError } from "@datadog/browser-rum-nextjs";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    addNextjsError(error);
    console.error("[global-error.tsx]", error);
  }, [error]);
  return (
    <html>
      <body
        style={{
          backgroundColor: "#000000",
          color: "#F4F7F4",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#8B9E93", fontSize: 14, marginBottom: 24 }}>
            A critical error occurred. Please refresh the page.
          </p>
          {error.digest && (
            <p style={{ color: "#666", fontSize: 12, marginBottom: 24, fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              backgroundColor: "#0f1f0f",
              color: "#FFF",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
