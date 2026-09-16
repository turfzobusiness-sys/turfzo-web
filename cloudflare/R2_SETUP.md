# R2 Incremental Cache — Turfzo (Optional / Future Enhancement)

> **Status (as of PR #11 / Sep 2026)**:
> R2 bindings were explicitly **omitted** from `open-next.config.ts`, `wrangler.jsonc`, and `wrangler.staging.jsonc` because R2 is not provisioned on Cloudflare account `3f24b8f35b25e0943b29f0035403f694` (which caused deploy error `[code: 10042]`).
> The application currently runs without external R2 cache bindings using standard worker memory caching.

---

## Steps to Enable R2 in the Future (When Needed)

### 1. Cloudflare Dashboard Provisioning
1. Log in to the Cloudflare Dashboard for account `3f24b8f35b25e0943b29f0035403f694`.
2. Navigate to **R2** and complete initial plan enablement.

### 2. Create the R2 Buckets
```bash
npx wrangler r2 bucket create turfzo-web-cache
npx wrangler r2 bucket create turfzo-web-staging-cache
```

### 3. Re-enable in Configuration Files
1. In `open-next.config.ts`:
   ```typescript
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";
   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2";

   export default defineCloudflareConfig({
     incrementalCache: r2IncrementalCache,
   });
   ```
2. In `wrangler.jsonc` and `wrangler.staging.jsonc`:
   ```jsonc
   "r2_buckets": [
     {
       "binding": "NEXT_INC_CACHE_R2_BUCKET",
       "bucket_name": "turfzo-web-cache" // or turfzo-web-staging-cache
     }
   ]
   ```
