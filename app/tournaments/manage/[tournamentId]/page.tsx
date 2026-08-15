"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Users,
  Trophy,
  Megaphone,
  Settings,
  Check,
  X,
  RefreshCw,
  Trash2,
  Send,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface TournamentDoc {
  _id: string;
  id: string;
  name: string;
  sport_type: string;
  tournament_type: string;
  entry_fee: number;
  prize_pool?: number;
  max_participants: number;
  status: string;
  can_manage?: boolean;
}

interface Participant {
  _id: string;
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  status: string;
  registration_type?: string;
  team_id?: string;
}

interface Team {
  _id: string;
  id: string;
  name: string;
  captain_id: string;
  status: string;
}

interface Match {
  _id: string;
  id: string;
  round_number: number;
  match_number: number;
  participant1_id?: string;
  participant2_id?: string;
  winner_id?: string;
  score1?: string;
  score2?: string;
  status: string;
}

interface Announcement {
  _id: string;
  id: string;
  title: string;
  message: string;
  created_at: string;
}

type Tab = "participants" | "matches" | "announcements" | "settings";

const STATUS_OPTIONS = [
  "draft",
  "registration_open",
  "open",
  "registration_closed",
  "upcoming",
  "in_progress",
  "completed",
  "cancelled",
];

export default function ManageTournamentPage() {
  const params = useParams<{ tournamentId: string }>();
  const tournamentId = params.tournamentId;
  const router = useRouter();
  const { status, convexUser, getFreshToken } = useAuth();

  const [tab, setTab] = useState<Tab>("participants");
  const [tournament, setTournament] = useState<TournamentDoc | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [statusDraft, setStatusDraft] = useState<string>("draft");

  const load = useCallback(async () => {
    if (status !== "authenticated" || !convexUser) return;
    try {
      const token = await getFreshToken();
      const [t, p, teamsData, matchesData, annData] = await Promise.all([
        convexClient.query<TournamentDoc>(
          "tournaments:getTournamentById",
          { tournamentId },
          token,
        ),
        convexClient.query<Participant[]>(
          "tournaments:getTournamentParticipants",
          { tournamentId },
          token,
        ),
        convexClient.query<Team[]>("tournaments:getTeams", { tournamentId }, token),
        convexClient.query<Match[]>(
          "tournaments:getMatches",
          { tournamentId },
          token,
        ),
        convexClient.query<Announcement[]>(
          "tournaments:getAnnouncements",
          { tournamentId },
          token,
        ),
      ]);
      setTournament(t ?? null);
      setParticipants(p ?? []);
      setTeams(teamsData ?? []);
      setMatches(matchesData ?? []);
      setAnnouncements(annData ?? []);
      if (t) setStatusDraft(t.status);
    } catch (err) {
      console.error("Failed to load tournament:", err);
    } finally {
      setLoading(false);
    }
  }, [status, convexUser, tournamentId, getFreshToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }
    async function initialLoad() {
      await load();
    }
    initialLoad();
  }, [status, router, load]);

  const run = async (fn: () => Promise<unknown>, successMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      await load();
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (status === "unauthenticated" || (status !== "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-brand-lime mb-3" />
        <p className="font-sans text-sm text-text-muted">
          Checking your session…
        </p>
      </div>
    );
  }

  if (!convexUser?.is_phone_verified) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 pt-24">
          <div className="max-w-md w-full bg-surface border border-border-default rounded-md p-8 shadow-card-shadow text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-lime/15 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-brand-lime" />
            </div>
            <h1 className="font-sans text-xl font-extrabold text-text-main mb-2">
              Verify your mobile number first
            </h1>
            <p className="text-text-muted text-sm mb-6">
              A verified mobile number is required to manage tournaments.
            </p>
            <a
              href="/auth/verify-phone"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover"
            >
              Verify my mobile number
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-24">
          <Loader2 className="w-6 h-6 animate-spin text-brand-lime" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 pt-24">
          <p className="font-sans text-sm text-text-muted">
            Tournament not found or you don&apos;t have permission to manage
            it.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" /> },
    { id: "matches", label: "Matches", icon: <Trophy className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <Link
            href="/tournaments/manage"
            className="inline-flex items-center gap-1 font-sans text-sm text-text-muted hover:text-text-main transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> My tournaments
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-sans text-3xl font-extrabold text-text-main">
                {tournament.name}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {tournament.sport_type} · {tournament.tournament_type} · Entry ₹
                {tournament.entry_fee}
              </p>
            </div>
            <Link
              href={`/tournament/${tournament.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-elevated hover:bg-elevated/80 text-text-main transition-colors"
            >
              View public page
            </Link>
          </div>

          <div className="flex gap-2 mb-6 border-b border-border-default overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? "border-brand-lime text-brand-lime"
                    : "border-transparent text-text-muted hover:text-text-main"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === "participants" && (
            <div className="space-y-3">
              {teams.length === 0 && participants.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-16">
                  No registrations yet. Share the{" "}
                  <a
                    href={`/tournament/${tournament.id}`}
                    className="text-brand-lime hover:underline"
                  >
                    public tournament page
                  </a>{" "}
                  to invite teams.
                </p>
              ) : (
                <>
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 bg-surface border border-border-default rounded-md p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-sans font-bold text-text-main truncate">
                          {team.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          Team · {team.status}
                        </p>
                      </div>
                      {team.status !== "approved" && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                convexClient.mutation(
                                  "tournaments:approveRegistration",
                                  {
                                    tournamentId,
                                    registrationId: team.id,
                                    isTeam: true,
                                  },
                                ),
                              "Team approved",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() =>
                          run(
                            () =>
                              convexClient.mutation(
                                "tournaments:rejectRegistration",
                                {
                                  tournamentId,
                                  registrationId: team.id,
                                  isTeam: true,
                                },
                              ),
                            "Team rejected",
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-error/15 text-error hover:bg-error/25 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ))}
                  {participants
                    .filter((p) => !p.team_id)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 bg-surface border border-border-default rounded-md p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-sans font-bold text-text-main truncate">
                            {p.user_name}
                          </p>
                          <p className="text-xs text-text-muted">
                            Individual · {p.status}
                          </p>
                        </div>
                        {p.status !== "approved" && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              run(
                                () =>
                                  convexClient.mutation(
                                    "tournaments:approveRegistration",
                                    { tournamentId, registrationId: p.id },
                                  ),
                                "Registration approved",
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        <button
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                convexClient.mutation(
                                  "tournaments:rejectRegistration",
                                  { tournamentId, registrationId: p.id },
                                ),
                              "Registration rejected",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-error/15 text-error hover:bg-error/25 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {tab === "matches" && (
            <div className="space-y-3">
              <button
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      convexClient.mutation("tournaments:generateInitialMatches", {
                        tournamentId,
                      }),
                    "Bracket generated!",
                  )
                }
                className="inline-flex items-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover disabled:opacity-50 mb-4"
              >
                <RefreshCw className="w-4 h-4" /> Generate bracket
              </button>
              {matches.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-12">
                  No matches yet. Approve at least 2 participants, then generate
                  the bracket.
                </p>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 bg-surface border border-border-default rounded-md p-4"
                  >
                    <div>
                      <p className="text-xs text-text-muted">
                        Round {m.round_number} · Match {m.match_number} ·{" "}
                        {m.status}
                      </p>
                      <p className="font-sans text-sm font-semibold text-text-main mt-1">
                        {m.participant1_id || "TBD"} vs{" "}
                        {m.participant2_id || "TBD"}
                      </p>
                      {m.score1 != null && (
                        <p className="text-xs text-text-muted mt-0.5">
                          Score: {m.score1} – {m.score2}
                        </p>
                      )}
                    </div>
                    {m.status !== "completed" && (
                      <button
                        disabled={busy}
                        onClick={() => {
                          const winnerId = window.prompt(
                            `Who won match ${m.match_number}? Enter participant id (${m.participant1_id} or ${m.participant2_id})`,
                          );
                          if (!winnerId) return;
                          run(
                            () =>
                              convexClient.mutation(
                                "tournaments:updateMatchResult",
                                { matchId: m.id, winnerId },
                              ),
                            "Match result saved",
                          );
                        }}
                        className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-elevated hover:bg-elevated/80 text-text-main disabled:opacity-50"
                      >
                        Set winner
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "announcements" && (
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!annTitle.trim() || !annMessage.trim()) {
                    toast.error("Title and message are required.");
                    return;
                  }
                  run(
                    () =>
                      convexClient.mutation("tournaments:createAnnouncement", {
                        tournamentId,
                        title: annTitle.trim(),
                        message: annMessage.trim(),
                      }),
                    "Announcement sent",
                  );
                  setAnnTitle("");
                  setAnnMessage("");
                }}
                className="bg-surface border border-border-default rounded-md p-5 space-y-3"
              >
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-sm text-text-main focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
                <textarea
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  rows={3}
                  placeholder="Message to participants…"
                  className="w-full rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-sm text-text-main focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Post announcement
                </button>
              </form>

              {announcements.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  No announcements yet.
                </p>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className="bg-surface border border-border-default rounded-md p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-sans font-bold text-text-main">
                          {a.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(a.created_at).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() =>
                          run(
                            () =>
                              convexClient.mutation(
                                "tournaments:deleteAnnouncement",
                                { announcementId: a.id },
                              ),
                            "Announcement deleted",
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-md text-xs font-semibold px-3 py-1.5 bg-error/15 text-error hover:bg-error/25 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                    <p className="text-sm text-text-muted mt-2 whitespace-pre-line">
                      {a.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-5">
              <div className="bg-surface border border-border-default rounded-md p-5">
                <label className="block text-sm font-semibold text-text-main mb-1.5">
                  Tournament status
                </label>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full sm:w-auto rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-sm text-text-main focus:border-border-strong focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          convexClient.mutation(
                            "tournaments:updateTournamentStatus",
                            { tournamentId, status: statusDraft },
                          ),
                        "Status updated",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover disabled:opacity-50"
                  >
                    Update status
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Use <span className="font-mono">registration_open</span> to
                  open registration, then{" "}
                  <span className="font-mono">in_progress</span> after
                  generating the bracket.
                </p>
              </div>

              <div className="bg-surface border border-border-default rounded-md p-5">
                <p className="font-sans font-bold text-text-main mb-1">
                  Public page
                </p>
                <p className="text-sm text-text-muted mb-3">
                  Share this link to let players register:
                </p>
                <a
                  href={`/tournament/${tournament.id}`}
                  className="text-brand-lime text-sm hover:underline break-all"
                >
                  https://turfzo.app/tournament/{tournament.id}
                </a>
              </div>

              <div className="bg-surface border border-border-default rounded-md p-5">
                <p className="font-sans font-bold text-error mb-2">
                  Danger zone
                </p>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm("Delete this tournament?")) return;
                    run(
                      () =>
                        convexClient.mutation("tournaments:deleteTournament", {
                          tournamentId,
                        }),
                      "Tournament deleted",
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-error/15 text-error hover:bg-error/25 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete tournament
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
