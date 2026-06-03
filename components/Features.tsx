"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export default function Features() {
  const featuresList = [
    {
      icon: Calendar,
      title: "Book in 60 seconds",
      desc: "Check real-time slots and get instant confirmation in seconds.",
      subText: "Instant confirmation",
    },
    {
      icon: MapPin,
      title: "Verified venues",
      desc: "All turf details, amenities, and photos are 100% verified.",
      subText: "Verified grounds only",
    },
    {
      icon: CreditCard,
      title: "No hidden fees",
      desc: "Transparent pricing. Pay exactly what the turf charges, with no booking fees.",
      subText: "Zero convenience fees",
    },
    {
      icon: ShieldCheck,
      title: "Money-back guarantee",
      desc: "Hassle-free cancellations and automatic refunds according to turf policies.",
      subText: "100% refund policy",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
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
    <section id="explore" className="relative py-20 bg-bg border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
            Why Choose Turfzo?
          </h2>
          <div className="h-1 w-12 bg-brand-lime mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-text-muted text-sm sm:text-base font-sans">
            Everything you need to get your game on, without the hassle.
          </p>
        </div>

        {/* Features 4-column Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {featuresList.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-surface border border-border-default hover:border-border-strong rounded-[12px] p-6 transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Icon container */}
                  <div className="w-12 h-12 rounded-[8px] flex items-center justify-center bg-elevated border border-border-default transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-brand-lime" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 font-poppins text-base font-bold text-text-main tracking-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 font-sans text-xs text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtext info */}
                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-[10px] font-sans font-medium tracking-wider text-text-muted uppercase">
                  <span>{item.subText}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
