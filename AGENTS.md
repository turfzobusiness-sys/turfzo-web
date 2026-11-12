# Turfzo Website — Agent Instructions

> **MANDATORY: Read these 3 files before any change:**
> 1. `/home/akram/projects/turfzo/TURFZO_ARCHITECTURE.md` — domain, 32 tables, thin-client invariants
> 2. `/home/akram/projects/turfzo/TURFZO_MIGRATION_AND_DEPLOYMENT.md` — live infra, env mismatches, deploy steps
> 3. `/home/akram/projects/turfzo/CONTEXT.md` — environments, secret homes, invariants
>
> Live state: `bash ../../.agents/ctx show` (versions, table count, workers).

## 1. What this repo is

Thin client Next.js 16.2.12 + React 19.2.4 at `turfzo_website/turfzo` (App Router). All business logic lives in `turfzo-backend` Convex. This repo only renders UI and calls `convexClient.{query,mutation,action}("module:functionName")`. Hosted on Cloudflare Workers (worker `turfzo-web`, account 3f24b8... Turfzobusiness) via `@opennextjs/cloudflare` ~1.19.0 + `wrangler` ^4.103.0. Vercel (prj_ET0L..., bom1) is retired — vercel.json kept for reference, DNS now Cloudflare.

## 2. Local setup

```
cd /home/akram/projects/turfzo/turfzo_website/turfzo
npm ci
# .env.local is gitignored — copy from .env.example and fill (Firebase, Convex PROD, Cashfree TEST, Turnstile placeholder, DD)
# .dev.vars is gitignored — only NEXTJS_ENV=development, used by `wrangler dev`/`opennext preview`
npm run dev          # Next dev, uses .env.local
npx opennextjs-cloudflare preview  # Workers preview with .dev.vars
```

Remotes: `origin` → `shaikhakramshakil/turfzo-web` (your fork), `upstream` → `turfzobusiness-sys/turfzo-web` (org main). Push feature branches to `upstream`, open PR to `upstream/main`. GitHub Actions runs CI builds. Staging deployment is executed directly from this workstation via local authenticated Wrangler (`turfzobusiness@gmail.com`): `npm run build && npx opennextjs-cloudflare build && npx wrangler deploy --config wrangler.staging.jsonc`. Production promotion is manually gated and executed via `npx wrangler deploy --config wrangler.jsonc` after explicit user confirmation with `deploy-prod`.

## 3. Architecture rules (hard)

- NEVER add schema, pricing, payment, fee, or discount logic here — call backend.
- NEVER store `CASHFREE_SECRET_KEY`, `CONVEX_ADMIN_KEY`, `TURNSTILE_SECRET_KEY` here — server-only via `wrangler secret put` or `npx convex env set`.
- NEVER run `npx convex deploy` from this repo.
- ALWAYS use `await convexClient.mutation("bookings:create", {...})` style (see `lib/convex.ts`).
- Timestamps ISO-8601 strings, not epoch numbers.

## 4. Stack & versions (keep pinned)

- Next 16.2.12 (Turbopack), React 19.2.4, @opennextjs/cloudflare ~1.19.0, wrangler ^4.103.0, Node 20 in CI. These are read from `package.json`; run `bash ../../.agents/ctx show` rather than trusting this line.
- Convex SDK 1.39.1 pinned with backend — bump together + `npx convex codegen`.
- Firebase turfzo-prod (apiKey AIzaSyCHIE..., appId 1:829647..., sender 82964771406), Convex PROD `https://dependable-donkey-330.eu-west-1.convex.cloud` (site `.convex.site`), DEV `woozy-husky-516` for local dev.

## 5. Env — where it lives

- Build-time public: `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL` (dependable-donkey PROD), `NEXT_PUBLIC_FIREBASE_*` (7 keys + VAPID), `NEXT_PUBLIC_CASHFREE_APP_ID` (TEST1109... sandbox, LIVE from merchant.cashfree.com when ready), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_VIEW_ONLY_MODE=true`, DD 5 keys. In `TURFZO_MIGRATION_AND_DEPLOYMENT.md` §5. Checked by `lib/env.ts` — deferred at build (`NEXT_PHASE` check), enforced at runtime (500 if missing, which we just fixed).
- Server-only: `CASHFREE_SECRET_KEY`, `TURNSTILE_SECRET_KEY` — set via Cloudflare secrets, not baked.
- Never `vercel env pull --environment=production` over `.env.local` without `cp .env.local .env.local.bak` — it blanked production before (see migration doc §4b).

## 6. Build & deploy (Cloudflare)

```
npm run build                         # 15s compile + 74s TSC, 87 pages
npx opennextjs-cloudflare build       # bundles middleware, assets, worker.js → .open-next/
npx wrangler deploy --dry-run         # verify 101 assets, bindings ASSETS/IMAGES/WORKER_SELF_REFERENCE
npx wrangler deploy                   # uploads to account 3f24..., routes turfzo.app/* + www.turfzo.app/*, Version c8cfc337
curl -s https://turfzo.app/ | grep "<title>Turfzo"  # verify 200
```

- `wrangler.jsonc`: `main .open-next/worker.js`, `compatibility_date 2026-08-01`, `compatibility_flags [nodejs_compat, global_fetch_strictly_public]`, `account_id 3f24...`, `workers_dev true`, `preview_urls true`, `routes` (apex) — custom_domain needs empty DNS, route pattern works with synthetic proxied A records (104.21.83.99).
- Zone turfzo.app 0f63ef... Active (javier/phoenix NS) in Turfzobusiness account.

## 7. Git & deploy guardrails

- **Mandatory Step-by-Step Execution**: Agents must proceed one step at a time (Edit → Local Verify → Ask Commit → Ask Push → Ask PR → Ask Merge → Staging Verify → Ask Prod Deploy). Never batch or skip ahead.
- **Explicit Permission Required**: NEVER run `git commit`, `git push`, `gh pr create`, `gh pr merge`, or `workflow_dispatch` deploy without showing the diff/results and getting explicit user approval in that exact turn.
- **Account Identity & Git Auth**: Commit locally using your personal GitHub account `shaikhakramshakil` (`shaikhakramshakil@gmail.com`). Active `gh` CLI auth is `turfzobusiness-sys`. HTTPS git credential helper uses `turfzobusiness-sys`, so pushing to `https://github.com/shaikhakramshakil/...` returns 404 (Repository Not Found). Always set `upstream` to `https://github.com/turfzobusiness-sys/turfzo-web.git` and push feature branches directly to `upstream` before opening PRs targeting `main`.
- **Secret Scanning & Fallback Prohibition**: Never hardcode API keys (e.g. `AIzaSy...`) or sandbox IDs as fallback strings in workflow YAML. GitHub Secret Scanning flags any `AIzaSy...` token and triggers alerts. Load keys exclusively from GitHub Secrets (`${{ secrets.STAGING_NEXT_PUBLIC_FIREBASE_API_KEY }}`).
- **Workflow Environment Scoping**: Place `env:` at the `job:` level in workflow files so downstream steps (like `npx opennextjs-cloudflare build`) inherit all environment variables without throwing `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is not set`.
- **Deploy Routing & Staging Validation**: CI builds the bundle on PRs/pushes to `main`. Staging worker deploy is executed locally from this terminal: `npm run build && npx opennextjs-cloudflare build && npx wrangler deploy --config wrangler.staging.jsonc`. Production deployment to `turfzo-web` requires manual confirmation input `deploy-prod` and is run via `npx wrangler deploy --config wrangler.jsonc`.
- **Cloudflare Deploy & Workstation Wrangler**:
  * **Wrangler is pre-authenticated on this workstation** via OAuth (`turfzobusiness@gmail.com`, Account ID `3f24b8f35b25e0943b29f0035403f694`). Verify anytime with `npx wrangler whoami`.
  * In GitHub Actions workflows (`deploy-staging.yml`, `deploy-production.yml`), Wrangler deploy is guarded with `if: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}`. If the token is empty in GitHub secrets, CI builds the bundle and skips deployment. **This is intentional**. Do NOT stop and ask the user for secrets; execute deployment locally using the workstation's authenticated `wrangler`.

## 8. Pitfalls

- `vercel env pull` can blank CONVEX vars — always diff `.env.local` before/after.
- `d6ca...` vs `3f24...` account mismatch → 10000 auth error — pin `account_id` in wrangler.jsonc.
- `custom_domain: true` with existing proxied A → 100117 — use `route` pattern or delete DNS A records first.
- Backend `.env` stays on woozy DEV for local — website on dependable-donkey PROD is intentional split.

## 9. Verify before commit

- `npx tsc -p convex/tsconfig.json --noEmit` if you touched Convex types
- `npm run build` must pass (allow env deferred warning)
- `curl https://turfzo.app/` and `https://turfzo-web.turfzobusiness.workers.dev/` 200 after deploy

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
