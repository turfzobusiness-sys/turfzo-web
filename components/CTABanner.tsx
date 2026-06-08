"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section id="tournaments" className="relative py-20 px-6 md:px-8 bg-bg overflow-hidden">
      {/* Outer container to hold the content */}
      <div className="max-w-7xl mx-auto relative rounded-xl overflow-hidden border border-border-default bg-surface min-h-[380px] flex items-center justify-center">
        
        {/* Content Centered Container */}
        <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center p-8 sm:p-12">
          <span className="text-xs sm:text-sm font-sans font-medium tracking-wide uppercase mb-4 text-brand-lime">
            Ready to play?
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main leading-tight tracking-tight">
            Your next game is one tap away
          </h2>
          <p className="mt-4 text-sm sm:text-base text-text-muted max-w-md font-sans leading-relaxed">
            Pick a turf, pick a time. We&apos;ll handle the rest.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
            <a 
              href="#explore"
              className="bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover hover:border-brand-lime/60 font-sans font-medium px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
            >
              Book Now
              <ArrowUpRight className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a 
              href="#explore"
              className="bg-bg border border-border-default text-text-main hover:bg-elevated hover:border-border-strong font-sans font-medium px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center"
            >
              Explore Turfs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
