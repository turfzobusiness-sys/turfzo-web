"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { addNextjsError } from "@datadog/browser-rum-nextjs";

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
    // Log to Datadog
    addNextjsError(error);
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/turfzo_mascot.svg"
            alt="Something went wrong"
            width={80}
            height={80}
            className="w-20 h-20 opacity-60 grayscale-[0.3]"
          />
        </div>
        <h1 className="font-sans text-3xl font-extrabold text-text-main mb-2">
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
            className="bg-surface border border-border-default hover:border-brand-lime/30 text-text-main font-semibold text-sm px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
