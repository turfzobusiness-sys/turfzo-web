import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Turfzo",
  description: "Read the latest articles about sports, turf bookings, and tips on Turfzo.",
  alternates: { canonical: "https://turfzo.app/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
