"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, 
  Users, 
  ScanLine, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Sparkles,
  ChevronDown,
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { HowToSchema, FAQPageSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

const howToSteps = [
  { name: "Search & Discover", text: "Find verified premium pitches near you that support your sport, formatting, and timing. Filter by floodlights, parking, and amenities." },
  { name: "Select Date & Time Slot", text: "Choose your preferred date and available time slot from real-time availability. No phone calls needed." },
  { name: "Split & Pay Online", text: "Reserve the slot instantly. Add your teammates' contacts at checkout to split the bill, allowing everyone to pay their share directly via UPI or card." },
  { name: "Show Up & Play", text: "Access the pitch by scanning your receipt QR code at the entrance gates. Floodlights activate automatically according to your booking slot." },
];

const faqItems = [
  { question: "How do I book a turf on Turfzo?", answer: "Visit turfzo.com/explore, select your city, browse available turfs, choose your date and time slot, and complete payment online. Your booking is confirmed instantly with a QR code ticket pass." },
  { question: "How much does turf booking cost?", answer: "Turf booking prices in India range from ₹500 to ₹2000 per hour depending on the city, sport, and facilities. Football turfs typically cost ₹800-1500/hour in metro cities." },
  { question: "Can I cancel my booking?", answer: "Yes, you can cancel your booking up to 6 hours before the scheduled time for a full refund. Cancellations within 6 hours receive a 50% refund." },
  { question: "How does bill splitting work?", answer: "When you book a turf on Turfzo, you can add your teammates' phone numbers at checkout. Each teammate receives a payment request for their share. Everyone pays their portion online." },
  { question: "What sports can I book on Turfzo?", answer: "Turfzo supports football, cricket, badminton, tennis, and multipurpose sports venues. We have 50+ turfs across 8 major Indian cities." },
  { question: "Is online payment safe on Turfzo?", answer: "Yes, Turfzo uses Razorpay for payment processing, which is PCI DSS compliant. We support UPI, credit cards, debit cards, and net banking." },
  { question: "Do I need to download an app to book?", answer: "No, you can book directly on turfzo.com from any browser. We also have a mobile app for Android and iOS if you prefer." },
  { question: "What happens if it rains on my booking day?", answer: "If the turf is outdoor and weather conditions prevent play, you can reschedule or get a full refund. Indoor turfs are not affected by weather." },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"player" | "owner">("player");

  const playerFlow = [
    {
      num: "01",
      icon: Compass,
      title: "Search & Discover",
      desc: "Find verified premium pitches near you that support your sport, formatting, and timing. Filter by floodlights, parking, and amenities.",
      tag: "Discover",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Real-time Search</span>
          <div className="bg-bg border border-border-subtle p-3 rounded-lg flex flex-col gap-1 shadow-inner">
            <span className="text-[8px] text-text-muted">Enter Location</span>
            <div className="text-text-main font-semibold flex items-center justify-between text-[10px]">
              <span>HSR Layout, Bengaluru</span>
              <span className="text-brand-lime">✓</span>
            </div>
          </div>
          <div className="bg-bg border border-border-subtle p-3 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#16211B] flex items-center justify-center font-bold text-xs text-brand-lime">G1</div>
            <div className="flex flex-col">
              <span className="font-bold text-text-main text-[10px]">Greenfield Arena</span>
              <span className="text-[8px] text-text-muted">Football · 5.0 ★ · 1.2 km away</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "02",
      icon: Calendar,
      title: "Select Date & Time Slot",
      desc: "Choose your preferred date and available hour from real-time availability. Check live slot pricing, peak hours, and lock your spot instantly.",
      tag: "Slot Select",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Live Booking Grid</span>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
            <span className="bg-elevated text-text-muted p-2 rounded border border-border-subtle line-through">05:00 PM (Booked)</span>
            <span className="bg-elevated text-text-muted p-2 rounded border border-border-subtle line-through">06:00 PM (Booked)</span>
            <span className="bg-brand-lime text-black font-bold p-2 rounded border border-brand-lime shadow-sm">07:00 PM (Selected)</span>
            <span className="bg-elevated text-text-main p-2 rounded border border-border-subtle hover:bg-elevated/80">08:00 PM (Available)</span>
          </div>
        </div>
      )
    },
    {
      num: "03",
      icon: Users,
      title: "Split & Pay Online",
      desc: "Reserve the slot instantly. Add your teammates' contacts at checkout to split the bill, allowing everyone to pay their share directly.",
      tag: "Secure Pay",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Teammate Bill Split</span>
          <div className="bg-bg border border-border-subtle p-3.5 rounded-lg flex flex-col gap-2 shadow-inner text-[10px]">
            <div className="flex justify-between border-b border-border-subtle pb-1.5 text-text-muted">
              <span>Total Booking Total</span>
              <span>₹1,000</span>
            </div>
            <div className="flex justify-between font-bold text-brand-lime text-xs pt-0.5">
              <span>Your share (1/4)</span>
              <span>₹250</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <span className="flex-1 bg-elevated border border-border-default rounded p-1.5 text-center text-[8px] font-bold">Pay UPI</span>
              <span className="flex-1 bg-elevated border border-border-default rounded p-1.5 text-center text-[8px] font-bold">Split Links</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "04",
      icon: ScanLine,
      title: "Show Up & Play",
      desc: "Access the pitch by scanning your receipt QR code pass at the entrance gates. Floodlights activate automatically according to your schedule.",
      tag: "Access Pass",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm flex flex-col items-center justify-center space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider self-start">Gate Entrance QR Pass</span>
          <div className="bg-white p-3 rounded-xl shadow-md">
            <svg viewBox="0 0 100 100" className="w-20 h-20 text-black">
              <rect x="0" y="0" width="30" height="30" fill="black" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" fill="black" />
              <rect x="70" y="0" width="30" height="30" fill="black" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" fill="black" />
              <rect x="0" y="70" width="30" height="30" fill="black" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" fill="black" />
              <rect x="40" y="40" width="20" height="20" fill="black" />
            </svg>
          </div>
          <span className="text-[9px] text-brand-lime font-bold tracking-widest uppercase font-sans">Entrance Pass Active</span>
        </div>
      )
    }
  ];

  const ownerFlow = [
    {
      num: "01",
      icon: MapPin,
      title: "List Venue Showcase",
      desc: "List your venue with photographs, grass specifications, location, amenities, and available pitches in minutes.",
      tag: "Setup",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Pitch Specifications</span>
          <div className="bg-bg border border-border-subtle p-3 rounded-lg flex flex-col gap-2 text-[10px]">
            <div className="flex justify-between border-b border-border-subtle pb-1">
              <span className="text-text-muted">Grass Type</span>
              <span className="font-semibold text-text-main">FIFA Pro Approved</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Amenities</span>
              <span className="font-semibold text-text-main">Floodlights, Parking</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "02",
      icon: Calendar,
      title: "Manage Slots & Rates",
      desc: "Set booking hours, seasonal pricing, and automate floodlight activation. Integrate slot syncing to prevent double bookings.",
      tag: "Controls",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Auto-scheduler Controls</span>
          <div className="bg-bg border border-border-subtle p-3.5 rounded-lg flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-muted">Night rate premium</span>
              <span className="text-brand-lime font-bold">+20%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-text-muted">Smart floodlights</span>
              <span className="text-brand-lime font-bold">Enabled</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "03",
      icon: BarChart3,
      title: "Track Payouts & Stats",
      desc: "Track earnings, average occupancy rates, and player reviews in real time via a secure owner dashboard. Payouts arrive in 24 hours.",
      tag: "Analytics",
      visual: (
        <div className="bg-[#111613] border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
          <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">Payout Dashboard</span>
          <div className="bg-bg border border-border-subtle p-3 rounded-lg flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] text-text-muted uppercase">Monthly Revenue</span>
              <span className="font-poppins font-extrabold text-text-main text-base mt-0.5">₹1,45,200</span>
            </div>
            <div className="bg-[#16211B] text-brand-lime border border-brand-lime/10 px-2 py-1 rounded text-[9px] font-bold">
              +14% Growth
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>How It Works | Book a Turf in 2 Minutes | Turfzo</title>
        <meta name="description" content="Learn how to book a football turf, cricket ground, or sports venue on Turfzo. Search, select your slot, pay online, and show up to play. It takes 2 minutes." />
        <link rel="canonical" href="https://turfzo.com/how-it-works" />
        <meta property="og:title" content="How It Works | Turfzo" />
        <meta property="og:description" content="Book a turf in 2 minutes. Search, pick a slot, pay online, and show up to play." />
        <meta property="og:url" content="https://turfzo.com/how-it-works" />
      </head>
      
      <HowToSchema
        name="How to Book a Turf on Turfzo"
        description="Book a football turf, cricket ground, or sports venue in 2 minutes on Turfzo. Search, select your slot, pay online, and show up to play."
        totalTime="PT2M"
        steps={howToSteps}
      />
      <FAQPageSchema items={faqItems} />
      
      <Header />

      <main className="flex-grow pt-24 pb-20 relative">
        {/* Subtle background ambient lighting */}
        <div className="absolute top-1/4 left-0 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-lime/[0.015] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-96 h-96 rounded-full bg-brand-lime/[0.015] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-10">
          
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-brand-lime/25 bg-brand-lime/5 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime">
              <Sparkles className="w-3.5 h-3.5" /> Simplifying Sports Bookings
            </span>
            <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight tracking-tight">
              Discover How <span className="text-brand-lime">Turfzo Works</span>
            </h1>
            <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
              Book a turf in 2 minutes. Search for available venues near you, select your time slot, pay online, and show up to play. No phone calls, no hassle.
            </p>

            {/* Toggle Tab Buttons: Flat segment controller */}
            <div className="mt-8 flex justify-center bg-elevated border border-border-default p-1 rounded-lg max-w-xs mx-auto">
              <button 
                onClick={() => setActiveTab("player")}
                className={`flex-1 font-poppins font-semibold text-xs py-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "player" ? "bg-surface text-brand-lime shadow-sm border border-border-subtle" : "text-text-muted hover:text-text-main"
                }`}
              >
                For Players
              </button>
              <button 
                onClick={() => setActiveTab("owner")}
                className={`flex-1 font-poppins font-semibold text-xs py-2.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "owner" ? "bg-surface text-brand-lime shadow-sm border border-border-subtle" : "text-text-muted hover:text-text-main"
                }`}
              >
                For Turf Owners
              </button>
            </div>
          </div>

          {/* EDITORIAL ALTERNATING STEPS FLOW */}
          <div className="space-y-24 max-w-5xl mx-auto mb-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-24"
              >
                {(activeTab === "player" ? playerFlow : ownerFlow).map((step, idx) => {
                  const Icon = step.icon;
                  const isEven = idx % 2 === 0;
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex flex-col gap-12 lg:gap-16 items-center justify-between",
                        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                      )}
                    >
                      {/* Typographic Guide Content (55% Width) */}
                      <div className="w-full lg:w-[50%] space-y-5 text-left">
                        <div className="flex items-center gap-3">
                          <span className="font-poppins text-sm font-bold text-brand-lime tracking-wide">
                            {step.num}
                          </span>
                          <span className="text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-elevated text-text-muted border border-border-subtle">
                            {step.tag}
                          </span>
                        </div>
                        <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-tight">
                          {step.title}
                        </h2>
                        <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      {/* Schematic Visual Mockup (45% Width) */}
                      <div className="w-full lg:w-[40%] flex items-center justify-center">
                        {step.visual}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FAQ Section: Minimal borderless list */}
          <div className="max-w-3xl mx-auto px-6 md:px-8 mt-20 border-t border-border-default pt-20">
            <h2 className="font-poppins font-extrabold text-3xl text-text-main tracking-tight mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-border-default">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="py-5 group cursor-pointer"
                >
                  <summary className="font-poppins font-bold text-sm sm:text-base text-text-main cursor-pointer list-none flex items-center justify-between focus:outline-none select-none">
                    <span>{item.question}</span>
                    <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform duration-300" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-text-muted font-sans leading-relaxed max-w-2xl pr-4">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
