"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPORTS = [
  { id: "Football", name: "Football", desc: "5v5, 7v7, 11v11 pitches", icon: "⚽" },
  { id: "Cricket", name: "Box Cricket", desc: "Box cricket, nets & turf pitch", icon: "🏏" },
  { id: "Badminton", name: "Badminton", desc: "Indoor wooden & synthetic courts", icon: "🏸" },
  { id: "Tennis", name: "Tennis", desc: "Clay & synthetic courts", icon: "🎾" },
  { id: "All Sports", name: "All Sports", desc: "Browse all available sports", icon: "🎯" },
];

const CITIES = [
  { name: "Bengaluru", areas: "Koramangala, HSR, Indiranagar" },
  { name: "Mumbai", areas: "Bandra, Andheri, Powai" },
  { name: "Delhi NCR", areas: "Gurgaon, Noida, South Delhi" },
  { name: "Hyderabad", areas: "Gachibowli, Madhapur, Jubilee Hills" },
  { name: "Pune", areas: "Kothrud, Viman Nagar, Baner" },
  { name: "Chennai", areas: "Anna Nagar, OMR, Guindy" },
];

const DATES = [
  { id: "Today", label: "Today", sub: "Evening slots available" },
  { id: "Tomorrow", label: "Tomorrow", sub: "Prime morning & evening slots" },
  { id: "Weekend", label: "This Weekend", sub: "Saturday & Sunday bookings" },
  { id: "Anytime", label: "Any Date", sub: "View complete calendar" },
];

export default function Hero() {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Search capsule state
  const [selectedSport, setSelectedSport] = useState("Football");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [selectedDate, setSelectedDate] = useState("Today");
  const [openDropdown, setOpenDropdown] = useState<"sport" | "city" | "date" | null>(null);
  const capsuleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (capsuleRef.current && !capsuleRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedSport && selectedSport !== "All Sports") params.set("sport", selectedSport);
    if (selectedCity && selectedCity !== "All Cities") params.set("city", selectedCity);
    if (selectedDate === "Today") {
      params.set("date", new Date().toISOString().split("T")[0]);
    }
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-20 flex items-center justify-center overflow-hidden bg-bg"
    >
      {/* ======================================================== */}
      {/*           REALISTIC LOCAL TURF BACKGROUND IMAGE          */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Single canonical LCP hero image */}
        <Image
          src="/images/marketing/home/hero-turf-evening.webp"
          alt="Floodlit sports turf pitch in the evening"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_50%] opacity-20 dark:opacity-35"
        />

        {/* Clean bottom-up gradient overlay — high contrast in light mode, atmospheric in dark */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40 dark:from-bg dark:via-bg/60 dark:to-transparent z-10" />
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-20 relative">

        {/* Left Column (Hero Content) */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
          {/* Architectural Typography Overline */}
          <div className="flex items-center gap-2 mb-4 w-fit mx-auto lg:mx-0">
            <span className="w-1.5 h-1.5 rounded-xs bg-brand-lime" />
            <span className="text-[11px] sm:text-xs font-mono font-bold text-text-muted tracking-wider uppercase">
              Verified Sports Venues
            </span>
          </div>

          {/* Clean Title Case Heading */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-text-main text-left max-w-2xl transition-all duration-200">
            Book local sports turfs <br className="hidden sm:inline" />
            <span className="text-text-main">in seconds</span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-base sm:text-lg text-text-muted font-sans font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed text-left">
            Real-time hourly slots, upfront pricing, and instant confirmation for verified football, cricket, badminton, and tennis grounds.
          </p>

          {/* ======================================================== */}
          {/*            MODERN STRUCTURED SEARCH CAPSULE              */}
          {/* ======================================================== */}
          <div ref={capsuleRef} className="mt-8 w-full max-w-2xl relative z-30">
            <div className="bg-surface border border-border-default hover:border-border-strong rounded-xl shadow-xs p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 transition-all">
              
              {/* Segment 1: Sport */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "sport" ? null : "sport")}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer",
                    openDropdown === "sport" ? "bg-elevated" : "hover:bg-elevated"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">
                      {SPORTS.find((s) => s.id === selectedSport)?.icon || "⚽"}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Sport
                      </span>
                      <span className="text-sm font-semibold text-text-main truncate">
                        {selectedSport}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", openDropdown === "sport" && "rotate-180")} />
                </button>

                {openDropdown === "sport" && (
                  <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 bg-surface border border-border-default rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle mb-1">
                      Select Sport
                    </div>
                    {SPORTS.map((sport) => {
                      const active = selectedSport === sport.id;
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => {
                            setSelectedSport(sport.id);
                            setOpenDropdown("city");
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer",
                            active ? "bg-brand-lime/15 text-text-main" : "hover:bg-elevated text-text-main"
                          )}
                        >
                          <span className="text-lg shrink-0 mt-0.5">{sport.icon}</span>
                          <div className="flex flex-col">
                            <span className={cn("text-xs font-semibold", active && "text-brand-lime")}>{sport.name}</span>
                            <span className="text-[10px] text-text-muted">{sport.desc}</span>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-brand-lime ml-auto mt-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-[1px] h-8 bg-border-default shrink-0" />

              {/* Segment 2: City */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer",
                    openDropdown === "city" ? "bg-elevated" : "hover:bg-elevated"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-brand-lime shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        City
                      </span>
                      <span className="text-sm font-semibold text-text-main truncate">
                        {selectedCity}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", openDropdown === "city" && "rotate-180")} />
                </button>

                {openDropdown === "city" && (
                  <div className="absolute top-[calc(100%+8px)] left-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-72 bg-surface border border-border-default rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle mb-1">
                      Choose City
                    </div>
                    {CITIES.map((city) => {
                      const active = selectedCity === city.name;
                      return (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city.name);
                            setOpenDropdown("date");
                          }}
                          className={cn(
                            "w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer",
                            active ? "bg-brand-lime/15 text-text-main" : "hover:bg-elevated text-text-main"
                          )}
                        >
                          <MapPin className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", active ? "text-brand-lime" : "text-text-muted")} />
                          <div className="flex flex-col">
                            <span className={cn("text-xs font-semibold", active && "text-brand-lime")}>{city.name}</span>
                            <span className="text-[10px] text-text-muted line-clamp-1">{city.areas}</span>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-brand-lime ml-auto mt-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-[1px] h-8 bg-border-default shrink-0" />

              {/* Segment 3: Date */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer",
                    openDropdown === "date" ? "bg-elevated" : "hover:bg-elevated"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-brand-lime shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        When
                      </span>
                      <span className="text-sm font-semibold text-text-main truncate">
                        {selectedDate}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", openDropdown === "date" && "rotate-180")} />
                </button>

                {openDropdown === "date" && (
                  <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-64 bg-surface border border-border-default rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle mb-1">
                      Choose Time Window
                    </div>
                    {DATES.map((date) => {
                      const active = selectedDate === date.id;
                      return (
                        <button
                          key={date.id}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date.id);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            "w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer",
                            active ? "bg-brand-lime/15 text-text-main" : "hover:bg-elevated text-text-main"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn("text-xs font-semibold", active && "text-brand-lime")}>{date.label}</span>
                            <span className="text-[10px] text-text-muted">{date.sub}</span>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-brand-lime ml-auto mt-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-6 py-3 rounded-xl transition-all shadow-sm text-sm shrink-0 cursor-pointer active:scale-95 mt-1 sm:mt-0"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mt-4 flex flex-wrap items-center justify-start gap-2 text-xs text-text-muted">
            <span className="font-medium">Trending:</span>
            <button
              type="button"
              onClick={() => router.push("/explore?sport=Football&city=Bengaluru")}
              className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:border-border-strong text-text-main hover:text-brand-lime transition-colors cursor-pointer"
            >
              ⚽ Bengaluru Football
            </button>
            <button
              type="button"
              onClick={() => router.push("/explore?sport=Cricket&city=Mumbai")}
              className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:border-border-strong text-text-main hover:text-brand-lime transition-colors cursor-pointer"
            >
              🏏 Mumbai Box Cricket
            </button>
            <button
              type="button"
              onClick={() => router.push("/explore?sport=Badminton&city=Hyderabad")}
              className="px-2.5 py-1 rounded-full bg-surface border border-border-subtle hover:border-border-strong text-text-main hover:text-brand-lime transition-colors cursor-pointer"
            >
              🏸 Hyderabad Badminton
            </button>
          </div>

          {/* ======================================================== */}
          {/*                   FLAT TYPOGRAPHIC STATS                 */}
          {/* ======================================================== */}
          <div className="mt-16 pt-8 border-t border-border-default/50 grid grid-cols-3 gap-6 text-left max-w-xl">
            {/* Stat 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl border border-brand-lime/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-brand-lime" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">500+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Turfs</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3.5 pl-2">
              <div className="w-11 h-11 rounded-xl border border-brand-lime/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-brand-lime" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">50K+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Happy Players</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3.5 pl-2">
              <div className="w-11 h-11 rounded-xl border border-brand-lime/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-brand-lime" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">1000+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Tournaments</span>
              </div>
            </div>
          </div>

          {/* App Store / Google Play Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center lg:items-start gap-3 w-full max-w-xl">
            <span className="text-[10px] font-sans text-text-muted tracking-wider font-extrabold uppercase">
              Book on the go — Get the app
            </span>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {/* Google Play (live on Play Store) */}
              <a
                href="https://play.google.com/store/apps/details?id=com.turfzo.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 h-11 min-w-[135px] px-3.5 rounded-lg transition-all border border-white/10 shadow-sm shrink-0"
              >
                <svg className="w-5 h-5 shrink-0 select-none" viewBox="0 0 16 16">
                  {/* Left Blue Segment */}
                  <path fill="#00c0ff" d="M1 13.396V2.603L6.846 8 1 13.396z" />
                  {/* Top Red Segment */}
                  <path fill="#ff3c3c" d="M1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27z" />
                  {/* Right Yellow Segment */}
                  <path fill="#ffb300" d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96z" />
                  {/* Bottom Green Segment */}
                  <path fill="#00e25b" d="M10.627 11.49L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.275z" />
                </svg>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[8px] font-sans uppercase font-semibold text-white/75 tracking-tight whitespace-nowrap">Get it on</span>
                  <span className="text-[11px] font-sans font-bold leading-none whitespace-nowrap">Google Play</span>
                </div>
              </a>

              {/* App Store (not yet live) */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 h-11 min-w-[135px] px-3.5 rounded-lg transition-all border border-white/10 shadow-sm shrink-0"
              >
                <svg className="w-5 h-5 shrink-0 select-none" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="5" fill="#007AFF" />
                  <path fill="#ffffff" d="M12 5.5c-.3 0-.6.1-.8.4l-3.3 6.9c-.3.4-.1 1 .4 1.2.4.3 1 .1 1.2-.4l.7-1.4h5.6l.7 1.4c.2.3.5.5.8.5.2 0 .3 0 .5-.1.5-.3.6-.9.4-1.3l-3.3-6.9c-.2-.2-.5-.4-.8-.4zm-1.5 5.5l1.5-3.1 1.5 3.1h-3.0z" />
                </svg>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[8px] font-sans uppercase font-semibold text-white/75 tracking-tight whitespace-nowrap">Download on the</span>
                  <span className="text-[11px] font-sans font-bold leading-none whitespace-nowrap">App Store</span>
                </div>
              </button>
            </div>
            {showComingSoon && (
              <p className="text-xs text-text-muted font-sans mt-1">The App Store version is coming soon — get it on Google Play today.</p>
            )}
          </div>

        </div>

        {/* Right Column (iPhone Mockup Showcase) */}
        <div className="flex lg:col-span-5 items-center justify-center relative w-full lg:h-auto mt-8 lg:mt-0">
          <div className="relative scale-95 sm:scale-100 origin-center w-full flex justify-center">

            {/* Show the static mockup image directly since it already contains the iPhone frame */}
            <div className="relative w-[300px] sm:w-[330px] aspect-[9/18] select-none">
              <Image
                src="/Screenshot_20260603-131114.turfzo-portrait.webp"
                alt="Turfzo mobile app interface"
                width={330}
                height={660}
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
