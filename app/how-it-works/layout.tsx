import type { Metadata } from "next";
import { buildOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How It Works — Book a Turf in 2 Minutes",
  description:
    "Learn how to book a football turf, cricket ground, or sports venue on Turfzo. Search, select your slot, pay online, and show up to play. It takes 2 minutes.",
  alternates: { canonical: "https://turfzo.app/how-it-works" },
  openGraph: buildOpenGraph({
    title: "How It Works | Turfzo",
    description:
      "Book a turf in 2 minutes. Search, pick a slot, pay online, and show up to play.",
    url: "https://turfzo.app/how-it-works",
  }),
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
