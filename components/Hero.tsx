"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="home" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden bg-bg-dark">


      {/* Grid Layout Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Column (Hero Content) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-surface-dark border border-white/10 w-fit mx-auto lg:mx-0 mb-6 text-xs text-text-muted font-sans font-medium uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            <span>Now Live in 8+ Cities</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-text-main max-w-2xl"
          >
            Your game<br />
            starts <span className="text-brand-lime">here</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-text-muted font-sans font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            Find available turfs near you, pick a time slot, and book instantly. No phone calls required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none"
          >
            <a 
              href="#explore"
              className="group bg-brand-lime text-black font-poppins font-semibold px-8 py-4 rounded-[12px] hover:bg-brand-lime-hover transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Book a Turf
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            
            <a 
              href="#how-it-works"
              className="bg-surface-dark border border-white/10 text-text-main hover:bg-white/5 font-poppins font-semibold px-8 py-4 rounded-[12px] transition-all duration-300 w-full sm:w-auto justify-center flex items-center"
            >
              How it works
            </a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4"
          >
            {/* Stat 1 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-lime stroke-[2.5]" />
                <span className="font-poppins text-lg sm:text-xl font-bold text-text-main">500+</span>
              </div>
              <span className="text-[10px] sm:text-xs font-sans text-text-muted tracking-wide uppercase">
                Turfs Listed
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1 border-x border-white/10 px-2 sm:px-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-lime stroke-[2.5]" />
                <span className="font-poppins text-lg sm:text-xl font-bold text-text-main">50K+</span>
              </div>
              <span className="text-[10px] sm:text-xs font-sans text-text-muted tracking-wide uppercase">
                Happy Players
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-brand-lime stroke-[2.5]" />
                <span className="font-poppins text-lg sm:text-xl font-bold text-text-main">1000+</span>
              </div>
              <span className="text-[10px] sm:text-xs font-sans text-text-muted tracking-wide uppercase">
                Tournaments
              </span>
            </div>
          </motion.div>

        </motion.div>

        {/* Right Column (iPhone Mockup Showcase) - Hidden on mobile, only on desktop */}
        <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative w-full lg:h-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" as const, delay: 0.2 }}
            className="relative"
          >
            <PhoneMockup />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
