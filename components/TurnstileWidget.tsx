"use client";

import { useEffect, useRef, useState } from "react";
import { loadTurnstileScript, TURNSTILE_SITE_KEY } from "@/lib/turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = "dark",
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token) => onVerify(token),
          "expired-callback": () => onExpire?.(),
          "error-callback": () => {
            setError("Verification failed. Please try again.");
            onError?.();
          },
        });
        widgetIdRef.current = widgetId;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // ignore — widget may already be removed
        }
      }
    };
  }, [onVerify, onExpire, onError, theme]);

  if (error) {
    return (
      <div
        className={`text-xs text-error font-sans p-3 rounded border border-error/20 bg-error/5 ${
          className ?? ""
        }`}
      >
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
