// Centralized environment variable validation.
// - In production, required env vars are checked at function-call time (deferred)
//   so the build can succeed without all secrets present at build-time.
// - In development, missing keys log a warning but don't block.
// - When a function like `getEnv()` is called, it throws if the key is missing.

type EnvKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
  | "NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL"
  | "CONVEX_DEPLOY_KEY"
  | "NEXT_PUBLIC_CASHFREE_APP_ID"
  | "NEXT_PUBLIC_CASHFREE_ENV"
  | "CASHFREE_SECRET_KEY"
  | "CASHFREE_WEBHOOK_SECRET"
  | "NEXT_PUBLIC_SENTRY_DSN"
  | "SENTRY_AUTH_TOKEN"
  | "NEXT_PUBLIC_POSTHOG_KEY"
  | "NEXT_PUBLIC_POSTHOG_HOST"
  | "EMAIL_PROVIDER_API_KEY"
  | "EMAIL_FROM_ADDRESS"
  | "NEXT_PUBLIC_DD_APPLICATION_ID"
  | "NEXT_PUBLIC_DD_CLIENT_TOKEN"
  | "NEXT_PUBLIC_DD_SITE"
  | "NEXT_PUBLIC_DD_SERVICE"
  | "NEXT_PUBLIC_DD_ENV";

const PROD_REQUIRED: EnvKey[] = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL",
  "NEXT_PUBLIC_CASHFREE_APP_ID",
  "CASHFREE_SECRET_KEY",
];

const OPTIONAL_BUT_RECOMMENDED: EnvKey[] = [
  "CASHFREE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "EMAIL_PROVIDER_API_KEY",
];

function readEnv(key: EnvKey): string | undefined {
  return readEnvRaw(key);
}

/**
 * Read any environment variable by name (including ones outside the typed
 * `EnvKey` union, e.g. `CONVEX_DEPLOYMENT`). Returns the trimmed value or
 * `undefined` when unset/empty.
 */
function readEnvRaw(key: string): string | undefined {
  const v = process.env[key];
  if (v && v.trim().length > 0) return v.trim();
  return undefined;
}

let warnedOnce = false;

export function validateEnv(): { ok: true } | { ok: false; missing: EnvKey[] } {
  const isProd = process.env.NODE_ENV === "production";
  const missing: EnvKey[] = [];
  const required = isProd ? PROD_REQUIRED : [];

  for (const key of required) {
    if (!readEnv(key)) missing.push(key);
  }

  if (missing.length > 0 && isProd) {
    const message = `[env] Missing required env vars in production: ${missing.join(", ")}`;
    // W8: fail fast at RUNTIME in production — never serve a site missing
    // core configuration. Next sets NEXT_PHASE during `next build`, where
    // secrets are intentionally absent; builds must still succeed.
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      console.error(message);
      throw new Error(message);
    }
    console.warn(`${message} (build-time — will be enforced at runtime)`);
  }

  if (!isProd && !warnedOnce) {
    const recommended = OPTIONAL_BUT_RECOMMENDED.filter((k) => !readEnv(k));
    const requiredMissing = PROD_REQUIRED.filter((k) => !readEnv(k));
    if (requiredMissing.length > 0 || recommended.length > 0) {
      console.warn(
        `[env] Dev mode: missing env vars (build still works): ${[...requiredMissing, ...recommended].join(", ")}`
      );
    }
    warnedOnce = true;
  }

  return { ok: true };
}

export function getEnv(key: EnvKey): string {
  const v = readEnv(key);
  if (!v) {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      throw new Error(
        `[env] Required env var "${key}" is not set in production. ` +
          `Set it in your hosting provider's environment.`
      );
    }
    return "";
  }
  return v;
}

export function getOptionalEnv(key: EnvKey): string | undefined {
  return readEnv(key);
}

export function getCashfreeCredentials(): { appId: string; secretKey: string } {
  return {
    appId: getEnv("NEXT_PUBLIC_CASHFREE_APP_ID"),
    secretKey: getEnv("CASHFREE_SECRET_KEY"),
  };
}

export function isCashfreeConfigured(): boolean {
  return Boolean(readEnv("NEXT_PUBLIC_CASHFREE_APP_ID") && readEnv("CASHFREE_SECRET_KEY"));
}

export function isCashfreeProdMode(): boolean {
  const explicit = readEnv("NEXT_PUBLIC_CASHFREE_ENV");
  if (explicit === "production") return true;
  if (explicit === "sandbox") return false;
  // Fallback: infer from APP ID
  const appId = readEnv("NEXT_PUBLIC_CASHFREE_APP_ID");
  return Boolean(appId && !appId.toLowerCase().includes("test"));
}

/**
 * Classify the active Convex deployment as dev/prod/unknown.
 *
 * Both dev and production Convex deployments are served from
 * `*.convex.cloud`, so the deployment URL alone cannot distinguish them
 * (the earlier heuristic returned "prod" for the dev deployment
 * `woozy-husky-516`, which was wrong). The reliable signal is the
 * `CONVEX_DEPLOYMENT` env var, which Convex prefixes with `dev:` or
 * `prod:`. We fall back to the URL only when that var is unavailable.
 */
export function getConvexEnvironment(): "dev" | "prod" | "unknown" {
  const deployment = readEnvRaw("CONVEX_DEPLOYMENT");
  if (deployment) {
    if (deployment.startsWith("dev:")) return "dev";
    if (deployment.startsWith("prod:")) return "prod";
  }

  const url = readEnv("NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL");
  if (!url) return "unknown";
  // `*.convex.site` hosts HTTP actions and is only present on dev
  // deployments; treat it as a dev signal. A bare `*.convex.cloud` URL
  // is ambiguous, so we don't claim "prod" from it.
  if (url.includes(".convex.site")) return "dev";
  return "unknown";
}

export type EnvironmentInfo = {
  nodeEnv: string;
  isProduction: boolean;
  isVercel: boolean;
  vercelEnv: string | null;
  vercelRegion: string | null;
  convexEnvironment: "dev" | "prod" | "unknown";
  cashfreeConfigured: boolean;
  cashfreeMode: "prod" | "test" | "none";
  sentryConfigured: boolean;
  posthogConfigured: boolean;
};

export function getEnvironmentInfo(): EnvironmentInfo {
  const isProdMode = isCashfreeProdMode();
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isVercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelRegion: process.env.VERCEL_REGION || null,
    convexEnvironment: getConvexEnvironment(),
    cashfreeConfigured: isCashfreeConfigured(),
    cashfreeMode: isCashfreeConfigured() ? (isProdMode ? "prod" : "test") : "none",
    sentryConfigured: Boolean(readEnv("NEXT_PUBLIC_SENTRY_DSN")),
    posthogConfigured: Boolean(readEnv("NEXT_PUBLIC_POSTHOG_KEY")),
  };
}

export function logEnvironmentInfo(): void {
  const info = getEnvironmentInfo();
  const lines = [
    `\n[env] Environment summary:`,
    `  Node:           ${info.nodeEnv}${info.isVercel ? ` (Vercel: ${info.vercelEnv}, region: ${info.vercelRegion})` : ""}`,
    `  Convex:         ${info.convexEnvironment}`,
    `  Cashfree:       ${info.cashfreeConfigured ? info.cashfreeMode : "not configured"}`,
    `  Sentry:         ${info.sentryConfigured ? "configured" : "not configured"}`,
    `  PostHog:        ${info.posthogConfigured ? "configured" : "not configured"}`,
  ];
  console.log(lines.join("\n"));
}
