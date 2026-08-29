import { datadogRum } from "@datadog/browser-rum";
import { nextjsPlugin } from "@datadog/browser-rum-nextjs";

const appId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID;
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;
const site = process.env.NEXT_PUBLIC_DD_SITE || "us5.datadoghq.com";
const service = process.env.NEXT_PUBLIC_DD_SERVICE || "turfzo-web";
const env = process.env.NEXT_PUBLIC_DD_ENV || process.env.NODE_ENV || "development";

export function initDatadog() {
  if (typeof window === "undefined" || !appId || !clientToken) return;
  // Only initialize if not already initialized
  if (datadogRum.getInternalContext()) return;

  const start = () => {
    if (datadogRum.getInternalContext()) return;
    datadogRum.init({
      applicationId: appId,
      clientToken: clientToken,
      site: site,
      service: service,
      env: env,
      sessionSampleRate: 100, // capture 100% of sessions
      // Full replay on every session costs continuous MutationObserver CPU
      // on user devices and Datadog quota. 15% is plenty for debugging.
      sessionReplaySampleRate: 15,
      trackResources: true, // Enable Resource tracking
      trackUserInteractions: true, // Enable Action tracking
      trackLongTasks: true, // Enable Long Tasks tracking
      plugins: [nextjsPlugin()],
      beforeSend: (event) => {
        // W4: strip URL fragments before RUM/session-replay uploads.
        // One-time reset tokens ride in the fragment and must never
        // reach Datadog.
        if (event.type === "view") {
          const url = event.view?.url;
          if (typeof url === "string" && url.includes("#")) {
            event.view!.url = url.split("#")[0];
          }
        }
        return true;
      },
    });
    datadogRum.startSessionReplayRecording();
  };

  // RUM is observability, not product — start it off the critical loading
  // path so it never competes with hydration/LCP.
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => start(), { timeout: 3000 });
  } else {
    setTimeout(start, 1500);
  }
}
