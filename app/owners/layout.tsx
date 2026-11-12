import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "List Your Turf Online | Turf Booking Software",
    template: "%s | Turfzo",
  },
  description:
    "List your football turf, cricket nets or sports arena on Turfzo. Manage slots, pricing and payouts from one dashboard. Free to list, 5% on completed bookings.",
  alternates: { canonical: "https://turfzo.app/owners" },
};

export default function OwnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
