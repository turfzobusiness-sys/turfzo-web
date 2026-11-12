# Turfzo Website — Cloudflare Workers Deployment Guide

> **Live Infrastructure Reference**: See [`TURFZO_MIGRATION_AND_DEPLOYMENT.md`](/home/akram/projects/turfzo/TURFZO_MIGRATION_AND_DEPLOYMENT.md) for full history.
> **Note**: Vercel was retired on **2026-09-06**. The website runs serverless exclusively on **Cloudflare Workers** via `@opennextjs/cloudflare` and `wrangler`.

---

## 0. Removed Hosting Configs

Three files describing hosting arrangements this project no longer has were deleted,
because each would have produced a broken deploy if used:

* `firebase.json` — declared Firebase Hosting with `"public": "out"`. No `out/`
  directory exists and none ever will: `next.config.ts` has no `output: "export"`, and
  the build output is `.open-next/`, served by the Worker. `firebase deploy` against it
  could not have worked.
* `.firebaserc` — existed only to give the above a default project.
* `vercel.json` — Vercel config for the retired project (region `bom1`). Auto-deploy was
  already disabled inside it (`git.deploymentEnabled`), so it was inert, and it was a
  standing invitation to redeploy a dead platform.

**Residual Vercel tooling, not removed** (outside the deployment-config scope of this
change): the `vercel` devDependency in `package.json`, and
`scripts/vercel-env-sync.mjs` / the `env:sync` npm script. Remove them together with
`vercel link` if Vercel is being fully decommissioned.

---

## 1. Environment Matrix

| Environment | Cloudflare Worker Target | URL / Domains | Convex Backend | Config File |
| :--- | :--- | :--- | :--- | :--- |
| **Local (Dev)** | `localhost:3000` | `http://localhost:3000` | `woozy-husky-516` | `.env.local` |
| **Staging** | `turfzo-web-staging` | `https://turfzo-web-staging.turfzobusiness.workers.dev` | `healthy-panther-67` | `wrangler.staging.jsonc` |
| **Production** | `turfzo-web` | `https://turfzo.app`<br>`https://www.turfzo.app`<br>`https://turfzo-web.turfzobusiness.workers.dev` | `dependable-donkey-330` | `wrangler.jsonc` |

`workers_dev: true` and `preview_urls: true` are set in both wrangler configs, so the
production worker also answers on `turfzo-web.turfzobusiness.workers.dev` and on
per-deploy preview URLs. Those origins are outside the `turfzo.app` zone, so the WAF
custom rules and the rate-limit rule in `cloudflare/` do not apply to them — see the
SCOPE LIMIT note in `cloudflare/waf-custom-rules.json`.

---

## 2. Authentication & Credentials

All deployment tooling is pre-authenticated on this workstation:
* **Cloudflare (Wrangler)**: Authenticated via OAuth as `turfzobusiness@gmail.com` (Account ID `3f24b8f35b25e0943b29f0035403f694`). Credentials reside in `~/.config/.wrangler/config/default.toml`. Verify with `npx wrangler whoami`.
* **GitHub CLI (`gh`)**: Authenticated as organization owner: `turfzobusiness-sys`.
* **CI/CD Guardrail**: In GitHub Actions (`deploy-staging.yml`, `deploy-production.yml`), `wrangler deploy` is deliberately skipped when `CLOUDFLARE_API_TOKEN` is empty — it is intentionally kept out of GitHub repository secrets. Deployment to Cloudflare is executed directly from this workstation using local Wrangler.

### 2.1 Required build-time public config (deploy preflight)

`lib/env.ts` requires these in production and fails closed at request time with an
HTTP 500, so a bundle missing any of them is broken the moment it is uploaded:

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
`NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL`, `NEXT_PUBLIC_CASHFREE_APP_ID`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Both deploy workflows now run a **preflight step before any build or upload** that fails
the job if any of these is unset, or if its value still contains `placeholder` (the
same test `lib/env.ts` and `lib/turnstile.ts` apply at runtime). The preflight reports
variable names and presence only, never values.

Consequence: `deploy-staging.yml` no longer falls back to
`NEXT_PUBLIC_TURNSTILE_SITE_KEY: 0x4AAAAAAA-placeholder`. It now requires
`STAGING_NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `STAGING_NEXT_PUBLIC_CASHFREE_APP_ID` to
be present in repository secrets, otherwise the job fails before building rather than
uploading a bundle with a dead Turnstile key.

---

## 3. Pre-Deployment Verification (Local)

Run these checks before deploying:
```bash
cd /home/akram/projects/turfzo/turfzo_website/turfzo

# 1. Typecheck TypeScript (must be 0 errors)
npm run typecheck

# 2. Compile Next.js production build
npm run build

# 3. Bundle OpenNext Cloudflare Worker
npx opennextjs-cloudflare build
```

---

## 4. Staging Deployment

Deploy the OpenNext build to the staging worker:
```bash
cd /home/akram/projects/turfzo/turfzo_website/turfzo
npx wrangler deploy --config wrangler.staging.jsonc
```

### Staging Verification
```bash
# Verify HTTP 200 response
curl -s -I https://turfzo-web-staging.turfzobusiness.workers.dev | head -n 1
```

---

## 5. Production Rollout

> [!CAUTION]
> **Protected branch required**: `deploy-production.yml` runs only when
> `workflow_dispatch` is invoked from `main` **and** the `confirm` input is exactly
> `deploy-prod`. The checkout is pinned to `ref: main`, so the bundle is always built
> from a commit that already merged — a feature branch cannot dispatch a production
> release even with the correct string. Deployments are serialised by a `concurrency`
> group, and the job runs in the `production` environment, where required reviewers and
> deployment branch restrictions apply.

> **Manual Confirmation Required**: Merges to `main` NEVER auto-deploy to production.
> Only deploy to production after explicit user instruction containing `deploy-prod`.

```bash
cd /home/akram/projects/turfzo/turfzo_website/turfzo
npx wrangler deploy --config wrangler.jsonc
```

### Production Smoke Checks
```bash
# Apex & WWW checks (both must return HTTP 200)
curl -s -I https://turfzo.app/ | head -n 1
curl -s -I https://www.turfzo.app/ | head -n 1
```

---

## 6. Rollback Procedure

To roll back a deployment to an earlier version on Cloudflare Workers:
1. List recent deployments:
   ```bash
   npx wrangler deployments list --config wrangler.jsonc
   ```
2. Rollback to a specific deployment version:
   ```bash
   npx wrangler rollback <version-id> --config wrangler.jsonc
   ```
