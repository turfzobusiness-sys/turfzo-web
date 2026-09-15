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
    icon: ShieldCheck
  },
  {
    num: "02",
    title: "Instant Confirmation",
    desc: "Check real-time slots and get confirmed in under 60 seconds. Our direct integration with venue management software eliminates double bookings.",
    tag: "Real-time",
    icon: Zap
  },
  {
    num: "03",
    title: "Transparent Pricing",
    desc: "What you see at checkout is what you pay. The single service fee is clearly shown before you pay — nothing hidden, nothing added later.",
    tag: "No Booking Fees",
    icon: CircleDollarSign
  },
  {
    num: "04",
    title: "Flexible Refunds & Cancellations",
    desc: "Plans changed? Cancel with confidence. Receive automatic refunds directly to your account based on the venue's cancellation window.",
    tag: "Hassle-free",
    icon: RotateCcw
  }
];

const STATS = [
  { value: "10K+", label: "Bookings completed" },
  { value: "100%", label: "Verified fields" },
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
    <section id="why-choose" className="py-24 sm:py-32 bg-bg border-t border-border-default relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: Sticky context, dynamic image & stats */}
          <div className="lg:sticky lg:top-28 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-medium tracking-wide uppercase text-text-muted">
                Engineered for players
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-text-main leading-[1.1]">
                Better turf booking. <br />
                <span className="text-text-muted">No friction.</span>
              </h2>
              <p className="max-w-md font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                Everything you need to secure your ground and lead your team, flat-out simplified. 
              </p>
            </div>

            {/* DYNAMIC AESTHETIC IMAGE SLIDESHOW */}
            <div className="relative h-60 sm:h-72 w-full rounded-md border border-border-default overflow-hidden bg-surface">
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
                  
                </div>
              ))}
            </div>

            {/* Flat typographic stats */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-border-default">
              {STATS.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-sans text-2xl sm:text-3xl font-bold text-text-main">
                    {stat.value}
                  </div>
                  <div className="font-sans text-[10px] text-text-muted font-medium tracking-wide uppercase">
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
                    "relative p-5 sm:p-6 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out",
                    "bg-surface border border-border-default",
                    "hover:border-border-strong hover:bg-elevated",
                    "opacity-100"
                  )}
                >
                  <div className="flex gap-4 sm:gap-5 items-start">
                    {/* Icon Container */}
                    <div className="mt-1 shrink-0 text-text-secondary transition-colors duration-200 group-hover:text-text-main">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <h3 className="font-sans text-base sm:text-lg font-semibold text-text-main tracking-tight transition-colors duration-200 group-hover:text-text-main">
                          {feature.title}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-elevated text-text-secondary font-semibold border border-border-default">
                          {feature.tag}
                        </span>
                      </div>
                      
                      <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Subtle micro-interaction arrow */}
                    <div className={cn(
                      "self-start pt-1.5 opacity-0 transition-all duration-200",
                      isHovered && "opacity-100 text-text-muted"
                    )}>
                      <ArrowUpRight className="w-4 h-4 stroke-[2]" />
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
