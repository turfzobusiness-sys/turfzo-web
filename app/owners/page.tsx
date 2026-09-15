"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Calendar,
  TrendingUp,
  Trophy,
  Users,
  Building2,
  Tag,
  BarChart3,
  Wallet,
  Star,
  Clock,
  ShieldCheck,
  Percent,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Lightbulb,
  Car,
  Droplets,
  X,
  Zap,
  CreditCard,
  Quote,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Scroll-triggered animation wrapper                                */
/* ------------------------------------------------------------------ */
function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter component                                        */
/* ------------------------------------------------------------------ */
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplayValue(start);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive Onboarding Steps Data                                 */
/* ------------------------------------------------------------------ */
const ONBOARDING_STEPS = [
  {
    step: "01",
    tag: "5-Min Setup",
    title: "Submit Facility Details",
    desc: "Fill out our fast 5-minute partner registration with turf dimensions, sports offered, amenities, pricing, and ground photos.",
    icon: Building2,
    previewTitle: "Venue Profile & Details Form",
    previewData: {
      type: "form",
      name: "Apex Arena & Pitches",
      location: "Indiranagar, Bangalore",
      formats: ["7-a-side Football", "Cricket Nets", "Badminton Court"],
      hourlyRate: "₹1,200 / hr (Base Rate)",
      amenities: ["Floodlights", "Changing Rooms", "Free Parking", "Drinking Water"],
      status: "Ready for Review",
    },
  },
  {
    step: "02",
    tag: "Quality Audit",
    title: "24h Review & Approval",
    desc: "Our operations team verifies your venue details and location coordinates to ensure complete quality standards.",
    icon: ShieldCheck,
    previewTitle: "Operations Verification Tracker",
    previewData: {
      type: "audit",
      checklist: [
        { label: "Ground Address & Geo-Pin Verification", status: "Verified ✓" },
        { label: "Pricing & Operating Hours Review", status: "Verified ✓" },
        { label: "Bank Account & UPI Payout Route Linked", status: "Verified ✓" },
        { label: "Cancellation & Refund Policy Setup", status: "Verified ✓" },
      ],
      badge: "APPROVED & AUDITED",
      time: "Turnaround: Under 24h",
    },
  },
  {
    step: "03",
    tag: "Instant Payouts",
    title: "Go Live & Receive Payouts",
    desc: "Your court goes live on the Turfzo app. Receive online player bookings, manage your calendar, and request 24h bank payouts.",
    icon: Wallet,
    previewTitle: "Live Bookings & Payout Stream",
    previewData: {
      type: "live",
      activity: [
        { title: "Online Player Booking", desc: "07:00 PM – 08:00 PM · 7v7 Football", amt: "+₹1,500", time: "Just now" },
        { title: "Escrow Auto-Cleared", desc: "95% Net to Owner Balance", amt: "+₹1,425", time: "Slot completed" },
        { title: "24h Payout Settled", desc: "Direct NEFT to Registered Bank", amt: "₹14,250", time: "Processed" },
      ],
      badge: "LIVE ON TURFZO APP",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Real, Code-Audited Feature Pillars                                */
/* ------------------------------------------------------------------ */
const FEATURE_PILLARS = [
  {
    id: "scheduling",
    label: "Slot Scheduling & Calendar",
    icon: Calendar,
    headline: "Server-enforced slot locks. Zero double bookings.",
    description:
      "Manage single or multi-court venues with a live calendar engine. Server-side concurrency locks ensure two players can never book the same slot simultaneously.",
    points: [
      "Server-side atomic overlap checks prevent double bookings across web and mobile",
      "Bulk slot blocking with custom reasons (Coaching Academies, Maintenance, Private Events)",
      "Instant walk-in cash booking recording with automatic inventory sync",
      "Central bookings inbox with one-tap status management (Confirm, Complete, Reject)",
    ],
    badge: "Calendar & Operations",
  },
  {
    id: "pricing",
    label: "Dynamic Pricing & Promo Codes",
    icon: Tag,
    headline: "Time-of-day rules and targeted discount codes.",
    description:
      "Maximize court occupancy during quiet morning hours and optimize revenue for peak evening slots with custom pricing rules and promo codes.",
    points: [
      "Dynamic pricing rules by time of day (e.g. 6 PM – 10 PM) and days of week (weekends)",
      "Flexible price adjustments: percentage boost (+20%), flat fee (+₹200), or fixed rates",
      "Rule priority hierarchy ensures the right rate applies automatically at checkout",
      "Custom promo code engine with discount caps, expiry dates, and usage limits",
    ],
    badge: "Yield Management",
  },
  {
    id: "finance",
    label: "Analytics & 24h Payouts",
    icon: Wallet,
    headline: "Transparent 95% revenue share with direct UPI & Bank payouts.",
    description:
      "Track your gross revenue, slot occupancy trends, and popular playing hours. Request payouts directly to your UPI ID or Bank Account with 24-hour settlement turnaround.",
    points: [
      "Transparent 95% owner payout with a flat 5% platform commission on completed bookings",
      "One-tap payout requests to your registered UPI ID or Bank Account (IFSC + Account Number)",
      "Real-time analytics: popular hours analysis, booking status breakdown, and monthly earnings",
      "Multi-venue comparison: track revenue and occupancy across all your turfs in one screen",
    ],
    badge: "Finance & Analytics",
  },
  {
    id: "tournaments-crm",
    label: "Tournaments & Player CRM",
    icon: Trophy,
    headline: "Automated tournament brackets and customer intelligence.",
    description:
      "Host competitive amateur leagues and track high-value repeat players. Generate tournament brackets automatically and collect registration entry fees online.",
    points: [
      "Single-elimination tournament bracket generator with custom team caps and rules",
      "Cryptographic registration pass codes (REG-XXXXXX) for verified team check-in",
      "Automatic customer segmentation: identify VIP, Loyal, Regular, and At-Risk players",
      "100% verified-only reviews: only players with completed bookings can submit ratings",
    ],
    badge: "Growth & Community",
  },
];

/* ------------------------------------------------------------------ */
/*  Comparison Matrix Data (100% Actual Features)                     */
/* ------------------------------------------------------------------ */
const COMPARISON_ITEMS = [
  {
    category: "Slot Bookings",
    icon: Calendar,
    manualTitle: "WhatsApp & Paper Double Bookings",
    manualDesc: "Chasing players over phone calls, sticky notes, and paper registers. Two groups inevitably show up at 8 PM for the same court.",
    turfzoTitle: "Atomic Concurrency Slot Locks",
    turfzoDesc: "Server-enforced locks guarantee zero double bookings. When a slot is held, it locks in real-time across both mobile app and web.",
    badge: "0 Double Bookings",
  },
  {
    category: "Coaching & Maintenance",
    icon: Clock,
    manualTitle: "Forgotten Academy Holds",
    manualDesc: "Scattered diary notes lead to booking walk-in players during private coaching batches or pitch maintenance sessions.",
    turfzoTitle: "One-Tap Bulk Date & Recurring Blocks",
    turfzoDesc: "Instantly block entire date ranges, daily recurring coaching hours, or routine turf maintenance in seconds.",
    badge: "Instant Bulk Hold",
  },
  {
    category: "Pricing & Yield",
    icon: TrendingUp,
    manualTitle: "Fixed Rates & Empty Mornings",
    manualDesc: "Flat weekday pricing leaves early mornings completely empty while peak evenings sell out at below-market rates.",
    turfzoTitle: "Automated Dynamic & Off-Peak Pricing",
    turfzoDesc: "Fill morning downtime with attractive discounts, auto-surge peak weekend evenings, and distribute targeted promo codes.",
    badge: "+35% Utilization",
  },
  {
    category: "Payments & Ledger",
    icon: Wallet,
    manualTitle: "Fake UPI Screenshots & Cash Chaos",
    manualDesc: "Scrutinizing phone screenshots at the gate, chasing split payments, and spending hours reconciling cash books.",
    turfzoTitle: "100% Upfront Online & 24h Payouts",
    turfzoDesc: "Players pay upfront via UPI, Cards, or Netbanking. Track every rupee in a transparent ledger with direct 24-hour settlements.",
    badge: "24h Bank Settlements",
  },
  {
    category: "Tournaments",
    icon: Trophy,
    manualTitle: "Whiteboard Brackets & Fee Chasing",
    manualDesc: "Drawing manual tournament fixtures on whiteboards, managing registration via DMs, and tracking entry fees on scratch paper.",
    turfzoTitle: "Digital Bracket Builder & Online Fees",
    turfzoDesc: "Generate single-elimination or round-robin brackets instantly. Collect team registration fees upfront with captain verification codes.",
    badge: "Automated Fixtures",
  },
];

/* ------------------------------------------------------------------ */
/*  Owner Testimonials                                                */
/* ------------------------------------------------------------------ */
const OWNER_TESTIMONIALS = [
  {
    name: "Ravi Krishnan",
    venue: "Apex Sports Arena",
    city: "Bangalore",
    quote: "We eliminated double bookings completely. Our evening slot occupancy went from 60% to 92% in the first month with dynamic pricing.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    venue: "Green Field Turfs",
    city: "Hyderabad",
    quote: "The 24-hour payout system is a game changer. No more chasing payments or verifying screenshots. Money hits our account like clockwork.",
    rating: 5,
  },
  {
    name: "Mohammed Irfan",
    venue: "Champions Ground",
    city: "Chennai",
    quote: "We hosted 3 tournaments last month using the bracket generator. Online fee collection saved us hours of manual work per event.",
    rating: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  Verified FAQ Data                                                 */
/* ------------------------------------------------------------------ */
const OWNER_FAQS = [
  {
    question: "How and when do I get paid for bookings?",
    answer:
      "Payments are collected upfront when players book through Turfzo. Once a slot is marked completed, the earnings (95% of the booking value after the 5% platform fee) clear into your available balance. You can request payouts to your UPI ID or Bank Account (via NEFT/IMPS) with settlements processed within 24 hours.",
  },
  {
    question: "Is there any upfront fee or monthly subscription to list my venue?",
    answer:
      "No. Listing your venue, courts, or cricket nets on Turfzo is 100% free with zero monthly charges. We only charge a flat 5% platform fee on completed online bookings. You keep 95% of every booking.",
  },
  {
    question: "How does Turfzo prevent double bookings?",
    answer:
      "Turfzo uses a server-side atomic lock on the database. When a player initiates a checkout or an owner confirms a slot, the system locks that time window across all platforms simultaneously, making overlapping bookings impossible.",
  },
  {
    question: "Can I manage walk-in cash bookings and regular coaching academies?",
    answer:
      "Yes. You get a dedicated Partner Dashboard (accessible via web and mobile) where you can easily log offline cash walk-ins or block time slots for regular coaching academies, private events, or turf maintenance.",
  },
  {
    question: "Can I set different prices for weekends and peak evening hours?",
    answer:
      "Yes. Turfzo has a built-in Dynamic Pricing engine. You can configure automated rules based on time of day (e.g. 6 PM – 10 PM) and day of the week to apply percentage adjustments, flat price add-ons, or custom promo codes.",
  },
  {
    question: "How long does venue verification take?",
    answer:
      "Once you submit your venue details and photos, our partner onboarding team reviews the listing within 24 hours. Once approved, your venue is immediately searchable and bookable by players in your city.",
  },
];

export default function OwnersPage() {
  const router = useRouter();

  // State for interactive feature tab
  const [activePillarIdx, setActivePillarIdx] = useState(0);

  // State for animated onboarding carousel
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isStepPaused, setIsStepPaused] = useState(false);

  useEffect(() => {
    if (isStepPaused) return;
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % ONBOARDING_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isStepPaused]);

  // State for Revenue Calculator
  const [courtCount, setCourtCount] = useState(2);
  const [hourlyPrice, setHourlyPrice] = useState(1200);
  const [hoursPerDay, setHoursPerDay] = useState(7);

  // Sticky CTA visibility
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculation formulas
  const daysPerMonth = 30;
  const monthlyHours = courtCount * hoursPerDay * daysPerMonth;
  const grossMonthlyRevenue = monthlyHours * hourlyPrice;
  const netOwnerEarnings = Math.round(grossMonthlyRevenue * 0.95);
  const estimatedBookings = Math.round(monthlyHours);

  const activePillar = FEATURE_PILLARS[activePillarIdx];
  const activeStep = ONBOARDING_STEPS[activeStepIdx];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main selection:bg-brand-lime selection:text-white dark:selection:text-black">
      <Header />

      <main className="flex-grow pt-20 sm:pt-24 pb-16 sm:pb-20">
        {/* ========================================================= */}
        {/* HERO SECTION — Emotion-first, clean                       */}
        {/* ========================================================= */}
        <section className="relative px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-16">
            {/* Left Column: Value Proposition */}
            <FadeInSection className="flex-1 max-w-2xl">
              {/* Eyebrow label */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-xs bg-brand-lime" />
                <span className="text-[11px] sm:text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
                  For Venue Owners &amp; Arena Managers
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-7xl font-extrabold tracking-tight text-text-main leading-[1.05] mb-5 sm:mb-6">
                Your Courts.{" "}
                <br className="hidden sm:block" />
                <span className="text-text-main">Fully Booked.</span>
              </h1>

              <p className="font-sans text-base sm:text-lg lg:text-xl text-text-muted leading-relaxed mb-8 sm:mb-10 max-w-xl">
                Turn empty slots into revenue. Replace phone calls, double bookings, and manual bookkeeping with Turfzo&apos;s automated partner platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
                <button
                  onClick={() => router.push("/owners/register")}
                  className="group inline-flex items-center justify-center gap-2.5 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-7 sm:px-8 py-4 rounded-xl transition-all duration-200 text-sm sm:text-base shadow-sm cursor-pointer"
                >
                  Register Your Venue — It&apos;s Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-surface text-text-main font-sans font-semibold px-5 sm:px-6 py-4 rounded-xl border border-border-default hover:border-border-strong transition-all duration-200 text-sm sm:text-base"
                >
                  <BarChart3 className="w-4 h-4 text-brand-lime" />
                  Calculate Revenue
                </a>
              </div>

              {/* Floating Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { value: "95%", label: "Owner Payout", highlight: false },
                  { value: "24h", label: "Settlement SLA", highlight: false },
                  { value: "₹0", label: "Listing Fee", highlight: true },
                  
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className="bg-surface border border-border-default rounded-xl p-3.5 sm:p-4 text-center transition-transform duration-200"
                  >
                    <div className={cn(
                      "font-mono text-lg sm:text-xl font-bold",
                      stat.highlight ? "text-brand-lime" : "text-text-main"
                    )}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-text-muted font-sans uppercase tracking-wider mt-0.5">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>

            {/* Right Column: Authentic Turf Manager Editorial Image */}
            <FadeInSection delay={0.2} className="w-full lg:w-[480px] shrink-0 min-w-0">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border-default shadow-sm bg-surface">
                <Image
                  src="/images/marketing/owners/hero-owner-at-turf.webp"
                  alt="Sports facility owner managing courts and bookings on a tablet"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-surface border border-border-default/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-lime" />
                    <span className="text-xs font-semibold text-text-main font-sans">
                      Partner Portal &amp; Ground Controls
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    Real-time slot locks, instant walk-in entry, and direct 24-hour settlements.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TRUST STRIP — Social Proof Bar                            */}
        {/* ========================================================= */}
        <section className="py-8 sm:py-10 border-y border-border-default/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  Trusted by venue owners
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  {[
                    { label: "150+ Venues Listed", icon: Building2 },
                    { label: "₹2Cr+ Payouts Processed", icon: Wallet },
                    { label: "4.8★ Owner Rating", icon: Star },
                    { label: "12+ Cities Live", icon: MapPin },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface border border-border-default hover:scale-[1.03] transition-transform duration-200"
                    >
                      <item.icon className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span className="text-[11px] sm:text-xs font-sans font-semibold text-text-main whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BENEFITS SECTION — Operations & Discovery                 */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 border-b border-border-default/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="mb-10 sm:mb-14 max-w-2xl">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  Daily Venue Operations
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Built for seamless court management.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed">
                  Turfzo equips arena owners and sports facility operators with purpose-built tools to maximize pitch utilization and streamline daily cash flow.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Image Column */}
              <FadeInSection delay={0.1} className="lg:col-span-6">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden border border-border-default shadow-sm bg-surface">
                  <Image
                    src="/images/marketing/owners/venue-operations.webp"
                    alt="Sports turf venue operations and ground staff maintenance during active evening hours"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </FadeInSection>

              {/* 4 Concise Benefits */}
              <FadeInSection delay={0.2} className="lg:col-span-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-default">
                    <div className="w-8 h-8 rounded-lg bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-3">
                      <Calendar className="w-4 h-4 text-brand-lime" />
                    </div>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-text-main">
                      Online Slot Scheduling
                    </h3>
                    <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">
                      Real-time availability with server-side concurrency locks that prevent double bookings.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-default">
                    <div className="w-8 h-8 rounded-lg bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-3">
                      <Wallet className="w-4 h-4 text-brand-lime" />
                    </div>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-text-main">
                      24h Payout Settlements
                    </h3>
                    <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">
                      Transparent 95% revenue share paid out directly to your registered UPI or bank account.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-default">
                    <div className="w-8 h-8 rounded-lg bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-3">
                      <Clock className="w-4 h-4 text-brand-lime" />
                    </div>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-text-main">
                      Flexible Slot Blocking
                    </h3>
                    <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">
                      Quickly hold slots for coaching academies, recurring leagues, offline walk-ins, or turf care.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-default">
                    <div className="w-8 h-8 rounded-lg bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-3">
                      <Users className="w-4 h-4 text-brand-lime" />
                    </div>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-text-main">
                      Player Discovery
                    </h3>
                    <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">
                      Immediate visibility to local players searching for football, cricket, badminton, and tennis grounds.
                    </p>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE FEATURE ARCHITECTURE — 4 Verified Pillars    */}
        {/* ========================================================= */}
        <section id="features" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="mb-8 sm:mb-12">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  Platform Capabilities
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Everything you need to run your sports facility.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base max-w-2xl mt-2 sm:mt-3">
                  All features below are live and accessible in the Turfzo Partner Dashboard.
                </p>
              </div>
            </FadeInSection>

            {/* Segmented Pillar Navigation Tabs */}
            <FadeInSection delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
                {FEATURE_PILLARS.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const isActive = activePillarIdx === idx;
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setActivePillarIdx(idx)}
                      className={cn(
                        "text-left p-3.5 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden",
                        isActive
                          ? "bg-surface border-brand-lime dark:border-white shadow-sm"
                          : "bg-elevated border-border-default hover:border-border-strong hover:bg-surface/60"
                      )}
                    >
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div
                          layoutId="activePillarLine"
                          className="absolute top-0 left-0 right-0 h-0.5 bg-brand-lime"
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                      )}

                      <div className="flex items-center justify-between w-full">
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                            isActive
                              ? "bg-brand-lime text-white dark:text-black shadow-sm"
                              : "bg-bg text-text-muted border border-border-default"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                              isActive ? "text-white dark:text-black stroke-current" : "text-text-muted stroke-current"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase tracking-wider font-semibold",
                            isActive ? "text-brand-lime font-bold" : "text-text-muted"
                          )}
                        >
                          [0{idx + 1}]
                        </span>
                      </div>

                      <div>
                        <div
                          className={cn(
                            "font-sans text-xs sm:text-sm font-bold leading-snug transition-colors",
                            isActive ? "text-text-main" : "text-text-muted"
                          )}
                        >
                          {pillar.label}
                        </div>
                        <div className="text-[10px] text-text-muted font-medium mt-0.5">{pillar.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FadeInSection>

            {/* Active Pillar Deep-Dive Card */}
            <FadeInSection delay={0.2}>
              <div className="bg-surface border border-border-default rounded-xl p-5 sm:p-8 lg:p-10 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-10 lg:gap-14 items-center">
                  {/* Left: Explanatory Copy & Points */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-elevated border border-border-default/50 text-xs font-mono text-brand-lime font-semibold">
                      <span>{activePillar.badge}</span>
                    </div>

                    <h3 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-text-main leading-tight">
                      {activePillar.headline}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm lg:text-base text-text-muted leading-relaxed">
                      {activePillar.description}
                    </p>

                    <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                      {activePillar.points.map((point, pIdx) => (
                        <motion.div
                          key={pIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: pIdx * 0.08 }}
                          className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-text-main"
                        >
                          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-brand-lime flex items-center justify-center shrink-0 mt-0.5 text-white dark:text-black shadow-xs">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-black stroke-[2.5]" />
                          </div>
                          <span className="leading-snug">{point}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-2 sm:pt-4">
                      <button
                        onClick={() => router.push("/owners/register")}
                        className="group inline-flex items-center gap-2 text-xs sm:text-sm font-sans font-bold text-brand-lime hover:underline cursor-pointer"
                      >
                        Get started with {activePillar.label}{" "}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Simulated Preview Widget */}
                  <div className="bg-elevated border border-border-default/50 rounded-xl p-4 sm:p-6 min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePillarIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        {activePillarIdx === 0 && (
                          <div className="space-y-3.5 sm:space-y-4">
                            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border-default/50">
                              <span className="font-mono text-xs font-bold text-text-main">SLOT CALENDAR OVERVIEW</span>
                              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md bg-elevated text-brand-lime border border-border-default/50 font-semibold">
                                ZERO OVERLAP
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 sm:p-3 rounded-lg bg-elevated border border-border-default/50">
                                <div className="text-[10px] text-text-muted font-mono">06:00 AM – 07:00 AM</div>
                                <div className="font-semibold text-text-main mt-0.5 sm:mt-1">Academy Coaching</div>
                                <span className="text-[9px] sm:text-[10px] text-text-muted font-medium">Recurring Slot Block</span>
                              </div>
                              <div className="p-2.5 sm:p-3 rounded-lg bg-elevated border border-border-default/50">
                                <div className="text-[10px] text-text-muted font-mono">07:00 AM – 08:00 AM</div>
                                <div className="font-semibold text-text-main mt-0.5 sm:mt-1">Available Online</div>
                                <span className="text-[9px] sm:text-[10px] text-brand-lime font-medium tabular-nums">
₹1,000 / hr</span>
                              </div>
                              <div className="p-2.5 sm:p-3 rounded-lg bg-brand-lime/5 border border-brand-lime/20">
                                <div className="text-[10px] text-brand-lime font-mono">08:00 PM – 09:00 PM</div>
                                <div className="font-semibold text-brand-lime mt-0.5 sm:mt-1">Confirmed · Online</div>
                                <span className="text-[9px] sm:text-[10px] text-brand-lime font-medium">Verified Escrow</span>
                              </div>
                              <div className="p-2.5 sm:p-3 rounded-lg bg-elevated border border-border-default/50">
                                <div className="text-[10px] text-text-muted font-mono">09:00 PM – 10:00 PM</div>
                                <div className="font-semibold text-text-main mt-0.5 sm:mt-1">Turf Grooming</div>
                                <span className="text-[9px] sm:text-[10px] text-text-muted font-medium">Maintenance Block</span>
                              </div>
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-text-muted bg-elevated p-2.5 rounded-lg border border-border-default/30">
                              ⚡ Concurrency-safe database transactions reject simultaneous booking attempts on the same slot.
                            </div>
                          </div>
                        )}

                        {activePillarIdx === 1 && (
                          <div className="space-y-3.5 sm:space-y-4">
                            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border-default/50">
                              <span className="font-mono text-xs font-bold text-text-main">DYNAMIC PRICING &amp; PROMOS</span>
                              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-lime text-white dark:text-black font-bold">
                                ACTIVE RULES
                              </span>
                            </div>
                            <div className="space-y-2 sm:space-y-2.5">
                              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-elevated border border-border-default/50 text-xs gap-2">
                                <div className="min-w-0">
                                  <div className="font-semibold text-text-main truncate">Prime Weekend Evening</div>
                                  <div className="text-[9px] sm:text-[10px] text-text-muted truncate">Fri, Sat, Sun · 06:00 PM – 10:00 PM</div>
                                </div>
                                <span className="font-mono text-[11px] sm:text-xs font-bold text-brand-lime bg-elevated px-2 py-0.5 rounded-md border border-border-default/50 shrink-0">
                                  +25% (1.25×)
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-elevated border border-border-default/50 text-xs gap-2">
                                <div className="min-w-0">
                                  <div className="font-semibold text-text-main truncate">Early Bird Promo Code</div>
                                  <div className="text-[9px] sm:text-[10px] text-text-muted truncate">Code: MORNING100 · ₹100 Flat Off</div>
                                </div>
                                <span className="font-mono text-[10px] sm:text-xs font-bold text-text-main bg-elevated px-2 py-0.5 rounded-md border border-border-default/50 shrink-0">
                                  Max 50 Uses
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-text-muted bg-elevated p-2.5 rounded-lg border border-border-default/30">
                              📈 Automatically applies the highest priority rule during user checkout.
                            </div>
                          </div>
                        )}

                        {activePillarIdx === 2 && (
                          <div className="space-y-3.5 sm:space-y-4">
                            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border-default/50">
                              <span className="font-mono text-xs font-bold text-text-main">EARNINGS &amp; PAYOUTS</span>
                              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md bg-elevated text-brand-lime border border-border-default/50 font-semibold">
                                95% REVENUE SHARE
                              </span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between p-2 sm:p-2.5 bg-elevated rounded-lg border border-border-default/50">
                                <span className="text-text-muted">Gross Slot Value</span>
                                <span className="font-mono font-semibold text-text-main tabular-nums">
₹1,500.00</span>
                              </div>
                              <div className="flex justify-between p-2 sm:p-2.5 bg-elevated rounded-lg border border-border-default/50">
                                <span className="text-text-muted">Platform Fee (Flat 5%)</span>
                                <span className="font-mono text-text-muted">- ₹75.00</span>
                              </div>
                              <div className="flex justify-between p-2 sm:p-2.5 bg-brand-lime/5 rounded-lg border border-brand-lime/20 font-bold text-brand-lime">
                                <span>Net Owner Payout Balance</span>
                                <span className="font-mono text-xs sm:text-sm tabular-nums">
₹1,425.00</span>
                              </div>
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-text-muted bg-elevated p-2.5 rounded-lg border border-border-default/30">
                              🏦 Request one-tap payouts to UPI or Bank (Account Number + IFSC) settled in 24 hours.
                            </div>
                          </div>
                        )}

                        {activePillarIdx === 3 && (
                          <div className="space-y-3.5 sm:space-y-4">
                            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border-default/50">
                              <span className="font-mono text-xs font-bold text-text-main">TOURNAMENTS &amp; CRM</span>
                              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-md bg-elevated text-text-main border border-border-default/50 font-semibold">
                                SINGLE ELIMINATION
                              </span>
                            </div>
                            <div className="space-y-2 text-xs font-mono">
                              <div className="p-2 sm:p-2.5 bg-elevated rounded-lg border border-border-default/50 flex justify-between items-center gap-2">
                                <span className="text-text-muted text-[11px] shrink-0">Quarter-Final 1</span>
                                <span className="text-brand-lime font-bold truncate text-right">Bangalore FC vs Apex United</span>
                              </div>
                              <div className="p-2 sm:p-2.5 bg-elevated rounded-lg border border-border-default/50 flex justify-between items-center gap-2">
                                <span className="text-text-muted text-[11px] shrink-0">Captain Pass Code</span>
                                <span className="text-text-main font-semibold">REG-K9W42J</span>
                              </div>
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-text-muted bg-elevated p-2.5 rounded-lg border border-border-default/30">
                              🏆 Manage fixtures, collect team entry fees, and identify VIP repeat players automatically.
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* VENUE OPERATIONS — On-Ground Check-in & Desk Management   */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 bg-elevated border-y border-border-default/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  On-Ground Operations
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Seamless check-ins from the front desk to the pitch.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed">
                  Manage walk-in arrivals, verify player slots instantly via QR, and eliminate manual register errors. Your front desk staff and ground operators stay in perfect sync with real-time slot telemetry.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-border-default bg-surface shadow-sm">
                <div className="relative aspect-[3/2] sm:aspect-[16/10] w-full overflow-hidden bg-bg group">
                  <Image
                    src="/images/marketing/owners/venue-reception.webp"
                    alt="Turf arena front desk reception with manager verifying walk-in check-in and booking schedule"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  
                  {/* Bottom overlay highlight pill badges */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-brand-lime" />
                      Instant QR Check-in
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono">
                      <CreditCard className="w-3.5 h-3.5 text-brand-lime" />
                      Walk-in POS & UPI
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime" />
                      Real-time Slot Locks
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* THE TURFZO DIFFERENCE — Two-Column "Chaos vs. System"     */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 bg-slate-50 dark:bg-zinc-950 border-y border-slate-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  Operational Comparison
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Stop managing chaos. Start managing a business.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed">
                  Compare traditional manual facility management with Turfzo&apos;s real-time operational operating system.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch max-w-6xl mx-auto">
              {/* LEFT BOARD: The Traditional Setup (Manual & Fragmented) */}
              <FadeInSection delay={0.1} className="h-full">
                <div className="h-full rounded-xl p-6 sm:p-8 bg-surface border border-border-default shadow-sm flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3.5 pb-6 border-b border-border-default">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                        <X className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">
                          The Traditional Setup
                        </span>
                        <h3 className="font-sans text-lg sm:text-xl font-bold text-text-main">
                          Manual Chaos &amp; Revenue Leaks
                        </h3>
                      </div>
                    </div>

                    {/* 5 Friction Points */}
                    <div className="divide-y divide-border-default mt-2">
                      {COMPARISON_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="py-4 sm:py-5 first:pt-4 last:pb-2">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0 mt-0.5">
                                <X className="w-3.5 h-3.5 text-rose-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="w-3.5 h-3.5 text-text-muted" />
                                  <span className="text-xs font-mono text-text-secondary uppercase tracking-wider font-semibold">
                                    {item.category}
                                  </span>
                                </div>
                                <h4 className="font-sans text-sm sm:text-base font-bold text-text-main">
                                  {item.manualTitle}
                                </h4>
                                <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                                  {item.manualDesc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Negative Outcome Footer Banner */}
                  <div className="mt-6 pt-5 border-t border-border-default">
                    <div className="p-4 rounded-xl bg-elevated border border-border-default flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <p className="font-sans text-xs text-text-muted leading-snug">
                        <strong className="text-text-main font-semibold">Typical venue loss:</strong> 15–20% monthly revenue leaked to double bookings, uncollected cash, and idle morning courts.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>

              {/* RIGHT BOARD: The Turfzo Operating System (Control & Scale) */}
              <FadeInSection delay={0.2} className="h-full">
                <div className="h-full rounded-xl p-6 sm:p-8 bg-surface border-2 border-brand-lime shadow-sm flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3.5 pb-6 border-b border-border-default">
                      <div className="w-10 h-10 rounded-lg bg-brand-lime text-white dark:text-black flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-text-main">
                            The Turfzo Platform
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-brand-lime/15 border border-brand-lime/30 text-brand-lime">
                            AUTOMATED OS
                          </span>
                        </div>
                        <h3 className="font-sans text-lg sm:text-xl font-bold text-text-main">
                          Automated, Confirmed &amp; Paid
                        </h3>
                      </div>
                    </div>

                    {/* 5 Solution Items */}
                    <div className="divide-y divide-border-default mt-2">
                      {COMPARISON_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="py-4 sm:py-5 first:pt-4 last:pb-2">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-brand-lime text-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5 text-brand-lime" />
                                    <span className="text-xs font-mono text-text-secondary font-semibold uppercase tracking-wider">
                                      {item.category}
                                    </span>
                                  </div>
                                  <span className="text-[10px] sm:text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-elevated text-text-main border border-border-default shrink-0">
                                    {item.badge}
                                  </span>
                                </div>
                                <h4 className="font-sans text-sm sm:text-base font-bold text-text-main">
                                  {item.turfzoTitle}
                                </h4>
                                <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                                  {item.turfzoDesc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Positive Outcome Footer Banner */}
                  <div className="mt-6 pt-5 border-t border-border-default">
                    <div className="p-4 rounded-xl bg-elevated border border-border-default flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-lime shrink-0" />
                      <p className="font-sans text-xs text-text-muted leading-snug">
                        <strong className="text-text-main font-bold">Turfzo partner result:</strong> 100% upfront booking collection, zero schedule conflicts, and direct 24h bank payouts at a flat 5% fee.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* REVENUE CALCULATOR — Premium Glassmorphism                */}
        {/* ========================================================= */}
        <section id="calculator" className="py-20 sm:py-28">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
            <FadeInSection>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  Venue Yield Estimator
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  See what your arena can earn.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3">
                  Adjust your court count, hourly rate, and daily bookings to calculate your projected revenue with Turfzo&apos;s 95% payout rate.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <div className="bg-surface border border-border-default rounded-xl p-5 sm:p-8 lg:p-12 max-w-4xl mx-auto shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center">
                  {/* Sliders Control Panel */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* Courts Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="font-sans text-xs sm:text-sm font-semibold text-text-main">
                          Number of Courts / Pitches
                        </label>
                        <span className="font-mono text-sm sm:text-base font-bold text-brand-lime px-3 py-1 bg-elevated rounded-lg border border-border-default/50 tabular-nums">
                          {courtCount} {courtCount === 1 ? "Court" : "Courts"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={6}
                        step={1}
                        value={courtCount}
                        onChange={(e) => setCourtCount(Number(e.target.value))}
                        className="owners-slider"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted font-medium font-mono mt-1.5">
                        <span>1</span>
                        <span>6</span>
                      </div>
                    </div>

                    {/* Hourly Rate Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="font-sans text-xs sm:text-sm font-semibold text-text-main">
                          Average Hourly Rate
                        </label>
                        <span className="font-mono text-sm sm:text-base font-bold text-brand-lime px-3 py-1 bg-elevated rounded-lg border border-border-default/50 tabular-nums">
₹{hourlyPrice.toLocaleString()} / hr
                        </span>
                      </div>
                      <input
                        type="range"
                        min={600}
                        max={3000}
                        step={100}
                        value={hourlyPrice}
                        onChange={(e) => setHourlyPrice(Number(e.target.value))}
                        className="owners-slider"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted font-medium font-mono mt-1.5">
                        <span>₹600</span>
                        <span>₹3,000</span>
                      </div>
                    </div>

                    {/* Daily Booked Hours Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="font-sans text-xs sm:text-sm font-semibold text-text-main">
                          Average Booked Hours / Day
                        </label>
                        <span className="font-mono text-sm sm:text-base font-bold text-brand-lime px-3 py-1 bg-elevated rounded-lg border border-border-default/50 tabular-nums">
                          {hoursPerDay} Hrs / Day
                        </span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={14}
                        step={1}
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(Number(e.target.value))}
                        className="owners-slider"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted font-medium font-mono mt-1.5">
                        <span>3 hrs</span>
                        <span>14 hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Output Card */}
                  <div className="bg-elevated border border-border-default/50 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5 sm:space-y-6">
                    <div>
                      <div className="text-[10px] sm:text-xs font-mono text-text-muted uppercase tracking-wider">
                        Projected Monthly Payout (95% Net)
                      </div>
                      <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-lime mt-2 tabular-nums">
                        <AnimatedCounter value={netOwnerEarnings} prefix="₹" />
                      </div>
                      <div className="text-[11px] sm:text-xs text-text-muted mt-1.5 tabular-nums">
                        Gross Turnover: ₹{grossMonthlyRevenue.toLocaleString("en-IN")} / mo
                      </div>
                      {/* Yearly projection */}
                      <div className="mt-3 pt-3 border-t border-border-default/30">
                        <div className="text-[10px] sm:text-xs font-mono text-text-muted font-medium uppercase tracking-wider">
                          Projected Annual Earnings
                        </div>
                        <div className="font-mono text-lg sm:text-xl font-bold text-text-main mt-1 tabular-nums">
₹{(netOwnerEarnings * 12).toLocaleString("en-IN")} / year
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-border-default/50 space-y-2 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Estimated Monthly Slots:</span>
                        <span className="font-mono font-semibold text-text-main tabular-nums">{estimatedBookings} Bookings</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Platform Fee (Flat 5%):</span>
                        <span className="font-mono font-semibold text-text-muted tabular-nums">
₹{(grossMonthlyRevenue - netOwnerEarnings).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Direct Bank Settlement:</span>
                        <span className="font-mono font-semibold text-brand-lime">24h SLA</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/owners/register")}
                      className="w-full py-3.5 rounded-xl bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm transition-all duration-200 cursor-pointer text-center shadow-sm"
                    >
                      Start Earning with Turfzo
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* OWNER TESTIMONIALS                                        */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  From Our Partners
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Venue owners love the results.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3">
                  Hear from arena managers who transformed their operations with Turfzo.
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {OWNER_TESTIMONIALS.map((testimonial, idx) => (
                <FadeInSection key={idx} delay={idx * 0.1}>
                  <div className="bg-surface border border-border-default rounded-xl p-5 sm:p-6 flex flex-col justify-between h-full transition-transform duration-300">
                    {/* Quote */}
                    <div>
                      <Quote className="w-6 h-6 text-brand-lime/30 mb-3" />
                      <p className="font-sans text-sm sm:text-base text-text-main leading-relaxed mb-5">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>

                    {/* Author */}
                    <div className="pt-4 border-t border-border-default/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-sans text-sm font-bold text-text-main">{testimonial.name}</div>
                          <div className="text-[11px] sm:text-xs text-text-muted">
                            {testimonial.venue} · {testimonial.city}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-star fill-star" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3-STEP ANIMATED ONBOARDING CAROUSEL                       */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
            <FadeInSection>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  Fast Onboarding
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Live in under 24 hours.
                </h2>
                <p className="font-sans text-text-muted text-sm sm:text-base mt-2 sm:mt-3">
                  List your ground, verify your location, and start accepting online bookings in 3 simple steps.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <div
                onMouseEnter={() => setIsStepPaused(true)}
                onMouseLeave={() => setIsStepPaused(false)}
                className="bg-surface border border-border-default rounded-xl p-4 sm:p-8 lg:p-10 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 sm:gap-8 lg:gap-12 items-center">
                  {/* Left: Interactive 3-Step Clickable Stack with Live Progress Lines */}
                  <div className="space-y-3 sm:space-y-3.5">
                    {ONBOARDING_STEPS.map((step, idx) => {
                      const isActive = activeStepIdx === idx;
                      const Icon = step.icon;
                      return (
                        <button
                          key={step.step}
                          onClick={() => setActiveStepIdx(idx)}
                          className={cn(
                            "w-full text-left p-3.5 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col gap-1.5 sm:gap-2",
                            isActive
                              ? "bg-surface border-brand-lime dark:border-white shadow-sm"
                              : "bg-bg border-border-default hover:border-border-strong hover:bg-elevated"
                          )}
                        >
                          {/* Live animated progress bar for active card */}
                          {isActive && (
                            <motion.div
                              key={`prog-${activeStepIdx}`}
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 4.5, ease: "linear" }}
                              className="absolute bottom-0 left-0 h-0.5 bg-brand-lime"
                            />
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                              <span
                                className={cn(
                                  "font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md",
                                  isActive
                                    ? "bg-brand-lime text-white dark:text-black"
                                    : "bg-elevated text-text-muted border border-border-default font-medium"
                                )}
                              >
                                STEP {step.step}
                              </span>
                              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold">
                                {step.tag}
                              </span>
                            </div>
                            {isActive && (
                              <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-brand-lime font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                                LIVE
                              </span>
                            )}
                          </div>

                          <h3
                            className={cn(
                              "font-sans text-xs sm:text-sm sm:text-base font-bold transition-colors",
                              isActive ? "text-text-main" : "text-text-muted"
                            )}
                          >
                            {step.title}
                          </h3>

                          <p className="font-sans text-xs text-text-muted leading-relaxed">
                            {step.desc}
                          </p>
                        </button>
                      );
                    })}

                    {/* Carousel Controls & Step Indicator Dots */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 px-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {ONBOARDING_STEPS.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveStepIdx(idx)}
                            aria-label={`Go to step ${idx + 1}`}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                              activeStepIdx === idx ? "w-5 sm:w-6 bg-brand-lime" : "w-2 bg-border-default hover:bg-border-strong"
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setActiveStepIdx(
                              (prev) => (prev - 1 + ONBOARDING_STEPS.length) % ONBOARDING_STEPS.length
                            )
                          }
                          aria-label="Previous step"
                          className="w-8 h-8 rounded-lg bg-elevated border border-border-default/50 hover:border-border-strong text-text-muted hover:text-text-main flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveStepIdx((prev) => (prev + 1) % ONBOARDING_STEPS.length)
                          }
                          aria-label="Next step"
                          className="w-8 h-8 rounded-lg bg-elevated border border-border-default/50 hover:border-border-strong text-text-muted hover:text-text-main flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Authentic Venue Exterior Image */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border-default bg-surface shadow-sm min-w-0">
                    <Image
                      src="/images/marketing/owners/onboarding-venue-exterior.webp"
                      alt="Verified sports turf venue exterior ready for player bookings"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 540px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="absolute top-4 right-4 z-10">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-lime text-white dark:text-black shadow-sm">
                        STEP {activeStep.step} OF 03
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 p-4 sm:p-5 rounded-xl bg-surface border border-border-default/80">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-lime" />
                        <span className="text-xs font-mono uppercase tracking-wider text-brand-lime font-semibold">
                          {activeStep.tag}
                        </span>
                      </div>
                      <h4 className="font-sans text-sm sm:text-base font-bold text-text-main">
                        {activeStep.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {activeStep.desc}
                      </p>
                      <div className="mt-3 pt-3 border-t border-border-default/40 flex items-center justify-between">
                        <span className="text-[11px] text-text-muted">
                          Approved in under 24 hours
                        </span>
                        <button
                          onClick={() => router.push("/owners/register")}
                          className="font-sans text-xs font-bold text-brand-lime hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          Register ground <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FAQ SECTION                                               */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
            <FadeInSection>
              <div className="text-center mb-8 sm:mb-12">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">
                  Frequently Asked Questions
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-main mt-1.5 sm:mt-2">
                  Everything you need to know about partnering with Turfzo.
                </h2>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <FaqAccordion items={OWNER_FAQS} />
            </FadeInSection>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CLOSING CTA — Floodlit Arena Background Card              */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
            <FadeInSection>
              <div className="relative rounded-xl overflow-hidden border border-border-default shadow-sm min-h-[420px] sm:min-h-[460px] flex items-center justify-center">
                {/* Authentic Floodlit Sports Arena Background */}
                <Image
                  src="/images/marketing/owners/cta-arena-aerial.webp"
                  alt="Overhead view of an active floodlit box cricket and football turf with community players at night"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1024px"
                  className="object-cover object-center"
                />

                {/* Balanced atmospheric contrast overlay — preserves vibrant turf while guaranteeing WCAG AAA legibility */}
                <div className="absolute inset-0 bg-black/50 z-10" />

                {/* Card Content Container */}
                <div className="relative z-20 w-full max-w-2xl mx-auto p-8 sm:p-12 lg:p-16 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-3.5 h-3.5 text-brand-lime" />
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white/90 uppercase tracking-wider">
                      100% Free to Start
                    </span>
                  </div>

                  <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 sm:mb-5 leading-tight">
                    Ready to fill every slot<br className="hidden sm:block" /> on your arena?
                  </h2>

                  <p className="font-sans text-sm sm:text-base lg:text-lg text-white/90 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                    Join verified venue owners across India. Start accepting online bookings, eliminate double scheduling, and receive direct 24h payouts.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => router.push("/owners/register")}
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-8 sm:px-10 py-4 sm:py-4.5 rounded-xl transition-all duration-200 text-sm sm:text-base shadow-sm cursor-pointer"
                    >
                      Start Free Partner Registration
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button
                      onClick={() => router.push("/owners/dashboard")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-sans font-semibold px-6 sm:px-8 py-4 sm:py-4.5 rounded-xl border border-white/25 transition-all duration-200 text-sm sm:text-base cursor-pointer shadow-md"
                    >
                      Partner Sign In
                    </button>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-mono text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-lime" /> Free Listing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-lime" /> Flat 5% Fee
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-lime" /> 24h Settlements
                    </span>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      {/* Sticky Mobile CTA Bar */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="sticky-mobile-cta lg:hidden"
          >
            <button
              onClick={() => router.push("/owners/register")}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
            >
              Register Your Venue — Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
