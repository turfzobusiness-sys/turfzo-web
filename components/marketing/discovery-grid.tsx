import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const SPORTS = [
  { name: "Football", image: "/images/marketing/explore/football-card.webp" },
  { name: "Cricket", image: "/images/marketing/explore/cricket-card.webp" },
  { name: "Badminton", image: "/images/marketing/explore/badminton-card.webp" },
  { name: "Tennis", image: "/images/marketing/explore/tennis-card.webp" },
];

/**
 * Neutral sport discovery grid. Links into /explore filtered by sport —
 * no invented venue names, ratings, prices or slots.
 */
export default function DiscoveryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {SPORTS.map((sport) => (
        <Link
          key={sport.name}
          href={`/explore?sport=${encodeURIComponent(sport.name)}`}
          className="group bg-surface border border-border-default hover:border-border-strong rounded-xl overflow-hidden transition-all shadow-md flex flex-col"
        >
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src={sport.image}
              alt={`${sport.name} turf`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-sans text-base font-bold text-text-main">{sport.name}</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-lime">
              Browse
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
