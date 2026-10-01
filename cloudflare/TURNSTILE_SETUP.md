# Turnstile setup — Turfzo (one widget, 3 actions)

Code is wired. Only real keys are missing.

> **Preflight note**: the deploy workflows now reject a
> `NEXT_PUBLIC_TURNSTILE_SITE_KEY` whose value contains `placeholder`, so a build
> cannot silently ship `0x4AAAAAAA-placeholder` any more. `lib/env.ts` and
> `lib/turnstile.ts` already treat such a value as unset.

## 0. Hostname allowlist — register every origin the worker answers on

Turnstile's `siteverify` validates the `hostname` field of the token, and
`lib/turnstile.ts` cross-checks it against the `TURNSTILE_HOSTNAMES` secret. **A
hostname missing from either list makes `/api/turnstile/verify` return 403** for
requests that arrive on it — so the list must cover every origin the worker is
actually reachable on, not just the apex.

`wrangler.jsonc` and `wrangler.staging.jsonc` both set `workers_dev: true` and
`preview_urls: true`, so the complete set is:

| Origin | Widget domain to register | In `TURNSTILE_HOSTNAMES`? |
| :--- | :--- | :--- |
| `turfzo.app` (prod) | yes | yes |
| `www.turfzo.app` (prod) | yes | yes |
| `turfzo-web.turfzobusiness.workers.dev` (prod) | yes | yes |
| `turfzo-web-staging.turfzobusiness.workers.dev` (staging) | **yes — was missing** | **yes — was missing** |
| `<hash>-turfzo-web.<subdomain>.workers.dev` (per-deploy previews) | **yes, as the wildcard `*.turfzo-web.turfzobusiness.workers.dev`** | **yes — was missing** |

The staging worker and the preview URLs are reachable today, so a Turnstile check
issued there fails closed unless they are registered. Register the preview pattern as
a wildcard on the widget (Turnstile accepts wildcard domains) and add the concrete
staging host plus the same wildcard to `TURNSTILE_HOSTNAMES` for each worker.

## 1. Create the widget (dashboard, 2 min)

1. Open https://dash.cloudflare.com/?to=/:account/turnstile → Add widget.
2. Name: `turfzo-web`, mode: Managed.
3. Domains: `turfzo.app`, `www.turfzo.app`, `turfzo-web.turfzobusiness.workers.dev`,
   `turfzo-web-staging.turfzobusiness.workers.dev`,
   `*.turfzo-web.turfzobusiness.workers.dev`, `localhost`, `127.0.0.1`.
4. Copy Site Key + Secret Key.

Or via Wrangler (4.109+):
```bash
wrangler turnstile widget create "turfzo-web" \
  --domain turfzo.app --domain www.turfzo.app \
  --domain turfzo-web.turfzobusiness.workers.dev \
  --domain turfzo-web-staging.turfzobusiness.workers.dev \
  --domain '*.turfzo-web.turfzobusiness.workers.dev' \
  --domain localhost --domain 127.0.0.1 \
  --mode managed --json
```

## 2. Set keys

```bash
# Local (website)
printf 'NEXT_PUBLIC_TURNSTILE_SITE_KEY=<sitekey>\nTURNSTILE_SECRET_KEY=<secret>\nTURNSTILE_HOSTNAMES=localhost,127.0.0.1,turfzo.app,www.turfzo.app,turfzo-web.turfzobusiness.workers.dev\n' >> turfzo_website/turfzo/.env.local

# Convex backend (enforces contact:submitContact when set, fail-open in dev)
npx convex env set TURNSTILE_SECRET_KEY '<secret>'   # run in turfzo-backend/

# Workers prod + staging (enforces /api/turnstile/verify for signup/login)
cd turfzo_website/turfzo
printf '%s' '<secret>' | wrangler secret put TURNSTILE_SECRET_KEY
printf '%s' 'turfzo.app,www.turfzo.app,turfzo-web.turfzobusiness.workers.dev' | wrangler secret put TURNSTILE_HOSTNAMES
printf '%s' '<secret>' | wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.staging.jsonc
printf '%s' 'turfzo-web-staging.turfzobusiness.workers.dev,*.turfzo-web.turfzobusiness.workers.dev' | wrangler secret put TURNSTILE_HOSTNAMES --config wrangler.staging.jsonc
```

GitHub Actions secrets: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (+ staging variant). The
deploy workflows read them and fail before building if either is missing — there is no
placeholder fallback.

## 3. Validate

- `/contact` without solving → "Please complete the bot verification."
- `/contact` with token → Convex `contact:submitContact` succeeds (fails closed in prod when secret set).
- Signup/login email flows call `POST /api/turnstile/verify` with `action=signup|login` before Firebase. Replay of a token → 403.
- Run the same three checks **against the staging origin** too. If staging verify 403s
  on hostname, the origin is missing from the widget domains or from
  `TURNSTILE_HOSTNAMES` — see §0, which lists the origins that were previously
  omitted.

## Notes

- Tokens are single-use; forms clear token state after each attempt and the widget issues a fresh challenge.
- Phone OTP uses Firebase reCAPTCHA — Turnstile gates email signup/login + contact only (documented limitation, not full Firebase enforcement).
- Free plan: unlimited solves, 20 widgets/account — we use 1.
- The `http_ratelimit` rule in `rate-limit-rule.json` throttles `POST
  /api/turnstile/verify` for `turfzo.app` / `www.turfzo.app` only. See its SCOPE LIMIT
  note for why the workers.dev origins are not throttled.
