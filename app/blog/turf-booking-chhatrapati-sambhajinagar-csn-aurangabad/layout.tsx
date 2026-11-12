import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/seo";

const TITLE =
  "Turf Booking in Chhatrapati Sambhajinagar (CSN / Aurangabad) [2026 Guide]";
const DESCRIPTION =
  "Complete guide to booking football turfs, box cricket nets, and badminton courts in Chhatrapati Sambhajinagar (CSN / Aurangabad). Compare CIDCO, Osmanpura, Garkheda, and Jalna Road hubs, typical hourly rates, and owner onboarding.";
const URL =
  "https://turfzo.app/blog/turf-booking-chhatrapati-sambhajinagar-csn-aurangabad";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "turf in csn",
    "football turf in csn",
    "turf booking chhatrapati sambhajinagar",
    "football turf chhatrapati sambhajinagar",
    "box cricket in csn",
    "turf booking aurangabad",
    "football turf in aurangabad",
    "cidco football turf csn",
    "sports turf chhatrapati sambhajinagar",
  ],
  alternates: {
    canonical: URL,
  },
  openGraph: buildOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "article",
    image: "/images/marketing/explore/football-card.webp",
    alt: "Football and box cricket turf in Chhatrapati Sambhajinagar (CSN / Aurangabad)",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
