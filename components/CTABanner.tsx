"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="relative py-20 px-6 md:px-8 bg-bg overflow-hidden border-t border-border-default">
      <div className="max-w-7xl mx-auto relative rounded-xl overflow-hidden border border-border-default min-h-[360px] sm:min-h-[420px] flex items-center justify-center">
        {/* 21:9 Floodlit Turf Background Image */}
        <Image
          src="/images/marketing/home/cta-floodlit-turf.webp"
          alt="Wide floodlit sports turf at twilight"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-bottom"
        />

        {/* Balanced Atmospheric Contrast Overlay — preserves the luminous green pitch, floodlights, and active players */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Content Centered Container */}
        <div className="relative z-20 w-full max-w-2xl mx-auto text-center flex flex-col items-center justify-center p-8 sm:p-12">
          <span className="text-xs font-semibold tracking-wider uppercase mb-3 text-white/80">
            Ready to play?
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Your next game is one tap away
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-lg font-sans leading-relaxed">
            Pick a turf, choose your time slot, and lock in your booking with zero hassle.
          </p>

          {/* Single Focused CTA */}
          <div className="mt-8 flex justify-center w-full">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-8 py-3.5 rounded-xl transition-all duration-200 text-sm sm:text-base shadow-md cursor-pointer"
            >
              Find a Turf
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
