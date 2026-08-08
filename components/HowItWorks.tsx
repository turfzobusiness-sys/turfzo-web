"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Award, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    num: "01",
    title: "Find Your Pitch",
    desc: "Search for premium verified turfs near you. Filter by location, pricing, time slot availability, and key amenities like floodlights or parking.",
    tag: "Search",
    icon: Search
  },
  {
    num: "02",
    title: "Choose & Book",
    desc: "Pick your preferred date and available hour from real-time slot grids. Instant confirmation booking locks your spot in under a minute.",
    tag: "Reservation",
    icon: Calendar
  },
  {
    num: "03",
    title: "Pay & Split Bill",
    desc: "Make safe online payments. Add your teammates' contacts at checkout to split the bill, allowing everyone to pay their share directly.",
    tag: "Split Fare",
    icon: CreditCard
  },
  {
    num: "04",
    title: "Show Up & Play",
    desc: "Access the pitch by scanning your ticket QR code pass at the entrance gates. Floodlights automatically activate according to your schedule.",
    tag: "Play Ball",
    icon: Award
  }
];

const COORDS = [
  { left: "15%", top: "50%" },
  { left: "40%", top: "30%" },
  { left: "65%", top: "70%" },
  { left: "85%", top: "50%" }
];

export default function HowItWorks() {
  const [activeIdx, setActiveIdx] = React.useState(0);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-bg border-t border-border-subtle relative overflow-hidden">
      {/* Background ambient light */}
      

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-lime">
            Playbook Strategy
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main mt-4">
            Our Booking <span className="text-brand-lime">Playbook</span>
          </h2>
          <div className="h-1 w-12 bg-brand-lime mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-text-muted text-sm sm:text-base font-sans">
            Move the ball from search to kickoff in 4 simple passes.
          </p>
        </div>

        {/* Tactical Pitch Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-24 items-center">
          
          {/* LEFT PANEL: Tactical Soccer Pitch Board */}
          <div className="relative w-full aspect-[1.5/1] max-w-[640px] bg-[#07170F] border border-brand-lime/20 rounded-2xl overflow-hidden shadow-2xl p-4 flex items-center justify-center">
            
            {/* Soccer Pitch Markings (SVG) */}
            <svg 
              viewBox="0 0 600 400" 
              className="absolute inset-0 w-full h-full select-none pointer-events-none opacity-40"
            >
              {/* Grass Patterns / Stripes */}
              <g opacity="0.15">
                <rect x="0" y="0" width="75" height="400" fill="var(--color-brand-lime)" />
                <rect x="150" y="0" width="75" height="400" fill="var(--color-brand-lime)" />
                <rect x="300" y="0" width="75" height="400" fill="var(--color-brand-lime)" />
                <rect x="450" y="0" width="75" height="400" fill="var(--color-brand-lime)" />
              </g>

              {/* Boundary Line */}
              <rect x="20" y="20" width="560" height="360" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              
              {/* Halfway Line */}
              <line x1="300" y1="20" x2="300" y2="380" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              
              {/* Center Circle */}
              <circle cx="300" cy="200" r="50" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              <circle cx="300" cy="200" r="2.5" fill="rgba(159, 232, 112, 0.4)" />

              {/* Left Penalty Area */}
              <rect x="20" y="100" width="80" height="200" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              <rect x="20" y="150" width="30" height="100" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              <circle cx="100" cy="200" r="1.5" fill="rgba(159, 232, 112, 0.4)" />
              <path d="M 100 160 A 50 50 0 0 1 100 240" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />

              {/* Right Penalty Area */}
              <rect x="500" y="100" width="80" height="200" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              <rect x="550" y="150" width="30" height="100" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />
              <circle cx="500" cy="200" r="1.5" fill="rgba(159, 232, 112, 0.4)" />
              <path d="M 500 160 A 50 50 0 0 0 500 240" fill="none" stroke="rgba(159, 232, 112, 0.4)" strokeWidth="1.5" />

              {/* Goal Posts */}
              <rect x="8" y="170" width="12" height="60" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />
              <rect x="580" y="170" width="12" height="60" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" />

              {/* Tactical Connection Path (Dashed Bezier Line) */}
              <path 
                d="M 90 200 Q 165 140 240 120 T 390 280 Q 450 230 510 200" 
                fill="none" 
                stroke="var(--color-brand-lime)" 
                strokeWidth="2" 
                strokeDasharray="6, 6" 
                className="opacity-60"
              />
            </svg>

            {/* Tactical Interactive Area Wrapper */}
            <div className="absolute inset-0 w-full h-full">
              
              {/* Tactical Nodes */}
              {STEPS.map((step, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={idx}
                    style={{ 
                      left: COORDS[idx].left, 
                      top: COORDS[idx].top 
                    }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setActiveIdx(idx)}
                    className="absolute cursor-pointer select-none group/node z-20"
                  >
                    {/* Node circle */}
                    <div className={cn(
                      "w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center border-2 font-sans text-xs font-extrabold transition-all duration-300",
                      isActive 
                        ? "bg-[#16211B] border-brand-lime text-brand-lime shadow-[0_0_15px_rgba(159,232,112,0.35)] scale-110" 
                        : "bg-surface border-border-default text-text-muted hover:border-border-strong hover:text-text-main hover:scale-105"
                    )}>
                      {step.num}
                    </div>

                    {/* Miniature Step Name Tooltip on Node Hover */}
                    <div className={cn(
                      "absolute top-7 left-1/2 -translate-x-1/2 bg-surface border border-border-default px-2 py-1 rounded text-[8px] font-bold text-text-main tracking-wider uppercase whitespace-nowrap shadow-md pointer-events-none transition-all duration-200",
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 group-hover/node:opacity-100 group-hover/node:translate-y-0"
                    )}>
                      {step.tag}
                    </div>
                  </div>
                );
              })}

              {/* Animated Soccer Ball indicator */}
              <motion.div
                className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-neutral-800 flex items-center justify-center text-sm z-30 select-none pointer-events-none"
                animate={{ 
                  left: COORDS[activeIdx].left, 
                  top: COORDS[activeIdx].top 
                }}
                transition={{ type: "spring", stiffness: 130, damping: 15 }}
              >
                ⚽
              </motion.div>

            </div>

          </div>

          {/* RIGHT PANEL: Typographic Content List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="divide-y divide-border-default border-t border-b border-border-default"
          >
            {STEPS.map((step, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => setActiveIdx(idx)}
                  className="py-7 transition-all duration-300 cursor-pointer relative group"
                >
                  <div 
                    className={cn(
                      "flex items-start gap-5 transition-opacity duration-300",
                      !isActive ? "opacity-35 hover:opacity-75" : "opacity-100"
                    )}
                  >
                    {/* Icon column */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                      isActive 
                        ? "bg-brand-lime/10 border-brand-lime/30 text-brand-lime" 
                        : "bg-elevated border-border-default text-text-muted group-hover:text-text-main"
                    )}>
                      <step.icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Text column */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-sans text-base sm:text-lg font-bold text-text-main tracking-tight group-hover:text-brand-lime transition-colors">
                          {step.title}
                        </h3>
                        <span className="text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-elevated text-text-muted border border-border-subtle">
                          {step.num}
                        </span>
                      </div>
                      
                      <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                        {step.desc}
                      </p>
                    </div>

                    {/* Interaction Arrow */}
                    <div className="hidden sm:flex self-start pt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="w-4 h-4 text-brand-lime" />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
