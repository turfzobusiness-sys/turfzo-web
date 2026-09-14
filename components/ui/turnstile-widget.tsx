"use client";

import Script from "next/script";
import { useRef } from "react";
import { getTurnstileSiteKey, isTurnstileConfigured } from "@/lib/turnstile";

type TurnstileWidgetId = string;
type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Reusable Turnstile widget (explicit render).
 * - Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; otherwise renders nothing (dev fail-open).
 * - Caller holds the token and must reset after each submission attempt (tokens are single-use).
 */
export function TurnstileWidget({
  action,
  onToken,
  onExpire,
}: {
  action: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  if (!isTurnstileConfigured()) return null;

  const render = () => {
    if (!containerRef.current || widgetIdRef.current !== null) return;
    if (!window.turnstile) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: getTurnstileSiteKey(),
      action,
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onExpireRef.current?.(),
    });
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={containerRef} className="cf-turnstile" data-action={action} />
    </>
  );
}

/** Reset helper for forms that keep their own widget via TurnstileWidget. */
export function resetTurnstile(): void {
  // Explicit-render widget IDs are scoped inside TurnstileWidget; a full
  // reset is done by re-render. Forms clear their token state and the widget
  // auto-issues a fresh challenge on expiry. This is a no-op placeholder for
  // API symmetry — token state reset lives in the form.
}
