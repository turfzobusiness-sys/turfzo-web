import type { NextConfig } from "next";
import path from "path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

// Strict CSP: no 'unsafe-eval' — SDK lazy-loaders (PostHog, Sentry) use
// real dynamic imports, not `new Function`, so eval is never required.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  !isProd ? "'unsafe-eval'" : "",
  "https://sdk.cashfree.com",
  "https://*.cashfree.com",
  "https://*.convex.cloud",
  "https://apis.google.com",
]
  .filter(Boolean)
  .join(" ");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "frame-src 'self' https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com https://*.firebaseapp.com https://*.firebaseauth.com",
  "connect-src 'self' https://*.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.firebaseauth.com https://*.datadoghq.com https://browser-intake-us5-datadoghq.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  // Matches X-Frame-Options: DENY above (frame-ancestors overrides XFO in
  // modern browsers — keep both deny so behavior is identical everywhere).
  "frame-ancestors 'none'",
  // Workers serve https only — upgrade any stray http subresource.
  "upgrade-insecure-requests",
  // FCM service worker is same-origin; blob: covers Next chunk workers.
  "worker-src 'self' blob:",
  "form-action 'self' https://*.firebaseapp.com https://*.firebaseauth.com https://*.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Scoped to the two known Convex deployments (PROD dependable-donkey-330,
    // DEV woozy-husky-516), both API host (.cloud) and storage host (.site —
    // turf image_url values resolve to storage URLs). No wildcards.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dependable-donkey-330.eu-west-1.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "dependable-donkey-330.eu-west-1.convex.site",
      },
      {
        protocol: "https",
        hostname: "woozy-husky-516.eu-west-1.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "woozy-husky-516.eu-west-1.convex.site",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
