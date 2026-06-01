// Sentry is OPTIONAL. It only initializes if NEXT_PUBLIC_SENTRY_DSN is set.
// To enable: install @sentry/nextjs, set the DSN, and uncomment the init code.
//
//   npm install @sentry/nextjs
//
// Then uncomment the Sentry init block, and add `withSentryConfig` to next.config.ts.

import { getOptionalEnv } from "./env";

const dsn = getOptionalEnv("NEXT_PUBLIC_SENTRY_DSN");

// Use `new Function` to make the dynamic import truly lazy at runtime,
// so the missing-module TS error doesn't fail the build when Sentry isn't installed.
const importSentry = new Function(
  "return import('@sentry/nextjs')"
) as () => Promise<{ init: (opts: Record<string, unknown>) => void }>;

if (typeof window !== "undefined" && dsn) {
  void importSentry()
    .then((Sentry) => {
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0,
      });
    })
    .catch(() => {
      // @sentry/nextjs not installed — silently skip.
    });
}

export const sentryEnabled = Boolean(dsn);
