import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournaments — Host & Join",
  description:
    "Discover and register for local football, cricket, and badminton tournaments on Turfzo, or host your own knockout bracket online.",
  alternates: { canonical: "https://turfzo.app/tournaments" },
};

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
