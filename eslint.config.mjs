import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare: generated worker types + adapter build output.
    "cloudflare-env.d.ts",
    ".open-next/**",
    // Auto-generated Convex stubs (overwritten by `npx convex dev`).
    "convex/_generated/**",
    // Tooling scripts (preflight, env-diff, vercel sync) — run with node, not the app.
    "scripts/**",
  ]),
]);

export default eslintConfig;
