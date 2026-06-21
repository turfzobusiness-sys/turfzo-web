import { datadogRum } from "@datadog/browser-rum";
import { nextjsPlugin } from "@datadog/browser-rum-nextjs";

const appId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID || "9ae8b859-4ab8-4ad2-90d0-7bd929fe818c";
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || "pub744df74357f673840b0ba5180e5c2017";
const site = process.env.NEXT_PUBLIC_DD_SITE || "us5.datadoghq.com";
const service = process.env.NEXT_PUBLIC_DD_SERVICE || "turfzo-web";
const env = process.env.NEXT_PUBLIC_DD_ENV || process.env.NODE_ENV || "development";

if (typeof window !== "undefined" && appId && clientToken) {
  datadogRum.init({
    applicationId: appId,
    clientToken: clientToken,
    site: site,
    service: service,
    env: env,
    sessionSampleRate: 100, // capture 100% of sessions
    sessionReplaySampleRate: 20, // capture 20% of sessions with replay
    trackResources: true, // Enable Resource tracking
    trackUserInteractions: true, // Enable Action tracking
    trackLongTasks: true, // Enable Long Tasks tracking
    plugins: [nextjsPlugin()],
  });
}
