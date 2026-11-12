import type { Metadata } from "next";

type Props = { params: Promise<{ tournamentId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tournamentId } = await params;
  return {
    title: "Manage Tournament",
    description: "Manage participants, brackets, and announcements for your Turfzo tournament.",
    alternates: { canonical: `https://turfzo.app/tournaments/manage/${tournamentId}` },
    robots: { index: false, follow: false },
  };
}

export default function ManageTournamentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
