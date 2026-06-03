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
  | "CASHFREE_SECRET_KEY"
  | "CASHFREE_WEBHOOK_SECRET"
  | "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
  | "TURNSTILE_SECRET_KEY"
  | "NEXT_PUBLIC_SENTRY_DSN"
  | "SENTRY_AUTH_TOKEN"
  | "NEXT_PUBLIC_POSTHOG_KEY"
  | "NEXT_PUBLIC_POSTHOG_HOST"
  | "EMAIL_PROVIDER_API_KEY"
  | "EMAIL_FROM_ADDRESS";

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
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "EMAIL_PROVIDER_API_KEY",
];

function readEnv(key: EnvKey): string | undefined {
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
    console.error(message);
    return { ok: false, missing };
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
  const appId = readEnv("NEXT_PUBLIC_CASHFREE_APP_ID");
  return Boolean(appId && !appId.includes("test")); // Very basic check, you could configure NEXT_PUBLIC_CASHFREE_ENVIRONMENT
}

export function isTurnstileConfigured(): boolean {
  return Boolean(readEnv("TURNSTILE_SECRET_KEY"));
}

export function getConvexEnvironment(): "dev" | "prod" | "unknown" {
  const url = readEnv("NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL");
  if (!url) return "unknown";
  if (url.includes(".convex.cloud")) return "prod";
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
  turnstileConfigured: boolean;
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
    turnstileConfigured: isTurnstileConfigured(),
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
    `  Turnstile:      ${info.turnstileConfigured ? "configured" : "not configured (bot protection disabled)"}`,
    `  Sentry:         ${info.sentryConfigured ? "configured" : "not configured"}`,
    `  PostHog:        ${info.posthogConfigured ? "configured" : "not configured"}`,
  ];
  console.log(lines.join("\n"));
}
