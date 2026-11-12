import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Tournament",
  description: "Host a football, cricket, badminton, or tennis tournament on Turfzo.",
  alternates: { canonical: "https://turfzo.app/tournaments/create" },
  robots: { index: false, follow: false },
};

export default function CreateTournamentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
