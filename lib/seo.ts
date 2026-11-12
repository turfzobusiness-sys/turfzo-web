import { cache } from "react";
import type { Metadata } from "next";
import { convexClient } from "@/lib/convex";
import type { Turf } from "@/lib/types";

/**
 * Testing-phase SEO switches.
 *
 * Turfzo has no real venue partners yet: every venue in production is seed
 * data. Indexing empty city pages or test venues teaches Google the pages
 * are thin, and spends the ranking position needed when inventory lands.
 *
 * - City pages auto-index PER CITY once Convex has >= 1 non-mock venue in
 *   that city (or if `CITY_PAGES_INDEXABLE` is flipped to `true`).
 * - `VENUE_PAGES_INDEXABLE` stays a manual kill switch until real partner
 *   venues are ready; mock venues stay excluded by `isTestVenue()` forever.
 */
export const CITY_PAGES_INDEXABLE = false;
export const VENUE_PAGES_INDEXABLE = false;

export const SITE_URL = "https://turfzo.app";
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-cover.jpg`;

export const INDEXABLE_CITY_SLUGS = [
  "bangalore",
  "mumbai",
  "delhi",
  "hyderabad",
  "pune",
  "chennai",
  "kolkata",
  "ahmedabad",
  "aurangabad",
] as const;

export const INDEXABLE_SPORT_SLUGS = [
  "football",
  "cricket",
  "badminton",
  "tennis",
  "multipurpose",
] as const;

/** Seed venues are named "... (Mock)" in turfzo-backend/convex/seed.ts. */
const TEST_VENUE_NAME = /\(mock\)/i;

export function isTestVenue(venue: { name?: string | null }): boolean {
  return TEST_VENUE_NAME.test(venue.name ?? "");
}

const CITY_ALIAS_TO_SLUG: Record<string, string> = {
  bangalore: "bangalore",
  bengaluru: "bangalore",
  mumbai: "mumbai",
  delhi: "delhi",
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  hyderabad: "hyderabad",
  pune: "pune",
  chennai: "chennai",
  kolkata: "kolkata",
  ahmedabad: "ahmedabad",
  aurangabad: "aurangabad",
  "chhatrapati sambhajinagar": "aurangabad",
  csn: "aurangabad",
};

export function normalizeCityToSlug(city: string | undefined | null): string | null {
  const key = (city ?? "").trim().toLowerCase();
  if (!key) return null;
  if (CITY_ALIAS_TO_SLUG[key]) return CITY_ALIAS_TO_SLUG[key];
  if ((INDEXABLE_CITY_SLUGS as readonly string[]).includes(key)) return key;
  return null;
}

/**
 * Per-request cached set of city slugs with at least one non-mock live venue.
 * Returns an empty set when Convex is unconfigured or unreachable so builds
 * and SSR pages never fail closed.
 */
export const getLiveCitySlugs = cache(async (): Promise<Set<string>> => {
  if (!process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL) {
    return new Set();
  }
  try {
    const turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
    const slugs = new Set<string>();
    for (const turf of turfs ?? []) {
      if (isTestVenue(turf)) continue;
      const slug = normalizeCityToSlug(turf.city);
      if (slug) slugs.add(slug);
    }
    return slugs;
  } catch {
    return new Set();
  }
});

export async function isCityIndexable(citySlug: string): Promise<boolean> {
  if (CITY_PAGES_INDEXABLE) return true;
  const live = await getLiveCitySlugs();
  return live.has(citySlug.toLowerCase());
}

/**
 * Preserves og:image, siteName, and locale when child routes override
 * openGraph. Next.js shallow-merges `openGraph`, so setting `openGraph` without
 * `images` drops the root layout's `og-cover.jpg`.
 */
export function buildOpenGraph(opts: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  image?: string;
  alt?: string;
}): NonNullable<Metadata["openGraph"]> {
  const imageUrl = opts.image
    ? opts.image.startsWith("http")
      ? opts.image
      : `${SITE_URL}${opts.image.startsWith("/") ? "" : "/"}${opts.image}`
    : DEFAULT_OG_IMAGE_URL;

  return {
    type: opts.type ?? "website",
    locale: "en_IN",
    siteName: "Turfzo",
    title: opts.title,
    description: opts.description,
    url: opts.url,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: opts.alt ?? "Turfzo - Sports Venue Booking",
      },
    ],
  };
}
