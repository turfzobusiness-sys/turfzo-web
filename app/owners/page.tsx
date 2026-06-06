"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { 
  TbCalendarTime, 
  TbCpu, 
  TbWallet, 
  TbBolt, 
  TbShieldCheck, 
  TbDeviceMobile, 
  TbMapPin, 
  TbChevronDown 
} from "react-icons/tb";
import { HiSparkles, HiArrowDown } from "react-icons/hi2";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { VenueRegistrationForm } from "@/components/owners/venue-registration-form";

// Owner FAQ data
const OWNER_FAQS = [
  {
    q: "How does the IoT-enabled lighting and gate system work?",
    a: "We install a compact wireless IoT relay at your power distribution board and gate lock. When a player books a slot on Turfzo, our server schedules a trigger to activate the lights 5 minutes before the session starts and turn them off 5 minutes after it ends. Similarly, a unique PIN is texted to the player to unlock the gate during their slot."
  },
  {
    q: "How and when do I get paid?",
    a: "Payments are processed automatically. When a player books or splits a bill, the funds go into escrow. Once the slot completes, settlements are cleared and deposited directly into your bank account within 24 hours. No manual tracking, no chasing cash."
  },
  {
    q: "Is it free to list my sports venue?",
    a: "Yes! Listing your turf, courts, or nets is completely free. We only charge a small convenience commission on successful online bookings made through the Turfzo app, meaning we only make money when you do."
  },
  {
    q: "Can I manage offline bookings or regular coaching academies?",
    a: "Absolutely. You get a dedicated Partner Dashboard (Web and Mobile app) where you can easily block out time slots for regular bookings, league events, academy coaching, or offline walk-ins. Turfzo will automatically sync and keep public slots updated."
  },
  {
    q: "How long does the verification and onboarding take?",
    a: "Onboarding is incredibly fast. Once you submit the registration form below, our manager will schedule a quick call to verify venue details. If approved, we can ship and configure the IoT controllers within 48 hours to get your venue live."
  }
];

export default function OwnersPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Interactive IoT Light Mockup State
  const [iotLightOn, setIotLightOn] = useState(true);

  // Smooth scroll helper
  const scrollToRegister = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none z-0" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sans font-bold tracking-wider uppercase mb-6"
            >
              <HiSparkles className="w-3.5 h-3.5" />
              Turfzo for Partners
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto"
            >
              Run Your Sports Venue on <span className="text-brand-lime">Autopilot</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-text-muted max-w-2xl mx-auto font-sans leading-relaxed"
            >
              Connect your venue to India&apos;s premium sports automation suite. Maximize your court occupancy, trigger floodlights automatically, and receive payouts within 24 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/owners/register")}
                  className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold px-8 py-4 rounded-[12px] transition-all shadow-glow-lime flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm md:text-base animate-pulse shadow-brand-lime/10"
                >
                  Get Started (Self-Serve)
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#features"
                  className="bg-surface border border-border-default hover:bg-elevated text-text-main font-poppins font-bold px-8 py-4 rounded-[12px] transition-all flex items-center justify-center text-sm md:text-base"
                >
                  Explore Technology
                </a>
              </div>
              <a
                href="/owners/dashboard"
                className="font-sans text-xs text-text-muted hover:text-brand-lime hover:underline transition-colors font-medium mt-1"
              >
                Already registered? Check your application status →
              </a>
            </motion.div>
          </div>
        </section>

        {/* INTERACTIVE SHOWCASES / FEATURE SHEMETICS */}
        <section id="features" className="py-20 border-t border-border-subtle bg-surface/30">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-xs font-sans font-bold tracking-widest text-brand-lime uppercase">Next-Gen Manager Tech</span>
              <h2 className="font-poppins text-3xl font-extrabold mt-3">Smart Automation, Not Just Bookings</h2>
              <p className="text-text-muted text-sm font-sans mt-3">We replace clunky spreadsheets and midnight WhatsApp calls with complete venue IoT orchestration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Feature 1: Scheduling Grid & Dynamic Pricing */}
              <div className="flex flex-col justify-between p-8 rounded-md border border-border-default bg-surface relative overflow-hidden group">
                <div>
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning border border-warning/20 mb-6">
                    <TbCalendarTime className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins text-lg font-bold text-text-main mb-2">Automated Slot Booking</h3>
                  <p className="text-text-muted text-sm font-sans leading-relaxed mb-6">
                    Real-time scheduling grid updates instantly. Adjust pricing parameters dynamically for morning discounts or peak evening slots.
                  </p>
                </div>

                {/* Timetable Mockup Grid */}
                <div className="mt-4 border border-border-subtle rounded bg-bg/50 p-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-text-muted mb-3 border-b border-border-subtle pb-2 font-bold tracking-wider uppercase text-[10px]">
                    <span>Timetable</span>
                    <span className="text-warning">Live Sync</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-warning/10 border border-warning/20 rounded">
                      <span className="font-bold text-warning-light">06:00 PM - 07:00 PM</span>
                      <span className="text-warning font-bold">Paid via Turfzo</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 border border-border-subtle rounded">
                      <span className="font-medium text-text-muted">07:00 PM - 08:00 PM</span>
                      <span className="text-warning font-bold">₹1,500 <TbBolt className="inline w-3 h-3 text-warning" /></span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-warning/10 border border-warning/20 rounded">
                      <span className="font-bold text-warning-light">08:00 PM - 09:00 PM</span>
                      <span className="text-warning font-bold">Paid via Turfzo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: IoT Smart Lights Toggle */}
              <div className="flex flex-col justify-between p-8 rounded-md border border-border-default bg-surface relative overflow-hidden group">
                <div>
                  <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info border border-info/20 mb-6">
                    <TbCpu className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins text-lg font-bold text-text-main mb-2">IoT Light & Gate Automation</h3>
                  <p className="text-text-muted text-sm font-sans leading-relaxed mb-6">
                    Forget staff overhead. Lights activate automatically when a booking begins and shut down at the end. Gates open via dynamic pin codes.
                  </p>
                </div>

                {/* IoT Controller Interactive Toggles */}
                <div className="mt-4 border border-border-subtle rounded bg-bg/50 p-4 font-sans text-xs flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-center text-text-muted mb-2 border-b border-border-subtle pb-2 font-bold tracking-wider uppercase text-[10px]">
                    <span>IoT Smart Box</span>
                    <span className="text-info flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-info rounded-full animate-pulse" /> Connected
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-text-muted font-medium">Smart Gate PIN Lock</span>
                    <span className="font-mono bg-elevated px-2 py-0.5 rounded border border-border-default text-text-main">#4819</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 mt-1 border-t border-border-subtle/50">
                    <span className="text-text-muted font-medium">Floodlight Controller</span>
                    <button 
                      onClick={() => setIotLightOn(v => !v)}
                      className={`px-3 py-1 rounded font-bold text-[10px] uppercase transition-colors select-none cursor-pointer ${
                        iotLightOn 
                          ? "bg-info text-black hover:bg-info/95 shadow-[0_0_12px_rgba(91,145,200,0.25)]" 
                          : "bg-elevated border border-border-default text-text-muted hover:text-text-main"
                      }`}
                    >
                      {iotLightOn ? "Lights: ON" : "Lights: OFF"}
                    </button>
                  </div>
                  
                  {/* Interactive light glow simulator */}
                  <div className="mt-2 h-1 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-info transition-all duration-300" 
                      style={{ 
                        width: iotLightOn ? "100%" : "0%",
                        opacity: iotLightOn ? 1 : 0 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Feature 3: Ledger settlement flow */}
              <div className="flex flex-col justify-between p-8 rounded-md border border-border-default bg-surface relative overflow-hidden group">
                <div>
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20 mb-6">
                    <TbWallet className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins text-lg font-bold text-text-main mb-2">24h Settlement Payouts</h3>
                  <p className="text-text-muted text-sm font-sans leading-relaxed mb-6">
                    Accept online, split payments, and direct deposits. Earnings clear instantly and transfer into your bank within 24 hours automatically.
                  </p>
                </div>

                {/* Payout Settlement Ledger */}
                <div className="mt-4 border border-border-subtle rounded bg-bg/50 p-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-text-muted mb-3 border-b border-border-subtle pb-2 font-bold tracking-wider uppercase text-[10px]">
                    <span>Settlement SLA</span>
                    <span className="text-info">Processing</span>
                  </div>
                  <div className="relative pl-4 border-l border-border-default space-y-3 py-1 text-[11px]">
                    <div className="relative">
                      <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-bg" />
                      <div className="font-semibold text-text-main">Booking Complete</div>
                      <div className="text-[10px] text-text-muted">Player checked out · 5:00 PM</div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-bg" />
                      <div className="font-semibold text-text-main">Escrow Cleared</div>
                      <div className="text-[10px] text-text-muted">Razorpay split settled · 5:05 PM</div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-info border-2 border-bg" />
                      <div className="font-semibold text-info">Bank Transfer SLA</div>
                      <div className="text-[10px] text-text-muted">Settlement to Bank · Pending 24h</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* REGISTRATION FORM COMPONENT SECTION */}
        <section id="register" className="py-20 border-t border-border-subtle scroll-mt-12">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-xs font-sans font-bold tracking-widest text-brand-lime uppercase">Partner Registration</span>
              <h2 className="font-poppins text-3xl font-extrabold mt-3">Register Your Sports Facility</h2>
              <p className="text-text-muted text-sm font-sans mt-3">
                Complete the details below to submit your venue listing request. Our onboarding specialist will contact you to finalize.
              </p>
            </div>

            <VenueRegistrationForm />
          </div>
        </section>

        {/* PARTNER BENEFITS TRUST BADGES */}
        <section className="py-16 border-t border-border-subtle bg-surface/20">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-info/10 border border-info/20 flex items-center justify-center text-info shrink-0">
                <TbShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-base text-text-main mb-1">Secure & Certified</h4>
                <p className="text-text-muted text-xs font-sans leading-relaxed">
                  All IoT hardware is CE/FCC certified, with custom server firewall protection to prevent lighting malfunctions or power overload.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
                <TbDeviceMobile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-base text-text-main mb-1">Partner App Controls</h4>
                <p className="text-text-muted text-xs font-sans leading-relaxed">
                  Manage slots, override floodlights manually, block academy schedule hours, and review analytics directly from our iOS and Android partner app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                <TbMapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-base text-text-main mb-1">Local Visibility</h4>
                <p className="text-text-muted text-xs font-sans leading-relaxed">
                  Get discovered by thousands of players searching for turfs, pitches, and courts in your city. Boost occupancy during off-peak morning hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OWNER FAQ ACCORDION */}
        <section className="py-20 border-t border-border-subtle bg-bg">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-sans font-bold tracking-widest text-brand-lime uppercase">FAQS</span>
              <h2 className="font-poppins text-3xl font-extrabold mt-3">Frequently Asked Questions</h2>
            </div>

            <div className="divide-y divide-border-subtle">
              {OWNER_FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="py-5">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex justify-between items-center text-left focus:outline-none group py-2"
                      aria-expanded={isOpen}
                    >
                      <span className="font-poppins font-semibold text-text-main group-hover:text-brand-lime transition-colors text-sm sm:text-base pr-4">
                        {faq.q}
                      </span>
                      <TbChevronDown 
                        className={`w-4 h-4 text-text-muted group-hover:text-text-main shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-brand-lime" : ""
                        }`} 
                      />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-60 mt-3 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-text-muted text-xs sm:text-sm font-sans leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
