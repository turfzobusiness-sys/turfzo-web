import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Tournaments",
  description: "Manage your hosted Turfzo tournaments, registrations, and brackets.",
  alternates: { canonical: "https://turfzo.app/tournaments/manage" },
  robots: { index: false, follow: false },
};

export default function ManageTournamentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
