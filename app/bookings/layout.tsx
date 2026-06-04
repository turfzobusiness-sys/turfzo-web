import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings | Turfzo",
  description: "View and manage your past and upcoming turf bookings.",
  alternates: { canonical: "https://turfzo.app/bookings" },
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
