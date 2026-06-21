import { MetadataRoute } from "next";
import { convexClient } from "@/lib/convex";
import type { Turf } from "@/lib/types";

const SITE_URL = "https://turfzo.app";

const CITIES = [
  "bangalore", "mumbai", "delhi", "hyderabad",
  "pune", "chennai", "kolkata", "ahmedabad",
];

const SPORTS = ["football", "cricket", "badminton", "tennis", "pickleball"];

const BLOG_SLUGS = [
  "how-to-book-turf-online",
  "turf-vs-ground",
  "turf-booking-price-india",
  "best-football-turfs-bangalore",
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

  let venuePages: { url: string; lastModified: Date; changeFrequency: "daily"; priority: number }[] = [];
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

  return [...staticPages, ...blogPages, ...cityPages, ...citySportPages, ...venuePages];
}
