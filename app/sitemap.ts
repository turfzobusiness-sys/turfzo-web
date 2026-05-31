import { MetadataRoute } from "next";

const SITE_URL = "https://turfzo.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${SITE_URL}/tournaments`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/auth/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/auth/signup`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const cityPages = [
    "bangalore", "mumbai", "delhi", "hyderabad",
    "pune", "chennai", "kolkata", "ahmedabad",
  ].map((city) => ({
    url: `${SITE_URL}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const sportPages = ["football", "cricket", "badminton", "tennis"].map((sport) => ({
    url: `${SITE_URL}/sports/${sport}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...sportPages];
}
