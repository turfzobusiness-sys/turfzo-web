# R2 incremental cache — Turfzo

`open-next.config.ts` uses `r2IncrementalCache`. Wrangler binds `NEXT_INC_CACHE_R2_BUCKET`.

## One-time bucket creation

```bash
cd turfzo_website/turfzo
wrangler r2 bucket create turfzo-web-cache
wrangler r2 bucket create turfzo-web-staging-cache
```

Free tier: 10GB std + 1M class-A / 10M class-B ops/mo, zero egress. ISR/SSG + fetch cache land here; miss → recompute, never 500.

## Verify

```bash
npm run build
npx opennextjs-cloudflare build   # should show R2 cache binding, no "no R2 bucket" warning
wrangler deploy --dry-run         # or opennextjs-cloudflare upload
```

If deploy complains about missing bucket, create it (above) and retry. Staging uses `wrangler.staging.jsonc` → `turfzo-web-staging-cache`.
