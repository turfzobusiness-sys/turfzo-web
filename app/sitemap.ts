import { MetadataRoute } from "next";
import { convexClient } from "@/lib/convex";
import {
  CITY_PAGES_INDEXABLE,
  VENUE_PAGES_INDEXABLE,
  isTestVenue,
} from "@/lib/seo";
import type { Turf } from "@/lib/types";

const SITE_URL = "https://turfzo.app";

const CITIES = [
  "bangalore", "mumbai", "delhi", "hyderabad",
  "pune", "chennai", "kolkata", "ahmedabad",
  "aurangabad",
];

/** Sports Turfzo actually supports; "pickleball" had no product support. */
const SPORTS = ["football", "cricket", "badminton", "tennis", "multipurpose"];

// Blog slugs. The first five resolve through app/blog/[slug]/page.tsx; the
// static guides resolve through their own app/blog/<slug>/page.tsx routes.
// Every slug here is also linked from app/blog/page.tsx.
const BLOG_SLUGS = [
  "book-football-turf-instantly",
  "organize-local-sports-tournaments",
  "maximize-turf-roi-booking-management",
  "future-of-amateur-sports-india",
  "turf-vs-ground-injury-prevention",
  "how-to-book-turf-online",
  "turf-booking-price-india",
  "best-football-turfs-bangalore",
  "turf-vs-ground",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/owners`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/tournaments`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const blogPages = BLOG_SLUGS.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Testing phase: city pages are noindex until a city has a real, bookable
  // venue (see lib/seo.ts). A sitemap must only list indexable URLs, so keep
  // them out while the flag is false.
  const cityPages: MetadataRoute.Sitemap = CITY_PAGES_INDEXABLE
    ? CITIES.map((city) => ({
        url: `${SITE_URL}/cities/${city}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }))
    : [];

  const citySportPages: MetadataRoute.Sitemap = [];
  if (CITY_PAGES_INDEXABLE) {
    for (const city of CITIES) {
      for (const sport of SPORTS) {
        citySportPages.push({
          url: `${SITE_URL}/cities/${city}/${sport}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }
  }

  // Venue pages come from the backend (thin-client rule: no local pricing/
  // schema logic, just turfs:getAvailable). When the Convex URL is empty at
  // build time, an empty base URL would self-fetch the Next server ("/api/query")
  // and return zero venues — so skip venue URLs with a LOUD warning instead of
  // silently producing a sitemap that looks complete but is missing venues.
  let venuePages: MetadataRoute.Sitemap = [];
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL ?? "";
  if (!VENUE_PAGES_INDEXABLE) {
    // Testing phase: no real partner venues yet. Venue pages also send
    // noindex (see app/venues/[venueId]/page.tsx).
  } else if (!convexUrl) {
    console.warn(
      "[sitemap] NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is empty at build time — " +
        "returning non-venue routes ONLY. Venue pages are OMITTED " +
        "(incomplete by design, not silently complete)."
    );
  } else {
    try {
      const turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
      venuePages = turfs
        .filter((turf) => !isTestVenue(turf))
        .map((turf) => ({
          url: `${SITE_URL}/venues/${turf._id}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        }));
    } catch (error) {
      console.error("Failed to fetch turfs for sitemap:", error);
    }
  }

  return [...staticPages, ...blogPages, ...cityPages, ...citySportPages, ...venuePages];
}
