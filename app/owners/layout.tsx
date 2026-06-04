import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner with Turfzo | List Your Turf & Sports Arena",
  description: "List your football turf, cricket nets, or sports arena on Turfzo. Automate scheduling, smart lighting, gate access, and receive 24-hour payouts.",
  alternates: { canonical: "https://turfzo.app/owners" },
};

export default function OwnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
