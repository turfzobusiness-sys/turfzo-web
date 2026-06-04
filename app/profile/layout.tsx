import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Turfzo",
  description: "Manage your Turfzo profile, view your bookings, and update your favorite sports.",
  alternates: {
    canonical: "https://turfzo.app/profile",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
