"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section id="tournaments" className="relative py-20 px-6 md:px-8 bg-bg-dark overflow-hidden">
      {/* Outer container to hold the background image and card */}
      <div className="max-w-7xl mx-auto relative rounded-lg overflow-hidden border border-white/10 shadow-card-shadow min-h-[420px] flex items-center">
        
        {/* Background Image with Dark Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent z-0" />
        
        {/* Ambient neon lights in CTA */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-lime/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Content & Layout Grid */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 md:p-16">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-brand-lime uppercase mb-4">
              READY TO PLAY?
            </span>
            <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
              Book Your Slot <span className="text-brand-lime">Today!</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-text-muted max-w-md font-sans leading-relaxed">
              Join thousands of players who trust Turfzo for their game time. Secure the best pitches under bright floodlights in seconds.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a 
                href="#explore"
                className="bg-brand-lime text-black font-poppins font-semibold px-8 py-3.5 rounded-pill hover:bg-brand-lime-hover hover:shadow-glow-lime hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                Book Now
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </a>
              <a 
                href="#explore"
                className="bg-transparent border border-white/20 hover:border-white/40 text-text-main hover:bg-white/5 font-poppins font-semibold px-8 py-3.5 rounded-pill hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
              >
                Explore Turfs
              </a>
            </div>
          </div>

          {/* Right Floating Ball & Goal Post Graphics Column */}
          <div className="hidden lg:col-span-5 lg:flex items-center justify-end relative h-full min-h-[300px]">
            
            {/* Stadium Goal Post Illustration in CSS/SVG */}
            <div className="absolute right-0 bottom-0 w-80 h-44 border-2 border-white/20 border-b-0 rounded-t-sm flex items-end justify-center z-0">
              {/* Goal net mesh overlay */}
              <div className="w-full h-full opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" 
                style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "8px 8px" }} 
              />
            </div>

            {/* Floating 3D SVG Soccer Ball */}
            <motion.div
              animate={{ 
                y: [0, -18, 0],
                rotate: [0, 15, 0]
              }}
              transition={{ 
                duration: 6, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
              className="relative z-10 mr-12 select-none"
            >
              <svg viewBox="0 0 100 100" className="w-44 h-44 drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)]">
                <defs>
                  <radialGradient id="ballShade" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="65%" stopColor="#d1d5db" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </radialGradient>
                  <radialGradient id="glowAccent" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#9FE870" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#9FE870" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Glow around ball */}
                <circle cx="50" cy="50" r="48" fill="url(#glowAccent)" />

                {/* Soccer Ball Base Sphere */}
                <circle cx="50" cy="50" r="40" fill="url(#ballShade)" stroke="#0b0f0d" strokeWidth="1" />

                {/* Central Pentagon Panel */}
                <polygon points="50,42 42,48 45,58 55,58 58,48" fill="#111827" stroke="#1f2937" strokeWidth="0.75" />

                {/* Seam lines radiating from center pentagon */}
                <line x1="50" y1="42" x2="50" y2="28" stroke="#0b0f0d" strokeWidth="1.5" />
                <line x1="42" y1="48" x2="28" y2="45" stroke="#0b0f0d" strokeWidth="1.5" />
                <line x1="45" y1="58" x2="36" y2="70" stroke="#0b0f0d" strokeWidth="1.5" />
                <line x1="55" y1="58" x2="64" y2="70" stroke="#0b0f0d" strokeWidth="1.5" />
                <line x1="58" y1="48" x2="72" y2="45" stroke="#0b0f0d" strokeWidth="1.5" />

                {/* Outer Hexagonal panels */}
                <polygon points="50,28 38,20 58,20" fill="#111827" stroke="#0b0f0d" strokeWidth="1" />
                <polygon points="28,45 20,53 23,63 36,70" fill="none" stroke="#0b0f0d" strokeWidth="1.5" />
                <polygon points="72,45 80,53 77,63 64,70" fill="none" stroke="#0b0f0d" strokeWidth="1.5" />
                <polygon points="50,28 38,22 28,30 28,45" fill="none" stroke="#0b0f0d" strokeWidth="1.5" />
                <polygon points="50,28 62,22 72,30 72,45" fill="none" stroke="#0b0f0d" strokeWidth="1.5" />
                
                {/* Edge Panels (Filled black) */}
                <polygon points="20,53 12,45 16,35 28,30" fill="#111827" stroke="#0b0f0d" strokeWidth="1" />
                <polygon points="80,53 88,45 84,35 72,30" fill="#111827" stroke="#0b0f0d" strokeWidth="1" />
                <polygon points="36,70 45,80 55,80 64,70" fill="none" stroke="#0b0f0d" strokeWidth="1.5" />
                <polygon points="45,80 34,76 30,65" fill="#111827" stroke="#0b0f0d" strokeWidth="1" />
                <polygon points="55,80 66,76 70,65" fill="#111827" stroke="#0b0f0d" strokeWidth="1" />
              </svg>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
