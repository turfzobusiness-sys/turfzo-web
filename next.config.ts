import type { NextConfig } from "next";
import path from "path";

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

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://*.cashfree.com https://*.convex.cloud https://challenges.cloudflare.com https://apis.google.com",
  "frame-src 'self' https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com https://challenges.cloudflare.com https://*.firebaseapp.com https://*.firebaseauth.com",
  "connect-src 'self' https://*.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.googleapis.com https://challenges.cloudflare.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.firebaseauth.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.firebaseapp.com https://*.firebaseauth.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
