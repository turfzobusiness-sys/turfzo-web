import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// R2 incremental cache: ISR/SSG + fetch cache persist in NEXT_INC_CACHE_R2_BUCKET.
// Buckets: turfzo-web-cache (prod), turfzo-web-staging-cache (staging). See wrangler configs.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
