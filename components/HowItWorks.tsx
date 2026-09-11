"use client";

import Image from "next/image";
import { Search, Calendar, Award, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Find a Turf",
    desc: "Search verified local venues by sport, location, and key amenities like floodlights, turf condition, and parking.",
    icon: Search,
  },
  {
    num: "02",
    title: "Choose a slot",
    desc: "Browse real-time hourly availability. Transparent pricing with zero hidden fees before you confirm.",
    icon: Calendar,
  },
  {
    num: "03",
    title: "Play",
    desc: "Receive your instant booking confirmation and gate pass QR code. Turn up with your team and play.",
    icon: Award,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-bg border-t border-border-default">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14 sm:mb-16">
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
            How it works
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main mt-2">
            Three simple steps from search to kickoff
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted font-sans">
            No phone calls, no double bookings. Instant reservations for players and teams.
          </p>
        </div>

        {/* Editorial Split Layout: 3:2 Image + 3 Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: 3:2 Candid Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden border border-border-default shadow-md bg-surface">
              <Image
                src="/images/marketing/home/how-it-works-players.webp"
                alt="Local amateur players warming up and gathering on an artificial sports turf"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: 3 Concise Steps */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border-default flex items-center justify-center shrink-0 group-hover:border-brand-lime/50 transition-colors">
                    <Icon className="w-5 h-5 text-brand-lime" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-brand-lime font-bold">
                        {step.num}
                      </span>
                      <h3 className="font-sans text-lg font-bold text-text-main">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <a
                href="/explore"
                className="inline-flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-6 py-3 rounded-xl transition-all duration-200 text-sm shadow-sm cursor-pointer"
              >
                Find a Turf Near You
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
