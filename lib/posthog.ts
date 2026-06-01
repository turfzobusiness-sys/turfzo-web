// PostHog is OPTIONAL. It only initializes if NEXT_PUBLIC_POSTHOG_KEY is set.
// To enable: install posthog-js, set the key in env, and call init() from a client component.
//
//   npm install posthog-js

import { getOptionalEnv } from "./env";

export const posthogKey = getOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY") ?? "";
export const posthogHost = getOptionalEnv("NEXT_PUBLIC_POSTHOG_HOST") ?? "https://us.i.posthog.com";
export const posthogEnabled = Boolean(posthogKey);

// Lazily import posthog-js to avoid a hard build dep.
// The dynamic import string is untyped at compile time — suppress the TS error.
const importPosthog = new Function(
  "return import('posthog-js')"
) as () => Promise<{ default: { init: (key: string, opts: Record<string, unknown>) => void } }>;

export async function initPostHog(): Promise<void> {
  if (!posthogEnabled) return;
  if (typeof window === "undefined") return;
  try {
    const posthog = await importPosthog();
    posthog.default.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
      capture_pageleave: true,
    });
  } catch {
    // posthog-js not installed — silently skip.
  }
}
