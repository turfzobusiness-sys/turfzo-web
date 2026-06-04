import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turf Booking Price in India | Turfzo",
  description: "Understand the costs of booking sports turfs across major Indian cities.",
  alternates: { canonical: "https://turfzo.app/blog/turf-booking-price-india" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
