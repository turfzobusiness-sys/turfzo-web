import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Book a Turf in 2 Minutes",
  description: "Learn how to book a turf, invite players, and manage your matches on Turfzo.",
  alternates: { canonical: "https://turfzo.app/how-it-works" },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
