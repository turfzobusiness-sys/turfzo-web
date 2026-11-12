import Link from "next/link";
import { ArrowRight, CalendarCheck, ShieldCheck, Wallet } from "lucide-react";

export type ExploreFaqItem = {
  question: string;
  answer: string;
};

const EXPLORE_HIGHLIGHTS = [
  {
    icon: CalendarCheck,
    title: "Live slot availability",
    description:
      "Every venue listing shows open dates and hourly time slots directly from the ground calendar, so you never have to call around to check.",
  },
  {
    icon: Wallet,
    title: "Upfront hourly pricing",
    description:
      "Compare per-hour rates across venues before you tap through. The total slot price and service fee are displayed clearly at checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Clear cancellation terms",
    description:
      "Cancel more than 24 hours before kickoff for a 100% slot refund, or 6 to 24 hours ahead for a 50% slot refund (service fee retained).",
  },
];

const SPORT_GUIDES = [
  {
    name: "Football Turfs",
    detail:
      "5v5, 6v6, and 7v7 artificial grass pitches with floodlights for evening and weekend matches.",
  },
  {
    name: "Box Cricket Grounds",
    detail:
      "Enclosed nets and turf pitches built for fast-paced group games and corporate cricket.",
  },
  {
    name: "Badminton & Tennis Courts",
    detail:
      "Indoor wooden or synthetic badminton courts and floodlit tennis surfaces bookable by the hour.",
  },
  {
    name: "Multipurpose Arenas",
    detail:
      "Flexible community sports spaces suited for mixed-sport sessions, training, and local meetups.",
  },
];

export default function ExploreSeoContent({
  faqs,
}: {
  faqs: ExploreFaqItem[];
}) {
  return (
    <section
      aria-label="Turf booking guide and FAQs"
      className="mt-16 pt-12 border-t border-border-default space-y-12"
    >
      <div className="max-w-3xl">
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
          Explore &amp; Book
        </span>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main mt-2">
          How turf discovery works on Turfzo
        </h2>
        <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
          Use the filters above to search sports venues by city, sport, date,
          price range, and amenities like floodlights, parking, or indoor
          courts. Turfzo is onboarding verified ground partners city by city,
          starting with Bangalore, so every bookable slot reflects real
          availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EXPLORE_HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-border-default bg-surface p-5"
            >
              <div className="w-9 h-9 rounded-lg bg-bg border border-border-default flex items-center justify-center">
                <Icon className="w-4 h-4 text-brand-lime" />
              </div>
              <h3 className="font-sans font-bold text-sm text-text-main mt-4">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mt-2">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
          Sports &amp; formats available
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {SPORT_GUIDES.map((sport) => (
            <div
              key={sport.name}
              className="rounded-xl border border-border-default bg-surface/60 p-4"
            >
              <h3 className="font-sans font-bold text-sm text-text-main">
                {sport.name}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mt-1.5">
                {sport.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12">
        <div>
          <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
            Frequently asked questions
          </h2>
          <p className="mt-2.5 text-sm text-text-muted leading-relaxed">
            Quick answers on finding a pitch, hourly pricing, and booking
            cancellations. Want to list your own venue? Visit our partner portal.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1 text-text-main hover:text-brand-lime transition-colors"
            >
              How it works <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/blog/how-to-book-turf-online"
              className="text-text-main hover:text-brand-lime transition-colors"
            >
              Online booking guide
            </Link>
            <Link
              href="/blog/turf-booking-price-india"
              className="text-text-main hover:text-brand-lime transition-colors"
            >
              Turf pricing guide
            </Link>
            <Link
              href="/tournaments"
              className="text-text-main hover:text-brand-lime transition-colors"
            >
              Browse tournaments
            </Link>
            <Link
              href="/owners"
              className="text-text-main hover:text-brand-lime transition-colors"
            >
              List your turf
            </Link>
            <Link
              href="/about"
              className="text-text-main hover:text-brand-lime transition-colors"
            >
              About Turfzo
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group bg-surface/60 border border-border-default hover:border-border-strong rounded-lg transition-colors"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-sans font-semibold text-sm text-text-main flex items-center justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-xs text-text-muted group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 pt-2 text-xs text-text-muted leading-relaxed border-t border-border-subtle/50">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
