"use client";

import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Star,
  Clock,
  Tag,
  Award,
  Home,
  User,
  Bell,
  ArrowRight,
  CalendarDays
} from "lucide-react";

export default function PhoneMockup() {
  return (
    <div className="dark">
      <div className="relative mx-auto w-[300px] sm:w-[320px] h-[630px] sm:h-[670px] bg-bg rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[4px] border-white/10 flex flex-col justify-between overflow-hidden group select-none">
        {/* Outer steel shine */}
        <div className="absolute inset-0 rounded-[46px] border border-white/[0.04] pointer-events-none" />

        {/* Screen */}
        <div className="relative flex flex-col w-full h-full bg-bg rounded-[38px] overflow-hidden border border-white/[0.08]">

          {/* Status Bar */}
          <div className="absolute top-0 inset-x-0 h-9 bg-bg z-20 flex items-center justify-between px-7 pointer-events-none">
            <span className="text-[10px] font-sans font-semibold text-white/80">9:41</span>
            <div className="w-[80px] h-[16px] bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-[6px]" />
            <div className="flex items-center gap-1">
              <div className="flex gap-[1px] items-end h-2">
                <span className="w-[2px] h-[3px] bg-white/70 rounded-sm" />
                <span className="w-[2px] h-[4px] bg-white/70 rounded-sm" />
                <span className="w-[2px] h-[6px] bg-white/70 rounded-sm" />
                <span className="w-[2px] h-[8px] bg-white/25 rounded-sm" />
              </div>
              <div className="w-[18px] h-[9px] border border-white/40 rounded-[3px] p-[1px] flex items-center ml-0.5">
                <div className="h-full w-[80%] bg-brand-lime rounded-[1.5px]" />
              </div>
            </div>
          </div>

          {/* App Header */}
          <div className="pt-10 px-4 pb-2 bg-surface flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Image
                src="/turfzo_mascot.svg"
                alt="Turfzo"
                width={24}
                height={24}
                className="w-6 h-6 shrink-0"
              />
              <span className="font-sans font-bold text-[16px] tracking-tight text-white">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Bell className="w-[18px] h-[18px] text-white/40" />
              <div className="w-7 h-7 bg-brand-lime rounded-full flex items-center justify-center text-black font-sans font-bold text-[10px]">
                JD
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-[72px] flex flex-col gap-3 scrollbar-none">

            {/* Location */}
            <div className="flex items-center gap-1 text-[11px] text-white/50">
              <MapPin className="w-3 h-3 text-brand-lime" />
              <span className="font-sans">Bengaluru, Karnataka</span>
              <ChevronDown className="w-3 h-3 text-white/30" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <div className="w-full bg-elevated border border-white/[0.06] rounded-full pl-9 pr-4 py-2.5 text-[11px] text-white/25 font-sans">
                Search for turfs, sports...
              </div>
            </div>

            {/* Sport Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
              {["⚽ Football", "Cricket", "Badminton", "Te.."].map((cat, i) => (
                <span
                  key={cat}
                  className={`text-[10px] font-sans font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0 ${i === 0
                      ? "bg-brand-lime text-black font-bold border border-brand-lime"
                      : "bg-elevated text-white/40 border border-white/[0.06]"
                    }`}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[14px] font-sans font-bold text-white">Popular Turfs</span>
              <span className="text-[11px] font-sans text-brand-lime font-semibold">View all</span>
            </div>

            {/* =============================== */}
            {/*    TURF CARD — APP ACCURATE     */}
            {/* =============================== */}
            <div className="bg-surface border border-white/[0.06] rounded-[22px] overflow-hidden flex flex-col">

              {/* Card Top Section */}
              <div className="px-4 pt-4 pb-3 flex flex-col gap-2">
                {/* Location Pill */}
                <div className="flex items-center gap-1.5 w-fit bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-[5px]">
                  <svg className="w-2.5 h-2.5 text-brand-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className="text-[9px] text-white/50 font-sans font-medium tracking-wide">Mumbai, Maharashtra</span>
                </div>

                {/* Title + Verified */}
                <div className="flex items-start justify-between">
                  <h4 className="text-[18px] font-sans font-bold text-white leading-tight tracking-tight">
                    Olympic Arena
                  </h4>
                  <svg className="w-[22px] h-[22px] text-brand-lime shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                  <span className="text-[12px] font-bold text-white">4.8</span>
                  <span className="text-[11px] text-white/35 font-sans">(25 reviews)</span>
                </div>
              </div>

              {/* ======================== */}
              {/*  TURF IMAGE — BIG & TALL */}
              {/* ======================== */}
              <div className="relative mx-3 h-[170px] rounded-[14px] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center scale-[1.05]"
                  style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                {/* Discount Badge — Bottom Center */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-[#0f1f0f] border border-brand-lime/30 text-brand-lime font-sans font-bold text-[9px] px-4 py-[6px] rounded-full tracking-wider whitespace-nowrap shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                    UP TO 20% OFF
                  </div>
                </div>
              </div>

              {/* Info Rows */}
              <div className="px-4 pt-4 pb-1 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-brand-lime/[0.08] flex items-center justify-center shrink-0">
                    <Award className="w-3 h-3 text-brand-lime" />
                  </div>
                  <span className="text-[12px] text-white/60 font-sans">Football • 5-a-side</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-brand-lime/[0.08] flex items-center justify-center shrink-0">
                    <Clock className="w-3 h-3 text-brand-lime" />
                  </div>
                  <span className="text-[12px] text-white/60 font-sans">6:00 AM - 11:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-brand-lime/[0.08] flex items-center justify-center shrink-0">
                    <Tag className="w-3 h-3 text-brand-lime" />
                  </div>
                  <span className="text-[12px] text-white/60 font-sans">₹1200/hr</span>
                </div>
              </div>

              {/* View Details Button */}
              <div className="px-3.5 pb-4 pt-2.5">
                <button className="w-full bg-brand-btn-bg border border-brand-lime/25 text-white font-sans font-semibold text-[12px] py-3.5 rounded-[14px] flex items-center justify-center relative hover:bg-brand-btn-bg-hover hover:border-brand-lime/40 transition-colors cursor-pointer">
                  View Details
                  <div className="absolute right-3 w-[28px] h-[28px] rounded-full border border-white/10 bg-bg flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white/50" />
                  </div>
                </button>
              </div>
            </div>
            {/* END CARD */}

          </div>

          {/* ================== */}
          {/*   BOTTOM NAV BAR  */}
          {/* ================== */}
          <div className="absolute bottom-0 inset-x-0 h-[60px] bg-bg border-t border-white/[0.04] flex items-center justify-around px-3 z-20">
            <button className="flex flex-col items-center gap-[3px] w-11">
              <Home className="w-[20px] h-[20px] text-brand-lime" />
              <span className="text-[8px] font-semibold text-brand-lime">Home</span>
            </button>
            <button className="flex flex-col items-center gap-[3px] w-11">
              <Search className="w-[20px] h-[20px] text-white/30" />
              <span className="text-[8px] font-medium text-white/30">Explore</span>
            </button>

            {/* Center Floating Trophy */}
            <div className="relative w-11 flex items-center justify-center">
              <div className="absolute -top-[34px] left-1/2 -translate-x-1/2">
                <div className="w-[48px] h-[48px] rounded-full bg-bg p-[3px]">
                  <div className="w-full h-full rounded-full bg-brand-lime flex items-center justify-center shadow-[0_0_16px_rgba(159,232,112,0.3)]">
                    <Image
                      src="/turfzo_mascot.svg"
                      alt="Turfzo"
                      width={26}
                      height={26}
                      className="w-[26px] h-[26px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="flex flex-col items-center gap-[3px] w-11">
              <CalendarDays className="w-[20px] h-[20px] text-white/30" />
              <span className="text-[8px] font-medium text-white/30">Bookings</span>
            </button>
            <button className="flex flex-col items-center gap-[3px] w-11">
              <User className="w-[20px] h-[20px] text-white/30" />
              <span className="text-[8px] font-medium text-white/30">Profile</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
