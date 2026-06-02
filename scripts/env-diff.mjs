#!/usr/bin/env node
/**
 * env-diff: compares .env.local against .env.example
 * Shows which keys from the template are missing in your local file.
 * Exits non-zero if any required key is missing.
 *
 * Usage: node scripts/env-diff.mjs
 *        node scripts/env-diff.mjs --strict   # also fail on recommended keys
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const strict = process.argv.includes("--strict");
const root = process.cwd();

const examplePath = resolve(root, ".env.example");
const localPath = resolve(root, ".env.local");

if (!existsSync(examplePath)) {
  console.error("❌ .env.example not found");
  process.exit(1);
}

if (!existsSync(localPath)) {
  console.error("❌ .env.local not found");
  console.log("\n→ Create it:  cp .env.example .env.local  then fill in values");
  process.exit(1);
}

function parseEnvFile(path) {
  const text = readFileSync(path, "utf8");
  const map = new Map();
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    map.set(key, value);
  }
  return map;
}

const example = parseEnvFile(examplePath);
const local = parseEnvFile(localPath);

const PUBLIC_KEYS = Array.from(example.keys()).filter((k) => k.startsWith("NEXT_PUBLIC_"));
const SERVER_KEYS = Array.from(example.keys()).filter((k) => !k.startsWith("NEXT_PUBLIC_"));

let missingRequired = 0;
let missingRecommended = 0;
let unexpected = 0;

console.log("\n🔍 Comparing .env.local vs .env.example\n");

function checkGroup(label, keys) {
  console.log(`— ${label} —`);
  for (const key of keys) {
    const inExample = example.has(key);
    const inLocal = local.has(key);
    const value = local.get(key);

    if (!inExample) {
      console.log(`  ⚠️  ${key}  (in .env.local but not in .env.example — consider adding to template)`);
      unexpected++;
      continue;
    }

    if (!inLocal) {
      console.log(`  ❌ ${key}  (missing)`);
      missingRequired++;
    } else if (!value || value.length === 0) {
      console.log(`  ⚠️  ${key}  (set but empty)`);
      missingRecommended++;
    } else {
      const masked = value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : "***";
      console.log(`  ✅ ${key}  = ${masked}`);
    }
  }
  console.log("");
}

checkGroup("Public vars (NEXT_PUBLIC_*)", PUBLIC_KEYS);
checkGroup("Server-only secrets", SERVER_KEYS);

console.log("— Summary —");
console.log(`  Missing required: ${missingRequired}`);
console.log(`  Set but empty:    ${missingRecommended}`);
console.log(`  Unexpected:       ${unexpected}`);

if (missingRequired > 0) {
  console.log("\n❌ Add the missing keys to .env.local");
  console.log("   Get values from:");
  console.log("   - Firebase Console  → https://console.firebase.google.com/");
  console.log("   - Convex Dashboard  → https://dashboard.convex.dev/");
  console.log("   - Razorpay Dashboard → https://dashboard.razorpay.com/");
  console.log("   - Cloudflare        → https://dash.cloudflare.com/?to=/:account/turnstile");
  process.exit(1);
}

if (strict && missingRecommended > 0) {
  console.log("\n❌ Strict mode: empty values are not allowed");
  process.exit(1);
}

console.log("\n✅ .env.local is in sync with .env.example");
