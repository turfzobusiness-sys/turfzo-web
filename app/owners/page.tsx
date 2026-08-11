"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Users,
  Star,
  Trophy,
  Building2,
  Wallet,
  Tag,
  CalendarCheck,
  Landmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbCalendarTime,
  TbCpu,
  TbWallet,
  TbBolt,
  TbShieldCheck,
  TbDeviceMobile,
  TbMapPin,
} from "react-icons/tb";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";

/* ------------------------------------------------------------------ */
/*  Verified owner feature categories (code-audited, no false claims) */
/* ------------------------------------------------------------------ */
const OWNER_FEATURES = [
  {
    icon: Landmark,
    title: "Turf Management",
    bullets: [
      "Create & publish turf listings in minutes — name, photos, address, city",
      "Set your own hourly price (₹) with validation",
      "Classify by sport type, format (5-a-side, 7-a-side…), tier & max players",
      "Amenity toggles: Floodlights, Free Parking, Changing Room, Drinking Water, First Aid, Indoor",
      "Set operating hours & working days (Mon–Sun)",
      "One-tap \"Available for Booking\" to show or hide your turf",
      "Edit any turf field in place — delete a turf any time",
    ],
  },
  {
    icon: CalendarCheck,
    title: "Bookings & Calendar",
    bullets: [
      "Central bookings inbox with pending/confirmed status tabs & badges",
      "One-tap Confirm / Reject on new bookings",
      "\"Mark as Completed\" once a slot finishes",
      "Safe cancellation with automatic refund policy",
      "Server-side overlap detection — no double bookings, ever",
      "Cash bookings auto-confirm; online payments auto-marked after verification",
      "Monthly turf calendar with day/hour drill-down",
      "Bulk slot blocking — block dates, ranges, weekends, with reasons (Maintenance / Private Event / Holiday)",
    ],
  },
  {
    icon: Tag,
    title: "Pricing & Promotions",
    bullets: [
      "Automatic tier pricing — off-peak (0.8×) & premium (1.3×) multipliers",
      "Dynamic pricing rule builder — time-of-day & day-of-week rules",
      "Adjust prices by percentage or flat ₹, with rule priority (higher wins)",
      "Toggle rules on/off, edit, or delete",
      "Promo codes with discount type, value, validity window & usage limits",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    bullets: [
      "Earnings dashboard with available balance (95% of revenue after 5% platform fee)",
      "Revenue history + monthly earnings charts",
      "Booking stats by status & period",
      "Popular slots analysis — see which hours sell best",
      "Recent transactions feed",
      "Revenue forecasting with period-based projections",
      "Cross-venue comparison — revenue & occupancy bar charts across all your turfs",
      "Dashboard stat cards: Today's Slots, Pending, Occupancy %",
    ],
  },
  {
    icon: Users,
    title: "Customers",
    bullets: [
      "Customer list with search, sorted by total spend",
      "Per-customer spend, booking count & repeat-customer detection",
      "Customer segmentation — auto-segments, tags, corporate flag",
      "Average booking value, preferred slots & days",
    ],
  },
  {
    icon: Wallet,
    title: "Payments & Payouts",
    bullets: [
      "Request payouts to UPI or Bank (account number + IFSC)",
      "Available balance with one-tap payout request",
      "Earnings settle after slot completion — transferred to your bank",
    ],
  },
  {
    icon: Star,
    title: "Reviews",
    bullets: [
      "Verified-booking 5★ rating system",
      "Spam-protected — only players who completed a booking can review",
      "Review history visible on your venue listing",
    ],
  },
  {
    icon: Trophy,
    title: "Tournaments",
    bullets: [
      "Create tournaments — entry fees, caps, team sizes, rules & dates",
      "Auto single-elimination bracket generation",
      "Full status lifecycle (open → in progress → completed)",
      "Entry-fee collection via Cashfree with auto-refund for unused payments",
      "Registration pass codes for controlled entry",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Turf Dashboard",
    bullets: [
      "All venues on one screen — switch between turfs instantly",
      "Per-turf bookings, occupancy & revenue at a glance",
      "Unified analytics across your entire portfolio",
    ],
  },
];

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
  const [iotLightOn, setIotLightOn] = useState(true);

  return (
    <div className="airbnb-explore-theme flex flex-col min-h-screen bg-[#fafafa] dark:bg-elevated">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        {/* HERO — full bleed */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative -mt-24 overflow-hidden bg-gradient-to-br from-[#dcfce7] via-[#f0fdf4] to-[#bbf7d0] dark:from-brand-btn-bg dark:via-surface dark:to-elevated"
        >
          {/* Background image — subtle */}
          <div
            className="absolute inset-0 z-0 opacity-85 dark:opacity-20 bg-cover bg-center brightness-90 dark:brightness-100"
            style={{ backgroundImage: "url('/stadium_cinematic_bg.png')" }}
          />

          {/* Decorative green gradient orb */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-lime/8 rounded-full blur-3xl z-0" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-lime/5 rounded-full blur-3xl z-0" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-28 py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-20 max-w-[1760px] mx-auto w-full">
            {/* Left — copy */}
            <div className="flex-1 max-w-xl">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-[family-name:var(--font-anton)] text-4xl sm:text-5xl lg:text-[3.5rem] text-white uppercase leading-[1.08] tracking-wide mb-5"
              >
                Run Your Venue
                <br />
                on <span className="text-brand-lime">Autopilot</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-white/80 text-sm sm:text-[15px] leading-relaxed mb-8 max-w-md"
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
                  className="flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-bg font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm cursor-pointer border-none outline-none"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#features"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-sm border border-white/20 backdrop-blur-sm"
                >
                  Explore Technology
                </a>
              </motion.div>

              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                href="/owners/dashboard"
                className="inline-block mt-6 text-xs text-white/60 hover:text-brand-lime transition-colors"
              >
                Already registered? Sign In or check application status →
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
                  className="absolute -left-16 top-20 bg-surface/90 border border-border-default shadow-sm dark:border-none dark:bg-black/40 backdrop-blur-md rounded-xl px-4 py-3"
                >
                  <div className="text-[10px] text-text-muted/80 dark:text-white/50 uppercase tracking-wider font-medium">Today&apos;s Earnings</div>
                  <div className="text-lg font-bold text-brand-lime mt-0.5">₹12,400</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -right-12 bottom-28 bg-surface/90 border border-border-default shadow-sm dark:border-none dark:bg-black/40 backdrop-blur-md rounded-xl px-4 py-3"
                >
                  <div className="text-[10px] text-text-muted/80 dark:text-white/50 uppercase tracking-wider font-medium">Active Bookings</div>
                  <div className="text-lg font-bold text-text-main dark:text-white mt-0.5">8 <span className="text-xs text-text-muted/60 dark:text-white/40 font-normal">live now</span></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FEATURES */}
        <div className="border-t border-gray-200 dark:border-border-default" />
        <section id="features" className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full py-14">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
              Next-Gen Manager Tech
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Smart Automation, Not Just Bookings
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base mt-4">
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
              className="bg-white dark:bg-surface rounded-2xl p-7 flex flex-col"
            >
              <div className="w-11 h-11 rounded-2xl bg-brand-lime/15 flex items-center justify-center mb-5">
                <TbCalendarTime className="w-5 h-5 text-brand-lime" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Automated Slot Booking
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Real-time scheduling grid updates instantly. Adjust pricing
                dynamically for morning discounts or peak evening slots.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-elevated border border-gray-200 dark:border-border-default rounded-xl p-4 text-xs shadow-sm">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-200 dark:border-border-default pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>Timetable</span>
                  <span className="text-brand-lime">Live Sync</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-brand-lime/10 border border-brand-lime/20 rounded-lg">
                    <span className="font-bold text-brand-lime">06:00 PM – 07:00 PM</span>
                    <span className="text-brand-lime font-bold">Paid via Turfzo</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-surface border border-gray-200 dark:border-border-default rounded-lg shadow-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-300">07:00 PM – 08:00 PM</span>
                    <span className="text-brand-lime font-bold">
                      ₹1,500 <TbBolt className="inline w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-brand-lime/10 border border-brand-lime/20 rounded-lg">
                    <span className="font-bold text-brand-lime">08:00 PM – 09:00 PM</span>
                    <span className="text-brand-lime font-bold">Paid via Turfzo</span>
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
              className="bg-white dark:bg-surface rounded-2xl p-7 flex flex-col"
            >
              <div className="w-11 h-11 rounded-2xl bg-brand-lime/15 flex items-center justify-center mb-5">
                <TbCpu className="w-5 h-5 text-brand-lime" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                IoT Light & Gate Automation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Forget staff overhead. Lights activate automatically when a
                booking begins and shut down at the end. Gates open via dynamic
                PIN codes.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-elevated border border-gray-200 dark:border-border-default rounded-xl p-4 text-xs shadow-sm">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-200 dark:border-border-default pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>IoT Smart Box</span>
                  <span className="text-brand-lime flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse" />{" "}
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Smart Gate PIN Lock
                  </span>
                  <span className="font-mono bg-white dark:bg-surface px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-border-strong text-gray-900 dark:text-white text-[11px] shadow-sm">
                    #4819
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 mt-1 border-t border-gray-200 dark:border-border-default">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Floodlight Controller
                  </span>
                  <button
                    onClick={() => setIotLightOn((v) => !v)}
                    className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors select-none cursor-pointer ${
                      iotLightOn
                        ? "bg-brand-lime text-white shadow-sm"
                        : "bg-white dark:bg-surface border border-gray-200 dark:border-border-strong text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {iotLightOn ? "Lights: ON" : "Lights: OFF"}
                  </button>
                </div>

                <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-border-default rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-lime transition-all duration-300 rounded-full"
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
              className="bg-white dark:bg-surface rounded-2xl p-7 flex flex-col"
            >
              <div className="w-11 h-11 rounded-2xl bg-brand-lime/15 flex items-center justify-center mb-5">
                <TbWallet className="w-5 h-5 text-brand-lime" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                24h Settlement Payouts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Accept online, split payments, and direct deposits. Earnings
                clear instantly and transfer into your bank within 24 hours
                automatically.
              </p>

              <div className="mt-auto bg-gray-50 dark:bg-elevated border border-gray-200 dark:border-border-default rounded-xl p-4 text-xs shadow-sm">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-200 dark:border-border-default pb-2 font-semibold tracking-wider uppercase text-[10px]">
                  <span>Settlement SLA</span>
                  <span className="text-brand-lime">Processing</span>
                </div>
                <div className="relative pl-4 border-l border-gray-300 dark:border-border-strong space-y-3 py-1 text-[11px]">
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-lime border-2 border-gray-50 dark:border-elevated" />
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Booking Complete
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Player checked out · 5:00 PM
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-lime border-2 border-gray-50 dark:border-elevated" />
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Escrow Cleared
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Cashfree split settled · 5:05 PM
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-lime border-2 border-gray-50 dark:border-elevated" />
                    <div className="font-semibold text-brand-lime">
                      Bank Transfer SLA
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Settlement to Bank · Pending 24h
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMPREHENSIVE FEATURE GRID */}
        <div className="border-t border-gray-200 dark:border-border-default" />
        <section className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full py-14">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-text-muted uppercase">
              Full Platform Capabilities
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Everything You Need to Run Your Venue
            </h2>
            <p className="text-gray-600 dark:text-text-secondary text-base mt-4">
              Every feature below is live and verified in the Turfzo Partner app.
              No roadmap fluff — just what works today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OWNER_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="bg-white dark:bg-surface border border-gray-200 dark:border-border-default rounded-2xl p-6 flex flex-col hover:border-brand-lime/40 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-lime/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-lime" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {feature.bullets.map((bullet, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-[13px] text-gray-600 dark:text-text-secondary leading-relaxed"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-lime flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* REGISTRATION CTA */}
        <div className="border-t border-gray-200 dark:border-border-default" />
        <section id="register" className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full py-20 scroll-mt-12">
          <div className="text-center max-w-2xl mx-auto bg-white dark:bg-surface border border-gray-200 dark:border-border-default p-10 rounded-2xl">
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Ready to Upgrade Your Venue?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 mb-8 max-w-md mx-auto leading-relaxed">
              Join the future of amateur sports. Register your facility now to get access to automated slot bookings, IoT lighting, and fast payouts.
            </p>
            <button
              onClick={() => router.push("/owners/register")}
              className="inline-flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
            >
              Start Partner Registration <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-400 mt-4">Takes less than 5 minutes. No credit card required.</p>
          </div>
        </section>

        {/* TRUST BADGES */}
        <div className="border-t border-gray-200 dark:border-border-default" />
        <section className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <TbShieldCheck className="w-5 h-5 text-brand-lime" />,
                title: "Secure & Certified",
                desc: "All IoT hardware is CE/FCC certified, with custom server firewall protection to prevent lighting malfunctions or power overload.",
              },
              {
                icon: <TbDeviceMobile className="w-5 h-5 text-brand-lime" />,
                title: "Partner App Controls",
                desc: "Manage slots, override floodlights manually, block academy schedule hours, and review analytics directly from our iOS and Android partner app.",
              },
              {
                icon: <TbMapPin className="w-5 h-5 text-brand-lime" />,
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
                className="bg-white dark:bg-surface rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-lime/10 flex items-center justify-center flex-shrink-0">
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
        <div className="border-t border-gray-200 dark:border-border-default" />
        <section className="px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full py-14">
          <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              FAQs
            </span>
            <h2 className="text-3xl font-bold mt-3 text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8">
            <FaqAccordion 
              items={OWNER_FAQS.map(faq => ({ 
                question: faq.q, 
                answer: faq.a 
              }))} 
            />
          </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
