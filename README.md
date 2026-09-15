# Turfzo Website

The web frontend for Turfzo, built with **Next.js 16 (App Router)** and **React 19**, running serverless on **Cloudflare Workers** via `@opennextjs/cloudflare`.

> **Thin Client Rule**: The website is strictly a presentation layer. It does not compute prices, manage bookings, or handle raw payment logic—all business operations are delegated to the Convex backend (`turfzo-backend`).

---

## 1. Environment Matrix

| Environment | Cloudflare Worker Target | Hostname / URL | Convex Backend |
| :--- | :--- | :--- | :--- |
| **Local (Dev)** | `localhost:3000` | `http://localhost:3000` | `woozy-husky-516` |
| **Staging** | `turfzo-web-staging` | `https://turfzo-web-staging.turfzobusiness.workers.dev` | `healthy-panther-67` |
| **Production** | `turfzo-web` | `https://turfzo.app` / `https://www.turfzo.app` | `dependable-donkey-330` |

---

## 2. Release & CI/CD Pipeline

```text
feature branch ──> Pull Request ──> CI (Lint, Typecheck, Build) ──> Merge to main
                                                                         │
                                                                         ▼
                                                          Deploy Staging Worker (Auto)
                                                                         │
                                                                         ▼
                                                          Manual Approval Gate
                                                                         │
                                                                         ▼
                                                          Deploy Production Worker
```

### Workflows
* **PR Checks (`ci.yml`)**: Runs lint, TypeScript checks (`tsc --noEmit`), and tests.
* **Staging Auto-Deploy (`deploy-staging.yml`)**: Runs on merge to `main`. Builds Next.js + OpenNext with staging public variables and deploys to Cloudflare Worker `turfzo-web-staging`.
* **Production Deploy (`deploy-production.yml`)**: Manual `workflow_dispatch` requiring explicit input confirmation (`deploy-prod`) and GitHub `production` environment approval. Builds with production variables and deploys to `turfzo-web`.

---

## 3. Local Development

### Prerequisites
* Node.js 20+
* Cloudflare Wrangler CLI (`npx wrangler`)

### Setup
1. Copy the environment configuration:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification Commands
```bash
# Typecheck TypeScript
npm run typecheck

# Production Next.js build
npm run build

# Cloudflare OpenNext bundle build
npx opennextjs-cloudflare build

# Wrangler deploy dry-run
npx wrangler deploy --dry-run --env staging
npx wrangler deploy --dry-run --env production
```
