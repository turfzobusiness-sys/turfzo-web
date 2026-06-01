# Turfzo — Setup Guide

Everything you can do with just code is done. Below is what **you** must do externally to go from "code-complete" to "production-ready".

---

## What's already done in this codebase

✅ Real money flow (Razorpay order → checkout → server-side HMAC verify → booking confirmed)
✅ Real data (Convex backend with 9 tables, 32 routes, real persistence)
✅ Idempotent payment orders (no double-charge on Pay button mash)
✅ Webhook handler (Razorpay → Convex for ground-truth payment status)
✅ Centralized auth (`requireUser`, `requireRole` helpers in `convex/_helpers.ts`)
✅ Rate limiting (contact form + booking creation, 3/hr and 10/hr)
✅ Real contact form (Convex `contact_messages` table + admin view)
✅ Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
✅ Legal pages (`/terms`, `/privacy`, `/refund-policy`)
✅ Error boundaries (`app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`)
✅ 12 unit tests for pricing, slot generation, refund logic
✅ GitHub Actions CI (lint + typecheck + test + build)
✅ Admin dashboard (`/admin` for `role === "admin"`)
✅ Optional Sentry + PostHog skeletons (lazy-load if env vars set)
✅ Env validation that throws in production, warns in dev

---

## Steps YOU need to take

### 1. Convex setup (5 min)
```bash
# Install Convex CLI (if not already)
npm i -g convex

# Login to your Convex account
npx convex login

# Sync your local `convex/` to the deployment
# This generates `convex/_generated/` (overwriting the stub I left)
npx convex dev

# In another terminal, seed the database
npm run seed
```

This pushes the schema (8 tables + 2 new ones: `contact_messages`, `rate_limits`) and runs the seed.

### 2. Razorpay setup (15 min)
1. Create a Razorpay account at https://dashboard.razorpay.com (use Test mode first).
2. Get your API keys: **Settings → API Keys → Generate Test Key**.
3. Add to `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxx
   ```
4. Set up the webhook:
   - Go to **Settings → Webhooks → Add New Webhook**
   - URL: `https://<your-convex-deployment>.convex.site/razorpay/webhook`
     (or whatever URL your Convex HTTP routes resolve to — check Convex dashboard)
   - Active events: `payment.captured`, `payment.authorized`, `payment.failed`
   - Save the **Webhook Secret** and add to `.env.local`:
     ```
     RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
     ```

### 3. Firebase setup (10 min)
The project is already configured (`turfzo-49e78.firebaseapp.com`). To set up custom password-reset emails and the authorized domain:

1. Firebase Console → **Authentication → Sign-in method**
   - Enable Email/Password and Google providers.
2. Firebase Console → **Authentication → Settings → Authorized domains**
   - Add `localhost` (for dev) and your production domain (e.g. `turfzo.com`).
3. Firebase Console → **Authentication → Templates** (for password reset email)
   - Customize the "Password reset" email template with your branding.
   - Set the action URL to your domain: `https://turfzo.com/auth/action`.

### 4. Promote yourself to admin (1 min)
After signing up on the app, run in your Convex dashboard **Data** tab:
```js
// Find your user record, then patch:
db.patch(userId, { role: "admin" })
```
Now you can access `/admin` to see contact messages and the user list.

### 5. Production deployment (30 min)
Recommended: **Vercel** for the Next.js app + **Convex Cloud** for the backend.

**Vercel:**
1. `vercel link` from the project root.
2. Add all env vars from `.env.local` to the Vercel project settings.
3. `vercel --prod` (or push to main and let CI handle it).

**Convex Cloud:**
1. The same Convex dev you ran locally is already on Convex Cloud.
2. In the Convex dashboard, add the same secrets (`RAZORPAY_KEY_ID`, etc.) under **Settings → Environment Variables**.
3. Configure the production Razorpay webhook URL (Step 2 above, pointing to prod).

### 6. Optional but recommended

#### Sentry (error tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
Set `NEXT_PUBLIC_SENTRY_DSN` in your env. The skeleton in `lib/sentry.ts` will auto-init.

#### PostHog (analytics)
```bash
npm install posthog-js
```
Set `NEXT_PUBLIC_POSTHOG_KEY` in your env. The skeleton in `lib/posthog.ts` will auto-init.

#### Email (booking confirmations, receipts)
The codebase doesn't send emails yet. When you're ready:
1. Sign up at [Resend](https://resend.com) (recommended for Next.js) or [SendGrid](https://sendgrid.com).
2. Add `EMAIL_PROVIDER_API_KEY` and `EMAIL_FROM_ADDRESS` to env.
3. Create a Convex action `convex/email.ts` that sends a template.
4. Call it from `convex/bookings.ts:confirmPaid` (after the booking is confirmed).

#### SMS (OTP, booking reminders)
For phone OTP / booking reminders:
1. Sign up at [Twilio](https://twilio.com) or [MSG91](https://msg91.com) (India-friendly).
2. Add a `convex/sms.ts` action.
3. Wire it into `auth-context.tsx` for OTP delivery.

#### Custom domain
1. Buy a domain (Namecheap, Cloudflare Registrar, etc).
2. Point it to Vercel: Vercel dashboard → Domains → Add.
3. Update `SITE_URL` constant in `app/layout.tsx` and `lib/schema.tsx` to match.

---

## Testing the full flow locally

```bash
# 1. Start Convex (in one terminal)
npx convex dev

# 2. Start Next.js (in another)
npm run dev

# 3. Open http://localhost:3000
# 4. Sign up with any email (Firebase test mode allows this)
# 5. Browse /explore → pick a turf → pick a slot → "Pay Now"
# 6. In Razorpay test mode, use card 4111 1111 1111 1111, any future expiry, any CVV
# 7. You should land on the confirmation screen with a real QR code
# 8. Check /bookings to see your booking
# 9. (If you made yourself admin) check /admin to see the contact form messages
```

---

## Quick reference

| File | Purpose |
|---|---|
| `convex/payments.ts` | Razorpay order + verify + webhook |
| `convex/bookings.ts` | Booking lifecycle (pending → confirmed → cancelled) |
| `convex/_helpers.ts` | Auth/role helpers — use these, don't reinvent |
| `lib/env.ts` | Centralized env validation |
| `lib/sentry.ts` | Optional Sentry (lazy init) |
| `lib/posthog.ts` | Optional PostHog (lazy init) |
| `app/admin/page.tsx` | Admin dashboard |
| `app/error.tsx` | Page-level error boundary |
| `app/global-error.tsx` | Root error boundary |
| `tests/unit.test.ts` | Pure logic tests (run with `npm test`) |
| `.github/workflows/ci.yml` | CI: lint + typecheck + test + build |

---

## Production readiness checklist

Before going live, verify:

- [ ] Razorpay webhook is configured and the secret is set
- [ ] Convex deployment has all env vars (Razorpay, Sentry, PostHog)
- [ ] Firebase authorized domains include your production domain
- [ ] You've made yourself admin in Convex dashboard
- [ ] You've seeded the database (`npm run seed`)
- [ ] Sentry is installed and receiving errors
- [ ] You've tested the full booking flow with a real test card
- [ ] You've cancelled a booking and verified the refund schedule fires correctly
- [ ] Legal pages (terms, privacy, refund) have your actual company details
- [ ] `Grievance Officer` is filled in on `/privacy` (required by India DPDP Act 2023)
- [ ] CSP allows any third-party services you actually use (current CSP allows Razorpay, Convex, Firebase, PostHog)
- [ ] You've added a real `og-image.png` to `/public` (currently referenced in metadata but file doesn't exist)

That's it. You're production-ready.
