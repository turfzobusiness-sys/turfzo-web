import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Turfs Near You — Book by City & Sport",
  description:
    "Browse football turfs, cricket grounds, badminton courts and tennis venues across India on Turfzo. Filter by city, sport and price, then book an available slot online.",
  alternates: {
    canonical: "https://turfzo.app/explore",
  },
  openGraph: {
    title: "Explore Turfs Near You",
    description:
      "Browse football, cricket, badminton and tennis venues across India. Filter by city, sport and price.",
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
