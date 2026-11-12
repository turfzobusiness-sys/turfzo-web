import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | Turfzo",
  },
  description: "Read the latest articles about sports, turf bookings, and tips on Turfzo.",
  alternates: { canonical: "https://turfzo.app/blog" },
  openGraph: buildOpenGraph({
    title: "Turf Booking Guides & Tips | Turfzo",
    description:
      "Read the latest articles about sports, turf bookings, pricing guides, and tournament tips on Turfzo.",
    url: "https://turfzo.app/blog",
  }),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
