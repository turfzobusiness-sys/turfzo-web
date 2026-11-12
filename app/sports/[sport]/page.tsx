import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import {
  BreadcrumbListSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/lib/schema";
import {
  INDEXABLE_CITY_SLUGS,
  INDEXABLE_SPORT_SLUGS,
  buildOpenGraph,
  getLiveCitySlugs,
  getLiveCitySportSlugs,
  isTestVenue,
} from "@/lib/seo";
import { convexClient } from "@/lib/convex";
import { getLocalTurfImage } from "@/lib/turf-images";
import type { Turf } from "@/lib/types";

export const revalidate = 300;

interface SportInfo {
  name: string;
  headline: string;
  description: string;
  ogImage: string;
  formats: string[];
  typicalPriceRange: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
}

const SPORT_DATA: Record<string, SportInfo> = {
  football: {
    name: "Football",
    headline: "Book Football Turfs Online",
    description:
      "Find 5v5, 7v7, and 11v11 artificial football turfs with floodlights, real-time slot availability, and transparent hourly rates on Turfzo.",
    ogImage: "/images/marketing/explore/football-card.webp",
    formats: ["5v5", "6v6", "7v7", "9v9", "11v11"],
    typicalPriceRange: "₹800 – ₹1,800 / hour",
    highlights: [
      "3G/4G FIFA-grade synthetic grass with rubber infill",
      "LED floodlights for evening and night matches",
      "Real-time hourly booking with instant QR pass",
      "Split match fees cleanly or cancel under clear 24h/6h rules",
    ],
    faqs: [
      {
        question: "How much does a football turf cost per hour in India?",
        answer:
          "Most 5v5 and 7v7 football turfs range from ₹800 to ₹1,800 per hour depending on the city, peak evening timing, and floodlight facilities.",
      },
      {
        question: "What footwear should I wear on artificial football turf?",
        answer:
          "Wear turf shoes (TF) or Artificial Grass (AG) studs with short rubber dimples. Avoid metal studs or long firm-ground (FG) blades, which grip synthetic turf too hard.",
      },
      {
        question: "Can I book a 5v5 or 7v7 football turf for tonight?",
        answer:
          "Yes. Open the Explore page filtered to Football, pick today's date, and any open evening or night slot can be booked online in under 60 seconds.",
      },
    ],
  },
  cricket: {
    name: "Cricket",
    headline: "Book Box Cricket & Practice Nets Online",
    description:
      "Reserve box cricket cages, AstroTurf pitches, and floodlit practice nets online. Compare hourly prices and book live slots on Turfzo.",
    ogImage: "/images/marketing/explore/cricket-card.webp",
    formats: ["Box Cricket", "Practice Nets", "Turf Wicket", "8v8 / 11v11"],
    typicalPriceRange: "₹500 – ₹1,500 / hour",
    highlights: [
      "Enclosed net arenas for fast-paced box cricket",
      "Dedicated bowling-machine and net practice lanes",
      "Bright overhead lighting for post-work night games",
      "Instant online confirmation with clear per-hour pricing",
    ],
    faqs: [
      {
        question: "How much does box cricket booking cost per hour?",
        answer:
          "Box cricket turfs and practice nets generally list between ₹500 and ₹1,500 per hour depending on venue size, city, and evening peak hours.",
      },
      {
        question: "Do cricket venues provide stumps, bats, and tennis balls?",
        answer:
          "Many box cricket venues include stumps and basic gear in the hourly fee or rent equipment on-site. Check each venue's Facilities list before booking.",
      },
      {
        question: "Can groups book multiple consecutive hours for a tournament?",
        answer:
          "Yes. You can select adjacent hourly slots during checkout or explore open Turfzo tournaments on the Tournaments page.",
      },
    ],
  },
  badminton: {
    name: "Badminton",
    headline: "Book Indoor Badminton Courts Online",
    description:
      "Book BWF-grade wooden and synthetic mat indoor badminton courts by the hour. Check live court availability and pay online on Turfzo.",
    ogImage: "/images/marketing/explore/badminton-card.webp",
    formats: ["Wooden Court", "Synthetic PVC Mat", "Singles & Doubles"],
    typicalPriceRange: "₹300 – ₹800 / hour",
    highlights: [
      "Cushioned wooden and synthetic anti-skid court surfaces",
      "Glare-free indoor overhead lighting",
      "Instant single-hour or multi-hour court reservations",
      "Non-marking indoor court rules clearly listed upfront",
    ],
    faqs: [
      {
        question: "How much is badminton court booking per hour?",
        answer:
          "Indoor badminton courts typically cost ₹300 to ₹800 per hour depending on the city, flooring type (wooden or synthetic mat), and peak morning/evening hours.",
      },
      {
        question: "Are non-marking shoes required at indoor badminton courts?",
        answer:
          "Yes. Almost all wooden and synthetic badminton courts require clean non-marking gum-sole shoes to protect the court surface.",
      },
      {
        question: "Do venues rent badminton rackets and shuttlecocks?",
        answer:
          "Selected courts offer racket rental and shuttle sales at reception. Check the venue amenities card on Turfzo before confirming your slot.",
      },
    ],
  },
  tennis: {
    name: "Tennis",
    headline: "Book Tennis Courts Online",
    description:
      "Reserve synthetic hard courts and clay tennis courts by the hour with live slot availability and upfront pricing on Turfzo.",
    ogImage: "/images/marketing/explore/tennis-card.webp",
    formats: ["Hard Court", "Clay Court", "Singles & Doubles"],
    typicalPriceRange: "₹500 – ₹1,200 / hour",
    highlights: [
      "Regulation synthetic acrylic and clay court surfaces",
      "Floodlit courts for cooler early-morning and night sets",
      "Direct online booking with zero phone calls",
      "Transparent 5% service fee shown before payment",
    ],
    faqs: [
      {
        question: "What does an hourly tennis court booking cost?",
        answer:
          "Hourly tennis court rates generally fall between ₹500 and ₹1,200 per hour depending on court surface, floodlights, and city location.",
      },
      {
        question: "Can I book clay and hard courts on Turfzo?",
        answer:
          "Yes. Venues list their surface type, floodlight availability, parking, and changing facilities directly on their Turfzo venue page.",
      },
    ],
  },
  multipurpose: {
    name: "Multipurpose",
    headline: "Book Multipurpose Sports Turfs Online",
    description:
      "Find convertible multipurpose turfs supporting football, box cricket, fitness sessions, and corporate sports days with live slot booking on Turfzo.",
    ogImage: "/images/marketing/home/cta-floodlit-turf.webp",
    formats: ["5v5 Football", "Box Cricket", "Corporate Events", "Group Training"],
    typicalPriceRange: "₹600 – ₹1,600 / hour",
    highlights: [
      "Convertible turf setups for multi-sport groups",
      "Spacious grounds suited for office offsites and weekend games",
      "Parking, drinking water, and floodlights listed per venue",
      "Instant digital QR pass for quick venue entry",
    ],
    faqs: [
      {
        question: "What can a multipurpose turf be used for?",
        answer:
          "Multipurpose arenas typically support both 5v5/7v7 football and box cricket, as well as agility drills, fitness bootcamps, and small corporate tournaments.",
      },
      {
        question: "How far in advance can I book a multipurpose ground?",
        answer:
          "Live calendar slots appear directly on each venue page and on the Explore view so you can book available hours right away.",
      },
    ],
  },
};

type Props = { params: Promise<{ sport: string }> };

export function generateStaticParams() {
  return INDEXABLE_SPORT_SLUGS.map((sport) => ({ sport }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  const key = sport.toLowerCase();
  const data = SPORT_DATA[key];
  if (!data) notFound();

  const title = `${data.headline} — Prices & Live Slots`;
  return {
    title,
    description: data.description,
    keywords: [
      `book ${data.name.toLowerCase()} turf online`,
      `${data.name.toLowerCase()} ground booking`,
      `${data.name.toLowerCase()} court near me`,
      `turfzo ${data.name.toLowerCase()}`,
    ],
    alternates: { canonical: `https://turfzo.app/sports/${key}` },
    openGraph: buildOpenGraph({
      title: `${data.headline} | Turfzo`,
      description: data.description,
      url: `https://turfzo.app/sports/${key}`,
      image: data.ogImage,
      alt: data.headline,
    }),
  };
}

export default async function SportLandingPage({ params }: Props) {
  const { sport } = await params;
  const key = sport.toLowerCase();
  const data = SPORT_DATA[key];
  if (!data) notFound();

  const [liveCitySlugs, liveCitySportSlugs] = await Promise.all([
    getLiveCitySlugs(),
    getLiveCitySportSlugs(),
  ]);

  let liveVenues: Turf[] = [];
  if (process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL) {
    try {
      const all = await convexClient.query<Turf[]>("turfs:getAvailable", {});
      liveVenues = (all ?? []).filter(
        (t) =>
          !isTestVenue(t) &&
          (t.sport_type ?? "").toLowerCase().includes(key),
      );
    } catch {
      liveVenues = [];
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: "https://turfzo.app" },
          { name: "Explore", url: "https://turfzo.app/explore" },
          { name: data.name, url: `https://turfzo.app/sports/${key}` },
        ]}
      />
      <FAQPageSchema items={data.faqs} />
      {liveVenues.length > 0 && (
        <ItemListSchema
          name={`${data.name} Venues on Turfzo`}
          url={`https://turfzo.app/sports/${key}`}
          items={liveVenues.slice(0, 12).map((v) => ({
            name: v.name,
            url: `https://turfzo.app/venues/${v._id}`,
          }))}
        />
      )}
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <div className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface border border-border-default text-xs font-bold text-brand-lime mb-4">
              {data.name} Booking
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
              {data.headline}
            </h1>
            <p className="mt-4 text-text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
              {data.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/explore?sport=${encodeURIComponent(data.name)}`}
                rel="nofollow"
                className="inline-flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm px-6 py-3 rounded-md transition-all"
              >
                Check Live {data.name} Slots
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 bg-surface border border-border-default hover:border-border-strong text-text-main font-sans font-semibold text-sm px-5 py-3 rounded-md transition-colors"
              >
                How Booking Works
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            <div className="bg-surface border border-border-default rounded-xl p-6">
              <h2 className="font-sans font-bold text-lg text-text-main mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-lime" />
                Formats &amp; Typical Hourly Rates
              </h2>
              <p className="text-sm text-text-muted mb-4">
                Typical rate across cities:{" "}
                <strong className="text-text-main">{data.typicalPriceRange}</strong>{" "}
                plus a flat 5% platform service fee shown upfront before checkout.
              </p>
              <div className="flex flex-wrap gap-2">
                {data.formats.map((f) => (
                  <span
                    key={f}
                    className="bg-elevated border border-border-subtle px-3 py-1 rounded-md text-xs font-semibold text-text-main"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border-default rounded-xl p-6">
              <h2 className="font-sans font-bold text-lg text-text-main mb-3">
                What You Get on Turfzo
              </h2>
              <ul className="space-y-2.5 text-sm text-text-muted">
                {data.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {liveVenues.length > 0 && (
            <section className="mb-14">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-sans text-2xl font-bold text-text-main">
                  Live {data.name} Venues
                </h2>
                <Link
                  href={`/explore?sport=${encodeURIComponent(data.name)}`}
                  rel="nofollow"
                  className="text-sm font-semibold text-brand-lime hover:underline inline-flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {liveVenues.slice(0, 6).map((v) => (
                  <div
                    key={v._id}
                    className="bg-surface border border-border-default rounded-xl overflow-hidden flex flex-col"
                  >
                    <Link href={`/venues/${v._id}`} className="relative aspect-[4/3] bg-elevated block">
                      <Image
                        src={getLocalTurfImage(v)}
                        alt={`${v.name} — ${data.name} venue in ${v.city || "India"}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-lime" />
                            {v.city || "India"}
                          </span>
                          {typeof v.rating === "number" && v.rating > 0 && (
                            <span className="inline-flex items-center gap-1 font-semibold text-text-main">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {v.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <Link href={`/venues/${v._id}`}>
                          <h3 className="font-sans font-bold text-base text-text-main hover:text-brand-lime transition-colors">
                            {v.name}
                          </h3>
                        </Link>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between">
                        <Link
                          href={`/venues/${v._id}`}
                          className="text-xs font-semibold text-brand-lime hover:underline"
                        >
                          View slots &amp; book
                        </Link>
                        <span className="text-sm font-bold text-text-main tabular-nums">
                          ₹{v.price_per_hour.toLocaleString("en-IN")}/hr
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-14">
            <h2 className="font-sans text-2xl font-bold text-text-main mb-4">
              Browse {data.name} by City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {INDEXABLE_CITY_SLUGS.map((citySlug) => {
                const label =
                  citySlug === "aurangabad"
                    ? "CSN (Aurangabad)"
                    : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
                const hasLiveSportCity = liveCitySportSlugs.has(`${citySlug}/${key}`);
                const hasLiveCity = liveCitySlugs.has(citySlug);
                const href = hasLiveSportCity
                  ? `/cities/${citySlug}/${key}`
                  : hasLiveCity
                    ? `/cities/${citySlug}`
                    : `/explore?city=${citySlug}&sport=${key}`;
                return (
                  <Link
                    key={citySlug}
                    href={href}
                    rel={hasLiveSportCity || hasLiveCity ? undefined : "nofollow"}
                    className="bg-surface border border-border-default hover:border-brand-lime/40 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-text-main hover:text-brand-lime transition-colors flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>
                );
              })}
            </div>
            {(key === "football" || key === "cricket") && (
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-sans">
                <Link
                  href="/blog/turf-booking-chhatrapati-sambhajinagar-csn-aurangabad"
                  className="text-brand-lime hover:underline inline-flex items-center gap-1"
                >
                  Chhatrapati Sambhajinagar (CSN / Aurangabad) {data.name} Guide{" "}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                {key === "football" && (
                  <Link
                    href="/blog/best-football-turfs-bangalore"
                    className="text-brand-lime hover:underline inline-flex items-center gap-1"
                  >
                    Bangalore Football Turf Guide{" "}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-sans text-2xl font-bold text-text-main mb-5">
              {data.name} Booking FAQs
            </h2>
            <div className="space-y-4">
              {data.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-surface border border-border-default rounded-xl p-5"
                >
                  <h3 className="font-sans font-bold text-sm text-text-main mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
