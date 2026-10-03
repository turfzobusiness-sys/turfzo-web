import { MetadataRoute } from "next";

/**
 * Paths no crawler may touch.
 *
 * `/setup` is the admin bootstrap page (admin:setupFirstAdmin) — indexing or
 * crawling it advertises a privileged surface. Applied to EVERY user-agent
 * group: Next groups rules by user agent and a crawler picks its most
 * specific match, so listing `allow: "/"` for GPTBot & co. without the
 * disallow would have re-permitted /setup for exactly those bots.
 */
const DISALLOW = ["/api/", "/auth/", "/.next/", "/admin/", "/setup"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: "https://turfzo.app/sitemap.xml",
  };
}
