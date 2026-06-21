"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";

export default function Hero() {
  const [showComingSoon, setShowComingSoon] = useState(false);
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
          {/* Heading in Google Anton Font */}

          {/* Heading in Google Anton Font */}
          <h1 className="font-anton italic text-5xl sm:text-7xl lg:text-[5.8rem] font-normal leading-[0.9] tracking-tighter text-text-main dark:text-white uppercase text-left max-w-2xl transition-all duration-200">
            YOUR GAME<br />
            STARTS <span className="text-[#5eb13c] dark:text-[#6DFF7A]">HERE</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-text-muted font-sans font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed text-left">
            Find top-rated turfs near you, pick a time slot, and book instantly. No phone calls required.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-start gap-4 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
            <a
              href="#explore"
              className="group bg-[#5eb13c] hover:bg-brand-lime-hover text-white dark:bg-[#6DFF7A] dark:hover:bg-[#52E05E] dark:text-[#0a1c12] font-sans font-semibold px-6 py-3.5 rounded-md transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center shadow-md cursor-pointer text-sm"
            >
              Book a Turf
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <a
              href="#how-it-works"
              className="group bg-surface border border-border-default text-text-main hover:bg-elevated hover:border-border-strong font-sans font-semibold px-6 py-3.5 rounded-md transition-all duration-200 w-full sm:w-auto justify-center flex items-center gap-2 cursor-pointer text-sm"
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
          <div className="mt-16 pt-8 border-t border-border-default/50 grid grid-cols-3 gap-6 text-left max-w-xl">
            {/* Stat 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">500+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Turfs</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3.5 pl-2">
              <div className="w-11 h-11 rounded-xl border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">50K+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Happy Players</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3.5 pl-2">
              <div className="w-11 h-11 rounded-xl border border-[#5eb13c]/35 dark:border-[#6DFF7A]/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-[#5eb13c] dark:text-[#6DFF7A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-text-main dark:text-white leading-none">1000+</span>
                <span className="text-xs font-sans text-text-muted mt-1">Tournaments</span>
              </div>
            </div>
          </div>

          {/* App Store / Google Play Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center lg:items-start gap-3 w-full max-w-xl">
            <span className="text-[10px] font-sans text-text-muted tracking-wider font-extrabold uppercase">
              Book on the go — Get the app
            </span>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {/* App Store */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 h-11 w-[135px] px-3.5 rounded-lg transition-all border border-white/10 shadow-sm shrink-0"
              >
                <svg className="w-5 h-5 shrink-0 select-none" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="5" fill="#007AFF" />
                  <path fill="#ffffff" d="M12 5.5c-.3 0-.6.1-.8.4l-3.3 6.9c-.3.4-.1 1 .4 1.2.4.3 1 .1 1.2-.4l.7-1.4h5.6l.7 1.4c.2.3.5.5.8.5.2 0 .3 0 .5-.1.5-.3.6-.9.4-1.3l-3.3-6.9c-.2-.2-.5-.4-.8-.4zm-1.5 5.5l1.5-3.1 1.5 3.1h-3.0z" />
                </svg>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[8px] font-sans uppercase font-semibold text-white/75 tracking-tight">Download on the</span>
                  <span className="text-[11px] font-sans font-bold leading-none">App Store</span>
                </div>
              </button>

              {/* Google Play */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="flex items-center gap-2 bg-[#09090b] text-white hover:bg-black/90 h-11 w-[135px] px-3.5 rounded-lg transition-all border border-white/10 shadow-sm shrink-0"
              >
                <svg className="w-5 h-5 shrink-0 select-none" viewBox="0 0 16 16">
                  {/* Left Blue Segment */}
                  <path fill="#00c0ff" d="M1 13.396V2.603L6.846 8 1 13.396z" />
                  {/* Top Red Segment */}
                  <path fill="#ff3c3c" d="M1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27z" />
                  {/* Right Yellow Segment */}
                  <path fill="#ffb300" d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96z" />
                  {/* Bottom Green Segment */}
                  <path fill="#00e25b" d="M10.627 11.49L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055l7.294-4.275z" />
                </svg>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[8px] font-sans uppercase font-semibold text-white/75 tracking-tight">Get it on</span>
                  <span className="text-[11px] font-sans font-bold leading-none">Google Play</span>
                </div>
              </button>
            </div>
            {showComingSoon && (
              <p className="text-xs text-text-muted font-sans mt-1">App coming soon on Play Store & App Store</p>
            )}
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
