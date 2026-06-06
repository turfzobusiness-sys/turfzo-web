"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-20 flex items-center justify-center overflow-hidden bg-bg"
    >
      {/* ======================================================== */}
      {/*           CINEMATIC AI STADIUM BACKGROUND IMAGE          */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {/* Dark Mode Background */}
        <Image
          src="/stadium_cinematic_bg.png"
          alt="Cinematic Night Stadium Backdrop"
          fill
          priority
          className="object-cover object-center dark:block hidden"
        />

        {/* Light Mode Background */}
        <Image
          src="/stadium_light_bg.png"
          alt="Cinematic Day Stadium Backdrop"
          fill
          priority
          className="object-cover object-center dark:hidden block"
        />
        
        {/* Dark Mode Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30 dark:block hidden z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/45 dark:block hidden z-10" />
        <div className="absolute inset-0 bg-black/35 dark:block hidden z-10" />
        
        {/* Light Mode Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/65 via-bg/15 to-transparent dark:hidden block z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent dark:hidden block z-10" />
      </div>

      {/* Grid Layout Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-20 relative">
        
        {/* Left Column (Hero Content) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-border-default w-fit mx-auto lg:mx-0 mb-6 text-xs text-text-main font-sans font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-lime"></span>
            </span>
            <span>Now Live in 8+ Cities</span>
          </div>

          {/* Heading in Google Anton Font */}
          <h1 className="font-anton italic text-5xl sm:text-7xl lg:text-[5.8rem] font-normal leading-[0.9] tracking-tighter text-text-main dark:text-white uppercase text-left max-w-2xl transition-all duration-200 drop-shadow-[0_2px_8px_rgba(255,255,255,0.85)] dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            YOUR GAME<br />
            STARTS <span className="text-[#5eb13c] dark:text-[#6DFF7A]">HERE</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-text-muted font-sans font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed text-left drop-shadow-[0_1.5px_3px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Find top-rated turfs near you, pick a time slot, and book instantly. No phone calls required.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-start gap-4 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
            <a 
              href="#explore"
              className="group bg-[#5eb13c] hover:bg-brand-lime-hover text-white border border-[#4c992f] dark:bg-[#6DFF7A] dark:hover:bg-[#52E05E] dark:text-[#0a1c12] dark:border-[#6DFF7A]/30 font-sans font-semibold px-6 py-3.5 rounded-md transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center shadow-md cursor-pointer text-sm"
            >
              Book a Turf
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            
            <a 
              href="#how-it-works"
              className="group bg-surface/80 backdrop-blur-sm border border-text-main/25 text-text-main hover:bg-elevated hover:border-border-strong font-sans font-semibold px-6 py-3.5 rounded-md transition-all duration-200 w-full sm:w-auto justify-center flex items-center gap-2 cursor-pointer text-sm"
            >
              How it works
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-text-main/5 border border-border-default group-hover:bg-brand-lime/10 group-hover:border-brand-lime/20 transition-all">
                <svg className="w-1.5 h-1.5 fill-current text-text-main group-hover:text-[#5eb13c] dark:group-hover:text-brand-lime ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </a>
          </div>

          {/* ======================================================== */}
          {/*                   FLAT TYPOGRAPHIC STATS                 */}
          {/* ======================================================== */}
          <div className="mt-12 p-4.5 rounded-xl border border-border-default/70 bg-surface/30 backdrop-blur-[2px] grid grid-cols-3 gap-4 text-left max-w-xl shadow-sm">
            {/* Stat 1 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0 bg-surface/20">
                <Calendar className="w-4 h-4 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-bold text-text-main dark:text-white leading-none">500+</span>
                <span className="text-[10px] font-sans text-text-muted mt-0.5">Turfs</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3 pl-4 border-l border-border-default/50">
              <div className="w-9 h-9 rounded-lg border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0 bg-surface/20">
                <Users className="w-4 h-4 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-bold text-text-main dark:text-white leading-none">50K+</span>
                <span className="text-[10px] font-sans text-text-muted mt-0.5">Happy Players</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3 pl-4 border-l border-border-default/50">
              <div className="w-9 h-9 rounded-lg border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0 bg-surface/20">
                <Trophy className="w-4 h-4 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-bold text-text-main dark:text-white leading-none">1000+</span>
                <span className="text-[10px] font-sans text-text-muted mt-0.5">Tournaments</span>
              </div>
            </div>
          </div>

          {/* App Store / Google Play Buttons */}
          <div className="mt-10 flex flex-col items-start gap-3 w-full max-w-xl">
            <span className="text-[10px] font-sans text-text-muted tracking-wider font-extrabold uppercase">
              Book on the go — Get the app
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 px-4 py-2 rounded-lg transition-all border border-white/10 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.22-.58 2.94-1.39z" />
                </svg>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] font-sans uppercase font-medium opacity-80">Download on the</span>
                  <span className="text-xs font-sans font-bold -mt-0.5">App Store</span>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 px-4 py-2 rounded-lg transition-all border border-white/10 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M5 3.25a.75.75 0 0 0-.75.75v16a.75.75 0 0 0 1.23.58l13-9a.75.75 0 0 0 0-1.16l-13-9A.75.75 0 0 0 5 3.25z" />
                </svg>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] font-sans uppercase font-medium opacity-80">Get it on</span>
                  <span className="text-xs font-sans font-bold -mt-0.5">Google Play</span>
                </div>
              </a>
            </div>
          </div>

        </motion.div>

        {/* Right Column (iPhone Mockup Showcase) */}
        <div className="flex lg:col-span-5 items-center justify-center relative w-full lg:h-auto mt-8 lg:mt-0">
          <div className="relative scale-95 sm:scale-100 origin-center w-full flex justify-center">
            
            {/* Show the static mockup image directly since it already contains the iPhone frame */}
            <div className="relative w-[300px] sm:w-[330px] aspect-[9/18] select-none">
              <Image
                src="/Screenshot_20260603-131114.turfzo-portrait.png"
                alt="Turfzo App Mockup"
                width={330}
                height={660}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
