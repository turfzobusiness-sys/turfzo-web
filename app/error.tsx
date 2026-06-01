"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry/PostHog if configured (no-op if not)
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        Sentry?: { captureException: (e: unknown) => void };
      };
      w.Sentry?.captureException(error);
    }
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-poppins text-3xl font-extrabold text-text-main mb-2">
          Something went wrong
        </h1>
        <p className="text-text-muted text-sm font-sans mb-8 leading-relaxed">
          We&apos;ve been notified. Please try again, or come back in a moment.
        </p>
        {error.digest && (
          <p className="text-text-muted/60 text-xs font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="bg-surface-dark border border-white/10 hover:border-brand-lime/30 text-text-main font-semibold text-sm px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
