import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournaments | Turfzo",
  description: "Discover and register for upcoming sports tournaments in your city.",
  alternates: { canonical: "https://turfzo.app/tournaments" },
};

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
