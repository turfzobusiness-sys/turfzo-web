import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turf vs Ground: Which Should You Book? [2026 Comparison]",
  description:
    "A practical comparison of artificial turf and natural ground for football and cricket, including cost, surface, and injury considerations.",
  alternates: { canonical: "https://turfzo.app/blog/turf-vs-ground" },
  openGraph: {
    title: "Turf vs Ground: Which Should You Book?",
    description:
      "Complete comparison of turf vs natural ground for football. Cost, playability, injuries, and more.",
    url: "https://turfzo.app/blog/turf-vs-ground",
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
