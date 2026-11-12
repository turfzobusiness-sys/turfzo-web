import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Book a Turf Online in India [Step-by-Step Guide]",
  description:
    "A step-by-step guide to finding a ground, checking live slots, paying online, and getting your confirmation. No phone calls.",
  alternates: { canonical: "https://turfzo.app/blog/how-to-book-turf-online" },
  openGraph: {
    title: "How to Book a Turf Online in India",
    description:
      "Step-by-step guide to booking a football turf, cricket ground, or sports venue online.",
    url: "https://turfzo.app/blog/how-to-book-turf-online",
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
