// Sentry is OPTIONAL. It only initializes if NEXT_PUBLIC_SENTRY_DSN is set.
// To enable: install @sentry/nextjs, set the DSN, and uncomment the init code.
//
//   npm install @sentry/nextjs
//
// Then uncomment the Sentry init block, and add `withSentryConfig` to next.config.ts.

import { getOptionalEnv } from "./env";

const dsn = getOptionalEnv("NEXT_PUBLIC_SENTRY_DSN");

// @sentry/nextjs is an optional dependency that may not be installed.
// `webpackIgnore` keeps the dynamic import unbundled (no build failure
// when the package is absent) and lazy. `new Function` is not used because
// the strict CSP forbids 'unsafe-eval'.
async function loadSentry(): Promise<{
  init: (opts: Record<string, unknown>) => void;
} | null> {
  try {
    // @ts-expect-error @sentry/nextjs is an optional dependency (not installed)
    const sdkModule = await import(/* webpackIgnore: true */ "@sentry/nextjs");
    return sdkModule as { init: (opts: Record<string, unknown>) => void };
  } catch {
    // @sentry/nextjs not installed — silently skip.
    return null;
  }
}

if (typeof window !== "undefined" && dsn) {
  void loadSentry().then((Sentry) => {
    Sentry?.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0,
    });
  });
}

export const sentryEnabled = Boolean(dsn);
