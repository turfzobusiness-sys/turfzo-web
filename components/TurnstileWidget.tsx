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
  const [mockChecked, setMockChecked] = useState(false);

  const isDev = typeof window !== "undefined" && (
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1"
  );

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
      .catch(() => {
        if (!cancelled) setError("Verification failed. Please try again.");
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
    if (isDev) {
      return (
        <div className={`flex items-center gap-3 bg-surface border border-border-default rounded-lg p-3.5 w-full max-w-[320px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${className ?? ""}`}>
          <input
            id="dev-turnstile-bypass"
            type="checkbox"
            checked={mockChecked}
            onChange={(e) => {
              const checked = e.target.checked;
              setMockChecked(checked);
              if (checked) {
                onVerify("mock-local-dev-token");
              } else {
                onExpire?.();
              }
            }}
            className="w-4.5 h-4.5 accent-brand-lime cursor-pointer rounded border-border-default bg-elevated"
          />
          <div className="flex flex-col text-left">
            <label htmlFor="dev-turnstile-bypass" className="text-xs font-semibold text-text-main cursor-pointer select-none">
              Verify Connection
            </label>
            <span className="text-[9px] text-text-muted">Simulated verification for localhost</span>
          </div>
        </div>
      );
    }

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
