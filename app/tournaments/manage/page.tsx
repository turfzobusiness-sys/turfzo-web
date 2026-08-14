"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Users,
  Clock,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { isViewOnlyMode } from "@/lib/env";

interface MyTournament {
  _id: string;
  id: string;
  name: string;
  sport_type: string;
  tournament_type: string;
  entry_fee: number;
  max_participants: number;
  status: string;
  start_date: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  registration_open: "Open for registration",
  open: "Open",
  registration_closed: "Registration closed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-border-default text-text-muted",
  upcoming: "bg-sky-500/15 text-sky-500",
  registration_open: "bg-emerald-500/15 text-emerald-500",
  open: "bg-emerald-500/15 text-emerald-500",
  registration_closed: "bg-amber-500/15 text-amber-500",
  in_progress: "bg-violet-500/15 text-violet-500",
  completed: "bg-brand-lime/15 text-brand-lime",
  cancelled: "bg-error/15 text-error",
};

export default function ManageTournamentsPage() {
  const router = useRouter();
  const { status, convexUser, getFreshToken } = useAuth();
  const [tournaments, setTournaments] = useState<MyTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function load() {
      if (status !== "authenticated" || !convexUser) return;
      try {
        const token = await getFreshToken();
        const data = await convexClient.query<MyTournament[]>(
          "tournaments:getOwnerTournaments",
          { ownerId: convexUser._id },
          token,
        );
        setTournaments(data ?? []);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status, convexUser, getFreshToken]);

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

  const viewOnly = isViewOnlyMode();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-sans text-3xl font-extrabold text-text-main">
                My tournaments
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {viewOnly
                  ? "Create, publish and manage your tournaments from the Turfzo app — or set one up here and manage it below."
                  : "Create, publish and manage tournaments."}
              </p>
            </div>
            <Link
              href="/tournaments/create"
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover"
            >
              <Plus className="w-4 h-4" /> Create tournament
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-brand-lime" />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-20 bg-surface border border-border-default rounded-md">
              <Trophy className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="font-sans font-semibold text-text-main mb-1">
                No tournaments yet
              </p>
              <p className="text-sm text-text-muted">
                Create your first tournament to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/manage/${t.id}`}
                  className="bg-surface border border-border-default rounded-md p-5 shadow-card-shadow hover:border-border-strong transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h2 className="font-sans font-bold text-text-main group-hover:text-brand-lime transition-colors truncate">
                        {t.name}
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        {t.sport_type} · {t.tournament_type}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[t.status] || "bg-border-default text-text-muted"}`}
                    >
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Max{" "}
                      {t.max_participants}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(t.start_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 ml-auto text-brand-lime font-semibold">
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
