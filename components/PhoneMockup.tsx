"use client";

import Image from "next/image";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Star, 
  Calendar, 
  Percent, 
  Award,
  Home, 
  Compass, 
  BookOpen, 
  User, 
  Bell,
  Activity
} from "lucide-react";

export default function PhoneMockup() {
  // Sports category chips inside the app
  const categories = ["Football", "Cricket", "Badminton", "Tennis"];

  return (
    <div className="relative mx-auto w-[290px] sm:w-[310px] h-[610px] sm:h-[650px] bg-[#0c0c0e] rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[4px] border-[#313639] flex flex-col justify-between overflow-hidden group select-none">
      {/* Outer steel shine border */}
      <div className="absolute inset-0 rounded-[46px] border border-white/5 pointer-events-none" />

      {/* Screen container */}
      <div className="relative flex flex-col w-full h-full bg-bg-dark rounded-[38px] overflow-hidden border border-white/10">
        
        {/* Top Status Bar & Notch */}
        <div className="absolute top-0 inset-x-0 h-10 bg-bg-dark z-20 flex items-center justify-between px-6 pointer-events-none">
          <span className="text-[11px] font-sans font-semibold text-text-main">9:41</span>
          
          {/* Dynamic Island */}
          <div className="w-[85px] h-[18px] bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-end pr-2.5">
            <span className="w-1.5 h-1.5 bg-[#17171d] rounded-full mr-1" />
            <span className="w-1 h-1 bg-[#12121a] rounded-full" />
          </div>

          {/* Network/Battery Icons */}
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <div className="flex gap-[1px] items-end h-2.5">
              <span className="w-[2px] h-[3px] bg-text-main rounded-sm" />
              <span className="w-[2px] h-[5px] bg-text-main rounded-sm" />
              <span className="w-[2px] h-[7px] bg-text-main rounded-sm" />
              <span className="w-[2px] h-[9px] bg-text-main/30 rounded-sm" />
            </div>
            {/* Battery */}
            <div className="w-5 h-2.5 border border-text-main/50 rounded-[4px] p-[1px] flex items-center">
              <div className="h-full w-[85%] bg-brand-lime rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Mobile Header (Starts under status bar) */}
        <div className="pt-11 px-4 pb-3 bg-surface-dark border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Image
              src="/turfzo_mascot.svg"
              alt="Turfzo Logo"
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
            <span className="font-poppins font-bold text-sm tracking-tight text-text-main">
              turf<span className="text-brand-lime">zo</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 bg-elevated-dark rounded-full flex items-center justify-center text-text-muted hover:text-brand-lime transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </button>
            <div className="w-7 h-7 bg-brand-lime rounded-full flex items-center justify-center text-black font-poppins font-bold text-[10px]">
              JD
            </div>
          </div>
        </div>

        {/* Mobile Main Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 scrollbar-none pb-20">
          
          {/* Location selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <MapPin className="w-3 h-3 text-brand-lime" />
              <span>Bengaluru, Karnataka</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search for turfs, sports..." 
                disabled
                className="w-full bg-surface-dark border border-white/5 rounded-pill pl-9 pr-4 py-2 text-xs text-text-main placeholder-text-muted/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Sports Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat, i) => (
              <span
                key={cat}
                className={`text-[10px] font-sans font-medium px-3 py-1 rounded-pill whitespace-nowrap border transition-all ${
                  i === 0 
                    ? "bg-brand-lime text-black border-brand-lime font-semibold" 
                    : "bg-surface-dark text-text-muted border-white/5 hover:text-text-main"
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Popular Turfs List */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-poppins font-semibold text-text-main">Popular Turfs</span>
              <span className="text-[10px] font-sans text-brand-lime hover:underline cursor-pointer">View all</span>
            </div>

            {/* Popular Turf Card */}
            <div className="bg-surface-dark border border-white/5 rounded-[20px] overflow-hidden flex flex-col shadow-md">
              {/* Turf Image simulation */}
              <div className="relative h-28 w-full bg-gradient-to-t from-black via-black/30 to-black/20 overflow-hidden flex items-end">
                {/* Simulated turf grid under floodlights background in CSS */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/stadium_turf_bg.png')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-black/30" />
                
                {/* Premium Badge */}
                <div className="absolute top-2 right-2 bg-brand-lime/95 text-black font-sans font-bold text-[9px] px-2 py-0.5 rounded-pill flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 fill-black" />
                  Premium
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-brand-lime font-sans font-bold text-[9px] px-2 py-0.5 rounded-pill flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-brand-lime text-brand-lime" />
                  4.8
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 flex flex-col gap-1.5">
                <div>
                  <h4 className="text-xs font-poppins font-semibold text-text-main">Playo Turf, HSR Layout</h4>
                  <p className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-brand-lime" /> HSR Layout, Bengaluru
                  </p>
                </div>

                {/* Amenities and Price */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
                    <span className="bg-elevated-dark px-1.5 py-0.5 rounded">Football</span>
                    <span className="bg-elevated-dark px-1.5 py-0.5 rounded">7v7</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-lime">₹1,000</span>
                    <span className="text-[8px] text-text-muted">/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Turf Card (Compact view) */}
            <div className="bg-surface-dark border border-white/5 rounded-[20px] p-2.5 flex items-center gap-3">
              <div className="w-16 h-16 bg-elevated-dark rounded-md overflow-hidden relative flex-shrink-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/stadium_turf_bg.png')` }} />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-poppins font-semibold text-text-main">KickOff Arena</h5>
                  <span className="text-[9px] text-brand-lime font-bold flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-brand-lime" /> 4.6
                  </span>
                </div>
                <p className="text-[9px] text-text-muted flex items-center gap-0.5">
                  <MapPin className="w-2 h-2 text-brand-lime" /> Indiranagar, Bengaluru
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-muted bg-elevated-dark px-1 py-0.5 rounded">Cricket · 8v8</span>
                  <span className="text-[10px] font-bold text-text-main">₹1,200/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Turfzo widgets inside the mobile screen */}
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-xs font-poppins font-semibold text-text-main">Why Choose Turfzo?</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-surface-dark border border-white/5 rounded-xl p-2 flex flex-col items-center text-center gap-1">
                <div className="w-6 h-6 bg-brand-lime/10 rounded-full flex items-center justify-center text-brand-lime">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-medium text-text-main">Easy Booking</span>
              </div>
              <div className="bg-surface-dark border border-white/5 rounded-xl p-2 flex flex-col items-center text-center gap-1">
                <div className="w-6 h-6 bg-brand-lime/10 rounded-full flex items-center justify-center text-brand-lime">
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-medium text-text-main">Best Prices</span>
              </div>
              <div className="bg-surface-dark border border-white/5 rounded-xl p-2 flex flex-col items-center text-center gap-1">
                <div className="w-6 h-6 bg-brand-lime/10 rounded-full flex items-center justify-center text-brand-lime">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-medium text-text-main">Premium Turfs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-surface-dark/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-4 pb-2 z-20">
          <button className="flex flex-col items-center gap-1 text-brand-lime">
            <Home className="w-4 h-4" />
            <span className="text-[8px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-text-muted hover:text-text-main transition-colors">
            <Compass className="w-4 h-4" />
            <span className="text-[8px] font-medium">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-text-muted hover:text-text-main transition-colors">
            <BookOpen className="w-4 h-4" />
            <span className="text-[8px] font-medium">Bookings</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-text-muted hover:text-text-main transition-colors">
            <User className="w-4 h-4" />
            <span className="text-[8px] font-medium">Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
