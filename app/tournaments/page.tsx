"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Calendar,
  MapPin,
  Award,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  User,
  Phone,
  Mail,
  Loader2,
  Download,
  AlertCircle,
  Users,
  Star,
  Search,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Share2,
  Heart,
} from "lucide-react";
import {
  GiSoccerBall,
  GiCricketBat,
  GiShuttlecock,
  GiTennisRacket,
  GiAmericanFootballBall,
} from "react-icons/gi";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { isViewOnlyMode } from "@/lib/env";
import QRCode from "qrcode";

interface Tournament {
  _id: string;
  _creationTime: number;
  title: string;
  sport: string;
  format: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue: string;
  city: string;
  entry_fee: number;
  prize_pool: string;
  max_teams: number;
  registered_teams: number;
  status: "upcoming" | "open" | "closed" | "live" | "completed";
  image_url?: string;
  created_at: string;
}

interface MyRegistration {
  _id: string;
  registration_code?: string;
  team_name?: string | null;
  registration_type?: string;
  status: string;
  registered_at: string;
  tournament: (Tournament & { id: string }) | null;
}

const leagueStandings = [
  {
    rank: "1",
    team: "HSR Strikers FC",
    played: "8",
    wins: "7",
    draws: "0",
    losses: "1",
    goalDiff: "+18",
    points: "21",
  },
  {
    rank: "2",
    team: "Koramangala Wizards",
    played: "8",
    wins: "6",
    draws: "1",
    losses: "1",
    goalDiff: "+12",
    points: "19",
  },
  {
    rank: "3",
    team: "Indiranagar Blazers",
    played: "8",
    wins: "5",
    draws: "2",
    losses: "1",
    goalDiff: "+8",
    points: "17",
  },
  {
    rank: "4",
    team: "Whitefield Rovers",
    played: "8",
    wins: "4",
    draws: "1",
    losses: "3",
    goalDiff: "+2",
    points: "13",
  },
  {
    rank: "5",
    team: "Marathahalli Titans",
    played: "8",
    wins: "3",
    draws: "0",
    losses: "5",
    goalDiff: "-4",
    points: "9",
  },
];

const topScorers = [
  { name: "Rahul Sharma", team: "HSR Strikers FC", goals: "12" },
  { name: "Amit Patel", team: "Koramangala Wizards", goals: "9" },
  { name: "Vikram Singh", team: "Indiranagar Blazers", goals: "8" },
];

const reviewRatings = [
  { label: "Competitive Intensity", score: "4.8" },
  { label: "Event Organization", score: "4.9" },
  { label: "Pitch & Court Quality", score: "4.9" },
  { label: "Referee Officiating", score: "4.7" },
  { label: "Hydration & Amenities", score: "4.8" },
  { label: "Prize Pool Value", score: "4.9" },
];

type RegStep = "closed" | "form" | "processing" | "confirmed" | "error";

/**
 * Strips a phone number to the bare 10-digit national format expected by
 * the registration form. The stored profile number is E.164 (+91...), but
 * the form and Cashfree require a 10-digit Indian mobile.
 */
function toNationalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TournamentsPage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser, getFreshToken } = useAuth();
  const viewOnly = isViewOnlyMode();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [regStep, setRegStep] = useState<RegStep>("closed");
  const [regError, setRegError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"standings" | "scorers">(
    "standings",
  );

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");

  const [registrationCode, setRegistrationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [downloadQrUrl, setDownloadQrUrl] = useState("");

  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [myRegQrs, setMyRegQrs] = useState<Record<string, string>>({});

  const [searchSport, setSearchSport] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const data = await convexClient.query<Tournament[]>(
          "tournaments:getOpen",
          {},
        );
        // NOTE: no mock fallback — mock mode is served by the mock
        // client (lib/mock-convex.ts); an empty live result means no
        // open tournaments right now.
        setTournaments(data ?? []);
        if (data && data.length > 0) {
          setSelectedTournament(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchMyRegistrations() {
      if (status !== "authenticated" || !convexUser) {
        setMyRegistrations([]);
        return;
      }
      try {
        const token = await getFreshToken();
        const data = await convexClient.query<MyRegistration[]>(
          "tournaments:getMyRegistrations",
          { userId: convexUser._id },
          token,
        );
        if (cancelled) return;
        setMyRegistrations(data ?? []);
        const qrs: Record<string, string> = {};
        for (const reg of data ?? []) {
          if (!reg.registration_code) continue;
          const payload = JSON.stringify({
            code: reg.registration_code,
            tournament: reg.tournament?.title ?? "Tournament",
            team: reg.team_name ?? "Individual",
          });
          qrs[reg._id] = await QRCode.toDataURL(payload, {
            width: 256,
            margin: 1,
          });
        }
        if (!cancelled) setMyRegQrs(qrs);
      } catch (err) {
        console.error("Failed to fetch my registrations:", err);
      }
    }
    fetchMyRegistrations();
    return () => {
      cancelled = true;
    };
  }, [status, convexUser, getFreshToken]);

  const filteredTournaments = tournaments.filter((t) => {
    const matchSport =
      searchSport === "all" ||
      t.sport.toLowerCase() === searchSport.toLowerCase();
    const matchCity =
      !searchCity || t.city.toLowerCase().includes(searchCity.toLowerCase());
    const matchQuery =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchCity && matchQuery;
  });

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleOpenRegistration = (t: Tournament) => {
    if (viewOnly) return;
    if (status !== "authenticated") {
      router.push("/auth/login?redirect=/tournaments");
      return;
    }
    setSelectedTournament(t);
    if (convexUser) {
      setCaptainName(
        convexUser.full_name && convexUser.full_name.trim() !== ""
          ? convexUser.full_name
          : convexUser.display_name && convexUser.display_name.trim() !== ""
            ? convexUser.display_name
            : firebaseUser?.displayName
              ? firebaseUser.displayName
              : ((convexUser.email ?? firebaseUser?.email)?.split("@")[0] ??
                ""),
      );
      setCaptainEmail(convexUser.email ?? firebaseUser?.email ?? "");
      setCaptainPhone(
        toNationalNumber(convexUser.phone_number ?? ""),
      );
    }
    setRegError(null);
    setRegStep("form");
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    if (
      !selectedTournament ||
      !teamName ||
      !captainName ||
      !captainEmail ||
      !captainPhone
    ) {
      setRegError("Please fill in all fields.");
      return;
    }
    if (!/^\d{10}$/.test(captainPhone)) {
      setRegError("Please enter a valid 10-digit phone number.");
      return;
    }
    setRegStep("processing");
    setRegError(null);

    let paymentOrderId: string | undefined;
    let token: string | undefined;

    try {
      console.log("[Tournament Reg] Step 0: Refreshing auth token...");
      token = await getFreshToken();
      console.log("[Tournament Reg] Token refreshed:", token ? "yes" : "NO TOKEN");

      // Paid tournaments: order → Cashfree checkout → server-side
      // verification. Free tournaments (entry_fee = 0) skip payment — the
      // backend accepts registrations without a payment order for them.
      if (selectedTournament.entry_fee > 0) {
        // ── Step 1: Create a Cashfree order for the entry fee ──
        console.log("[Tournament Reg] Step 1: Creating Cashfree order via payments:createTournamentOrder...");
        const order = await convexClient.action<{
          success: boolean;
          cf_order_id: string;
          payment_session_id: string;
          order_amount: number;
          error?: string;
        }>(
          "payments:createTournamentOrder",
          {
            tournament_id: selectedTournament._id,
            customer_name: captainName,
            customer_email: captainEmail,
            customer_phone: captainPhone,
          },
          token
        );
        console.log("[Tournament Reg] Step 1 result:", order);
        if (!order.success || !order.payment_session_id) {
          throw new Error(order.error || "Failed to initialize payment session.");
        }

        // ── Step 2: Open the Cashfree checkout modal ──
        console.log("[Tournament Reg] Step 2: Opening Cashfree checkout modal...");
        await openCashfreeCheckout({
          paymentSessionId: order.payment_session_id,
        });
        console.log("[Tournament Reg] Step 2 complete: Cashfree checkout done.");

        // ── Step 3: Verify the payment server-side (single source of truth) ──
        console.log("[Tournament Reg] Step 3: Verifying payment via payments:verifyTournamentCashfreePayment...");
        const verify = await convexClient.action<{
          success: boolean;
          payment_verified: boolean;
          payment_id?: string;
          error?: string;
        }>(
          "payments:verifyTournamentCashfreePayment",
          {
            cf_order_id: order.cf_order_id,
          },
          token
        );
        console.log("[Tournament Reg] Step 3 result:", verify);
        if (!verify.success || !verify.payment_verified) {
          throw new Error(verify.error || "Payment verification failed.");
        }
        paymentOrderId = order.cf_order_id;
      }

      // ── Step 4: Register the team with the verified payment order ID ──
      console.log("[Tournament Reg] Step 4: Registering team via tournaments:register...");
      const registration = await convexClient.mutation<{
        registration_code: string;
        team_name: string;
        _id: string;
      }>(
        "tournaments:register",
        {
          tournament_id: selectedTournament._id,
          team_name: teamName,
          captain_name: captainName,
          captain_email: captainEmail,
          captain_phone: captainPhone,
          entry_fee_paid: selectedTournament.entry_fee,
          ...(paymentOrderId ? { payment_order_id: paymentOrderId } : {}),
        },
        token
      );
      console.log("[Tournament Reg] Step 4 result:", registration);

      setRegistrationCode(registration.registration_code);
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === selectedTournament._id
            ? {
                ...t,
                registered_teams: Math.min(t.registered_teams + 1, t.max_teams),
              }
            : t,
        ),
      );
      setSelectedTournament((prev) =>
        prev
          ? {
              ...prev,
              registered_teams: Math.min(
                prev.registered_teams + 1,
                prev.max_teams,
              ),
            }
          : null,
      );

      const qrPayload = JSON.stringify({
        code: registration.registration_code,
        tournament: selectedTournament.title,
        team: teamName,
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 256,
        margin: 1,
      });
      setQrCodeUrl(qrDataUrl);
      setDownloadQrUrl(qrDataUrl);
      setRegStep("confirmed");
    } catch (err) {
      console.error("[Tournament Reg] FAILED:", err);
      // SECURITY (T13): payment was verified but registration failed (full,
      // deadline, duplicate, etc.) — auto-refund the unconsumed entry fee so
      // the player's money isn't stuck.
      if (paymentOrderId) {
        try {
          await convexClient.action(
            "payments:refundTournamentEntry",
            { cf_order_id: paymentOrderId },
            token,
          );
        } catch (refundErr) {
          console.error(
            "[Tournament Reg] Refund request failed:",
            refundErr,
          );
          // SECURITY (T13): payment verified but registration failed AND the
          // auto-refund also failed — tell the player their money may be
          // stuck so they contact support instead of silently losing it.
          setRegError(
            "Your payment was collected but your registration could not be completed, and your entry fee refund could not be processed automatically. Please contact support for a manual refund.",
          );
          setRegStep("error");
          return;
        }
      }
      const { getErrorMessage } = await import("@/lib/errors");
      setRegError(
        getErrorMessage(err, "Registration failed. Please try again."),
      );
      setRegStep("error");
    }
  };

  const handleDownloadTicket = () => {
    if (!downloadQrUrl) return;
    const link = document.createElement("a");
    link.href = downloadQrUrl;
    link.download = `turfzo-tournament-${registrationCode}.png`;
    link.click();
  };

  // Switch to details page
  const openDetails = (t: Tournament) => {
    setSelectedTournament(t);
    setViewMode("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        {viewMode === "list" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative -mt-24 overflow-hidden min-h-[320px] sm:min-h-[380px] flex flex-col items-start justify-end mb-6"
          >
            <div
              className="absolute inset-0 bg-cover bg-center z-0 opacity-50"
              style={{ backgroundImage: `url('/stadium_light_bg.png')` }}
            />
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
              }}
            />
            <div className="relative z-10 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full pb-10 sm:pb-14">
              <h1 className="font-[family-name:var(--font-anton)] text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-[1.1] tracking-wide mb-2">
                Leagues &<br />
                Tournaments
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl">
                Register your team, climb the regional leaderboards, and compete
                for grand cash prizes on the finest turfs.
              </p>
            </div>
          </motion.section>
        )}

        {/* ORGANIZER HIGHLIGHT SECTION */}
        {viewMode === "list" && (
          <section className="max-w-[1280px] mx-auto px-6 md:px-10 w-full mb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-surface border border-border-default rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-lime/15 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 text-brand-lime" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Organize Your Tournament
                  </h3>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary">
                  {[
                    "Create tournaments with entry fees, team caps, sizes & rules",
                    "Auto single-elimination bracket generation",
                    "Full lifecycle management — open → in progress → completed",
                    "Entry-fee collection via Cashfree with auto-refund",
                    "Registration pass codes for controlled entry",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-lime flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => router.push("/tournaments/create")}
                className="flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-bg font-semibold px-6 py-3 rounded-xl transition-colors text-sm cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                Create Tournament <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </section>
        )}

        <div className="max-w-[1280px] mx-auto px-6 md:px-10 w-full">
          {/* ========================================================
              VIEW 1: TOURNAMENTS LIST VIEW
              ======================================================== */}
          {viewMode === "list" && (
            <div>
              {/* Category Strip Row */}
              <div className="border-b border-border-default mt-2 mb-6">
                <div className="flex gap-10 overflow-x-auto scrollbar-none pb-0 justify-start sm:justify-center items-center">
                  {[
                    { id: "all", label: "All Sports", icon: Trophy },
                    { id: "Football", label: "Football", icon: GiSoccerBall },
                    { id: "Cricket", label: "Cricket", icon: GiCricketBat },
                    {
                      id: "Badminton",
                      label: "Badminton",
                      icon: GiShuttlecock,
                    },
                    { id: "Tennis", label: "Tennis", icon: GiTennisRacket },
                    {
                      id: "Multipurpose",
                      label: "Multipurpose",
                      icon: GiAmericanFootballBall,
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isActive = searchSport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSearchSport(s.id)}
                        className={`flex flex-col items-center gap-2 pb-3.5 cursor-pointer border-b-2 transition-all duration-200 relative -mb-[2px]
                          ${
                            isActive
                              ? "border-text-main text-text-main opacity-100 font-semibold"
                              : "border-transparent text-text-muted opacity-55 hover:opacity-100 hover:text-text-main"
                          }`}
                      >
                        <Icon className="w-7 h-7 shrink-0" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Filters and Count Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="text-sm text-text-muted font-medium">
                  {filteredTournaments.length} tournament
                  {filteredTournaments.length !== 1 ? "s" : ""} available
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* City filter */}
                  <div className="flex items-center gap-2 w-full sm:w-44 bg-surface border border-border-default rounded-xl px-3.5 py-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter city..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                    />
                    {searchCity && (
                      <button
                        onClick={() => setSearchCity("")}
                        className="text-text-muted hover:text-text-main"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Keyword Search */}
                  <div className="flex items-center gap-2 w-full sm:w-56 bg-surface border border-border-default rounded-xl px-3.5 py-2 shrink-0">
                    <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search tournament name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-text-muted hover:text-text-main"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* My Registrations — persisted tournament passes */}
              {myRegistrations.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-brand-lime" />
                      My Registrations
                    </h2>
                    <span className="text-xs text-text-muted font-medium">
                      {myRegistrations.length} pass
                      {myRegistrations.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRegistrations.map((reg) => {
                      const t = reg.tournament;
                      return (
                        <div
                          key={reg._id}
                          className="bg-elevated border border-border-default rounded-2xl p-5"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-dashed border-border-strong mb-4">
                            <span className="font-extrabold text-brand-lime text-base tracking-wide">
                              {reg.registration_code ?? "No pass ID"}
                            </span>
                            <span className="bg-brand-lime text-bg text-[9px] font-black px-2.5 py-1 rounded-md uppercase">
                              {reg.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {reg.status === "approved" &&
                            myRegQrs[reg._id] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={myRegQrs[reg._id]}
                                alt="Tournament Pass QR"
                                className="w-28 h-28 rounded-xl bg-white p-1.5 border border-border-default shrink-0"
                              />
                            ) : (
                              <div className="w-28 h-28 rounded-xl border border-dashed border-border-strong flex flex-col items-center justify-center gap-1.5 bg-surface shrink-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                                  {reg.status === "approved"
                                    ? "Loading pass…"
                                    : reg.status === "rejected"
                                      ? "Rejected"
                                      : "Pending approval"}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                                Tournament
                              </span>
                              <span className="font-bold text-text-main text-sm line-clamp-2">
                                {t?.title ?? "Tournament"}
                              </span>
                              <span className="block mt-1.5 text-[8px] text-text-muted uppercase tracking-wider font-bold">
                                {reg.team_name ? "Team" : "Entrant"}
                              </span>
                              <span className="font-semibold text-text-main text-xs truncate">
                                {reg.team_name ?? "Individual"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-default">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                              {reg.status === "approved"
                                ? "Scan at venue gate"
                                : reg.status === "rejected"
                                  ? "Not admitted — registration rejected"
                                  : "Admitted after organizer approval"}
                            </span>
                            {reg.status === "approved" && reg.registration_code && (
                              <a
                                href={myRegQrs[reg._id]}
                                download={`turfzo-pass-${reg.registration_code}.png`}
                                className="flex items-center gap-1.5 bg-text-main hover:bg-text-main/90 text-bg text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Pass
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tournament Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                  <p className="text-sm text-text-muted">
                    Loading tournaments list...
                  </p>
                </div>
              ) : filteredTournaments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-border-default rounded-2xl text-center p-8">
                  <Trophy
                    className="w-14 h-14 text-text-muted"
                    strokeWidth={1.2}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-text-main">
                      No tournaments found
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      We couldn&apos;t find any tournaments matching your
                      filters. Try resetting the search filters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchSport("all");
                      setSearchCity("");
                      setSearchQuery("");
                    }}
                    className="mt-2 bg-text-main hover:bg-text-main/90 text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTournaments.map((t) => {
                    const spotsLeft = t.max_teams - t.registered_teams;
                    const isFull = spotsLeft <= 0;
                    const progressPercent =
                      (t.registered_teams / t.max_teams) * 100;
                    const inWishlist = wishlist.includes(t._id);

                    return (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => openDetails(t)}
                        className="bg-surface border border-border-default rounded-2xl overflow-hidden hover:shadow-lg hover:border-border-strong transition-all duration-300 cursor-pointer group flex flex-col h-full relative"
                      >
                        {/* Wishlist and Share */}
                        <button
                          onClick={(e) => toggleWishlist(t._id, e)}
                          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-bg/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${inWishlist ? "fill-brand-lime text-brand-lime" : "text-white"}`}
                          />
                        </button>

                        {/* Image banner */}
                        <div className="relative w-full h-48 bg-elevated overflow-hidden shrink-0">
                          <Image
                            src={t.image_url || "/stadium_turf_bg.png"}
                            alt={t.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-bg/80 dark:bg-surface/80 backdrop-blur-md text-text-main text-[10px] font-bold px-2.5 py-1 rounded-md border border-border-default">
                              {t.sport}
                            </span>
                            <span className="bg-brand-lime text-bg text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                              {t.format}
                            </span>
                          </div>
                        </div>

                        {/* Card body content */}
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              <span className="truncate">
                                {t.venue}, {t.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                              <Calendar className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              <span>Starts {formatDate(t.start_date)}</span>
                            </div>

                            <h3 className="text-lg font-bold text-text-main leading-tight mb-2 group-hover:text-brand-lime transition-colors duration-200">
                              {t.title}
                            </h3>

                            {/* Spot status indicator */}
                            <div className="mt-4 pt-1">
                              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                                <span className="text-text-muted">
                                  Teams Registered
                                </span>
                                <span className="text-text-main">
                                  {t.registered_teams}/{t.max_teams}
                                </span>
                              </div>
                              {/* Glowing green progress bar */}
                              <div className="h-2 w-full bg-border-default rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-brand-lime rounded-full transition-all duration-500 relative"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="block text-[10px] font-medium text-text-muted mt-1.5">
                                {isFull
                                  ? "Registration Closed"
                                  : `${spotsLeft} team slots left`}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-border-default mt-5 pt-4 flex items-center justify-between">
                            <div>
                              <span className="block text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                                Entry Fee
                              </span>
                              <span className="text-lg font-extrabold text-brand-lime">
                                ₹{t.entry_fee.toLocaleString("en-IN")}
                                <span className="text-xs text-text-muted font-normal ml-0.5">
                                  /team
                                </span>
                              </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-text-main group-hover:text-brand-lime transition-colors duration-200">
                              View details{" "}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 2: AIRBNB-STYLE DETAILS VIEW
              ======================================================== */}
          {viewMode === "details" && selectedTournament && (
            <div>
              {/* Top Navigation breadcrumbs and share options */}
              <div className="flex items-center justify-between pb-6">
                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2 text-sm font-semibold text-text-main hover:text-brand-lime transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                  Back to all tournaments
                </button>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <button className="flex items-center gap-1.5 text-text-main hover:text-brand-lime transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(selectedTournament._id, e)}
                    className="flex items-center gap-1.5 text-text-main hover:text-brand-lime transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${wishlist.includes(selectedTournament._id) ? "fill-brand-lime text-brand-lime" : ""}`}
                    />
                    {wishlist.includes(selectedTournament._id)
                      ? "Saved"
                      : "Save"}
                  </button>
                </div>
              </div>

              {/* Title Header */}
              <div className="pb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                  {selectedTournament.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted mt-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-text-main text-text-main" />{" "}
                    4.9
                  </span>
                  <span>·</span>
                  <span className="underline cursor-pointer hover:text-text-main">
                    12 reviews
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-semibold text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime" />{" "}
                    {selectedTournament.venue}, {selectedTournament.city}
                  </span>
                </div>
              </div>

              {/* Airbnb-style Photo Grid Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden bg-elevated relative h-[300px] md:h-[420px]">
                {/* Left Large Photo */}
                <div className="md:col-span-2 relative h-full w-full overflow-hidden group">
                  <Image
                    src={selectedTournament.image_url || "/stadium_turf_bg.png"}
                    alt={selectedTournament.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover group-hover:brightness-95 transition-all duration-300"
                  />
                </div>
                {/* Right stacked photos */}
                <div className="hidden md:flex flex-col gap-3 h-full">
                  <div className="relative flex-1 w-full overflow-hidden group">
                    <Image
                      src="/feature_verified.jpg"
                      alt="Verified turf conditions"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:brightness-95 transition-all duration-300"
                    />
                  </div>
                  <div className="relative flex-1 w-full overflow-hidden group">
                    <Image
                      src="/stadium_cinematic_bg.png"
                      alt="Cinematic stadium lighting"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:brightness-95 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Show all photos floating button */}
                <button className="absolute bottom-6 right-6 bg-surface border border-border-strong text-text-main hover:bg-elevated transition-colors text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md">
                  <Info className="w-3.5 h-3.5" /> Show all photos
                </button>
              </div>

              {/* Airbnb-style Split Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 mt-8 items-start">
                {/* LEFT COLUMN: Tournament details info */}
                <div className="space-y-6">
                  {/* Overview details */}
                  <div className="pb-6 border-b border-border-default">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                      {selectedTournament.format} organized by Turfzo
                    </h2>
                    <p className="text-text-muted mt-1 text-sm">
                      {selectedTournament.max_teams} Teams tournament capacity ·
                      Matches on {selectedTournament.sport} turf · Trophy &
                      medal ceremony
                    </p>
                  </div>

                  {/* Host Info Box */}
                  <div className="pb-6 border-b border-border-default flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime font-bold text-lg border border-brand-lime/30 shrink-0">
                        TZ
                      </div>
                      <div>
                        <h3 className="font-bold text-text-main">
                          Hosted by Turfzo Sports
                        </h3>
                        <p className="text-xs text-text-muted">
                          Superhost · 3 seasons organizing local leagues
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1 bg-brand-lime/10 text-brand-lime rounded-full border border-brand-lime/20 shrink-0">
                      <Award className="w-3.5 h-3.5" /> Verified Host
                    </div>
                  </div>

                  {/* Highlight checklist list */}
                  <div className="pb-6 border-b border-border-default space-y-5">
                    {/* Item 1 */}
                    <div className="flex items-start gap-4">
                      <Zap className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">
                          Instant Digital Pass
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Complete team entry payment to receive a download pass
                          and QR ticket to check in at venue gate.
                        </p>
                      </div>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">
                          AIFF Certified Referees
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Professional officiating for all league and knockout
                          stage matches to ensure fair gameplay.
                        </p>
                      </div>
                    </div>
                    {/* Item 3 */}
                    <div className="flex items-start gap-4">
                      <Users className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">
                          Spectator & Stream Friendly
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Family seating zones, hydration setups, and live game
                          updates for fans attending or checking scores online.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* About rules / description block */}
                  <div className="pb-6 border-b border-border-default">
                    <h3 className="text-lg font-bold text-text-main mb-3">
                      About this tournament
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                      {selectedTournament.description}
                    </p>
                  </div>

                  {/* What is provided / Amenities Grid */}
                  <div className="pb-6 border-b border-border-default">
                    <h3 className="text-lg font-bold text-text-main mb-4">
                      What this tournament offers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                      {[
                        {
                          label: "BWF certified shuttles / FIFA grass turf",
                          icon: <Award className="w-4 h-4 text-text-muted" />,
                        },
                        {
                          label: "Free vehicle parking on premises",
                          icon: <Users className="w-4 h-4 text-text-muted" />,
                        },
                        {
                          label: "Hydration & energy drink station",
                          icon: <Info className="w-4 h-4 text-text-muted" />,
                        },
                        {
                          label: "Changing rooms & shower amenities",
                          icon: <User className="w-4 h-4 text-text-muted" />,
                        },
                        {
                          label: "Live scoring updates & screen",
                          icon: (
                            <Sparkles className="w-4 h-4 text-text-muted" />
                          ),
                        },
                        {
                          label: "On-site first aid & medical kit",
                          icon: (
                            <ShieldCheck className="w-4 h-4 text-text-muted" />
                          ),
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm text-text-main"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* League leaderboards & Competitive review ratings */}
                  <div className="pb-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-1.5 mb-2">
                      <Star className="w-5 h-5 fill-text-main text-text-main" />{" "}
                      4.9 · 12 tournament ratings
                    </h3>
                    <p className="text-xs text-text-muted mb-6">
                      Metrics calculated from surveys collected from team
                      captains during past tournament seasons.
                    </p>

                    {/* Progress bars matching Airbnb design */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                      {reviewRatings.map((rating, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-sm text-text-main">
                            {rating.label}
                          </span>
                          <div className="flex items-center gap-3 shrink-0 w-36 sm:w-44">
                            <div className="h-1.5 flex-grow bg-border-default rounded-full overflow-hidden">
                              <div
                                className="h-full bg-text-main rounded-full"
                                style={{
                                  width: `${(parseFloat(rating.score) / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-text-main text-right w-5">
                              {rating.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Standings & Stats tab interface */}
                    <div className="bg-surface border border-border-default rounded-2xl p-5 mt-8 shadow-sm">
                      <div className="flex border-b border-border-default pb-3 mb-4 gap-4">
                        <button
                          onClick={() => setActiveTab("standings")}
                          className={`text-sm font-bold pb-1 cursor-pointer transition-colors border-b-2
                            ${
                              activeTab === "standings"
                                ? "border-brand-lime text-brand-lime"
                                : "border-transparent text-text-muted hover:text-text-main"
                            }`}
                        >
                          League Standings
                        </button>
                        <button
                          onClick={() => setActiveTab("scorers")}
                          className={`text-sm font-bold pb-1 cursor-pointer transition-colors border-b-2
                            ${
                              activeTab === "scorers"
                                ? "border-brand-lime text-brand-lime"
                                : "border-transparent text-text-muted hover:text-text-main"
                            }`}
                        >
                          Golden Boot
                        </button>
                      </div>

                      {activeTab === "standings" && (
                        <div className="overflow-x-auto scrollbar-none">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="text-text-muted border-b border-border-default font-semibold text-[10px] uppercase tracking-wider">
                                <th className="pb-3 pr-2">#</th>
                                <th className="pb-3">Team</th>
                                <th className="pb-3 text-center">P</th>
                                <th className="pb-3 text-center">GD</th>
                                <th className="pb-3 text-right">Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leagueStandings.map((row) => (
                                <tr
                                  key={row.rank}
                                  className="border-b border-border-subtle last:border-b-0"
                                >
                                  <td className="py-3 font-bold text-text-muted pr-2">
                                    {row.rank}
                                  </td>
                                  <td className="py-3 font-semibold text-text-main">
                                    {row.team}
                                  </td>
                                  <td className="py-3 text-center text-text-muted">
                                    {row.played}
                                  </td>
                                  <td className="py-3 text-center font-semibold text-brand-lime">
                                    {row.goalDiff}
                                  </td>
                                  <td className="py-3 text-right font-extrabold text-brand-lime">
                                    {row.points}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeTab === "scorers" && (
                        <div className="space-y-4">
                          {topScorers.map((scorer, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between pb-3 border-b border-border-subtle last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-elevated border border-border-default flex items-center justify-center text-xs font-bold text-text-main">
                                  {scorer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <span className="block text-sm font-semibold text-text-main">
                                    {scorer.name}
                                  </span>
                                  <span className="block text-[10px] text-text-muted mt-0.5">
                                    {scorer.team}
                                  </span>
                                </div>
                              </div>
                              <span className="bg-brand-lime/10 text-brand-lime text-xs font-bold px-3 py-1 rounded-full border border-brand-lime/15">
                                {scorer.goals} goals
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Sticky Reservation card widget (Airbnb-style) */}
                <div className="sticky top-28 bg-surface border border-border-default rounded-2xl p-6 shadow-md space-y-4">
                  {/* Price info header */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-text-main">
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-text-muted font-medium ml-1">
                        / team entry
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Star className="w-3 h-3 fill-text-main text-text-main" />{" "}
                      4.9 ·
                      <span className="underline cursor-pointer hover:text-text-main">
                        12 reviews
                      </span>
                    </div>
                  </div>

                  {/* Grid fields box selector */}
                  <div className="border border-border-strong rounded-xl overflow-hidden text-xs bg-bg">
                    {/* Top half split */}
                    <div className="grid grid-cols-2 border-b border-border-strong">
                      <div className="p-3 border-r border-border-strong">
                        <label className="block text-[9px] uppercase font-bold text-text-muted">
                          Sport format
                        </label>
                        <span className="font-semibold text-text-main mt-0.5 block truncate">
                          {selectedTournament.format}
                        </span>
                      </div>
                      <div className="p-3">
                        <label className="block text-[9px] uppercase font-bold text-text-muted">
                          Schedule Date
                        </label>
                        <span className="font-semibold text-text-main mt-0.5 block truncate">
                          {new Date(
                            selectedTournament.start_date,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {/* Bottom half */}
                    <div className="p-3">
                      <label className="block text-[9px] uppercase font-bold text-text-muted">
                        Venue Arena
                      </label>
                      <span className="font-semibold text-text-main mt-0.5 block truncate">
                        {selectedTournament.venue}
                      </span>
                    </div>
                  </div>

                  {/* Action Register Button */}
                  {selectedTournament.max_teams -
                    selectedTournament.registered_teams <=
                  0 ? (
                    <button
                      disabled
                      className="w-full bg-border-default text-text-muted font-bold text-sm py-3.5 rounded-xl cursor-not-allowed text-center"
                    >
                      Registration Full
                    </button>
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
                        Tournament registrations are available on the Turfzo
                        app only.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRegistration(selectedTournament)}
                      className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      Register Team
                    </button>
                  )}

                  {/* subtext information */}
                  <p className="text-center text-xs text-text-muted">
                    Instant confirmation. Team brackets update live.
                  </p>

                  <div className="border-t border-border-default my-4" />

                  {/* Fee calculation breakdown */}
                  <div className="space-y-2.5 text-sm text-text-muted">
                    <div className="flex justify-between">
                      <span className="underline">Entry fee</span>
                      <span className="text-text-main">
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Turfzo convenience fee</span>
                      <span className="text-text-main">₹0</span>
                    </div>
                    <div className="flex justify-between font-bold text-text-main border-t border-border-default pt-2.5 text-base">
                      <span>Total</span>
                      <span>
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Remaining slots alert */}
                  {selectedTournament.max_teams -
                    selectedTournament.registered_teams >
                    0 && (
                    <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/15 text-center text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 mt-2">
                      <Info className="w-4 h-4 text-brand-lime shrink-0" />
                      Only{" "}
                      {selectedTournament.max_teams -
                        selectedTournament.registered_teams}{" "}
                      team slots left!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          REGISTRATION CHECKOUT MODALS
          ======================================================== */}
      <AnimatePresence>
        {regStep !== "closed" && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setRegStep("closed")}
            />

            {/* Step 1: Data Input Form */}
            {regStep === "form" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-default">
                  <h3 className="text-lg font-bold text-text-main">
                    Team Registration
                  </h3>
                  <button
                    onClick={() => setRegStep("closed")}
                    className="p-1 hover:bg-elevated rounded-full border border-border-default transition-colors text-text-muted hover:text-text-main"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center py-2 bg-elevated border border-border-default rounded-xl">
                  <span className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                    Tournament
                  </span>
                  <span className="font-bold text-text-main text-sm">
                    {selectedTournament.title}
                  </span>
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitRegistration}
                  className="flex flex-col gap-4 text-xs font-medium"
                >
                  {/* Team Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={50}
                      placeholder="Enter team / club name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-bg border border-border-strong rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                    />
                  </div>

                  {/* Captain Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Captain Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={50}
                        placeholder="Enter captain name"
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        minLength={10}
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        value={captainPhone}
                        onChange={(e) =>
                          setCaptainPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="bg-elevated border border-border-default rounded-xl p-4 flex justify-between items-center mt-1">
                    <span className="text-sm font-semibold text-text-muted">
                      Total Entry Fee
                    </span>
                    <span className="text-lg font-extrabold text-brand-lime">
                      ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all mt-2 cursor-pointer text-center shadow-sm active:scale-[0.99]"
                  >
                    Pay & Register Team
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Processing Loader */}
            {regStep === "processing" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-2xl max-w-sm w-full p-8 shadow-2xl z-10 flex flex-col items-center justify-center gap-4 text-center"
              >
                <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                <h3 className="text-lg font-bold text-text-main">
                  Processing Registration
                </h3>
                <p className="text-xs text-text-muted">
                  Booking your squad slot in the tournament bracket...
                </p>
              </motion.div>
            )}

            {/* Step 3: Registration Confirmed Pass */}
            {regStep === "confirmed" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 text-center"
              >
                <div className="w-16 h-16 bg-brand-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-lime/20">
                  <Check className="w-8 h-8 text-brand-lime" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-extrabold text-text-main">
                  Team Registered!
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {selectedTournament.entry_fee > 0
                    ? "Your team has successfully secured a tournament slot."
                    : "Registration submitted — pending organizer approval."}
                </p>

                {/* Ticket Receipt Pass */}
                <div className="bg-bg border border-border-default rounded-2xl p-5 mt-6 text-left relative overflow-hidden">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-strong mb-4">
                    <div>
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Registration Pass ID
                      </span>
                      <span className="font-extrabold text-brand-lime text-base tracking-wide">
                        {registrationCode}
                      </span>
                    </div>
                    <span className="bg-brand-lime text-bg text-[9px] font-black px-2.5 py-1 rounded-md uppercase">
                      {selectedTournament.entry_fee > 0 ? "Paid" : "Free"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Tournament
                    </span>
                    <span className="font-bold text-text-main text-sm">
                      {selectedTournament.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Team Name
                      </span>
                      <span className="font-semibold text-text-main text-xs">
                        {teamName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Captain
                      </span>
                      <span className="font-semibold text-text-main text-xs">
                        {captainName}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Venue Arena
                      </span>
                      <span className="font-semibold text-text-main text-xs">
                        {selectedTournament.venue}
                      </span>
                    </div>
                  </div>

                  {/* QR Code Pass scan */}
                  <div className="border-t border-dashed border-border-strong pt-4 flex flex-col items-center gap-2.5">
                    {qrCodeUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCodeUrl}
                        alt="Tournament Pass QR"
                        className="w-28 h-28 rounded-xl bg-white p-1.5 border border-border-default"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-elevated animate-pulse rounded-xl" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                      Scan at venue gate to check in
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={handleDownloadTicket}
                    className="w-full bg-elevated border border-border-default hover:bg-bg text-text-main font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Digital Pass
                  </button>
                  <button
                    onClick={() => setRegStep("closed")}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Error Block */}
            {regStep === "error" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 text-center flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/25">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-main">
                  Registration Failed
                </h3>
                <p className="text-xs text-text-muted">{regError}</p>
                <div className="flex gap-3 mt-4 w-full justify-center text-xs font-semibold">
                  <button
                    onClick={() => setRegStep("form")}
                    className="bg-brand-lime hover:bg-brand-lime-hover text-bg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setRegStep("closed")}
                    className="bg-elevated border border-border-default text-text-main px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
