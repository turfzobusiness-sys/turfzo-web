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
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="home" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden bg-bg-dark">
      {/* Background glowing ambient light rings */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[130px] pointer-events-none" />

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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-surface-dark border border-white/10 w-fit mx-auto lg:mx-0 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-xs font-sans font-semibold tracking-wider uppercase text-text-main">
              Premium Turf Booking Experience
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-text-main max-w-2xl"
          >
            Book Premium Turfs.<br />
            <span className="text-brand-lime">Play.</span> Enjoy. <span className="text-brand-lime">Repeat.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-text-muted font-sans font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            Turfzo makes it simple to discover and book the best turfs near you. Anytime. Anywhere. Step onto professional grass under bright floodlights today.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <a 
              href="#explore"
              className="group bg-brand-lime text-black font-poppins font-semibold px-8 py-4 rounded-pill hover:bg-brand-lime-hover hover:shadow-glow-lime hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Book a Turf
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            
            <a 
              href="#how-it-works"
              className="bg-transparent border border-white/15 text-text-main hover:bg-white/5 font-poppins font-semibold px-8 py-4 rounded-pill hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center flex items-center"
            >
              Explore Turfs
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
                Premium Turfs
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

        {/* Right Column (iPhone Mockup Showcase) */}
        <div className="lg:col-span-5 flex items-center justify-center relative w-full h-[650px] lg:h-auto">
          {/* Intense Glow Circle behind mockup */}
          <div className="absolute w-[320px] h-[320px] bg-brand-lime/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateY: 15, rotateX: 5 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0, rotateX: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
            className="relative transform hover:scale-102 hover:-rotate-1 hover:translate-y-[-5px] transition-all duration-500 ease-out"
          >
            {/* Dynamic visual spotlight under the phone */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/60 rounded-full blur-[20px] pointer-events-none" />
            <PhoneMockup />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
