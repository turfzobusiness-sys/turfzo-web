"use client";

import { useState } from "react";
import Image from "next/image";
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
  ArrowRight,
  Play,
  CheckCircle2,
  Lock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"player" | "owner">("player");
  const [simStep, setSimStep] = useState(0);

  const playerFlow = [
    {
      icon: Compass,
      title: "1. Search & Discover",
      desc: "Find verified premium pitches near you that support your sport, formatting, and timing. Filter by floodlights, parking, and amenities."
    },
    {
      icon: Users,
      title: "2. Split & Book",
      desc: "Reserve the slot instantly. Add your teammates' contacts at checkout to split the bill, allowing everyone to pay their share directly."
    },
    {
      icon: ScanLine,
      title: "3. Show Up & Play",
      desc: "Access the pitch by scanning your receipt QR code at the entrance gates. Floodlights activate automatically according to your booking slot."
    }
  ];

  const ownerFlow = [
    {
      icon: MapPin,
      title: "1. List Venue Showcase",
      desc: "List your venue with photographs, grass specifications, location, amenities, and available pitches in minutes."
    },
    {
      icon: Calendar,
      title: "2. Manage Slots & Rates",
      desc: "Set booking hours, seasonal pricing, and automate floodlight activation. Integrate slot syncing to prevent double bookings."
    },
    {
      icon: BarChart3,
      title: "3. Track Payouts & Stats",
      desc: "Track earnings, average occupancy rates, and player reviews in real time via a secure owner dashboard. Payouts arrive in 24 hours."
    }
  ];

  // Simulator frames
  const simulatorSteps = [
    {
      title: "Search & Match",
      phoneScreen: (
        <div className="flex flex-col gap-2 p-3 text-left bg-bg-dark h-full text-[10px]">
          <span className="text-[8px] font-bold text-brand-lime uppercase">Step 01</span>
          <h4 className="font-poppins font-bold text-xs text-text-main">Find local turfs</h4>
          <div className="bg-surface-dark border border-white/5 p-2 rounded flex flex-col gap-1.5 mt-1">
            <span className="text-[8px] text-text-muted">Enter Location</span>
            <div className="bg-bg-dark p-1.5 rounded border border-white/10 text-text-main flex items-center justify-between">
              <span>HSR Layout, Bengaluru</span>
              <span className="text-brand-lime">✓</span>
            </div>
            <span className="bg-brand-lime text-black text-center font-bold p-1 rounded mt-1">Search Turfs</span>
          </div>
        </div>
      )
    },
    {
      title: "Select Time Slot",
      phoneScreen: (
        <div className="flex flex-col gap-2 p-3 text-left bg-bg-dark h-full text-[10px]">
          <span className="text-[8px] font-bold text-brand-lime uppercase">Step 02</span>
          <h4 className="font-poppins font-bold text-xs text-text-main">Choose your hour</h4>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <span className="bg-elevated-dark text-text-muted p-1 text-center rounded border border-white/5 line-through">05:00 PM</span>
            <span className="bg-elevated-dark text-text-muted p-1 text-center rounded border border-white/5 line-through">06:00 PM</span>
            <span className="bg-brand-lime text-black font-bold p-1 text-center rounded border border-brand-lime">07:00 PM</span>
            <span className="bg-elevated-dark text-text-main p-1 text-center rounded border border-white/5">08:00 PM</span>
          </div>
          <span className="text-[7px] text-text-muted text-center mt-2">Slot: 24 May, Fri · 07:00 PM</span>
        </div>
      )
    },
    {
      title: "Bill Splitting",
      phoneScreen: (
        <div className="flex flex-col gap-2 p-3 text-left bg-bg-dark h-full text-[10px]">
          <span className="text-[8px] font-bold text-brand-lime uppercase">Step 03</span>
          <h4 className="font-poppins font-bold text-xs text-text-main">Split with team</h4>
          <div className="bg-surface-dark border border-white/5 p-2 rounded flex flex-col gap-2 mt-1">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Slot Fare</span>
              <span>₹1,000</span>
            </div>
            <div className="flex justify-between font-bold text-brand-lime">
              <span>Your share (1/4)</span>
              <span>₹250</span>
            </div>
            <span className="bg-brand-lime text-black text-center font-bold p-1 rounded mt-1">Split & Pay Now</span>
          </div>
        </div>
      )
    },
    {
      title: "QR Pass Gate Access",
      phoneScreen: (
        <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center bg-bg-dark h-full text-[10px]">
          <span className="text-[8px] font-bold text-brand-lime uppercase">Step 04</span>
          <h4 className="font-poppins font-bold text-xs text-text-main">Entrance Ticket</h4>
          <div className="bg-white p-1.5 rounded mt-1">
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-black">
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
          <span className="text-[7px] text-brand-lime font-bold tracking-wider mt-1 uppercase">Ready to scan</span>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-dark border border-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime">
              <Sparkles className="w-3.5 h-3.5" /> Simplifying Sports Bookings
            </span>
            <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight tracking-tight">
              Discover How <span className="text-brand-lime">Turfzo Works</span>
            </h1>
            <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
              Step onto the court with zero friction. We connect passionate players with luxury venues through automated, high-end booking workflows.
            </p>

            {/* Toggle Tab Buttons */}
            <div className="mt-8 flex justify-center bg-surface-dark border border-white/5 p-1 rounded-pill max-w-xs mx-auto">
              <button 
                onClick={() => setActiveTab("player")}
                className={`flex-1 font-poppins font-semibold text-xs py-2.5 rounded-pill transition-all ${
                  activeTab === "player" ? "bg-brand-lime text-black" : "text-text-muted hover:text-text-main"
                }`}
              >
                For Players
              </button>
              <button 
                onClick={() => setActiveTab("owner")}
                className={`flex-1 font-poppins font-semibold text-xs py-2.5 rounded-pill transition-all ${
                  activeTab === "owner" ? "bg-brand-lime text-black" : "text-text-muted hover:text-text-main"
                }`}
              >
                For Turf Owners
              </button>
            </div>
          </div>

          {/* Details flow columns grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            
            {/* Left Flow Descriptions: 7 Cols */}
            <div className="lg:col-span-7 flex flex-col gap-8 text-left">
              <h2 className="font-poppins font-bold text-2xl text-text-main">
                {activeTab === 'player' ? "Step-by-Step Player Guide" : "Step-by-Step Host Guide"}
              </h2>

              <div className="flex flex-col gap-6">
                {(activeTab === 'player' ? playerFlow : ownerFlow).map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="bg-surface-dark border border-white/5 hover:border-brand-lime/10 rounded-md p-6 flex gap-5 transition-all duration-300 hover:shadow-card-shadow"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime border border-brand-lime/10 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-poppins font-bold text-base text-text-main">{step.title}</h3>
                        <p className="mt-2 text-xs text-text-muted font-sans leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Interactive Simulator Mockup: 5 Cols */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[460px] bg-surface-dark border border-white/5 rounded-md p-8 shadow-card-shadow">
              <div className="absolute top-4 left-4 bg-brand-lime/10 border border-brand-lime/20 text-brand-lime font-sans font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                Interactive simulator
              </div>

              {/* Simulated mini phone mockup container */}
              <div className="relative w-48 h-96 bg-black rounded-[36px] p-2 shadow-2xl border-[3px] border-[#313639] overflow-hidden flex flex-col mt-4">
                
                {/* Phone screen inner view */}
                <div className="relative flex-1 bg-bg-dark rounded-[28px] overflow-hidden flex flex-col justify-between border border-white/10">
                  
                  {/* Status & Island mock */}
                  <div className="h-6 bg-black flex items-center justify-center relative select-none">
                    <div className="w-14 h-3.5 bg-black rounded-full absolute top-1 flex items-center justify-end pr-1 text-[5px] text-white">
                      <span className="w-0.5 h-0.5 bg-white/30 rounded-full mr-0.5" />
                      <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                    </div>
                  </div>

                  {/* Render step layout content based on simStep state */}
                  <div className="flex-1">
                    {simulatorSteps[simStep].phoneScreen}
                  </div>

                  {/* Bottom navigator bar */}
                  <div className="h-7 bg-surface-dark border-t border-white/5 flex items-center justify-around pb-1 select-none">
                    <span className="w-1.5 h-1.5 bg-brand-lime rounded-full" />
                    <span className="w-1.5 h-1.5 bg-white/25 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-white/25 rounded-full" />
                  </div>
                </div>

              </div>

              {/* Clickable step timeline buttons under the phone */}
              <div className="mt-8 flex flex-col gap-2 w-full">
                <span className="text-[10px] text-text-muted uppercase font-poppins font-bold tracking-wider">
                  Select Step:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {simulatorSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSimStep(idx)}
                      className={`py-2 px-3 text-[10px] font-sans font-semibold rounded border text-center transition-all ${
                        simStep === idx
                          ? "bg-brand-lime text-black border-brand-lime font-bold"
                          : "bg-bg-dark text-text-muted border-white/5 hover:text-text-main"
                      }`}
                    >
                      {idx + 1}. {step.title}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
