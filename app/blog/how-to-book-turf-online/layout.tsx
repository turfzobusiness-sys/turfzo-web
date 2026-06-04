import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Book Turf Online | Turfzo",
  description: "A step-by-step guide to booking your favorite sports turf online quickly and securely.",
  alternates: { canonical: "https://turfzo.app/blog/how-to-book-turf-online" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
