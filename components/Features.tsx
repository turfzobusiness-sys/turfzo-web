"use client";

import * as React from "react";
import { ArrowUpRight, ShieldCheck, Zap, CircleDollarSign, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    num: "01",
    title: "Verified Venues Only",
    desc: "Every listing on Turfzo is personally inspected. We verify location accuracy, amenities, lighting quality, and turf conditions so you play exactly what you see.",
    tag: "100% Verified",
    icon: ShieldCheck,
    colorClass: "text-[#6DB631] bg-[#6DB631]/10"
  },
  {
    num: "02",
    title: "Instant Confirmation",
    desc: "Check real-time slots and get confirmed in under 60 seconds. Our direct integration with venue management software eliminates double bookings.",
    tag: "Real-time",
    icon: Zap,
    colorClass: "text-[#E4B66A] bg-[#E4B66A]/10"
  },
  {
    num: "03",
    title: "Zero Hidden Fees",
    desc: "What you see is what you pay. Transparent booking pricing with absolute zero convenience charges or hidden administrative fees.",
    tag: "No Booking Fees",
    icon: CircleDollarSign,
    colorClass: "text-[#5B91C8] bg-[#5B91C8]/10"
  },
  {
    num: "04",
    title: "Flexible Refunds & Cancellations",
    desc: "Plans changed? Cancel with confidence. Receive automatic refunds directly to your account based on the venue's cancellation window.",
    tag: "Hassle-free",
    icon: RotateCcw,
    colorClass: "text-[#E05A47] bg-[#E05A47]/10"
  }
];

const STATS = [
  { value: "10K+", label: "Bookings completed" },
  { value: "500+", label: "Verified fields" },
  { value: "25K+", label: "Active players" },
  { value: "4.8/5", label: "User satisfaction" }
];

const IMAGES = [
  "/feature_verified.jpg",
  "/feature_instant.jpg",
  "/feature_zero_fees.jpg",
  "/feature_refunds.jpg"
];

export default function Features() {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  
  // Use first image as default
  const activeImgIdx = hoveredIdx !== null ? hoveredIdx : 0;

  return (
    <section id="why-choose" className="py-24 sm:py-32 bg-bg border-t border-border-subtle relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-lime/[0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: Sticky context, dynamic image & stats */}
          <div className="lg:sticky lg:top-28 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-lime">
                Engineered for players
              </span>
              <h2 className="font-poppins text-4xl sm:text-5xl font-extrabold tracking-tight text-text-main leading-[1.1]">
                Better turf booking. <br />
                <span className="text-text-muted">No friction.</span>
              </h2>
              <p className="max-w-md font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                Everything you need to secure your ground and lead your team, flat-out simplified. 
              </p>
            </div>

            {/* DYNAMIC AESTHETIC IMAGE SLIDESHOW */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl border border-border-default overflow-hidden bg-surface shadow-card-shadow">
              {IMAGES.map((src, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-in-out",
                    activeImgIdx === idx 
                      ? "opacity-100 scale-100 z-10" 
                      : "opacity-0 scale-[1.04] z-0 pointer-events-none"
                  )}
                >
                  <img
                    src={src}
                    alt={`Feature preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                </div>
              ))}
            </div>

            {/* Flat typographic stats */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-border-default">
              {STATS.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-text-main">
                    {stat.value}
                  </div>
                  <div className="font-sans text-[10px] text-text-muted font-semibold tracking-wider uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Premium interactive glassmorphic cards */}
          <div className="flex flex-col gap-6">
            {FEATURES.map((feature, idx) => {
              const isHovered = hoveredIdx === idx;
              const isAnyHovered = hoveredIdx !== null;
              const Icon = feature.icon;
              
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={cn(
                    "relative p-6 sm:p-8 rounded-2xl cursor-pointer select-none transition-all duration-300 ease-out",
                    "bg-surface/30 dark:bg-surface/10 border border-border-default/40 backdrop-blur-xs",
                    "hover:scale-[1.01] hover:border-brand-lime/80 hover:bg-surface/60 dark:hover:bg-surface/20",
                    "hover:shadow-[0_8px_30px_rgba(109,182,49,0.08)]",
                    isAnyHovered && !isHovered ? "opacity-60 scale-[0.99]" : "opacity-100"
                  )}
                >
                  <div className="flex gap-5 sm:gap-6 items-start">
                    {/* Glowing Icon Container */}
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", feature.colorClass)}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <h3 className="font-poppins text-lg sm:text-xl font-bold text-text-main tracking-tight transition-colors duration-200 group-hover:text-brand-lime">
                          {feature.title}
                        </h3>
                        <span className="text-[9px] font-sans font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-elevated text-text-muted border border-border-subtle">
                          {feature.tag}
                        </span>
                      </div>
                      
                      <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Subtle micro-interaction arrow */}
                    <div className={cn(
                      "self-start pt-1.5 opacity-30 transition-all duration-300",
                      isHovered && "opacity-100 translate-x-1 -translate-y-1 text-brand-lime"
                    )}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
