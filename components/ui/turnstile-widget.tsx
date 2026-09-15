"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
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
  reset: (widgetId?: TurnstileWidgetId) => void;
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
 * - Caller holds the token and can trigger a reset via `resetKey` after submission attempts (tokens are single-use).
 */
export function TurnstileWidget({
  action,
  onToken,
  onExpire,
  resetKey,
}: {
  action: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  resetKey?: number | string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
  }, [onToken, onExpire]);

  const render = useCallback(() => {
    if (!containerRef.current || widgetIdRef.current !== null) return;
    if (!window.turnstile) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: getTurnstileSiteKey(),
      action,
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onExpireRef.current?.(),
    });
  }, [action]);

  // Mount/remount: if turnstile is already on window, render immediately
  useEffect(() => {
    if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
      render();
    }
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [render]);

  // When resetKey changes, reset the active widget
  useEffect(() => {
    if (resetKey !== undefined && widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // ignore
      }
    }
  }, [resetKey]);

  if (!isTurnstileConfigured()) return null;

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
export function resetTurnstile(widgetId?: TurnstileWidgetId): void {
  if (window.turnstile) {
    try {
      if (widgetId) {
        window.turnstile.reset(widgetId);
      } else {
        window.turnstile.reset();
      }
    } catch {
      // ignore
    }
  }
}
