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
  useEffect(() => {
    onVerify("bypass-token");
  }, [onVerify]);

  return null;
}
