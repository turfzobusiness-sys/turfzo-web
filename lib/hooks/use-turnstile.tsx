"use client";

import { useState, useCallback, useRef } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

interface UseTurnstileOptions {
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

interface UseTurnstileReturn {
  token: string | null;
  error: string | null;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
  reset: () => void;
  verify: () => string | null;
  Widget: React.FC<{ className?: string; theme?: "light" | "dark" | "auto" }>;
}

export function useTurnstile(options: UseTurnstileOptions = {}): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<string | null>(null);

  const onVerify = useCallback(
    (newToken: string) => {
      setToken(newToken);
      setError(null);
      options.onVerify?.(newToken);
    },
    [options.onVerify]
  );

  const onExpire = useCallback(() => {
    setToken(null);
    setError(null);
    options.onExpire?.();
  }, [options.onExpire]);

  const onError = useCallback(() => {
    setToken(null);
    setError("Verification failed. Please try again.");
    options.onError?.();
  }, [options.onError]);

  const reset = useCallback(() => {
    setToken(null);
    setError(null);
    if (widgetRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetRef.current);
      } catch {
        // Widget may not exist yet
      }
    }
  }, []);

  const verify = useCallback(() => {
    return token;
  }, [token]);

  const Widget = useCallback(
    ({ className, theme = "dark" }: { className?: string; theme?: "light" | "dark" | "auto" }) => {
      return (
        <TurnstileWidget
          onVerify={onVerify}
          onExpire={onExpire}
          onError={onError}
          className={className}
          theme={theme}
        />
      );
    },
    [onVerify, onExpire, onError]
  );

  return {
    token,
    error,
    onVerify,
    onExpire,
    onError,
    reset,
    verify,
    Widget,
  };
}
