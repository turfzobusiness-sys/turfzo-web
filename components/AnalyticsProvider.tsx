"use client";

import { useEffect } from "react";
import { initPostHog, posthogEnabled } from "@/lib/posthog";
import "@/instrumentation-client"; // Initialize Datadog RUM

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthogEnabled) {
      void initPostHog();
    }
  }, []);
  return <>{children}</>;
}
