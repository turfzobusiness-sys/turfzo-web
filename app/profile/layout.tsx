import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your Turfzo profile, view your bookings, and update your favorite sports.",
  alternates: {
    canonical: "https://turfzo.app/profile",
  },
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
