import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turf vs Ground: Which is Better? | Turfzo",
  description: "A comprehensive comparison between playing on artificial turf versus natural grass.",
  alternates: { canonical: "https://turfzo.app/blog/turf-vs-ground" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
