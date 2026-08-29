import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  CalendarDays,
  Trophy,
  Users,
  IndianRupee,
  Smartphone,
  ChevronRight,
  Timer,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { BreadcrumbListSchema } from "@/lib/schema";
import { convexClient } from "@/lib/convex";
import { isViewOnlyMode } from "@/lib/env";

type Props = { params: Promise<{ tournamentId: string }> };

interface TournamentDoc {
  _id: string;
  name: string;
  description?: string;
  sport_type: string;
  tournament_type: string;
  entry_fee: number;
  prize_pool?: number;
  max_participants: number;
  min_team_size?: number;
  max_team_size?: number;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  bracket_type: string;
  status: string;
  rules?: string;
  image_url?: string;
  turf_id?: string;
  organizer_id: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tournamentId } = await params;
  try {
    const t = await convexClient.query<TournamentDoc>(
      "tournaments:getTournamentById",
      { tournamentId },
    );
    if (!t) return { title: "Tournament Not Found" };
    const title = `${t.name} | ${t.sport_type} Tournament | Turfzo`;
    const description = `${t.name} — ${t.tournament_type} tournament. Entry ₹${t.entry_fee}, prize pool ${t.prize_pool ? `₹${t.prize_pool.toLocaleString()}` : "Trophy"}. Register on the Turfzo app.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: t.image_url ? [{ url: t.image_url }] : undefined,
      },
      alternates: { canonical: `https://turfzo.app/tournament/${tournamentId}` },
    };
  } catch {
    return { title: "Tournament Not Found" };
  }
}

export default async function TournamentPage({ params }: Props) {
  const { tournamentId } = await params;

  let tournament: TournamentDoc | null = null;
  try {
    tournament = await convexClient.query<TournamentDoc>(
      "tournaments:getTournamentById",
      { tournamentId },
    );
  } catch (err) {
    console.error("Failed to fetch tournament:", err);
  }

  if (!tournament) notFound();

  const viewOnly = isViewOnlyMode();
  const isOpen =
    tournament.status === "open" || tournament.status === "registration_open";

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <link
          rel="canonical"
          href={`https://turfzo.app/tournament/${tournamentId}`}
        />
      </head>
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: "https://turfzo.app" },
          { name: "Tournaments", url: "https://turfzo.app/tournaments" },
          { name: tournament.name, url: `https://turfzo.app/tournament/${tournamentId}` },
        ]}
      />
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-1 font-sans text-sm text-text-muted hover:text-text-main transition-colors mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            All tournaments
          </Link>

          <div className="relative rounded-lg overflow-hidden border border-border-default shadow-card-shadow mb-8 min-h-[300px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${tournament.image_url || "/stadium_turf_bg.webp"})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface/80 backdrop-blur-md border border-border-default text-xs font-bold text-brand-lime mb-4">
                <Trophy className="w-3.5 h-3.5" /> {tournament.sport_type}
              </span>
              <h1 className="font-sans text-4xl font-extrabold text-text-main mb-2">
                {tournament.name}
              </h1>
              <p className="text-text-muted text-sm max-w-2xl">
                {tournament.tournament_type} · {tournament.bracket_type} bracket
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="font-sans text-xl font-bold mb-3">
                  About this tournament
                </h2>
                <p className="text-text-muted text-sm leading-relaxed">
                  {tournament.description || "No description provided."}
                </p>
                {tournament.rules && (
                  <div className="mt-4 rounded-lg border border-border-default bg-surface p-4">
                    <h3 className="font-sans text-sm font-bold mb-2">Rules</h3>
                    <p className="text-text-muted text-sm whitespace-pre-line">
                      {tournament.rules}
                    </p>
                  </div>
                )}
              </section>

              <section>
                <h2 className="font-sans text-xl font-bold mb-3">
                  Tournament details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface p-3.5">
                    <CalendarDays className="w-4 h-4 text-brand-lime shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">Starts</p>
                      <p className="text-sm font-semibold">
                        {formatDate(tournament.start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface p-3.5">
                    <Timer className="w-4 h-4 text-brand-lime shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">Registration closes</p>
                      <p className="text-sm font-semibold">
                        {formatDate(tournament.registration_deadline)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface p-3.5">
                    <Users className="w-4 h-4 text-brand-lime shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">Team size</p>
                      <p className="text-sm font-semibold">
                        {tournament.max_team_size
                          ? `${tournament.min_team_size ?? 1}–${tournament.max_team_size} players`
                          : "Individual entry"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-surface p-3.5">
                    <IndianRupee className="w-4 h-4 text-brand-lime shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">Prize pool</p>
                      <p className="text-sm font-semibold">
                        {tournament.prize_pool
                          ? `₹${tournament.prize_pool.toLocaleString()}`
                          : "Trophy"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-1">
              <div className="rounded-lg border border-border-default bg-surface shadow-card-shadow p-5 sticky top-24">
                <p className="text-xs text-text-muted mb-1">Entry fee</p>
                <p className="font-sans text-3xl font-extrabold text-text-main mb-4">
                  ₹{tournament.entry_fee}
                  <span className="text-sm font-medium text-text-muted">
                    {" "}
                    / team
                  </span>
                </p>
                <div className="flex items-center gap-1.5 text-sm text-text-muted mb-5">
                  <Users className="w-4 h-4" />
                  Max {tournament.max_participants}{" "}
                  {tournament.max_team_size ? "teams" : "players"}
                </div>

                {!isOpen ? (
                  <div className="w-full bg-border-default text-text-muted font-bold text-sm py-3.5 rounded-xl cursor-not-allowed text-center">
                    Registration Closed
                  </div>
                ) : viewOnly ? (
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.turfzo.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99] inline-flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      Register on the Turfzo App
                    </a>
                    <p className="text-center text-xs text-text-muted">
                      Tournament registrations are available on the Turfzo app
                      only.
                    </p>
                  </div>
                ) : (
                  <Link
                    href={`/tournaments?id=${tournamentId}`}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99] inline-flex items-center justify-center gap-2"
                  >
                    Register Team
                  </Link>
                )}

                <p className="mt-4 text-center text-xs text-text-muted">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Managed by the tournament organizer on Turfzo
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
