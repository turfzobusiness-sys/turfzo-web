/**
 * Testing-phase SEO switches.
 *
 * Turfzo has no real venue partners yet: every venue in production is seed
 * data. Indexing city pages that cannot show a real bookable venue teaches
 * Google the pages are thin, and it spends the ranking position we will need
 * when inventory lands.
 *
 * Flip a flag to true as soon as its condition is met, then redeploy and
 * request indexing in Search Console:
 * - CITY_PAGES_INDEXABLE: at least one city has a real, bookable venue.
 * - VENUE_PAGES_INDEXABLE: real partner venues are live. Mock venues stay
 *   excluded by isTestVenue() even after this flips.
 */
export const CITY_PAGES_INDEXABLE = false;
export const VENUE_PAGES_INDEXABLE = false;

/** Seed venues are named "... (Mock)" in turfzo-backend/convex/seed.ts. */
const TEST_VENUE_NAME = /\(mock\)/i;

export function isTestVenue(venue: { name?: string | null }): boolean {
  return TEST_VENUE_NAME.test(venue.name ?? "");
}
