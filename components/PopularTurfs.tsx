"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, MapPin, ArrowRight } from "lucide-react";

interface VenueCardItem {
  id: string;
  name: string;
  sport: string;
  city: string;
  rating: number;
  reviews: number;
  nextSlot: string;
  pricePerHour: number;
  image: string;
  sportFilter: string;
}

const POPULAR_VENUES: VenueCardItem[] = [
  {
    id: "football-1",
    name: "Koramangala Arena Turf",
    sport: "Football (5v5 / 7v7)",
    city: "Bengaluru",
    rating: 4.8,
    reviews: 142,
    nextSlot: "Today, 7:00 PM",
    pricePerHour: 1200,
    image: "/images/marketing/explore/football-card.webp",
    sportFilter: "Football",
  },
  {
    id: "cricket-1",
    name: "Apex Box Cricket Ground",
    sport: "Box Cricket",
    city: "Mumbai",
    rating: 4.9,
    reviews: 218,
    nextSlot: "Today, 8:30 PM",
    pricePerHour: 1500,
    image: "/images/marketing/explore/cricket-card.webp",
    sportFilter: "Cricket",
  },
  {
    id: "badminton-1",
    name: "SmashZone Indoor Court",
    sport: "Badminton",
    city: "Hyderabad",
    rating: 4.7,
    reviews: 96,
    nextSlot: "Tomorrow, 6:00 AM",
    pricePerHour: 600,
    image: "/images/marketing/explore/badminton-card.webp",
    sportFilter: "Badminton",
  },
  {
    id: "tennis-1",
    name: "Clay & Hard Tennis Club",
    sport: "Tennis",
    city: "Delhi NCR",
    rating: 4.8,
    reviews: 84,
    nextSlot: "Tomorrow, 7:00 AM",
    pricePerHour: 900,
    image: "/images/marketing/explore/tennis-card.webp",
    sportFilter: "Tennis",
  },
];

export default function PopularTurfs() {
  return (
    <section id="popular-turfs" className="py-20 sm:py-28 bg-surface border-t border-border-default">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
              Verified Marketplace
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main mt-2">
              Popular sports turfs
            </h2>
            <p className="mt-2 text-sm sm:text-base text-text-muted max-w-xl font-sans">
              Book top-rated community fields with instant confirmation and transparent hourly pricing.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-main hover:text-brand-lime transition-colors group"
          >
            Browse all venues
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Card Grid with strict 4:3 crop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_VENUES.map((venue) => (
            <Link
              key={venue.id}
              href={`/explore?sport=${encodeURIComponent(venue.sportFilter)}`}
              className="group bg-bg border border-border-default hover:border-brand-lime/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-sm hover:shadow-md"
            >
              {/* Image Container with 4:3 Aspect Ratio */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface">
                <Image
                  src={venue.image}
                  alt={`${venue.name} in ${venue.city}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {venue.sport}
                </span>
              </div>

              {/* Card HTML Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-brand-lime" />
                      {venue.city}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-main">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {venue.rating}
                      <span className="text-text-muted font-normal">({venue.reviews})</span>
                    </span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-text-main group-hover:text-brand-lime transition-colors line-clamp-1">
                    {venue.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="w-3.5 h-3.5 text-text-hint" />
                    <span>{venue.nextSlot}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-main tabular-nums">₹{venue.pricePerHour}</span>
                    <span className="text-[11px] text-text-muted">/hr</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
