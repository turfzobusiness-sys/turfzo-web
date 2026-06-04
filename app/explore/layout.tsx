import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Turfs Near You | Book Football, Cricket & More | Turfzo",
  description:
    "Browse 50+ verified football turfs, cricket grounds, and sports venues across India. Filter by sport, price, and amenities. Real-time availability, instant booking, and secure online payment.",
  alternates: {
    canonical: "https://turfzo.app/explore",
  },
  openGraph: {
    title: "Explore Turfs Near You | Turfzo",
    description:
      "Browse 50+ verified turfs across India. Book football, cricket, badminton, and tennis venues instantly.",
    url: "https://turfzo.app/explore",
    type: "website",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
