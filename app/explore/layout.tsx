import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Explore Turfs Near You — Book by City & Sport",
  description:
    "Browse football turfs, cricket grounds, badminton courts and tennis venues on Turfzo. Compare hourly rates, check live slots and book online.",
  alternates: {
    canonical: "https://turfzo.app/explore",
  },
  openGraph: buildOpenGraph({
    title: "Explore Turfs Near You",
    description:
      "Browse football, cricket, badminton and tennis venues across India. Filter by city, sport and price.",
    url: "https://turfzo.app/explore",
  }),
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
