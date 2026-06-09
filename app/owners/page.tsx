"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbCalendarTime,
  TbCpu,
  TbWallet,
  TbBolt,
  TbShieldCheck,
  TbDeviceMobile,
  TbMapPin,
  TbChevronDown,
} from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { VenueRegistrationForm } from "@/components/owners/venue-registration-form";

const OWNER_FAQS = [
  {
    q: "How does the IoT-enabled lighting and gate system work?",
    a: "We install a compact wireless IoT relay at your power distribution board and gate lock. When a player books a slot on Turfzo, our server schedules a trigger to activate the lights 5 minutes before the session starts and turn them off 5 minutes after it ends. Similarly, a unique PIN is texted to the player to unlock the gate during their slot.",
  },
  {
    q: "How and when do I get paid?",
    a: "Payments are processed automatically. When a player books or splits a bill, the funds go into escrow. Once the slot completes, settlements are cleared and deposited directly into your bank account within 24 hours. No manual tracking, no chasing cash.",
  },
  {
    q: "Is it free to list my sports venue?",
    a: "Yes! Listing your turf, courts, or nets is completely free. We only charge a small convenience commission on successful online bookings made through the Turfzo app, meaning we only make money when you do.",
  },
  {
    q: "Can I manage offline bookings or regular coaching academies?",
    a: "Absolutely. You get a dedicated Partner Dashboard (Web and Mobile app) where you can easily block out time slots for regular bookings, league events, academy coaching, or offline walk-ins. Turfzo will automatically sync and keep public slots updated.",
  },
  {
    q: "How long does the verification and onboarding take?",
    a: "Onboarding is incredibly fast. Once you submit the registration form below, our manager will schedule a quick call to verify venue details. If approved, we can ship and configure the IoT controllers within 48 hours to get your venue live.",
  },
];

export default function OwnersPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [iotLightOn, setIotLightOn] = useState(true);

  return (
    <div className="airbnb-explore-theme flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#1a1a1a]">
      <Header />

      <main className="flex-grow pt-24 pb-16 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full">
        {/* HERO — split layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden mb-16 bg-gradient-to-br from-[#0f1f0f] via-[#162016] to-[#0d1a0d]"
        >
          {/* Background image — subtle */}
          <div
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: "url('/stadium_cinematic_bg.png')" }}
          />

          {/* Decorative green gradient orb */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#4ADE80]/8 rounded-full blur-3xl z-0" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#4ADE80]/5 rounded-full blur-3xl z-0" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16 sm:py-20 lg:py-24 px-8 sm:px-14">
            {/* Left — copy */}
            <div className="flex-1 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80] text-[11px] font-semibold tracking-wider uppercase mb-6"
              >
                <HiSparkles className="w-3.5 h-3.5" />
                Turfzo for Partners
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-[family-name:var(--font-anton)] text-4xl sm:text-5xl lg:text-[3.5rem] text-white uppercase leading-[1.08] tracking-wide mb-5"
              >
                Run Your Venue
                <br />
                on <span className="text-[#4ADE80]">Autopilot</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-white/60 text-sm sm:text-[15px] leading-relaxed mb-8 max-w-md"
              >
                Connect your venue to India&apos;s premium sports automation suite.
                Maximize court occupancy, trigger floodlights automatically, and
                receive payouts within 24 hours.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-start gap-3"
              >
                <button
                  onClick={() => router.push("/owners/register")}
                  className="flex items-center gap-2 bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#features"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 font-medium px-7 py-3.5 rounded-xl transition-colors text-sm border border-white/10"
                >
                  Explore Technology
                </a>
              </motion.div>

              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                href="/owners/dashboard"
                className="inline-block mt-6 text-xs text-white/30 hover:text-[#4ADE80] transition-colors"
              >
                Already registered? Check your application status →
              </motion.a>
            </div>

            {/* Right — app screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="flex-shrink-0 hidden lg:block"
            >
              <div className="relative">
                <div className="relative w-[260px] h-[520px] rounded-[2rem] overflow-hidden">
                  <Image
                    src="/Screenshot_20260603-131114.turfzo-portrait.png"
                    alt="Turfzo Partner App"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>

                {/* Floating stat cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -left-16 top-20 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3"
                >
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Today&apos;s Earnings</div>
                  <div className="text-lg font-bold text-[#4ADE80] mt-0.5">₹12,400</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -right-12 bottom-28 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3"
                >
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Active Bookings</div>
                  <div className="text-lg font-bold text-white mt-0.5">8 <span className="text-xs text-white/40 font-normal">live now</span></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FEATURES */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              Next-Gen Manager Tech
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Smart Automation, Not Just Bookings
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              We replace clunky spreadsheets and midnight WhatsApp calls with
              complete venue IoT orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: Scheduling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl p-7 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center mb-5">
                <TbCalendarTime className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Automated Slot Booking
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Real-time scheduling grid updates instantly. Adjust pricing
                dynamically for morning discounts or peak evening slots.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 text-xs">
                <div className="flex justify-between items-center text-gray-400 dark:text-gray-500 mb-3 border-b border-gray-100 dark:border-[#2a2a2a] pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>Timetable</span>
                  <span className="text-[#4ADE80]">Live Sync</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-[#4ADE80]/8 border border-[#4ADE80]/15 rounded-lg">
                    <span className="font-bold text-[#4ADE80]">06:00 PM – 07:00 PM</span>
                    <span className="text-[#4ADE80] font-bold">Paid via Turfzo</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#282828] border border-gray-100 dark:border-[#2a2a2a] rounded-lg">
                    <span className="font-medium text-gray-500 dark:text-gray-400">07:00 PM – 08:00 PM</span>
                    <span className="text-[#4ADE80] font-bold">
                      ₹1,500 <TbBolt className="inline w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#4ADE80]/8 border border-[#4ADE80]/15 rounded-lg">
                    <span className="font-bold text-[#4ADE80]">08:00 PM – 09:00 PM</span>
                    <span className="text-[#4ADE80] font-bold">Paid via Turfzo</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: IoT Lights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl p-7 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center mb-5">
                <TbCpu className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                IoT Light & Gate Automation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Forget staff overhead. Lights activate automatically when a
                booking begins and shut down at the end. Gates open via dynamic
                PIN codes.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 text-xs">
                <div className="flex justify-between items-center text-gray-400 dark:text-gray-500 mb-3 border-b border-gray-100 dark:border-[#2a2a2a] pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>IoT Smart Box</span>
                  <span className="text-[#4ADE80] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />{" "}
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Smart Gate PIN Lock
                  </span>
                  <span className="font-mono bg-white dark:bg-[#282828] px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-[#3a3a3a] text-gray-900 dark:text-white text-[11px]">
                    #4819
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 mt-1 border-t border-gray-100 dark:border-[#2a2a2a]">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Floodlight Controller
                  </span>
                  <button
                    onClick={() => setIotLightOn((v) => !v)}
                    className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors select-none cursor-pointer ${
                      iotLightOn
                        ? "bg-[#4ADE80] text-white"
                        : "bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3a3a3a] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {iotLightOn ? "Lights: ON" : "Lights: OFF"}
                  </button>
                </div>

                <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4ADE80] transition-all duration-300 rounded-full"
                    style={{ width: iotLightOn ? "100%" : "0%" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Payouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl p-7 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center mb-5">
                <TbWallet className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                24h Settlement Payouts
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Accept online, split payments, and direct deposits. Earnings
                clear instantly and transfer into your bank within 24 hours
                automatically.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 text-xs">
                <div className="flex justify-between items-center text-gray-400 dark:text-gray-500 mb-3 border-b border-gray-100 dark:border-[#2a2a2a] pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>Settlement SLA</span>
                  <span className="text-[#4ADE80]">Processing</span>
                </div>
                <div className="relative pl-4 border-l border-gray-200 dark:border-[#3a3a3a] space-y-3 py-1 text-[11px]">
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-gray-50 dark:border-[#1a1a1a]" />
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Booking Complete
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      Player checked out · 5:00 PM
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-gray-50 dark:border-[#1a1a1a]" />
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Escrow Cleared
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      Cashfree split settled · 5:05 PM
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-gray-50 dark:border-[#1a1a1a]" />
                    <div className="font-semibold text-[#4ADE80]">
                      Bank Transfer SLA
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      Settlement to Bank · Pending 24h
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* REGISTRATION FORM */}
        <section id="register" className="mb-20 scroll-mt-12">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              Partner Registration
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Register Your Sports Facility
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Complete the details below to submit your venue listing request.
              Our onboarding specialist will contact you to finalize.
            </p>
          </div>
          <VenueRegistrationForm />
        </section>

        {/* TRUST BADGES */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <TbShieldCheck className="w-5 h-5 text-[#4ADE80]" />,
                title: "Secure & Certified",
                desc: "All IoT hardware is CE/FCC certified, with custom server firewall protection to prevent lighting malfunctions or power overload.",
              },
              {
                icon: <TbDeviceMobile className="w-5 h-5 text-[#4ADE80]" />,
                title: "Partner App Controls",
                desc: "Manage slots, override floodlights manually, block academy schedule hours, and review analytics directly from our iOS and Android partner app.",
              },
              {
                icon: <TbMapPin className="w-5 h-5 text-[#4ADE80]" />,
                title: "Local Visibility",
                desc: "Get discovered by thousands of players searching for turfs, pitches, and courts in your city. Boost occupancy during off-peak morning hours.",
              },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl p-6 flex items-start gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#4ADE80]/10 flex items-center justify-center flex-shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              FAQs
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            {OWNER_FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`border-b border-gray-100 dark:border-[#2a2a2a] last:border-b-0`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <TbChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "rotate-180 text-[#4ADE80]"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
