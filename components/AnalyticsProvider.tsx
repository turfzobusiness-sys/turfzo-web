"use client";

import { useEffect } from "react";
import { initPostHog, posthogEnabled } from "@/lib/posthog";
import { initDatadog } from "@/instrumentation-client";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthogEnabled) {
      void initPostHog();
    }
    // Initialize Datadog RUM securely on the client
    initDatadog();
  }, []);
  return <>{children}</>;
}
