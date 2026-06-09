"use client";

import { useState, useEffect, useRef } from "react";
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
  Users,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openCashfreeCheckout } from "@/lib/cashfree";
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

function CalendarPicker({ onSelect, onClose }: { onSelect: (date: Date) => void; onClose: () => void }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] rounded-xl shadow-lg p-4 z-50" style={{ width: "320px" }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-full transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{monthLabel}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="p-1 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-full transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
          return (
            <button
              key={day}
              onClick={() => { const d = new Date(year, month, day); setSelectedDate(d); onSelect(d); onClose(); }}
              className={`w-full aspect-square flex items-center justify-center text-sm rounded-full transition-colors
                ${isSelected ? "bg-black dark:bg-white text-white dark:text-black font-semibold" : ""}
                ${!isSelected && isToday ? "border border-black dark:border-white text-black dark:text-white font-semibold" : ""}
                ${!isSelected && !isToday ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
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
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");

  const [registrationCode, setRegistrationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [downloadQrUrl, setDownloadQrUrl] = useState("");

  const [searchSport, setSearchSport] = useState("");
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

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

  const filteredTournaments = tournaments.filter((t) => {
    const matchSport = !searchSport || t.sport.toLowerCase().includes(searchSport.toLowerCase());
    const matchCity = !searchCity || t.city.toLowerCase().includes(searchCity.toLowerCase());
    return matchSport && matchCity;
  });

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
      const order = await convexClient.action<{ id: string; payment_session_id?: string; amount: number; mock?: boolean; idempotent_replay?: boolean }>(
        "payments:createCashfreeOrder",
        { amount: amountInPaise, currency: "INR", receipt, client_request_id: clientRequestId, type: "tournament_registration" }
      );

      if (!order.payment_session_id) {
        throw new Error("Failed to initialize payment session");
      }

      await openCashfreeCheckout({
        paymentSessionId: order.payment_session_id,
      });

      const verify = await convexClient.action<{ verified: boolean; payment_id?: string; mock?: boolean }>(
        "payments:verifyCashfreePayment",
        {
          order_id: order.id,
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
    <div className="airbnb-explore-theme flex flex-col min-h-screen bg-[#f7f7f7] dark:bg-[#1a1a1a]">
      <head>
        <title>Sports Tournaments | Find & Join Local Tournaments | Turfzo</title>
        <meta name="description" content="Discover and join football, cricket, and badminton tournaments in your city. Register your team, compete, and win prizes on Turfzo." />
        <link rel="canonical" href="https://turfzo.com/tournaments" />
        <meta property="og:title" content="Sports Tournaments | Turfzo" />
        <meta property="og:description" content="Find and join local sports tournaments. Register your team and compete." />
        <meta property="og:url" content="https://turfzo.com/tournaments" />
      </head>
      <Header />

      <main className="flex-grow pt-24 pb-16 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden mb-10 min-h-[280px] sm:min-h-[340px] flex flex-col items-start justify-end p-8 sm:p-12"
        >
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-50" style={{ backgroundImage: `url('/stadium_light_bg.png')` }} />
          <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)" }} />
          <div className="relative z-10">
            <h1 className="font-[family-name:var(--font-anton)] text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-[1.1] tracking-wide mb-2">
              Leagues &<br />Tournaments
            </h1>
            <p className="text-white/80 text-sm sm:text-base font-[family-name:var(--font-inter)] max-w-xl">
              Register your team, climb the regional leaderboards, and compete for grand cash prizes on the finest turfs.
            </p>
          </div>
        </motion.section>

        {/* Search bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-0 border border-[#ddd] dark:border-[#3a3a3a] rounded-full py-2 px-2 shadow-sm w-full max-w-2xl">
            <div className="flex-1 min-w-0 px-5 border-r border-[#ddd] dark:border-[#3a3a3a]">
              <label className="block text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">City</label>
              <input
                type="text"
                placeholder="Where are you playing?"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none py-1"
              />
            </div>
            <div className="flex-1 min-w-0 px-5 border-r border-[#ddd] dark:border-[#3a3a3a]">
              <label className="block text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sport</label>
              <input
                type="text"
                placeholder="Football, Cricket..."
                value={searchSport}
                onChange={(e) => setSearchSport(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none py-1"
              />
            </div>
            <div className="relative flex-1 min-w-0 px-5" ref={calendarRef}>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full text-left bg-transparent"
              >
                <label className="block text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer">Date</label>
                <span className="text-sm text-gray-400 py-1 block">When?</span>
              </button>
              {showCalendar && <CalendarPicker onSelect={() => {}} onClose={() => setShowCalendar(false)} />}
            </div>
            <button
              onClick={() => {}}
              className="flex items-center justify-center bg-[#4ADE80] hover:bg-[#16A34A] text-white rounded-full w-12 h-12 transition-colors flex-shrink-0"
              aria-label="Search tournaments"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-6 sm:gap-10 mb-12"
        >
          {[
            { icon: <Trophy className="w-5 h-5 text-[#4ADE80]" />, label: "Tournaments", value: tournaments.length || "—" },
            { icon: <Users className="w-5 h-5 text-[#4ADE80]" />, label: "Teams Registered", value: tournaments.reduce((s, t) => s + t.registered_teams, 0) || "—" },
            { icon: <MapPin className="w-5 h-5 text-[#4ADE80]" />, label: "Venues", value: new Set(tournaments.map((t) => t.venue)).size || "—" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl p-2.5">{s.icon}</div>
              <div>
                <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: tournaments */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {loadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#4ADE80]" /> Open Registrations
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">{filteredTournaments.length} tournaments</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-[#4ADE80] animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading tournaments...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">No tournaments found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check back soon for upcoming tournaments.</p>
              </div>
            ) : (
              filteredTournaments.map((t) => {
                const spotsLeft = t.max_teams - t.registered_teams;
                const isFull = spotsLeft <= 0;
                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-64 h-48 sm:h-auto bg-gray-100 dark:bg-[#1a1a1a] flex-shrink-0">
                        <Image
                          src={t.image_url || "/stadium_turf_bg.png"}
                          alt={t.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-white dark:bg-[#282828] text-gray-900 dark:text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            {t.sport}
                          </span>
                          <span className="bg-[#4ADE80] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            {t.format}
                          </span>
                        </div>
                        {!isFull && spotsLeft <= 3 && (
                          <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {spotsLeft} spots left
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white leading-snug">
                              {t.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#4ADE80] flex-shrink-0" />
                            {t.venue}, {t.city}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#4ADE80] flex-shrink-0" />
                            Starts {formatDate(t.start_date)}
                          </p>

                          <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg px-3 py-1.5">
                              <Trophy className="w-3.5 h-3.5 text-[#4ADE80]" />
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{t.prize_pool}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg px-3 py-1.5">
                              <Users className="w-3.5 h-3.5 text-[#4ADE80]" />
                              <span className="text-xs text-gray-600 dark:text-gray-300">{t.registered_teams}/{t.max_teams} teams</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#eee] dark:border-[#3a3a3a]">
                          <div>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry Fee</span>
                            <span className="text-xl font-bold text-[#4ADE80]">
                              ₹{t.entry_fee.toLocaleString("en-IN")}
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">/team</span>
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenRegistration(t)}
                            disabled={isFull}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                              isFull
                                ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "bg-[#4ADE80] hover:bg-[#16A34A] text-white"
                            }`}
                          >
                            {isFull ? "Full" : "Register"}
                            {!isFull && <ArrowRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* League Standings */}
            <div className="bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#4ADE80]" /> League Standings
              </h3>
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-[#eee] dark:border-[#3a3a3a] font-semibold text-[10px] uppercase tracking-wider text-left">
                      <th className="pb-2.5 pr-2">#</th>
                      <th className="pb-2.5">Team</th>
                      <th className="pb-2.5 text-center">P</th>
                      <th className="pb-2.5 text-center">GD</th>
                      <th className="pb-2.5 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueStandings.map((row) => (
                      <tr key={row.rank} className="border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-b-0 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                        <td className="py-3 font-bold text-gray-400 dark:text-gray-500 pr-2">{row.rank}</td>
                        <td className="py-3 font-semibold text-gray-900 dark:text-white">{row.team}</td>
                        <td className="py-3 text-center text-gray-500 dark:text-gray-400">{row.played}</td>
                        <td className="py-3 text-center font-semibold text-[#4ADE80]">{row.goalDiff}</td>
                        <td className="py-3 text-right font-extrabold text-[#4ADE80] pr-1">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Golden Boot */}
            <div className="bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#4ADE80]" /> Golden Boot
              </h3>
              <div className="flex flex-col gap-3">
                {topScorers.map((scorer, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-[#f0f0f0] dark:border-[#2a2a2a] last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                        {scorer.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{scorer.name}</span>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{scorer.team}</span>
                      </div>
                    </div>
                    <span className="bg-[#4ADE80]/10 text-[#4ADE80] text-xs font-bold px-2.5 py-1 rounded-full">
                      {scorer.goals} goals
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick info */}
            <div className="bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3">How it works</h3>
              <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] text-xs font-bold flex items-center justify-center">1</span>
                  <span>Browse open tournaments and pick your league</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] text-xs font-bold flex items-center justify-center">2</span>
                  <span>Register your team and pay the entry fee</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] text-xs font-bold flex items-center justify-center">3</span>
                  <span>Receive your QR pass and check in at venue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {regStep !== "closed" && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
              onClick={() => setRegStep("closed")}
            />

            {regStep === "form" && (
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl max-w-md w-full p-6 shadow-xl"
              >
                <button onClick={() => setRegStep("closed")} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6 text-[#4ADE80]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3">Team Registration</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{selectedTournament.title}</p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                  </div>
                )}

                <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Team Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Captain Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Enter captain name"
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={captainPhone}
                        onChange={(e) => setCaptainPhone(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Fee</span>
                    <span className="text-lg font-bold text-[#4ADE80]">₹{selectedTournament.entry_fee.toLocaleString("en-IN")}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold text-sm py-3.5 rounded-xl transition-colors mt-1"
                  >
                    Pay &amp; Register Team
                  </button>
                </form>
              </motion.div>
            )}

            {regStep === "processing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col items-center justify-center gap-4 text-center bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl max-w-sm w-full p-10 shadow-xl">
                <Loader2 className="w-10 h-10 text-[#4ADE80] animate-spin" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Processing Registration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking your slot in the brackets...</p>
              </motion.div>
            )}

            {regStep === "confirmed" && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-[#282828] border border-[#ddd] dark:border-[#3a3a3a] rounded-2xl max-w-md w-full p-6 shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-[#4ADE80]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#4ADE80]/30">
                  <Check className="w-8 h-8 text-[#4ADE80]" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Registered!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your team has been successfully placed.</p>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] rounded-xl p-5 mt-6 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-[#ddd] dark:border-[#3a3a3a] mb-4">
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase">Pass ID</span>
                      <span className="font-bold text-[#4ADE80] text-sm tracking-wide">{registrationCode}</span>
                    </div>
                    <span className="bg-[#4ADE80]/10 text-[#4ADE80] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">paid</span>
                  </div>

                  <div className="mb-4">
                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase">Tournament</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{selectedTournament.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase">Team</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{teamName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase">Captain</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{captainName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase">Venue</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{selectedTournament.venue}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#ddd] dark:border-[#3a3a3a] pt-4 flex flex-col items-center gap-2">
                    {qrCodeUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrCodeUrl} alt="Tournament Pass QR" className="w-32 h-32 rounded-xl bg-white p-2" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 dark:bg-[#282828] animate-pulse rounded-xl" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Scan at venue gate</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button onClick={handleDownloadTicket} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] text-gray-900 dark:text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-[#282828] transition-colors">
                    <Download className="w-4 h-4" /> Download Pass
                  </button>
                  <button onClick={() => setRegStep("closed")} className="w-full bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl transition-colors">
                    Done
                  </button>
                </div>
              </motion.div>
            )}

            {regStep === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-white dark:bg-[#282828] border border-red-200 dark:border-red-800 rounded-2xl max-w-md w-full p-6 shadow-xl text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Registration Failed</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{regError}</p>
                <div className="flex gap-3 mt-6 justify-center">
                  <button onClick={() => setRegStep("form")} className="bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-colors">
                    Try Again
                  </button>
                  <button onClick={() => setRegStep("closed")} className="bg-gray-100 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 text-sm py-2.5 px-6 rounded-xl">
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
