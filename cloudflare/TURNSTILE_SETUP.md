# Turnstile setup — Turfzo (one widget, 3 actions)

Code is wired. Only real keys are missing (currently `0x4AAAAAAA-placeholder`).

## 1. Create the widget (dashboard, 2 min)

1. Open https://dash.cloudflare.com/?to=/:account/turnstile → Add widget.
2. Name: `turfzo-web`, mode: Managed.
3. Domains: `turfzo.app`, `www.turfzo.app`, `turfzo-web.turfzobusiness.workers.dev`, `localhost`, `127.0.0.1`.
4. Copy Site Key + Secret Key.

Or via Wrangler (4.109+):
```bash
wrangler turnstile widget create "turfzo-web" \
  --domain turfzo.app --domain www.turfzo.app \
  --domain turfzo-web.turfzobusiness.workers.dev \
  --domain localhost --domain 127.0.0.1 \
  --mode managed --json
```

## 2. Set keys

```bash
# Local (website)
printf 'NEXT_PUBLIC_TURNSTILE_SITE_KEY=<sitekey>\nTURNSTILE_SECRET_KEY=<secret>\nTURNSTILE_HOSTNAMES=turfzo.app,www.turfzo.app,turfzo-web.turfzobusiness.workers.dev\n' >> turfzo_website/turfzo/.env.local

# Convex backend (enforces contact:submitContact when set, fail-open in dev)
npx convex env set TURNSTILE_SECRET_KEY '<secret>'   # run in turfzo-backend/

# Workers prod + staging (enforces /api/turnstile/verify for signup/login)
cd turfzo_website/turfzo
printf '%s' '<secret>' | wrangler secret put TURNSTILE_SECRET_KEY
printf '%s' 'turfzo.app,www.turfzo.app,turfzo-web.turfzobusiness.workers.dev' | wrangler secret put TURNSTILE_HOSTNAMES
printf '%s' '<secret>' | wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.staging.jsonc
```

GitHub Actions secrets: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (+ staging variant). Workflows already read them with placeholder fallback.

## 3. Validate

- `/contact` without solving → "Please complete the bot verification."
- `/contact` with token → Convex `contact:submitContact` succeeds (fails closed in prod when secret set).
- Signup/login email flows call `POST /api/turnstile/verify` with `action=signup|login` before Firebase. Replay of a token → 403.
- Staging hostnames: add `turfzo-web-staging.workers.dev` to widget domains + `TURNSTILE_HOSTNAMES` if staging verify 403s on hostname.

## Notes

- Tokens are single-use; forms clear token state after each attempt and the widget issues a fresh challenge.
- Phone OTP uses Firebase reCAPTCHA — Turnstile gates email signup/login + contact only (documented limitation, not full Firebase enforcement).
- Free plan: unlimited solves, 20 widgets/account — we use 1.
