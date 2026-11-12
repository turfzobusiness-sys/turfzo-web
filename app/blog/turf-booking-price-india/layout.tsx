import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turf Booking Price in India [2026 Guide] | City-wise Pricing",
  description:
    "How much does turf booking cost in India? See typical hourly price ranges for football, cricket and badminton across major Indian cities.",
  alternates: { canonical: "https://turfzo.app/blog/turf-booking-price-india" },
  openGraph: {
    title: "Turf Booking Price in India [2026 Guide]",
    description:
      "Typical turf booking prices across Indian cities for football, cricket and badminton.",
    url: "https://turfzo.app/blog/turf-booking-price-india",
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
