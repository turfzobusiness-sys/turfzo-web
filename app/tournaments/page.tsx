"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Award,
  ArrowRight,
  X,
  Check,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Loader2,
  Download
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Tournament {
  id: string;
  title: string;
  sport: string;
  format: string;
  date: string;
  venue: string;
  entryFee: number;
  prizePool: string;
  registeredTeams: number;
  totalTeams: number;
  image: string;
}

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: "t-1",
    title: "Turfzo Summer Football Cup",
    sport: "Football",
    format: "7v7 Knockout",
    date: "Starts June 12, 2026",
    venue: "Playo Turf, HSR Layout",
    entryFee: 1500,
    prizePool: "₹50,000 + Trophy",
    registeredTeams: 14,
    totalTeams: 16,
    image: "/stadium_turf_bg.png"
  },
  {
    id: "t-2",
    title: "Monsoon Cricket Championship",
    sport: "Cricket",
    format: "6v6 Box Cricket",
    date: "Starts June 20, 2026",
    venue: "Indiranagar Cricket Club",
    entryFee: 1200,
    prizePool: "₹35,000 + Medals",
    registeredTeams: 8,
    totalTeams: 12,
    image: "/stadium_turf_bg.png"
  },
  {
    id: "t-3",
    title: "Corporate Badminton Clash",
    sport: "Badminton",
    format: "Doubles Tournament",
    date: "Starts June 28, 2026",
    venue: "Golden Sports Arena",
    entryFee: 500,
    prizePool: "₹15,000 Cash Prize",
    registeredTeams: 18,
    totalTeams: 24,
    image: "/stadium_turf_bg.png"
  }
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  // Registration Flow State: 'closed' | 'form' | 'processing' | 'confirmed'
  const [regStep, setRegStep] = useState<'closed' | 'form' | 'processing' | 'confirmed'>('closed');
  
  // Form State
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  
  const [registrationId, setRegistrationId] = useState("");

  const handleOpenRegistration = (t: Tournament) => {
    setSelectedTournament(t);
    setTeamName("");
    setCaptainName("");
    setCaptainEmail("");
    setCaptainPhone("");
    setRegStep('form');
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captainName || !captainEmail || !captainPhone) return;
    
    setRegStep('processing');
    const randomId = "REG-" + Math.floor(100000 + Math.random() * 900000);
    setRegistrationId(randomId);

    // Simulate server request
    setTimeout(() => {
      // Increment registered teams count locally
      if (selectedTournament) {
        setTournaments(tournaments.map(t => {
          if (t.id === selectedTournament.id) {
            return { ...t, registeredTeams: Math.min(t.registeredTeams + 1, t.totalTeams) };
          }
          return t;
        }));
      }
      setRegStep('confirmed');
    }, 2000);
  };

  // Mock standings table data
  const leagueStandings = [
    { rank: "1", team: "HSR Strikers FC", played: "8", wins: "7", draws: "0", losses: "1", goalDiff: "+18", points: "21" },
    { rank: "2", team: "Koramangala Wizards", played: "8", wins: "6", draws: "1", losses: "1", goalDiff: "+12", points: "19" },
    { rank: "3", team: "Indiranagar Blazers", played: "8", wins: "5", draws: "2", losses: "1", goalDiff: "+8", points: "17" },
    { rank: "4", team: "Whitefield Rovers", played: "8", wins: "4", draws: "1", losses: "3", goalDiff: "+2", points: "13" },
    { rank: "5", team: "Marathahalli Titans", played: "8", wins: "3", draws: "0", losses: "5", goalDiff: "-4", points: "9" }
  ];

  // Mock Top Scorers
  const topScorers = [
    { name: "Rahul Sharma", team: "HSR Strikers FC", goals: "12" },
    { name: "Amit Patel", team: "Koramangala Wizards", goals: "9" },
    { name: "Vikram Singh", team: "Indiranagar Blazers", goals: "8" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
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
          
          {/* Hero Banner Section */}
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-card-shadow p-8 sm:p-12 mb-12 min-h-[240px] flex flex-col justify-end">
            <div 
              className="absolute inset-0 bg-cover bg-center z-0 opacity-40" 
              style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/70 to-transparent z-0" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-dark border border-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime mb-4">
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

          {/* Tournament Listings & Standings Tabs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left listings: 8 Cols */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-poppins font-bold text-xl text-text-main text-left pb-2 border-b border-white/5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-lime" /> Open Registrations
              </h2>

              <div className="flex flex-col gap-6">
                {tournaments.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-surface-dark border border-white/5 hover:border-brand-lime/10 rounded-md p-6 flex flex-col md:flex-row gap-6 transition-all duration-300 hover:shadow-card-shadow text-left"
                  >
                    {/* Visual picture */}
                    <div className="relative w-full md:w-56 h-40 bg-elevated-dark rounded-sm overflow-hidden flex-shrink-0">
                      <Image 
                        src={t.image} 
                        alt={t.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 border border-white/10 text-text-main font-sans font-bold text-[10px] px-2.5 py-1 rounded-pill uppercase tracking-wider select-none">
                        {t.sport}
                      </div>
                    </div>

                    {/* Content body */}
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 border-t border-white/5 pt-4 text-xs font-sans text-text-muted">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider">Schedule</span>
                            <span className="font-semibold text-text-main">{t.date}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider">Prize Pool</span>
                            <span className="font-bold text-brand-lime">{t.prizePool}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider">Slots Registered</span>
                            <span className="font-semibold text-text-main">{t.registeredTeams} / {t.totalTeams} Teams</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA & registration fees */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                        <div>
                          <span className="text-[9px] uppercase text-text-muted block leading-none font-sans">Registration Fee</span>
                          <span className="text-lg font-poppins font-extrabold text-brand-lime mt-1 block">
                            ₹{t.entryFee} <span className="text-xs text-text-muted font-normal font-sans">/Team</span>
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleOpenRegistration(t)}
                          disabled={t.registeredTeams >= t.totalTeams}
                          className="bg-brand-lime disabled:bg-elevated-dark disabled:text-text-muted/30 hover:bg-brand-lime-hover text-black font-poppins font-bold text-xs py-3 px-6 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1"
                        >
                          {t.registeredTeams >= t.totalTeams ? "Slots Full" : "Register Team"}
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: League Standings leaderboards */}
            <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
              
              {/* Leaderboard points table card */}
              <div className="bg-surface-dark border border-white/5 rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main flex items-center gap-2 pb-3.5 border-b border-white/5 mb-4">
                  <Award className="w-5 h-5 text-brand-lime" /> League Standings
                </h3>

                {/* Standing Table */}
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="text-text-muted border-b border-white/5 font-semibold text-[10px] uppercase tracking-wider text-left">
                        <th className="py-2.5">Rank</th>
                        <th className="py-2.5">Team</th>
                        <th className="py-2.5 text-center">P</th>
                        <th className="py-2.5 text-center">GD</th>
                        <th className="py-2.5 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueStandings.map((row) => (
                        <tr key={row.rank} className="border-b border-white/5 hover:bg-elevated-dark/30 transition-colors">
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

              {/* Top Scorers list card */}
              <div className="bg-surface-dark border border-white/5 rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main flex items-center gap-2 pb-3.5 border-b border-white/5 mb-4">
                  <Trophy className="w-4.5 h-4.5 text-brand-lime" /> Golden Boot Leaderboard
                </h3>
                <div className="flex flex-col gap-3.5">
                  {topScorers.map((scorer, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-elevated-dark border border-white/10 flex items-center justify-center font-poppins font-bold text-[11px] text-text-main">
                          {scorer.name.split(" ").map(n => n[0]).join("")}
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

      {/* Team Registration Modal */}
      <AnimatePresence>
        {regStep !== 'closed' && selectedTournament && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            
            {/* Registration Form container */}
            {regStep === 'form' && (
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-surface-dark border border-white/10 rounded-md max-w-md w-full p-6 relative shadow-card-shadow text-left"
              >
                {/* Close */}
                <button 
                  onClick={() => setRegStep('closed')}
                  className="absolute top-4 right-4 p-1.5 bg-elevated-dark hover:bg-white/10 rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <Trophy className="w-8 h-8 text-brand-lime mx-auto" />
                  <h3 className="font-poppins font-bold text-lg text-text-main mt-3">Team Registration</h3>
                  <p className="text-xs text-text-muted font-sans mt-0.5">{selectedTournament.title}</p>
                </div>

                <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-4 text-xs font-sans">
                  
                  {/* Team Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Team Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-elevated-dark border border-white/5 rounded px-4 py-2.5 text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                    />
                  </div>

                  {/* Captain Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input 
                        type="text" 
                        required
                        placeholder="Enter captain name"
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="bg-elevated-dark border border-white/5 rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Mobile Number</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input 
                        type="tel" 
                        required
                        placeholder="Enter phone number"
                        value={captainPhone}
                        onChange={(e) => setCaptainPhone(e.target.value)}
                        className="bg-elevated-dark border border-white/5 rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                      />
                    </div>
                  </div>

                  {/* Captain Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Captain Email</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input 
                        type="email" 
                        required
                        placeholder="Enter email address"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        className="bg-elevated-dark border border-white/5 rounded pl-10 pr-4 py-2.5 w-full text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                      />
                    </div>
                  </div>

                  {/* Summary fee */}
                  <div className="bg-elevated-dark p-3.5 rounded border border-white/5 flex justify-between items-center mt-2">
                    <span className="font-semibold text-text-muted">Total Registration Fee</span>
                    <span className="font-poppins font-extrabold text-sm text-brand-lime">₹{selectedTournament.entryFee}</span>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3 rounded-md transition-all mt-2 flex items-center justify-center gap-1.5"
                  >
                    Pay & Register Team
                  </button>
                </form>
              </motion.div>
            )}

            {/* Registration Processing spinner */}
            {regStep === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 text-center"
              >
                <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2.5]" />
                <h3 className="font-poppins font-bold text-lg text-text-main mt-2">Processing Team registration</h3>
                <p className="text-xs text-text-muted max-w-xs font-sans">Booking slot in the league brackets...</p>
              </motion.div>
            )}

            {/* Registration Confirmation Receipt Ticket */}
            {regStep === 'confirmed' && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface-dark border border-white/10 rounded-md max-w-md w-full p-6 relative shadow-card-shadow text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-glow-lime select-none mb-4">
                  <Check className="w-8 h-8 text-brand-lime stroke-[3]" />
                </div>

                <h3 className="font-poppins font-bold text-xl text-text-main">Team Registered!</h3>
                <p className="text-xs text-text-muted font-sans mt-1">Your team has been successfully placed in the brackets.</p>

                {/* Pass Ticket Receipt card */}
                <div className="relative w-full bg-elevated-dark border border-white/5 rounded p-5 mt-6 text-left flex flex-col gap-4 overflow-hidden">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-surface-dark rounded-full border-r border-white/10" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-surface-dark rounded-full border-l border-white/10" />

                  <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-white/10 font-sans">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-muted uppercase">Tournament Pass ID</span>
                      <span className="font-poppins font-bold text-brand-lime text-sm tracking-wide">{registrationId}</span>
                    </div>
                    <span className="bg-brand-lime/10 text-brand-lime font-bold text-[9px] border border-brand-lime/10 px-2 py-0.5 rounded uppercase">paid</span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] text-text-muted uppercase font-sans">Tournament</span>
                    <span className="font-poppins font-extrabold text-sm text-text-main">{selectedTournament.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3.5 text-xs font-sans">
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

                  {/* QR access code */}
                  <div className="border-t border-dashed border-white/10 pt-4 flex flex-col items-center justify-center gap-2">
                    <div className="bg-white p-2 rounded">
                      <svg viewBox="0 0 100 100" className="w-24 h-24 text-black">
                        <rect x="0" y="0" width="30" height="30" fill="black" />
                        <rect x="5" y="5" width="20" height="20" fill="white" />
                        <rect x="10" y="10" width="10" height="10" fill="black" />
                        <rect x="70" y="0" width="30" height="30" fill="black" />
                        <rect x="75" y="5" width="20" height="20" fill="white" />
                        <rect x="80" y="10" width="10" height="10" fill="black" />
                        <rect x="0" y="70" width="30" height="30" fill="black" />
                        <rect x="5" y="75" width="20" height="20" fill="white" />
                        <rect x="10" y="80" width="10" height="10" fill="black" />
                        <rect x="40" y="10" width="10" height="40" fill="black" />
                        <rect x="60" y="60" width="20" height="20" fill="black" />
                      </svg>
                    </div>
                    <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-text-muted">SCAN AT VENUE GATE TO CHECK IN</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3.5 w-full">
                  <button 
                    onClick={() => alert("Simulated ticket download success!")}
                    className="w-full bg-elevated-dark hover:bg-white/5 border border-white/10 text-text-main font-semibold py-3 rounded-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Ticket Pass
                  </button>
                  <button 
                    onClick={() => setRegStep('closed')}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold py-3 rounded-md transition-all"
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
