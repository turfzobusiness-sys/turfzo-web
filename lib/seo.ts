import { cache } from "react";
import type { Metadata } from "next";
import { convexClient } from "@/lib/convex";
import type { Turf } from "@/lib/types";

/**
 * SEO & programmatic indexability switches.
 *
 * - City pages auto-index PER CITY once Convex has >= 1 non-mock venue in
 *   that city (or if `CITY_PAGES_INDEXABLE` is flipped to `true`).
 * - City+Sport pages auto-index PER PAIR once Convex has >= 1 non-mock venue
 *   matching that city and sport, so empty combinations stay `noindex`.
 * - `VENUE_PAGES_INDEXABLE` is enabled for non-mock live venues; seed records
 *   marked `(Mock)` stay excluded by `isTestVenue()` forever.
 */
export const CITY_PAGES_INDEXABLE = false;
export const VENUE_PAGES_INDEXABLE = true;

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

export function getMatchingSportSlugs(sport: string | undefined | null): string[] {
  const key = (sport ?? "").trim().toLowerCase();
  if (!key) return [];
  return INDEXABLE_SPORT_SLUGS.filter((slug) => key.includes(slug));
}

/**
 * Per-request cached list of all available non-mock venues from Convex.
 * Fails open to `[]` when Convex is unconfigured or unreachable so builds
 * and SSR routes never throw.
 */
export const getLiveTurfs = cache(async (): Promise<Turf[]> => {
  if (!process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL) {
    return [];
  }
  try {
    const turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
    return (turfs ?? []).filter((turf) => !isTestVenue(turf));
  } catch {
    return [];
  }
});

/**
 * Per-request cached set of city slugs with at least one non-mock live venue.
 */
export const getLiveCitySlugs = cache(async (): Promise<Set<string>> => {
  const turfs = await getLiveTurfs();
  const slugs = new Set<string>();
  for (const turf of turfs) {
    const slug = normalizeCityToSlug(turf.city);
    if (slug) slugs.add(slug);
  }
  return slugs;
});

/**
 * Per-request cached set of `${citySlug}/${sportSlug}` pairs that have at least
 * one non-mock live venue matching both city and sport.
 */
export const getLiveCitySportSlugs = cache(async (): Promise<Set<string>> => {
  const turfs = await getLiveTurfs();
  const pairs = new Set<string>();
  for (const turf of turfs) {
    const citySlug = normalizeCityToSlug(turf.city);
    if (!citySlug) continue;
    for (const sportSlug of getMatchingSportSlugs(turf.sport_type)) {
      pairs.add(`${citySlug}/${sportSlug}`);
    }
  }
  return pairs;
});

export async function isCityIndexable(citySlug: string): Promise<boolean> {
  if (CITY_PAGES_INDEXABLE) return true;
  const live = await getLiveCitySlugs();
  return live.has(citySlug.toLowerCase());
}

export async function isCitySportIndexable(
  citySlug: string,
  sportSlug: string,
): Promise<boolean> {
  if (CITY_PAGES_INDEXABLE) return true;
  const live = await getLiveCitySportSlugs();
  return live.has(`${citySlug.toLowerCase()}/${sportSlug.toLowerCase()}`);
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
