import { datadogRum } from "@datadog/browser-rum";
import { nextjsPlugin } from "@datadog/browser-rum-nextjs";

const appId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID || "9ae8b859-4ab8-4ad2-90d0-7bd929fe818c";
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || "pub744df74357f673840b0ba5180e5c2017";
const site = process.env.NEXT_PUBLIC_DD_SITE || "us5.datadoghq.com";
const service = process.env.NEXT_PUBLIC_DD_SERVICE || "turfzo-web";
const env = process.env.NEXT_PUBLIC_DD_ENV || process.env.NODE_ENV || "development";

export function initDatadog() {
  if (typeof window !== "undefined" && appId && clientToken) {
    // Only initialize if not already initialized
    if (!datadogRum.getInternalContext()) {
      datadogRum.init({
        applicationId: appId,
        clientToken: clientToken,
        site: site,
        service: service,
        env: env,
        sessionSampleRate: 100, // capture 100% of sessions
        sessionReplaySampleRate: 100, // capture 100% of sessions with replay
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
    }
  }
}
