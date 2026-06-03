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
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (


    <section id="how-it-works" className="relative py-20 bg-bg border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
            How It Works
          </h2>
          <div className="h-1 w-12 bg-brand-lime mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-text-muted text-sm sm:text-base font-sans">
            Four steps. Under a minute.
          </p>
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
          <div className="hidden lg:block absolute top-[32px] left-[12%] right-[12%] h-[1px] pointer-events-none z-0">
            <div className="w-full h-full border-t border-dashed border-border-default" />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex flex-col items-center text-center relative z-10 group"
              >
                {/* Clean step indicator icon */}
                <div className="relative w-16 h-16 rounded-[12px] flex items-center justify-center bg-surface border border-border-default group-hover:border-border-strong transition-all duration-300">
                  <Icon className="w-6 h-6 text-text-main group-hover:text-brand-lime transition-colors duration-300" />
                  
                  {/* Absolute Step Badge */}
                  <span className="absolute -top-2 -right-2 bg-brand-lime text-black font-poppins font-bold text-[10px] px-2 py-0.5 rounded-[4px] select-none">
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
