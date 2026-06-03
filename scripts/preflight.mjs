#!/usr/bin/env node
/**
 * Preflight check: verifies all required env vars are set before deploy.
 * Exits non-zero if anything is missing. Run with: node scripts/preflight.mjs
 *
 * Does NOT print secret values. Only prints key names + whether they're set.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const isProd = process.env.NODE_ENV === "production";

const REQUIRED_PUBLIC = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL",
  "NEXT_PUBLIC_CASHFREE_APP_ID",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
];

const REQUIRED_SERVER = [
  "CASHFREE_SECRET_KEY",
  "TURNSTILE_SECRET_KEY",
];

const RECOMMENDED = [
  "CASHFREE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_POSTHOG_KEY",
];

function checkKey(key) {
  const v = process.env[key];
  if (!v || v.trim().length === 0) return false;
  return true;
}

let errors = 0;
let warnings = 0;

console.log("\n🔍 Turfzo deployment preflight check\n");

if (isProd) {
  console.log("Mode: PRODUCTION (strict)\n");
} else {
  console.log("Mode: development (warnings only)\n");
}

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  console.log("✅ .env.local found");
} else {
  console.log("⚠️  .env.local not found (relying on shell env / Vercel env)");
}

console.log("\n— Required public env vars —");
for (const key of REQUIRED_PUBLIC) {
  const ok = checkKey(key);
  if (ok) {
    console.log(`  ✅ ${key}`);
  } else {
    console.log(`  ❌ ${key} — MISSING`);
    errors++;
  }
}

console.log("\n— Required server env vars (server-only) —");
for (const key of REQUIRED_SERVER) {
  const ok = checkKey(key);
  if (ok) {
    console.log(`  ✅ ${key}`);
  } else {
    console.log(`  ❌ ${key} — MISSING`);
    errors++;
  }
}

console.log("\n— Recommended (optional but advised) —");
for (const key of RECOMMENDED) {
  const ok = checkKey(key);
  if (ok) {
    console.log(`  ✅ ${key}`);
  } else {
    console.log(`  ⚠️  ${key} — not set`);
    warnings++;
  }
}

console.log("\n— Build artifacts —");
for (const path of [".next", "node_modules"]) {
  if (existsSync(resolve(process.cwd(), path))) {
    console.log(`  ✅ ${path} present`);
  } else {
    console.log(`  ℹ️  ${path} not present (will be created on build/install)`);
  }
}

console.log("\n— Summary —");
if (errors === 0) {
  console.log(`✅ All required env vars set. ${warnings} warning(s).`);
  process.exit(0);
} else {
  console.log(`❌ ${errors} required env var(s) missing. ${warnings} warning(s).`);
  if (isProd) {
    console.log("\nSet them in Vercel → Project → Settings → Environment Variables,");
    console.log("or in your .env.local for local production builds.");
  } else {
    console.log("\nSet them in your .env.local file.");
  }
  process.exit(1);
}
