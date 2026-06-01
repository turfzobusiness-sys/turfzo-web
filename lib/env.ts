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
  | "NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL"
  | "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "RAZORPAY_WEBHOOK_SECRET"
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
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const OPTIONAL_BUT_RECOMMENDED: EnvKey[] = [
  "RAZORPAY_WEBHOOK_SECRET",
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

export function getRazorpayCredentials(): { keyId: string; keySecret: string } {
  return {
    keyId: getEnv("RAZORPAY_KEY_ID"),
    keySecret: getEnv("RAZORPAY_KEY_SECRET"),
  };
}

export function isRazorpayConfigured(): boolean {
  return Boolean(readEnv("RAZORPAY_KEY_ID") && readEnv("RAZORPAY_KEY_SECRET"));
}
