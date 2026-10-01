import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
  description: "India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly.",
  alternates: { canonical: "https://turfzo.app" }
};

import { Header } from "@/components/ui/header-2";
import Hero from "@/components/Hero";
import PopularTurfs, { type PopularTurfItem } from "@/components/PopularTurfs";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { getLocalTurfImage } from "@/lib/turf-images";
import type { Turf } from "@/lib/types";

/** Sports the product actually supports (mirrors /explore's filter list). */
const SUPPORTED_SPORTS = [
  "Football",
  "Cricket",
  "Badminton",
  "Tennis",
  "Multipurpose",
];

/**
 * Real, live venue rows for the home page.
 *
 * Replaces a hardcoded list of four invented venues with invented ratings,
 * review counts, next-slot times and prices. A backend outage or an empty
 * result yields an empty array and the section renders nothing, rather than
 * falling back to fiction.
 */
async function loadPopularTurfs(): Promise<PopularTurfItem[]> {
  let turfs: Turf[] = [];
  try {
    turfs = await convexClient.query<Turf[]>("turfs:getAvailable", {});
  } catch (err) {
    console.error("Home: failed to load venues:", err);
    return [];
  }
  return (turfs ?? [])
    // Keep only sports the product can actually book, so the card's
    // sport filter always lands on a working result set.
    .filter((t) => SUPPORTED_SPORTS.includes(t.sport_type ?? ""))
    .slice(0, 8)
    // "Popular" is ordered by the venue's own review count; no client-side
    // score is invented.
    .sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
    .slice(0, 4)
    .map((t) => ({
      id: t._id,
      name: t.name,
      sport: t.sport_type ?? "Multipurpose",
      city: t.city ?? "",
      rating: typeof t.rating === "number" && t.rating > 0 ? t.rating : null,
      reviews:
        typeof t.review_count === "number" && t.review_count > 0
          ? t.review_count
          : null,
      pricePerHour: t.price_per_hour,
      image: getLocalTurfImage(t),
      sportFilter: t.sport_type ?? "Multipurpose",
    }));
}

export default async function Home() {
  const venues = await loadPopularTurfs();

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow">
        <Hero />
        <PopularTurfs venues={venues} />
        <Features />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
