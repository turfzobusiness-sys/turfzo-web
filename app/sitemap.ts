import { MetadataRoute } from "next";
import { convexClient } from "@/lib/convex";
import {
  CITY_PAGES_INDEXABLE,
  INDEXABLE_CITY_SLUGS,
  INDEXABLE_SPORT_SLUGS,
  SITE_URL,
  VENUE_PAGES_INDEXABLE,
  getLiveCitySlugs,
  isTestVenue,
} from "@/lib/seo";
import type { Turf } from "@/lib/types";

export const revalidate = 300;

// Real static content update dates — never emit `new Date()` at request time
// or Google learns to ignore `lastmod`.
const STATIC_PAGE_LASTMOD = new Date("2026-11-12T00:00:00Z");
const LEGAL_PAGE_LASTMOD = new Date("2026-06-08T00:00:00Z");

// Blog slugs and their publication/update dates. The first five resolve through
// app/blog/[slug]/page.tsx; the static guides resolve through their own
// app/blog/<slug>/page.tsx routes. Every slug here is also linked from
// app/blog/page.tsx.
const BLOG_POSTS: Array<{ slug: string; lastModified: string }> = [
  { slug: "book-football-turf-instantly", lastModified: "2026-06-01T00:00:00Z" },
  { slug: "organize-local-sports-tournaments", lastModified: "2026-06-01T00:00:00Z" },
  { slug: "maximize-turf-roi-booking-management", lastModified: "2026-06-01T00:00:00Z" },
  { slug: "future-of-amateur-sports-india", lastModified: "2026-06-01T00:00:00Z" },
  { slug: "turf-vs-ground-injury-prevention", lastModified: "2026-06-01T00:00:00Z" },
  { slug: "how-to-book-turf-online", lastModified: "2026-05-31T00:00:00Z" },
  { slug: "turf-booking-price-india", lastModified: "2026-05-31T00:00:00Z" },
  { slug: "best-football-turfs-bangalore", lastModified: "2026-05-31T00:00:00Z" },
  { slug: "turf-vs-ground", lastModified: "2026-05-31T00:00:00Z" },
];

interface SitemapTournament {
  _id: string;
  _creationTime?: number;
  created_at?: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/how-it-works`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/owners`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tournaments`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: STATIC_PAGE_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: LEGAL_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: LEGAL_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, lastModified: LEGAL_PAGE_LASTMOD, changeFrequency: "monthly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const sportPages: MetadataRoute.Sitemap = INDEXABLE_SPORT_SLUGS.map((sport) => ({
    url: `${SITE_URL}/sports/${sport}`,
    lastModified: STATIC_PAGE_LASTMOD,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Per-city indexing: only list cities that actually have 1+ real non-mock
  // venue in Convex (or all cities when CITY_PAGES_INDEXABLE is flipped).
  const activeCities = CITY_PAGES_INDEXABLE
    ? [...INDEXABLE_CITY_SLUGS]
    : [...(await getLiveCitySlugs())];

  const cityPages: MetadataRoute.Sitemap = activeCities.map((city) => ({
    url: `${SITE_URL}/cities/${city}`,
    lastModified: STATIC_PAGE_LASTMOD,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const citySportPages: MetadataRoute.Sitemap = [];
  for (const city of activeCities) {
    for (const sport of INDEXABLE_SPORT_SLUGS) {
      citySportPages.push({
        url: `${SITE_URL}/cities/${city}/${sport}`,
        lastModified: STATIC_PAGE_LASTMOD,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Venue and tournament detail pages come from the backend (thin-client rule:
  // no local pricing/schema logic). When the Convex URL is empty at build time,
  // an empty base URL would self-fetch the Next server ("/api/query") and
  // return zero rows — so skip dynamic routes with a LOUD warning instead of
  // silently producing an incomplete sitemap.
  let venuePages: MetadataRoute.Sitemap = [];
  let tournamentPages: MetadataRoute.Sitemap = [];
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL ?? "";
  if (!convexUrl) {
    console.warn(
      "[sitemap] NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is empty at build time — " +
        "returning static routes ONLY. Dynamic venue/tournament pages are OMITTED."
    );
  } else {
    if (VENUE_PAGES_INDEXABLE) {
      try {
        const turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
        venuePages = (turfs ?? [])
          .filter((turf) => !isTestVenue(turf))
          .map((turf) => ({
            url: `${SITE_URL}/venues/${turf._id}`,
            lastModified: new Date(
              turf.updated_at ?? turf.created_at ?? turf._creationTime ?? STATIC_PAGE_LASTMOD.getTime(),
            ),
            changeFrequency: "daily" as const,
            priority: 0.8,
          }));
      } catch (error) {
        console.error("Failed to fetch turfs for sitemap:", error);
      }
    }

    try {
      const tournaments = await convexClient.query<SitemapTournament[]>(
        "tournaments:getOpen",
        {},
      );
      tournamentPages = (tournaments ?? []).map((t) => ({
        url: `${SITE_URL}/tournament/${t._id}`,
        lastModified: new Date(
          t.updated_at ?? t.created_at ?? t._creationTime ?? STATIC_PAGE_LASTMOD.getTime(),
        ),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error("Failed to fetch tournaments for sitemap:", error);
    }
  }

  return [
    ...staticPages,
    ...sportPages,
    ...blogPages,
    ...cityPages,
    ...citySportPages,
    ...venuePages,
    ...tournamentPages,
  ];
}
