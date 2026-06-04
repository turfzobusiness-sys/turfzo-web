"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    num: "01",
    title: "Verified Venues Only",
    desc: "Every listing on Turfzo is personally inspected. We verify location accuracy, amenities, lighting quality, and turf conditions so you play exactly what you see.",
    tag: "100% Verified"
  },
  {
    num: "02",
    title: "Instant Confirmation",
    desc: "Check real-time slots and get confirmed in under 60 seconds. Our direct integration with venue management software eliminates double bookings.",
    tag: "Real-time"
  },
  {
    num: "03",
    title: "Zero Hidden Fees",
    desc: "What you see is what you pay. Transparent booking pricing with absolute zero convenience charges or hidden administrative fees.",
    tag: "No Booking Fees"
  },
  {
    num: "04",
    title: "Flexible Refunds & Cancellations",
    desc: "Plans changed? Cancel with confidence. Receive automatic refunds directly to your account based on the venue's cancellation window.",
    tag: "Hassle-free"
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

          {/* RIGHT COLUMN: Minimal timeline list */}
          <div className="divide-y divide-border-default border-t border-b border-border-default">
            {FEATURES.map((feature, idx) => {
              const isHovered = hoveredIdx === idx;
              const isAnyHovered = hoveredIdx !== null;
              
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="py-10 transition-all duration-300 cursor-pointer relative group"
                >
                  <div 
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 transition-opacity duration-300",
                      isAnyHovered && !isHovered ? "opacity-30" : "opacity-100"
                    )}
                  >
                    {/* Index Number */}
                    <div className="font-poppins text-sm sm:text-base font-bold text-brand-lime tracking-wider shrink-0 w-8">
                      {feature.num}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <h3 className="font-poppins text-lg sm:text-xl font-bold text-text-main tracking-tight group-hover:text-brand-lime transition-colors">
                          {feature.title}
                        </h3>
                        <span className="self-start sm:self-auto text-[9px] font-sans font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-elevated text-text-muted border border-border-subtle">
                          {feature.tag}
                        </span>
                      </div>
                      
                      <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Subtle micro-interaction arrow */}
                    <div className="hidden sm:flex self-start pt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="w-5 h-5 text-brand-lime" />
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
