"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section id="tournaments" className="relative py-20 px-6 md:px-8 bg-bg overflow-hidden">
      {/* Outer container to hold the background image and card */}
      <div className="max-w-7xl mx-auto relative rounded-lg overflow-hidden border border-border-default shadow-card-shadow min-h-[420px] flex items-center">
        
        {/* Background Image with Dark Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
        />
        <div className="absolute inset-0 bg-overlay z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent z-0" />
        
        {/* Content Centered Container */}
        <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center p-8 sm:p-12 md:p-16">
          <span className="text-xs sm:text-sm font-sans font-bold tracking-widest text-brand-lime uppercase mb-4">
            READY TO PLAY?
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main leading-tight tracking-tight">
            Your next game is <span className="text-brand-lime">one tap away</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-text-muted max-w-md font-sans leading-relaxed">
            Pick a turf, pick a time. We&apos;ll handle the rest.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <a 
              href="#explore"
              className="bg-brand-lime text-black font-poppins font-semibold px-8 py-3.5 rounded-[12px] hover:bg-brand-lime-hover transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              Book Now
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a 
              href="#explore"
              className="bg-surface border border-border-default text-text-main hover:bg-elevated font-poppins font-semibold px-8 py-3.5 rounded-[12px] transition-all duration-300 flex items-center justify-center"
            >
              Explore Turfs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
