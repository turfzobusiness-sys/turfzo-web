export interface TurfImageInput {
  name?: string;
  title?: string;
  sport_type?: string;
  sport?: string;
  image_url?: string;
}

export function getLocalTurfImage(t: TurfImageInput): string {
  // If it's a valid custom storage URL (not third-party stock CDN that can fail/404), use it
  if (
    t.image_url &&
    !t.image_url.includes("images.unsplash.com") &&
    !t.image_url.includes("images.pexels.com")
  ) {
    return t.image_url;
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
  if (
    t.image_url &&
    !t.image_url.includes("images.unsplash.com") &&
    !t.image_url.includes("images.pexels.com")
  ) {
    return t.image_url;
  }
  return "/images/marketing/tournaments/tournament-hero.webp";
}

