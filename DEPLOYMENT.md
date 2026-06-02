# Turfzo — Vercel Deployment Guide

Complete walkthrough: from `git push` to live site, with security hardening at every step.

---

## 1. Pre-Deployment Checklist (do these BEFORE touching Vercel)

### Code-side
- [x] `npm run lint` — 0 errors
- [x] `npm run typecheck` — 0 errors
- [x] `npm test` — 23/23 passing
- [x] `npm run build` — succeeds locally
- [x] `npm run preflight` — all required env vars set

### Account-side (need to be ready)
- [ ] Vercel account (free tier is fine for start)
- [ ] Convex account authenticated
- [ ] Domain registered (or use `turfzo.vercel.app` for staging)
- [ ] Razorpay live keys obtained
- [ ] Turnstile site + secret keys in `.env.local`

### Decisions to make
- [ ] **Domain**: `turfzo.com` (or `turfzo.in` — `.in` is cheaper, ₹500/year)
- [ ] **Region**: Mumbai (`bom1`) is closest for your Indian users
- [ ] **Plan**: Hobby (free) is fine until you hit Vercel's soft limits

---

## 2. Vercel Project Setup

### 2.1 Create the project
```bash
npm i -g vercel
vercel login
vercel link  # in your project root
```

In Vercel dashboard:
- **Project Settings → General**
  - Framework Preset: **Next.js** (auto-detected)
  - Build Command: `npm run build` (default)
  - Install Command: `npm ci` (faster + reproducible than `npm install`)
  - Output Directory: `.next` (default)
  - Node.js Version: **20.x** (matches your engines requirement)

### 2.2 Add Environment Variables

**Go to Project Settings → Environment Variables.**

Add each one. Choose the right **Environment** scope for each:

| Variable | Scope | Why |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview, Development | Public, safe everywhere |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | All | Public |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | All | Public |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | All | Public |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | All | Public |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | All | Public |
| `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL` | All | Public (your prod deployment URL) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | All | Public key (live, not test!) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | All | Public |
| `RAZORPAY_KEY_ID` | **Production only** | Server secret |
| `RAZORPAY_KEY_SECRET` | **Production only** | Server secret — never expose |
| `RAZORPAY_WEBHOOK_SECRET` | **Production only** | Server secret |
| `TURNSTILE_SECRET_KEY` | **Production only** | Server secret |
| `CONVEX_DEPLOY_KEY` | **Production only** | CI only, not runtime |
| `NEXT_PUBLIC_SENTRY_DSN` | Production | Optional |
| `NEXT_PUBLIC_POSTHOG_KEY` | Production | Optional |

**Pro tip:** Use different values for Preview vs Production. Vercel will deploy every PR to a unique preview URL — use your **test** Razorpay keys there.

**To make a value Preview-only or Production-only**, uncheck the other scopes.

### 2.3 Connect Domain

1. Vercel Dashboard → Domains → Add
2. Type `turfzo.com` (or your domain)
3. Vercel will give you DNS records. Add them at your registrar:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
4. Wait 5-30 min for DNS propagation
5. Vercel auto-issues a Let's Encrypt SSL cert (free)

For apex (`turfzo.com`) + `www` redirect, set `www` as primary, then redirect apex to `www` (or vice versa, your choice).

---

## 3. Convex Production Setup

Your dev Convex deployment is `woozy-husky-516`. For production:

### Option A: Same deployment (simpler)
Just use `woozy-husky-516` for production. Set `NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL` in Vercel to this URL. Push schema with `npx convex deploy`.

### Option B: Separate prod deployment (recommended)
```bash
# One-time setup
npx convex deploy --prod

# This creates a NEW deployment and prints its URL
# Add the URL as NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL in Vercel
# Add CONVEX_DEPLOY_KEY in Vercel for CI deployments
```

Then push the same schema:
```bash
npx convex deploy --prod
npx convex run --prod seed:seedAll
```

---

## 4. Razorpay Webhook Configuration

### 4.1 Get your Convex webhook URL
Your Convex HTTP routes resolve at:
```
https://<your-deployment>.convex.site/razorpay/webhook
```
Find it in the Convex dashboard → Settings → HTTP Actions.

### 4.2 Set up in Razorpay
1. Razorpay Dashboard → Settings → Webhooks → Add New Webhook
2. **Webhook URL**: `https://<your-convex>.convex.site/razorpay/webhook`
3. **Active Events**: select `payment.captured`, `payment.authorized`, `payment.failed`
4. **Secret**: copy the generated secret
5. Paste it as `RAZORPAY_WEBHOOK_SECRET` in Vercel env vars

### 4.3 Test the webhook
```bash
# In Razorpay dashboard → Webhooks → click on your webhook → "Send Test Webhook"
# Check Convex dashboard → Logs to see it received
```

---

## 5. Security Hardening (the actual security steps you asked for)

### 5.1 Vercel-side

**Deployment Protection (Vercel Pro feature, optional but recommended):**
- Project Settings → Deployment Protection → Enable
- Choose: "Standard Protection" (password on preview URLs)
- OR: "Vercel Authentication" (SSO with Vercel team)

**Branch Protection (GitHub):**
- Repo → Settings → Branches → Add rule for `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass (your CI workflow)
- ✅ Require up-to-date branches
- ✅ Include administrators

**Vercel Git Integration:**
- Project Settings → Git
- ✅ "Deploy Hooks" — optional, skip for now
- ✅ Production Branch: `main`
- ✅ Auto-deploy on push: ON for `main`
- ✅ Auto-deploy on PR: ON (creates preview URLs)

### 5.2 Vercel Password Protection (free tier trick)

If you want to test production with your team before public launch:
1. Project Settings → Deployment Protection → Password Protection
2. Set a strong password
3. All visitors see a password prompt
4. Remove it when ready to go public

### 5.3 Environment Variable Security

**Do:**
- ✅ Add `RAZORPAY_KEY_SECRET` only to **Production** scope
- ✅ Rotate secrets every 90 days (set a calendar reminder)
- ✅ Use Vercel's "Sensitive" toggle on secret env vars
- ✅ Delete `.env.local` from any shared/cloud-synced folder

**Don't:**
- ❌ Never put a secret in a `NEXT_PUBLIC_*` variable (it's shipped to the browser)
- ❌ Never commit `.env.local` to git (already gitignored — verify with `git status`)
- ❌ Never paste real keys in Slack/Discord/email
- ❌ Never log full env dumps to console (we already redact this in `lib/env.ts`)

### 5.4 Vercel Security Headers (already in `next.config.ts`)

You already have:
- ✅ CSP (Content-Security-Policy)
- ✅ HSTS (Strict-Transport-Security, production only)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy
- ✅ Permissions-Policy

**Test your headers:**
After deploy, run:
```bash
curl -I https://turfzo.com
```
You should see all the headers above.

**Test CSP:**
```bash
# Online: https://csp-evaluator.withgoogle.com/
# Paste your CSP from the response headers
```

### 5.5 Convex Security

**Auth checks (already in your code):**
- ✅ `requireUser()` on all sensitive mutations
- ✅ `requireRole()` on admin-only functions
- ✅ `getCurrentUserId()` checks Firebase identity in context

**Convex dashboard hardening:**
- Convex Dashboard → Team Settings → Members
- Only you should have admin access
- Add team members with "developer" role, never "admin"
- 2FA on your Convex account

**Convex data safety:**
- Convex auto-backs-up data daily
- For extra safety: Convex Dashboard → Settings → Backups → Enable (paid)
- Schema is version-controlled via `convex/schema.ts`

### 5.6 Firebase Security

**Authentication:**
- Firebase Console → Authentication → Sign-in method
- ✅ Email/Password enabled
- ✅ Google enabled
- ❌ Phone, Anonymous, etc. — DISABLE unused methods (smaller attack surface)

**Authorized domains:**
- Firebase Console → Authentication → Settings → Authorized Domains
- Add: `turfzo.com`, `www.turfzo.com`, `turfzo.vercel.app` (for previews)
- **Remove `localhost`** from production (only keep in dev)

**API key restrictions:**
- Google Cloud Console → APIs & Services → Credentials
- Your Firebase API key: click → Application restrictions
- Set to "HTTP referrers" and add: `turfzo.com/*`, `www.turfzo.com/*`
- (Optional but high-impact — limits the API key to only work on your domain)

### 5.7 Razorpay Security

- ✅ Use **Live** keys in production, **Test** in preview
- ✅ Set `RAZORPAY_KEY_SECRET` in Production only
- ✅ Webhook signature is verified server-side (already done in `convex/payments.ts`)
- ✅ Idempotency key prevents double-charges (already done)
- ✅ Webhook is the source of truth, not the client callback (already done)
- Set up email alerts: Razorpay Dashboard → Settings → Notifications
  - Daily transaction summary
  - Failed payment alerts
  - Refund alerts

### 5.8 Turnstile Security

- ✅ Secret key is server-only, never in `NEXT_PUBLIC_*`
- ✅ Verification happens server-side in Convex
- ✅ Token expires after 300 seconds (Cloudflare default)
- ✅ If you see abuse, switch widget to "Forces interactive challenges" mode in Cloudflare dashboard

### 5.9 Dependency Security

```bash
# Run weekly
npm audit
npm audit fix

# Or use Snyk (free for open source)
npx snyk test
```

Add Dependabot (free):
- GitHub repo → Settings → Code security → Dependabot
- Enable version updates and security updates
- Auto-creates PRs when vulnerabilities are found

### 5.10 Logging and Monitoring

**Already in code:**
- ✅ Convex logs all function calls (visible in dashboard)
- ✅ Mock mode warns loudly in dev

**Add before launch:**
- ✅ Sentry (already have skeleton, just install + DSN)
- ✅ PostHog (already have skeleton, just install + key)
- ✅ Uptime monitoring: [UptimeRobot](https://uptimerobot.com) (free) — alerts if site is down
- ✅ Vercel Analytics (built-in, no setup)

### 5.11 Rate Limiting (already done)

- ✅ Contact form: 3/hour per user
- ✅ Booking creation: 10/hour per user
- ✅ Firebase Auth: built-in rate limits

For DDoS, Vercel handles automatically. For more aggressive protection, add Cloudflare in front (their free plan includes basic WAF).

### 5.12 Secret Rotation Schedule

Set calendar reminders for:
- [ ] **Every 90 days**: rotate `RAZORPAY_KEY_SECRET`
- [ ] **Every 90 days**: rotate `TURNSTILE_SECRET_KEY`
- [ ] **Every 90 days**: rotate Firebase service account key
- [ ] **Every 6 months**: review and remove unused env vars
- [ ] **Every quarter**: review Vercel team members
- [ ] **Every quarter**: review Convex team members

---

## 6. Deployment Workflow (the actual process)

### First-time deploy:
```bash
# 1. Authenticate
vercel login
npx convex login

# 2. Push schema to production
npx convex deploy --prod
npx convex run --prod seed:seedAll

# 3. Set all env vars in Vercel dashboard (see Section 2.2)

# 4. Deploy
vercel --prod
# OR just: git push origin main (if Vercel Git integration is set)
```

### Subsequent deploys:
```bash
# Just push to main
git push origin main
# Vercel auto-deploys, Convex auto-deploys via CI
```

### Rollback (if something breaks):
```bash
# In Vercel dashboard → Deployments → click previous successful deploy → "Promote to Production"
# Takes ~30 seconds, no rebuild
```

---

## 7. Post-Deployment Testing

After first deploy, test EVERYTHING:

```bash
# Replace with your real URL
SITE=https://turfzo.com
```

**Landing & auth:**
- [ ] Homepage loads
- [ ] All navigation links work
- [ ] Sign up with new email works
- [ ] Sign in works
- [ ] Google OAuth works
- [ ] Forgot password email arrives (check spam!)

**Booking flow:**
- [ ] Browse turfs on /explore
- [ ] Click a turf → see slots
- [ ] Pick a slot → see payment screen
- [ ] Click Pay → Razorpay opens
- [ ] Use test card `4111 1111 1111 1111` (still on test keys? switch to live for real test)
- [ ] See confirmation with QR
- [ ] Check /bookings — your booking is there

**Tournament flow:**
- [ ] Browse /tournaments
- [ ] Click Register → fill form
- [ ] Pay → confirmation

**Admin:**
- [ ] Manually set your user `role: "admin"` in Convex dashboard
- [ ] Visit /admin → see your user listed
- [ ] Submit a contact form from another browser
- [ ] Refresh /admin → see the message

**Security tests:**
- [ ] `curl -I https://turfzo.com` — all security headers present
- [ ] Try `/admin` without being logged in → redirected to login
- [ ] Try `/admin` as a non-admin → "Access denied"
- [ ] Submit contact form without solving Turnstile → rejected
- [ ] Open DevTools → Network → check no secrets in JS bundle
- [ ] View source → no API keys in HTML

**Performance:**
- [ ] https://pagespeed.web.dev/ — aim for 90+ on all categories
- [ ] https://www.webpagetest.org/ — check Time to First Byte from Mumbai
- [ ] Lighthouse in Chrome DevTools — Accessibility 90+, SEO 100

---

## 8. Ongoing Maintenance

### Weekly
- [ ] Check Vercel dashboard for failed builds
- [ ] Check Convex dashboard for function errors
- [ ] Check Sentry for new error patterns
- [ ] Review Razorpay dashboard for failed payments

### Monthly
- [ ] `npm audit` and update deps
- [ ] Review Vercel Analytics for traffic spikes/anomalies
- [ ] Review contact form submissions for spam/abuse
- [ ] Review `/admin` for any user with `role !== 'player'` that you didn't approve

### Quarterly
- [ ] Rotate secrets (see Section 5.12)
- [ ] Review and prune unused env vars
- [ ] Check Vercel/Convex/Firebase/Razorpay billing
- [ ] Renew domain (set auto-renew!)
- [ ] Review and update legal pages if business details change

---

## 9. Cost Estimate (first 6 months)

| Service | Plan | Monthly cost |
|---|---|---|
| Vercel | Hobby (free) | ₹0 (up to 100GB bandwidth, then $20/mo Pro) |
| Convex | Free | ₹0 (up to 1M function calls, 0.5GB storage) |
| Firebase | Spark (free) | ₹0 (up to 10K auth verifications/mo) |
| Razorpay | Pay-per-use | 2% per transaction (no monthly fee) |
| Cloudflare Turnstile | Free | ₹0 (unlimited) |
| Domain | Annual | ₹500-1000/year |
| **Total (low traffic)** | | **~₹100-500/month** |
| **Total (moderate traffic, ~10K MAU)** | | **~₹3,000-5,000/month** |

You can run a serious MVP for under ₹500/month until you hit scale.

---

## 10. When to Upgrade

**Vercel Pro ($20/mo) when:**
- You exceed 100GB bandwidth
- You need team collaboration
- You want password-protected deployments
- You exceed function execution limits

**Convex Pro ($25/mo) when:**
- You exceed 1M function calls/month
- You exceed 0.5GB storage
- You need point-in-time recovery

**Firebase Blaze (pay-as-you-go) when:**
- You exceed 10K phone verifications/month
- You exceed 10K Cloud Functions invocations

**Don't upgrade prematurely.** The free tiers are very generous and will carry you past your first 1000 users.

---

## TL;DR — the 5 things you must do

1. **Set all 9 `NEXT_PUBLIC_*` env vars in Vercel for all 3 environments**
2. **Set 4 server secrets in Vercel for Production only**
3. **Add `turfzo.com` to Firebase authorized domains, remove `localhost`**
4. **Set up Razorpay webhook pointing to your Convex URL**
5. **Test the full booking flow with a real (test) card before going public**

The rest is best-practice that protects you from rare events. Do the 5 above, deploy, then layer in the rest over the next month.
