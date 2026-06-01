"use client";

import { useEffect } from "react";
import { initPostHog, posthogEnabled } from "@/lib/posthog";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthogEnabled) {
      void initPostHog();
    }
  }, []);
  return <>{children}</>;
}
