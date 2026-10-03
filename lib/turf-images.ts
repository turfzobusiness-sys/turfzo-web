export interface TurfImageInput {
  name?: string;
  title?: string;
  sport_type?: string;
  sport?: string;
  image_url?: string;
}

/**
 * Remote image hosts the app is allowed to load.
 *
 * MUST stay in sync with `images.remotePatterns` and the CSP `img-src` list
 * in next.config.ts. The backend (validators.assertSafeHttpUrl) accepts any
 * http(s) image URL, so an owner-typed host outside this list cannot be
 * fetched — the optimizer rejects it and the CSP blocks it. Rather than
 * opening both up to arbitrary third-party hosts (which would let any owner
 * point the site at a tracking pixel, and would turn the Next image
 * optimizer into an open proxy), the client degrades to a local placeholder.
 * Adding a host here AND in next.config.ts is the two-line change to support a
 * new CDN.
 */
const ALLOWED_REMOTE_IMAGE_HOSTS = new Set([
  // Convex storage (owner uploads resolve here) — PROD and DEV, both hosts.
  "dependable-donkey-330.eu-west-1.convex.cloud",
  "dependable-donkey-330.eu-west-1.convex.site",
  "woozy-husky-516.eu-west-1.convex.cloud",
  "woozy-husky-516.eu-west-1.convex.site",
  // Marketing stock imagery used by the seed data.
  "images.unsplash.com",
  "images.pexels.com",
  // Google sign-in avatars (Firebase photoURL).
  "lh3.googleusercontent.com",
]);

/** True when `url` is an absolute https URL on an allow-listed host. */
export function isAllowedRemoteImage(url: string | undefined | null): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return ALLOWED_REMOTE_IMAGE_HOSTS.has(parsed.hostname.toLowerCase());
}

export function getLocalTurfImage(t: TurfImageInput): string {
  // If it's a valid custom storage URL (not third-party stock CDN that can
  // fail/404, and on a host the image pipeline actually serves) use it.
  if (isAllowedRemoteImage(t.image_url)) {
    return t.image_url as string;
  }
  // Deterministically map to verified, locally-stored WebP venue photography
  const sport = (t.sport_type || t.sport || "").toLowerCase();
  const name = (t.name || t.title || "").toLowerCase();
  if (sport.includes("cricket")) {
    return "/images/venues/cricket-1.webp";
  }
  if (sport.includes("badminton")) {
    return "/images/venues/badminton-1.webp";
  }
  if (sport.includes("tennis")) {
    return name.includes("clay") ? "/images/venues/tennis-2.webp" : "/images/venues/tennis-1.webp";
  }
  if (name.includes("arena") || name.includes("club")) {
    return "/images/venues/football-2.webp";
  }
  return "/images/venues/football-1.webp";
}

export function getLocalTournamentImage(t: TurfImageInput): string {
  if (isAllowedRemoteImage(t.image_url)) {
    return t.image_url as string;
  }
  return "/images/marketing/tournaments/tournament-hero.webp";
}
