"use client";

import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Award } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Search",
      desc: "Find turfs near you that match your game.",
      icon: Search,
    },
    {
      num: "02",
      title: "Choose & Book",
      desc: "Pick a date, time and book instantly.",
      icon: Calendar,
    },
    {
      num: "03",
      title: "Pay Securely",
      desc: "Make secure payments with multiple options.",
      icon: CreditCard,
    },
    {
      num: "04",
      title: "Play & Enjoy",
      desc: "Show up and enjoy your game hassle-free.",
      icon: Award,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="how-it-works" className="relative py-24 bg-bg-dark border-t border-white/5">
      {/* Glow rings in background */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-lime/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-poppins text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main"
          >
            How It Works
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-brand-lime mx-auto mt-4 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-text-muted text-sm sm:text-base font-sans"
          >
            Booking a slot has never been this simple. Follow these four basic steps and get ready to play.
          </motion.p>
        </div>

        {/* Steps Timeline Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative"
        >
          {/* Connector Line (Desktop Horizontal) */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] pointer-events-none z-0">
            {/* Glowing dashed line animation */}
            <div className="w-full h-full border-t-2 border-dashed border-brand-lime/25 relative">
              <motion.div
                initial={{ left: "0%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                className="absolute -top-1 w-2.5 h-2.5 bg-brand-lime rounded-full shadow-glow-lime-intense"
              />
            </div>
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center text-center relative z-10 group"
              >
                {/* Glowing step indicator icon */}
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-surface-dark border-2 border-white/10 group-hover:border-brand-lime/50 transition-all duration-500 shadow-card-shadow">
                  {/* Subtle inner reflection & background pulse glow */}
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-brand-lime/5 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-brand-lime/0 group-hover:bg-brand-lime/5 blur-md transition-all duration-500" />
                  
                  <Icon className="w-8 h-8 text-text-main group-hover:text-brand-lime transition-colors duration-500" />
                  
                  {/* Absolute Step Badge inside the circle border */}
                  <span className="absolute -bottom-1.5 bg-brand-lime text-black font-poppins font-extrabold text-xs px-2.5 py-0.5 rounded-pill shadow-glow-lime select-none">
                    {step.num}
                  </span>
                </div>

                {/* Text Content */}
                <h3 className="mt-8 font-poppins text-lg font-bold text-text-main tracking-tight group-hover:text-brand-lime transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="mt-3 font-sans text-sm text-text-muted leading-relaxed max-w-[240px]">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
