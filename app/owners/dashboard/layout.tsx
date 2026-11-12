import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Dashboard",
  alternates: { canonical: "https://turfzo.app/owners/dashboard" },
  robots: { index: false, follow: false },
};

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
