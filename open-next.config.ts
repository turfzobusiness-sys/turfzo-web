import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal preview-first config: default caching (no R2 bucket yet).
// Add R2 incremental cache later if ISR/SSG caching needs it.
export default defineCloudflareConfig();
