import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Football Turfs in Bangalore | Turfzo",
  description: "Discover the top-rated football turfs in Bangalore. Compare prices, amenities, and book your slot instantly on Turfzo.",
  alternates: { canonical: "https://turfzo.app/blog/best-football-turfs-bangalore" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
