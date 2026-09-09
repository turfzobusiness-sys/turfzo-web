import { MetadataRoute } from "next";
import { convexClient } from "@/lib/convex";
import type { Turf } from "@/lib/types";

const SITE_URL = "https://turfzo.app";

const CITIES = [
  "bangalore", "mumbai", "delhi", "hyderabad",
  "pune", "chennai", "kolkata", "ahmedabad",
  "aurangabad",
];

const SPORTS = ["football", "cricket", "badminton", "tennis", "pickleball"];

// Real blog slugs — must match app/blog/page.tsx + app/blog/[slug]/page.tsx
// generateStaticParams so every sitemap URL resolves (legacy static routes
// under app/blog/<slug>/ stay live but are no longer listed here).
const BLOG_SLUGS = [
  "book-football-turf-instantly",
  "organize-local-sports-tournaments",
  "maximize-turf-roi-booking-management",
  "future-of-amateur-sports-india",
  "turf-vs-ground-injury-prevention",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/owners`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/owners/register`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
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

  const cityPages = CITIES.map((city) => ({
    url: `${SITE_URL}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const citySportPages = [];
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

  // Venue pages come from the backend (thin-client rule: no local pricing/
  // schema logic, just turfs:getAvailable). When the Convex URL is empty at
  // build time, an empty base URL would self-fetch the Next server ("/api/query")
  // and return zero venues — so skip venue URLs with a LOUD warning instead of
  // silently producing a sitemap that looks complete but is missing venues.
  let venuePages: { url: string; lastModified: Date; changeFrequency: "daily"; priority: number }[] = [];
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL ?? "";
  if (!convexUrl) {
    console.warn(
      "[sitemap] NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is empty at build time — " +
        "returning static/blog/city routes ONLY. Venue pages are OMITTED " +
        "(incomplete by design, not silently complete)."
    );
  } else {
    try {
      const turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
      venuePages = turfs.map((turf) => ({
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
