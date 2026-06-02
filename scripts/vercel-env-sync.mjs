#!/usr/bin/env node
/**
 * vercel-env-sync: bulk-syncs env vars from .env.local to Vercel.
 *
 * Usage:
 *   1. `npm i -g vercel` and `vercel login`
 *   2. `vercel link` (in project root)
 *   3. `node scripts/vercel-env-sync.mjs`
 *
 * It will:
 *   - Read .env.local
 *   - Skip keys already on Vercel
 *   - Add new keys to all 3 Vercel envs (Production/Preview/Development)
 *   - Mask secret values in output
 *   - Skip NEXT_PUBLIC_* values that match keys already public
 *
 * Re-runnable: safe to run multiple times.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const localPath = resolve(root, ".env.local");

if (!existsSync(localPath)) {
  console.error("❌ .env.local not found");
  process.exit(1);
}

function shell(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    return null;
  }
}

if (!shell("vercel --version")) {
  console.error("❌ Vercel CLI not installed. Run:  npm i -g vercel");
  process.exit(1);
}

if (!shell("vercel project ls")) {
  console.error("❌ Not linked to a Vercel project. Run:  vercel link");
  process.exit(1);
}

function parseEnv(path) {
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

function listVercelEnv() {
  const out = shell("vercel env ls --format json");
  if (!out) return new Set();
  try {
    const parsed = JSON.parse(out);
    return new Set(parsed.map((e) => e.key));
  } catch {
    return new Set();
  }
}

const local = parseEnv(localPath);
const existing = listVercelEnv();

console.log(`\n📤 Vercel env sync`);
console.log(`   Found ${local.size} keys in .env.local`);
console.log(`   Found ${existing.size} keys already on Vercel\n`);

let added = 0;
let skipped = 0;
let failed = 0;

for (const [key, value] of local) {
  if (existing.has(key)) {
    console.log(`  ⏭  ${key}  (already on Vercel)`);
    skipped++;
    continue;
  }

  if (!value) {
    console.log(`  ⏭  ${key}  (empty in .env.local, skipping)`);
    skipped++;
    continue;
  }

  const isPublic = key.startsWith("NEXT_PUBLIC_");
  const isSecret = !isPublic;

  const envs = isSecret ? "production" : "production preview development";
  const cmd = `vercel env add ${key} ${envs} <<< "${value.replace(/"/g, '\\"')}"`;
  const ok = shell(cmd);

  if (ok !== null) {
    const masked = value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : "***";
    console.log(`  ✅ ${key}  = ${masked}  (added to ${envs})`);
    added++;
  } else {
    console.log(`  ❌ ${key}  (failed to add)`);
    failed++;
  }
}

console.log(`\n— Summary —`);
console.log(`  Added:   ${added}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Failed:  ${failed}`);

if (failed > 0) {
  console.log(`\n⚠️  Some keys failed. You may need to add them manually:`);
  console.log(`   https://vercel.com/dashboard → Project → Settings → Environment Variables`);
  process.exit(1);
}

console.log(`\n✅ Vercel env vars are in sync with .env.local`);
console.log(`\n⚠️  Secrets were added with values from .env.local.`);
console.log(`   If you want Production to use LIVE keys (not test), update them in the Vercel dashboard.`);
