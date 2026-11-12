import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Turf Booking in Bangalore [2026 Guide] | Prices & Tips",
  description:
    "What football turf booking costs in Bangalore, which areas have the densest clusters, and how to compare live availability.",
  alternates: {
    canonical: "https://turfzo.app/blog/best-football-turfs-bangalore",
  },
  openGraph: {
    title: "Football Turf Booking in Bangalore [2026 Guide]",
    description:
      "Football turf booking in Bangalore: typical prices, popular areas, and how to compare live availability.",
    url: "https://turfzo.app/blog/best-football-turfs-bangalore",
    images: [
      {
        url: "https://turfzo.app/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Turfzo",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
