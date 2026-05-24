"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export default function Features() {
  const featuresList = [
    {
      icon: Calendar,
      title: "Easy Booking",
      desc: "Book your favorite turf in just a few taps. Check real-time slots and instant confirmation.",
      subText: "10-second booking process",
    },
    {
      icon: MapPin,
      title: "Premium Locations",
      desc: "Top quality turfs in prime locations near you. Curated list of premium and luxury venues.",
      subText: "Verified grounds only",
    },
    {
      icon: CreditCard,
      title: "Best Prices",
      desc: "Affordable pricing with zero hidden charges. Pay online securely or split the bill.",
      subText: "No booking convenience fees",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Secure",
      desc: "Secure payments with multiple options. Fully-floodlighted venues with top-tier security.",
      subText: "100% money-back guarantee",
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
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="explore" className="relative py-24 bg-bg-dark border-t border-white/5">
      {/* Background glow ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-lime/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-poppins text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main"
          >
            Why Choose Turfzo?
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
            We set the gold standard in online turf bookings. Experience a premium sports layout with seamless payments and high-contrast floodlight slots.
          </motion.p>
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
                className="group relative bg-surface-dark border border-white/5 hover:border-brand-lime/20 rounded-md p-8 transition-all duration-300 hover:shadow-glow-lime flex flex-col justify-between h-full"
              >
                {/* Spotlight Background effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-lime/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-md pointer-events-none" />

                <div>
                  {/* Icon with glowing backdrop */}
                  <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-bg-dark border border-white/10 group-hover:border-brand-lime/30 transition-all duration-300">
                    <div className="absolute inset-0 rounded-full bg-brand-lime/5 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    <IconComponent className="relative w-6 h-6 text-brand-lime transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 font-poppins text-lg font-bold text-text-main tracking-tight group-hover:text-brand-lime transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 font-sans text-sm text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Subtext info pill */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-sans font-semibold tracking-wider text-brand-lime/80 uppercase">
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
