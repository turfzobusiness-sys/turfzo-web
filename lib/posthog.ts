// PostHog is OPTIONAL. It only initializes if NEXT_PUBLIC_POSTHOG_KEY is set.
// To enable: install posthog-js, set the key in env, and call init() from a client component.
//
//   npm install posthog-js

import { getOptionalEnv } from "./env";

export const posthogKey = getOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY") ?? "";
export const posthogHost = getOptionalEnv("NEXT_PUBLIC_POSTHOG_HOST") ?? "https://us.i.posthog.com";
export const posthogEnabled = Boolean(posthogKey);

// posthog-js is an optional dependency that may not be installed.
// `webpackIgnore` keeps the dynamic import unbundled (no build failure
// when the package is absent) and lazy (resolved only if init is called).
// A static `import("posthog-js")` would fail the build when absent, and
// `new Function` would violate the strict CSP ('unsafe-eval' is not allowed).
async function loadPosthog(): Promise<{
  init: (key: string, opts: Record<string, unknown>) => void;
} | null> {
  try {
    // @ts-expect-error posthog-js is an optional dependency (not installed)
    const sdkModule = await import(/* webpackIgnore: true */ "posthog-js");
    return sdkModule.default as {
      init: (key: string, opts: Record<string, unknown>) => void;
    };
  } catch {
    // posthog-js not installed — silently skip.
    return null;
  }
}

export async function initPostHog(): Promise<void> {
  if (!posthogEnabled) return;
  if (typeof window === "undefined") return;
  const posthog = await loadPosthog();
  if (!posthog) return;
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: true,
  });
}
