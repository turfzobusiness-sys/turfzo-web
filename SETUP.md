# Turfzo Website — Setup Guide

Everything you can do with code is done. Below is what is required externally and locally to run and develop the Turfzo website.

---

## What's already done in this codebase
✅ Real money flow (Cashfree order → checkout → server-side verify → booking confirmed)
✅ Real data (Convex backend with 32 tables — see [`TURFZO_ARCHITECTURE.md`](/home/akram/projects/turfzo/TURFZO_ARCHITECTURE.md) §3)
✅ Idempotent payment orders (no double-charge on Pay button mash)
✅ Webhook handler (Cashfree → Convex via HMAC + 10-min replay window at POST `/cashfree-webhook`)
✅ Centralized auth (`requireAuth`, `requireApprovedOwner`, `requirePhoneVerified` in `turfzo-backend/convex/shared.ts`)
✅ Rate limiting (contact form + booking creation, via `turfzo-backend/convex/rate_limits.ts`)
✅ Real contact form (Convex `contactSubmissions` table + admin view)
✅ Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
✅ Legal pages (`/terms`, `/privacy`, `/refund-policy`)
✅ Error boundaries (`app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`)
✅ Admin dashboard (`/admin` for `role === "admin"`)
✅ View-only display mode (`NEXT_PUBLIC_VIEW_ONLY_MODE=true`)
✅ Cloudflare Turnstile bot verification on sign-in, sign-up, and contact forms

---

## Local Development & Setup Steps

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cd /home/akram/projects/turfzo/turfzo_website/turfzo
cp .env.example .env.local
```

Key environment variables:
* `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL`: Points to Convex (`woozy-husky-516` for local dev, `dependable-donkey-330` for prod).
* `NEXT_PUBLIC_FIREBASE_*`: Configured for `turfzo-prod`.
* `NEXT_PUBLIC_CASHFREE_APP_ID`: Sandboxed or live Cashfree App ID.
* `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key.

### 2. Install & Run Dev Server
```bash
npm ci
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Backend Setup (in `turfzo-backend/`)
All schema, validators, and Convex functions live in `/home/akram/projects/turfzo/turfzo-backend`:
```bash
cd /home/akram/projects/turfzo/turfzo-backend
npm ci
npx convex dev
```

### 4. Promote a User to Admin
After signing up on the app/web, find your user in Convex dashboard (**Data** tab $\rightarrow$ `users` table) and set:
```json
{
  "role": "admin"
}
```
Now you can access `/admin` to view platform messages, audits, and user lists.

### 5. Deployment
Deployments run serverless on Cloudflare Workers. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for complete staging and production deployment commands.
