# Turfzo Website — Claude Code Instructions

> **MANDATORY: Read before any change:**
> - `/home/akram/projects/turfzo/TURFZO_ARCHITECTURE.md` — domain, 31 tables, thin-client invariants
> - `/home/akram/projects/turfzo/TURFZO_MIGRATION_AND_DEPLOYMENT.md` — live infra from Vercel → Cloudflare cutover
> - `/home/akram/projects/turfzo/AGENTS.md` — monorepo execution protocol

---

## 1. What This Repo Is

Thin client Next.js 16.2.12 + React 19 at `turfzo_website/turfzo` (App Router). All business logic lives in `turfzo-backend` Convex. This repo only renders UI and calls Convex functions (`convexClient.query`, `convexClient.mutation`). Hosted on Cloudflare Workers (`turfzo-web`, account `3f24b8f35b25e0943b29f0035403f694`) via `@opennextjs/cloudflare` + `wrangler`.

**Thin-client hard rules**:
* NEVER add schema, pricing, payment, fee, or discount logic here — call backend.
* NEVER store server secrets (`CASHFREE_SECRET_KEY`, `CONVEX_ADMIN_KEY`, `TURNSTILE_SECRET_KEY`) here.
* Build-time public vars: `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL`, `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_VIEW_ONLY_MODE=true`.

---

## 2. Workstation Credentials (DO NOT ASK FOR TOKENS)

All deployment and git credentials are ALREADY configured on this workstation:
* **Cloudflare (Wrangler)**: Already logged in with OAuth as `turfzobusiness@gmail.com` (Account ID `3f24b8f35b25e0943b29f0035403f694`). Verify anytime with `npx wrangler whoami`.
* **GitHub CLI (`gh`)**: Authenticated as organization owner: `turfzobusiness-sys`.
* **Git Commits**: Author locally as `shaikhakramshakil` (`shaikhakramshakil@gmail.com`).

> [!IMPORTANT]
> **Why GitHub Actions Skips `wrangler deploy`**:
> GitHub Actions workflows (`deploy-staging.yml`) build the OpenNext bundle to verify compilation, but deliberately skip `wrangler deploy` because `CLOUDFLARE_API_TOKEN` is intentionally not stored in GitHub repository secrets.
> **DO NOT stop or ask the user to add `CLOUDFLARE_API_TOKEN` to GitHub Secrets.**
> Staging and production deployments are executed directly from this workstation via local `wrangler`.

---

## 3. Git Remotes & Accounts

* `upstream` → `https://github.com/turfzobusiness-sys/turfzo-web.git` (canonical org repo)
* `origin` → `git@github.com:shaikhakramshakil/turfzo-web.git` (personal fork)
* Pushing: Push feature branches to `upstream` (or fork over SSH):
  ```bash
  git push upstream feat/your-feature
  ```
* Open PR targeting `main`:
  ```bash
  gh pr create --repo turfzobusiness-sys/turfzo-web --base main --fill
  ```

---

## 4. Step-by-Step Execution Protocol (Permission Required)

You must proceed strictly one step at a time and obtain user confirmation before each mutating action:

1. **Local Preflight (0 errors required)**:
   ```bash
   npm run typecheck
   ```
   🛑 **PAUSE AND ASK**: Present diff and ask: *"Local preflight passed with 0 errors. Would you like me to commit these changes to branch `feat/...`?"*

2. **Commit (Requires Permission)**:
   Author commit as `shaikhakramshakil` (`shaikhakramshakil@gmail.com`).
   🛑 **PAUSE AND ASK**: *"Changes committed locally. Should I push this branch to upstream?"*

3. **Push & PR (Requires Permission)**:
   Push to upstream and create PR (`gh pr create --repo turfzobusiness-sys/turfzo-web --base main --fill`).
   Wait for CI checks (`gh pr checks`).
   🛑 **PAUSE AND ASK**: *"CI checks are green. Should I merge this Pull Request to `main`?"*

4. **Staging Deploy & Verification (Requires Permission)**:
   Merge PR with `gh pr merge --squash`.
   Deploy staging worker via local Wrangler:
   ```bash
   npm run build && npx opennextjs-cloudflare build && npx wrangler deploy --config wrangler.staging.jsonc
   ```
   Verify staging health:
   ```bash
   curl -s -I https://turfzo-web-staging.turfzobusiness.workers.dev | head -n 1
   ```
   🛑 **PAUSE AND ASK**: *"Staging validation is complete and healthy (HTTP 200). Do you approve promoting to live Production?"*

5. **Production Rollout (Requires Explicit "deploy-prod")**:
   Merges to `main` NEVER deploy to production automatically.
   Only proceed after user explicitly replies with `deploy-prod`:
   ```bash
   npx wrangler deploy --config wrangler.jsonc
   ```
   Smoke check:
   ```bash
   curl -s -I https://turfzo.app/ | head -n 1
   curl -s -I https://www.turfzo.app/ | head -n 1
   ```
