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
  X,
  Check,
  User,
  Phone,
  Mail,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openRazorpayCheckout } from "@/lib/razorpay";
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

const leagueStandings = [
  { rank: "1", team: "HSR Strikers FC", played: "8", wins: "7", draws: "0", losses: "1", goalDiff: "+18", points: "21" },
  { rank: "2", team: "Koramangala Wizards", played: "8", wins: "6", draws: "1", losses: "1", goalDiff: "+12", points: "19" },
  { rank: "3", team: "Indiranagar Blazers", played: "8", wins: "5", draws: "2", losses: "1", goalDiff: "+8", points: "17" },
  { rank: "4", team: "Whitefield Rovers", played: "8", wins: "4", draws: "1", losses: "3", goalDiff: "+2", points: "13" },
  { rank: "5", team: "Marathahalli Titans", played: "8", wins: "3", draws: "0", losses: "5", goalDiff: "-4", points: "9" },
];

const topScorers = [
  { name: "Rahul Sharma", team: "HSR Strikers FC", goals: "12" },
  { name: "Amit Patel", team: "Koramangala Wizards", goals: "9" },
  { name: "Vikram Singh", team: "Indiranagar Blazers", goals: "8" },
];

type RegStep = "closed" | "form" | "processing" | "confirmed" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function TournamentsPage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [regStep, setRegStep] = useState<RegStep>("closed");
  const [regError, setRegError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");

  const [registrationCode, setRegistrationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [downloadQrUrl, setDownloadQrUrl] = useState("");

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const data = await convexClient.query<Tournament[]>("tournaments:getOpen", {});
        setTournaments(data);
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
        setLoadError("Could not load tournaments. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  const handleOpenRegistration = (t: Tournament) => {
    if (status !== "authenticated") {
      router.push("/auth/login?redirect=/tournaments");
      return;
    }
    setSelectedTournament(t);
    if (convexUser) {
      setCaptainName(convexUser.full_name ?? convexUser.display_name ?? "");
      setCaptainEmail(convexUser.email ?? firebaseUser?.email ?? "");
      setCaptainPhone(convexUser.phone_number ?? "");
    }
    setRegError(null);
    setRegStep("form");
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament || !teamName || !captainName || !captainEmail || !captainPhone) {
      setRegError("Please fill in all fields.");
      return;
    }
    setRegStep("processing");
    setRegError(null);

    const receipt = `tournament_${Date.now()}`;
    const amountInPaise = selectedTournament.entry_fee * 100;
    const clientRequestId = `tour_${firebaseUser?.uid ?? "anon"}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const order = await convexClient.action<{ id: string; key_id: string; amount: number; mock?: boolean; idempotent_replay?: boolean }>(
        "payments:createRazorpayOrder",
        { amount: amountInPaise, currency: "INR", receipt, client_request_id: clientRequestId, type: "tournament_registration" }
      );

      const paymentResponse = await openRazorpayCheckout({
        orderId: order.id,
        amountInPaise,
        description: `Registration: ${selectedTournament.title}`,
        customerName: captainName,
        customerEmail: captainEmail,
        customerPhone: captainPhone,
        notes: { tournament_id: selectedTournament._id, team_name: teamName },
      });

      const verify = await convexClient.action<{ verified: boolean; mock?: boolean }>(
        "payments:verifyRazorpayPayment",
        {
          order_id: paymentResponse.razorpay_order_id,
          payment_id: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature,
        }
      );
      if (!verify.verified) throw new Error("Payment verification failed.");

      const registration = await convexClient.mutation<{
        registration_code: string;
        team_name: string;
        _id: string;
      }>("tournaments:register", {
        tournament_id: selectedTournament._id,
        team_name: teamName,
        captain_name: captainName,
        captain_email: captainEmail,
        captain_phone: captainPhone,
        entry_fee_paid: selectedTournament.entry_fee,
        payment_order_id: order.id,
      });

      setRegistrationCode(registration.registration_code);
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === selectedTournament._id
            ? { ...t, registered_teams: Math.min(t.registered_teams + 1, t.max_teams) }
            : t
        )
      );

      const qrPayload = JSON.stringify({
        code: registration.registration_code,
        tournament: selectedTournament.title,
        team: teamName,
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1 });
      setQrCodeUrl(qrDataUrl);
      setDownloadQrUrl(qrDataUrl);
      setRegStep("confirmed");
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setRegError(msg);
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

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>Sports Tournaments | Find & Join Local Tournaments | Turfzo</title>
        <meta name="description" content="Discover and join football, cricket, and badminton tournaments in your city. Register your team, compete, and win prizes on Turfzo." />
        <link rel="canonical" href="https://turfzo.com/tournaments" />
        <meta property="og:title" content="Sports Tournaments | Turfzo" />
        <meta property="og:description" content="Find and join local sports tournaments. Register your team and compete." />
        <meta property="og:url" content="https://turfzo.com/tournaments" />
      </head>
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="relative rounded-lg overflow-hidden border border-border-default shadow-card-shadow p-8 sm:p-12 mb-12 min-h-[240px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: `url('/stadium_turf_bg.png')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent z-0" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface border border-border-default text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime mb-4">
                <Trophy className="w-3.5 h-3.5" /> Compete With The Best
              </span>
              <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Active Leagues & <span className="text-brand-lime">Tournaments</span>
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base font-sans max-w-xl leading-relaxed">
                Register your team, climb the regional leaderboards, and compete for grand cash prizes. Experience professional sports leagues hosted on the finest turfs.
              </p>
            </div>
          </div>

          {loadError && (
            <div className="bg-error/10 border border-error/20 rounded-md p-4 flex items-center gap-3 mb-8">
              <AlertCircle className="w-5 h-5 text-error shrink-0" />
              <p className="text-sm text-error font-sans">{loadError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-poppins font-bold text-xl text-text-main text-left pb-2 border-b border-border-subtle flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-lime" /> Open Registrations
              </h2>

              {loading ? (
                <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                  <h3 className="font-poppins font-bold text-lg text-text-main">Loading Tournaments</h3>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center justify-center gap-3">
                  <Trophy className="w-12 h-12 text-text-muted opacity-50" />
                  <h3 className="font-poppins font-bold text-lg text-text-main">No Open Registrations</h3>
                  <p className="text-text-muted text-sm font-sans max-w-xs">Check back soon for upcoming tournaments in your city.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {tournaments.map((t) => (
                    <motion.div
                      key={t._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-surface border border-border-default hover:border-brand-lime/10 rounded-md p-6 flex flex-col md:flex-row gap-6 transition-all duration-300 hover:shadow-card-shadow text-left"
                    >
                      <div className="relative w-full md:w-56 h-40 bg-elevated rounded-sm overflow-hidden flex-shrink-0">
                        <Image src={t.image_url || "/stadium_turf_bg.png"} alt={t.title} fill className="object-cover" />
                        <div className="absolute top-3 left-3 bg-overlay-heavy border border-border-default text-text-main font-sans font-bold text-[10px] px-2.5 py-1 rounded-pill uppercase tracking-wider select-none">
                          {t.sport}
                        </div>
                      </div>

                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <h3 className="font-poppins font-bold text-lg text-text-main hover:text-brand-lime transition-colors">
                              {t.title}
                            </h3>
                            <span className="text-[10px] font-sans font-bold bg-brand-lime/10 text-brand-lime border border-brand-lime/25 px-2.5 py-1 rounded-pill uppercase tracking-wider">
                              {t.format}
                            </span>
                          </div>

                          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" /> {t.venue}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 border-t border-border-subtle pt-4 text-xs font-sans text-text-muted">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider">Schedule</span>
                              <span className="font-semibold text-text-main">Starts {formatDate(t.start_date)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider">Prize Pool</span>
                              <span className="font-bold text-brand-lime">{t.prize_pool}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider">Slots Registered</span>
                              <span className="font-semibold text-text-main">{t.registered_teams} / {t.max_teams} Teams</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-6">
                          <div>
                            <span className="text-[9px] uppercase text-text-muted block leading-none font-sans">Registration Fee</span>
                            <span className="text-lg font-poppins font-extrabold text-brand-lime mt-1 block">
                              ₹{t.entry_fee.toLocaleString("en-IN")} <span className="text-xs text-text-muted font-normal font-sans">/Team</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenRegistration(t)}
                            disabled={t.registered_teams >= t.max_teams}
                            className="bg-brand-lime disabled:bg-elevated disabled:text-text-muted/30 hover:bg-brand-lime-hover text-black font-poppins font-bold text-xs py-3 px-6 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1"
                          >
                            {t.registered_teams >= t.max_teams ? "Slots Full" : "Register Team"}
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
              <div className="bg-surface border border-border-default rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main flex items-center gap-2 pb-3.5 border-b border-border-subtle mb-4">
                  <Award className="w-5 h-5 text-brand-lime" /> League Standings
                </h3>
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="text-text-muted border-b border-border-subtle font-semibold text-[10px] uppercase tracking-wider text-left">
                        <th className="py-2.5">Rank</th>
                        <th className="py-2.5">Team</th>
                        <th className="py-2.5 text-center">P</th>
                        <th className="py-2.5 text-center">GD</th>
                        <th className="py-2.5 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueStandings.map((row) => (
                        <tr key={row.rank} className="border-b border-border-subtle hover:bg-elevated/30 transition-colors">
                          <td className="py-3 font-bold text-text-muted pl-1">{row.rank}</td>
                          <td className="py-3 font-semibold text-text-main">{row.team}</td>
                          <td className="py-3 text-center text-text-muted">{row.played}</td>
                          <td className="py-3 text-center font-semibold text-brand-lime/80">{row.goalDiff}</td>
                          <td className="py-3 text-right font-extrabold text-brand-lime pr-1">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface border border-border-default rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main flex items-center gap-2 pb-3.5 border-b border-border-subtle mb-4">
                  <Trophy className="w-4 h-4 text-brand-lime" /> Golden Boot Leaderboard
                </h3>
                <div className="flex flex-col gap-3.5">
                  {topScorers.map((scorer, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border-subtle pb-2.5 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-elevated border border-border-default flex items-center justify-center font-poppins font-bold text-[11px] text-text-main">
                          {scorer.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-xs font-bold text-text-main">{scorer.name}</span>
                          <span className="text-[10px] text-text-muted mt-1">{scorer.team}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-brand-lime/10 text-brand-lime font-poppins font-extrabold text-xs px-2.5 py-1 rounded-pill">
                        {scorer.goals} Goals
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {regStep !== "closed" && selectedTournament && (
          <div className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4">
            {regStep === "form" && (
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-surface border border-border-default rounded-md max-w-md w-full p-6 relative shadow-card-shadow text-left"
              >
                <button onClick={() => setRegStep("closed")} className="absolute top-4 right-4 p-1.5 bg-elevated hover:bg-elevated rounded-full text-text-muted hover:text-text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <Trophy className="w-8 h-8 text-brand-lime mx-auto" />
                  <h3 className="font-poppins font-bold text-lg text-text-main mt-3">Team Registration</h3>
                  <p className="text-xs text-text-muted font-sans mt-0.5">{selectedTournament.title}</p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-xs font-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {regError}
                  </div>
                )}

                <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-4 text-xs font-sans">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Team Name</label>
                    <input type="text" required placeholder="Enter team name" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                      className="bg-elevated border border-border-subtle rounded px-4 py-2.5 text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input type="text" required placeholder="Enter captain name" value={captainName} onChange={(e) => setCaptainName(e.target.value)}
                        className="bg-elevated border border-border-subtle rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Mobile Number</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input type="tel" required placeholder="Enter phone number" value={captainPhone} onChange={(e) => setCaptainPhone(e.target.value)}
                        className="bg-elevated border border-border-subtle rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Email</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input type="email" required placeholder="Enter email address" value={captainEmail} onChange={(e) => setCaptainEmail(e.target.value)}
                        className="bg-elevated border border-border-subtle rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30" />
                    </div>
                  </div>

                  <div className="bg-elevated p-3.5 rounded border border-border-subtle flex justify-between items-center mt-2">
                    <span className="font-semibold text-text-muted">Total Registration Fee</span>
                    <span className="font-poppins font-extrabold text-sm text-brand-lime">₹{selectedTournament.entry_fee.toLocaleString("en-IN")}</span>
                  </div>

                  <button type="submit" className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3 rounded-md transition-all mt-2 flex items-center justify-center gap-1.5">
                    Pay & Register Team
                  </button>
                </form>
              </motion.div>
            )}

            {regStep === "processing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2.5]" />
                <h3 className="font-poppins font-bold text-lg text-text-main mt-2">Processing Registration</h3>
                <p className="text-xs text-text-muted max-w-xs font-sans">Booking slot in the league brackets...</p>
              </motion.div>
            )}

            {regStep === "confirmed" && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface border border-border-default rounded-md max-w-md w-full p-6 relative shadow-card-shadow text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-glow-lime select-none mb-4">
                  <Check className="w-8 h-8 text-brand-lime stroke-[3]" />
                </div>
                <h3 className="font-poppins font-bold text-xl text-text-main">Team Registered!</h3>
                <p className="text-xs text-text-muted font-sans mt-1">Your team has been successfully placed in the brackets.</p>

                <div className="relative w-full bg-elevated border border-border-subtle rounded p-5 mt-6 text-left flex flex-col gap-4 overflow-hidden">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-surface rounded-full border-r border-border-default" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-surface rounded-full border-l border-border-default" />

                  <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-border-default font-sans">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-muted uppercase">Tournament Pass ID</span>
                      <span className="font-poppins font-bold text-brand-lime text-sm tracking-wide">{registrationCode}</span>
                    </div>
                    <span className="bg-brand-lime/10 text-brand-lime font-bold text-[9px] border border-brand-lime/10 px-2 py-0.5 rounded uppercase">paid</span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] text-text-muted uppercase font-sans">Tournament</span>
                    <span className="font-poppins font-extrabold text-sm text-text-main">{selectedTournament.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-3.5 text-xs font-sans">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-text-muted uppercase">Team Name</span>
                      <span className="font-semibold text-text-main">{teamName}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-text-muted uppercase">Captain</span>
                      <span className="font-semibold text-text-main">{captainName}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[9px] text-text-muted uppercase">Venue</span>
                      <span className="font-semibold text-text-main">{selectedTournament.venue}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-border-default pt-4 flex flex-col items-center justify-center gap-2">
                    {qrCodeUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrCodeUrl} alt="Tournament Pass QR" className="w-32 h-32 rounded bg-qr-bg p-2" />
                    ) : (
                      <div className="w-32 h-32 bg-bg animate-pulse rounded" />
                    )}
                    <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-text-muted">SCAN AT VENUE GATE TO CHECK IN</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3.5 w-full">
                  <button onClick={handleDownloadTicket}
                    className="w-full bg-elevated hover:bg-elevated border border-border-default text-text-main font-semibold py-3 rounded-md flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Ticket Pass
                  </button>
                  <button onClick={() => setRegStep("closed")} className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold py-3 rounded-md transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            )}

            {regStep === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-error/30 rounded-md max-w-md w-full p-6 text-center">
                <AlertCircle className="w-10 h-10 text-error mx-auto" />
                <h3 className="font-poppins font-bold text-lg text-text-main mt-4">Registration Failed</h3>
                <p className="text-xs text-text-muted mt-2 font-sans">{regError}</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button onClick={() => setRegStep("form")} className="bg-brand-lime text-black font-poppins font-bold text-sm py-2.5 px-6 rounded-md">
                    Try Again
                  </button>
                  <button onClick={() => setRegStep("closed")} className="bg-elevated border border-border-default text-text-main font-sans text-sm py-2.5 px-6 rounded-md">
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
