"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Loader2,
  Check,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Sports the product actually supports booking for (see lib/types.ts Turf
// sport_type and the explore filter list). The old list offered Basketball,
// Kabaddi and Volleyball, which have no slot/pricing support anywhere.
const SPORTS = [
  "Cricket",
  "Football",
  "Badminton",
  "Tennis",
  "Multipurpose",
  "Other",
];

const TOURNAMENT_TYPES = [
  { value: "team", label: "Team / Squad" },
  { value: "individual", label: "Individual / Solo" },
];

/**
 * Only bracket types the backend actually generates. Double elimination and
 * round robin were offered but tournaments:generateInitialMatches only
 * implements a single-elimination bracket — picking either produced a
 * single-elim bracket under a misleading label.
 */
const BRACKET_TYPES = [
  { value: "single_elimination", label: "Single Elimination (Knockout)" },
];

/** Team/squad modes are the ones that need a roster size. */
function isTeamMode(type: string): boolean {
  const t = type.trim().toLowerCase();
  return t === "team" || t === "squad";
}

const inputCls =
  "w-full rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200";
const labelCls = "block text-sm font-semibold text-text-main mb-1.5";

export default function CreateTournamentPage() {
  const router = useRouter();
  const { status, convexUser, getFreshToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [sportType, setSportType] = useState(SPORTS[0]);
  const [tournamentType, setTournamentType] = useState(TOURNAMENT_TYPES[0].value);
  const [bracketType, setBracketType] = useState(BRACKET_TYPES[0].value);
  const [entryFee, setEntryFee] = useState("0");
  const [prizePool, setPrizePool] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("8");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [minTeamSize, setMinTeamSize] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
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
              A verified mobile number is required to create a tournament. It
              only takes a minute.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      toast.error("Tournament name is required.");
      return;
    }
    if (!startDate || !endDate || !regDeadline) {
      toast.error("Start, end and registration deadline dates are required.");
      return;
    }
    if (new Date(regDeadline) > new Date(startDate)) {
      toast.error("Registration deadline must be on or before the start date.");
      return;
    }
    const maxTeams = parseInt(maxParticipants, 10);
    if (!maxTeams || maxTeams < 1) {
      toast.error("Max teams/players must be at least 1.");
      return;
    }
    // A team/squad event without a roster size has no way to display or
    // enforce how many players a team brings.
    const teamMode = isTeamMode(tournamentType);
    const minSize = minTeamSize ? parseInt(minTeamSize, 10) : undefined;
    const maxSize = maxTeamSize ? parseInt(maxTeamSize, 10) : undefined;
    if (teamMode) {
      if (!maxSize || !Number.isFinite(maxSize) || maxSize < 1) {
        toast.error("Team events need a max team size.");
        return;
      }
      if (minSize !== undefined && (!Number.isFinite(minSize) || minSize < 1)) {
        toast.error("Min team size must be at least 1.");
        return;
      }
      if (minSize !== undefined && minSize > maxSize) {
        toast.error("Min team size cannot exceed max team size.");
        return;
      }
    }
    setSaving(true);
    try {
      const token = await getFreshToken();
      await convexClient.mutation(
        "tournaments:createTournament",
        {
          name: name.trim(),
          description: description.trim() || undefined,
          sport_type: sportType,
          tournament_type: tournamentType,
          entry_fee: parseFloat(entryFee) || 0,
          prize_pool: prizePool ? parseFloat(prizePool) : undefined,
          max_participants: maxTeams,
          // Solo events must not carry team sizes: the backend's own team
          // discriminator is `tournament_type`, but a stray max_team_size
          // would make the public page render team-size copy for an
          // individual event.
          min_team_size: teamMode ? minSize : undefined,
          max_team_size: teamMode ? maxSize : undefined,
          registration_deadline: new Date(regDeadline).toISOString(),
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          bracket_type: bracketType,
          // `auto_generate_bracket` is required by the mutation but is never
          // read: the bracket is only ever created by
          // tournaments:generateInitialMatches. Send a constant rather than
          // exposing a toggle that does nothing.
          auto_generate_bracket: true,
          status: "draft",
          rules: rules.trim() || undefined,
        },
        token,
      );
      toast.success("Tournament created! Publish it from Manage.");
      router.push("/tournaments/manage");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(
        getErrorMessage(err, "Failed to create tournament. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 md:px-8 w-full">
          <Link
            href="/tournaments/manage"
            className="inline-flex items-center gap-1 font-sans text-sm text-text-muted hover:text-text-main transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to my tournaments
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-brand-lime/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-brand-lime" />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-extrabold text-text-main">
                Create a tournament
              </h1>
              <p className="text-text-muted text-sm">
                Set up the basics — you can publish it from Manage.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-border-default rounded-md p-6 md:p-8 shadow-card-shadow space-y-6"
          >
            <div>
              <label className={labelCls} htmlFor="t-name">
                Tournament name *
              </label>
              <input
                id="t-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HSR Summer Cup 2026"
                className={inputCls}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sport</label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className={inputCls}
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Format</label>
                <select
                  value={tournamentType}
                  onChange={(e) => {
                    setTournamentType(e.target.value);
                    if (!isTeamMode(e.target.value)) {
                      // Solo events have no roster — drop the stale values
                      // so a later switch back starts clean.
                      setMinTeamSize("");
                      setMaxTeamSize("");
                    }
                  }}
                  className={inputCls}
                >
                  {TOURNAMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Bracket type</label>
                <select
                  value={bracketType}
                  onChange={(e) => setBracketType(e.target.value)}
                  className={inputCls}
                >
                  {BRACKET_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Max {isTeamMode(tournamentType) ? "teams" : "players"} *
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Entry fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Prize pool (₹, optional)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  className={inputCls}
                />
              </div>
              {/* Roster size only means something for a team event. */}
              {isTeamMode(tournamentType) && (
                <>
                  <div>
                    <label className={labelCls}>Min team size (optional)</label>
                    <input
                      type="number"
                      min={1}
                      max={maxTeamSize ? Number(maxTeamSize) : undefined}
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Max team size *</label>
                    <input
                      type="number"
                      min={1}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Registration deadline *</label>
                <input
                  type="datetime-local"
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Start date *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>End date *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <p className="text-xs text-text-muted">
              The bracket is generated from approved entrants after you move
              the tournament to{" "}
              <span className="font-mono">in_progress</span> on the Matches
              tab.
            </p>

            <div>
              <label className={labelCls}>Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell players what to expect…"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Rules (optional)</label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={3}
                placeholder="Format, scoring, equipment…"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold h-11 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Create tournament
                </>
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
