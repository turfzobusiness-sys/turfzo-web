import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight } from "lucide-react";

/**
 * A real venue row, as returned by `turfs:getAvailable`. Every field shown
 * below comes from the backend — the previous version of this component was a
 * hardcoded list of four venues ("Koramangala Arena Turf", "Apex Box Cricket
 * Ground", …) with invented 4.7–4.9 ratings, invented review counts, invented
 * next-slot times and invented hourly prices, plus a Tennis club for a sport
 * the explore filter does not offer.
 */
export interface PopularTurfItem {
  id: string;
  name: string;
  sport: string;
  city: string;
  /** Null when the venue has no reviews yet — never substituted. */
  rating: number | null;
  reviews: number | null;
  pricePerHour: number;
  image: string;
  sportFilter: string;
}

interface PopularTurfsProps {
  venues: PopularTurfItem[];
}

export default function PopularTurfs({ venues }: PopularTurfsProps) {
  if (venues.length === 0) {
    // Say nothing rather than filling the slot with invented venues.
    return null;
  }

  return (
    <section id="popular-turfs" className="py-20 sm:py-28 bg-surface border-t border-border-default">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
              Live Marketplace
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main mt-2">
              Popular sports turfs
            </h2>
            <p className="mt-2 text-sm sm:text-base text-text-muted max-w-xl font-sans">
              Real venues currently listed on Turfzo, with their own hourly rate
              and player reviews.
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

        {/* Card grid with strict 4:3 crop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/explore?sport=${encodeURIComponent(venue.sportFilter)}&turfId=${encodeURIComponent(venue.id)}`}
              className="group bg-bg border border-border-default hover:border-brand-lime/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-sm hover:shadow-md"
            >
              {/* Image Container with 4:3 Aspect Ratio */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface">
                <Image
                  src={venue.image}
                  alt={`${venue.name}${venue.city ? ` in ${venue.city}` : ""}`}
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
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span className="truncate">{venue.city}</span>
                    </span>
                    {/* No rating is shown for an unrated venue. */}
                    {venue.rating != null && venue.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-main shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {venue.rating.toFixed(1)}
                        {venue.reviews != null && venue.reviews > 0 && (
                          <span className="text-text-muted font-normal">
                            ({venue.reviews})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="font-sans text-base font-bold text-text-main group-hover:text-brand-lime transition-colors line-clamp-1">
                    {venue.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-end">
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-main tabular-nums">
                      ₹{venue.pricePerHour.toLocaleString("en-IN")}
                    </span>
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
