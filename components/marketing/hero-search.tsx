"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Trophy, Calendar, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad",
  "Pune", "Chennai", "Kolkata", "Ahmedabad",
];

const SPORTS = [
  { name: "Football", icon: "⚽" },
  { name: "Cricket", icon: "🏏" },
  { name: "Badminton", icon: "🏸" },
  { name: "Tennis", icon: "🎾" },
];

/** Modern search module with custom dropdowns (no native HTML selects). */
export default function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [sport, setSport] = useState("");

  const [openDropdown, setOpenDropdown] = useState<"city" | "sport" | null>(null);
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (sport) params.set("sport", sport);
    if (date) params.set("date", date);
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      ref={containerRef}
      onSubmit={submit}
      className="w-full bg-surface border border-border-default rounded-2xl shadow-lg p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2.5 items-end relative z-20"
    >
      {/* City Dropdown */}
      <div className="relative flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
          Location
        </span>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-border-default bg-elevated/60 hover:bg-elevated text-left text-sm text-text-main transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-brand-lime shrink-0" />
            <span className="truncate font-semibold">{city || "All cities"}</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", openDropdown === "city" && "rotate-180")} />
        </button>

        {openDropdown === "city" && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full min-w-[200px] bg-surface border border-border-default rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setCity("");
                setOpenDropdown(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer",
                !city ? "bg-brand-lime/15 text-brand-lime" : "text-text-main hover:bg-elevated"
              )}
            >
              <span>All cities</span>
              {!city && <Check className="w-3.5 h-3.5 text-brand-lime" />}
            </button>
            {CITIES.map((c) => {
              const active = city === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCity(c);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer",
                    active ? "bg-brand-lime/15 text-brand-lime" : "text-text-main hover:bg-elevated"
                  )}
                >
                  <span>{c}</span>
                  {active && <Check className="w-3.5 h-3.5 text-brand-lime" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Input */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
          Date
        </span>
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-brand-lime absolute left-3.5 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border-default bg-elevated/60 hover:bg-elevated text-sm text-text-main transition-colors focus:outline-none focus:border-brand-lime font-medium cursor-pointer"
            aria-label="Date"
          />
        </div>
      </div>

      {/* Sport Dropdown */}
      <div className="relative flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
          Sport
        </span>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "sport" ? null : "sport")}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-border-default bg-elevated/60 hover:bg-elevated text-left text-sm text-text-main transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-brand-lime shrink-0" />
            <span className="truncate font-semibold">{sport || "All sports"}</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", openDropdown === "sport" && "rotate-180")} />
        </button>

        {openDropdown === "sport" && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full min-w-[180px] bg-surface border border-border-default rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setSport("");
                setOpenDropdown(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer",
                !sport ? "bg-brand-lime/15 text-brand-lime" : "text-text-main hover:bg-elevated"
              )}
            >
              <span>All sports</span>
              {!sport && <Check className="w-3.5 h-3.5 text-brand-lime" />}
            </button>
            {SPORTS.map((s) => {
              const active = sport === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setSport(s.name);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer",
                    active ? "bg-brand-lime/15 text-brand-lime" : "text-text-main hover:bg-elevated"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                  </span>
                  {active && <Check className="w-3.5 h-3.5 text-brand-lime" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-brand-btn-bg font-sans font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm text-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
