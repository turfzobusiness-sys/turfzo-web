// Cloudflare Turnstile integration.
// Site key is public (designed to be in client code). Secret key is server-only.

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADdslHrvtajPq8-E";

// Server-side only. Never import this in a "use client" file.
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? "";

export const TURNSTILE_ENABLED = Boolean(TURNSTILE_SECRET_KEY);

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
          action?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

let scriptLoadingPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) resolve();
      else existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export interface TurnstileVerifyResult {
  ok: boolean;
  errorCodes: string[];
  hostname?: string;
}

/**
 * Server-side: verify a Turnstile token with Cloudflare's siteverify endpoint.
 * Use this in Convex actions, API routes, etc.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  if (!TURNSTILE_ENABLED) {
    // Dev mode with no secret key — allow through with a warning.
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set; skipping verification (dev only)."
    );
    return { ok: true, errorCodes: [] };
  }
  if (!token) {
    return { ok: false, errorCodes: ["missing-input-response"] };
  }

  const res = await fetch(
    "https://turnstile-siteverify-turfzo.shaikhakramshakil.workers.dev/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, remoteip: remoteIp }),
    }
  );
  if (!res.ok) {
    return { ok: false, errorCodes: ["siteverify-fetch-failed"] };
  }
  const data = (await res.json()) as {
    success: boolean;
    "error-codes"?: string[];
    hostname?: string;
  };
  return {
    ok: Boolean(data.success),
    errorCodes: data["error-codes"] ?? [],
    hostname: data.hostname,
  };
}
