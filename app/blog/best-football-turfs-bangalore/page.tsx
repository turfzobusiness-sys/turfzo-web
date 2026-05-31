"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQPageSchema, ArticleSchema } from "@/lib/schema";

const turfs = [
  {
    name: "Olympic Arena",
    location: "HSR Layout, Bengaluru",
    rating: 4.8,
    reviews: 230,
    price: 1200,
    sport: "Football",
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    premium: true,
    image: "/stadium_turf_bg.png",
  },
  {
    name: "Green Valley Turf",
    location: "Koramangala, Bengaluru",
    rating: 4.7,
    reviews: 180,
    price: 1000,
    sport: "Football",
    facilities: ["Floodlights", "Parking", "Cafeteria"],
    premium: false,
    image: "/stadium_turf_bg.png",
  },
  {
    name: "Bangalore Football Arena",
    location: "Indiranagar, Bengaluru",
    rating: 4.9,
    reviews: 120,
    price: 1500,
    sport: "Football",
    facilities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    premium: true,
    image: "/stadium_turf_bg.png",
  },
  {
    name: "Whitefield Kickers",
    location: "Whitefield, Bengaluru",
    rating: 4.5,
    reviews: 95,
    price: 800,
    sport: "Football",
    facilities: ["Floodlights", "Parking"],
    premium: false,
    image: "/stadium_turf_bg.png",
  },
  {
    name: "JP Nagar Sports Hub",
    location: "JP Nagar, Bengaluru",
    rating: 4.6,
    reviews: 150,
    price: 900,
    sport: "Football",
    facilities: ["Floodlights", "Changing Rooms", "Water"],
    premium: false,
    image: "/stadium_turf_bg.png",
  },
  {
    name: "Electronic City Turf",
    location: "Electronic City, Bengaluru",
    rating: 4.4,
    reviews: 82,
    price: 700,
    sport: "Football",
    facilities: ["Floodlights", "Parking"],
    premium: false,
    image: "/stadium_turf_bg.png",
  },
];

const faqItems = [
  {
    question: "How much does football turf cost in Bangalore?",
    answer:
      "Football turf booking in Bangalore ranges from ₹700 to ₹2000 per hour. Budget turfs in areas like Electronic City start at ₹700/hr, while premium turfs in HSR Layout and Indiranagar cost ₹1200-1500/hr. Prices vary by location, amenities, and time of day.",
  },
  {
    question: "Which area in Bangalore has the best football turfs?",
    answer:
      "HSR Layout, Koramangala, and Indiranagar have the highest-rated football turfs in Bangalore. HSR Layout has the most options with 10+ turfs, while Indiranagar offers premium venues with better facilities.",
  },
  {
    question: "Can I book a football turf for tonight in Bangalore?",
    answer:
      "Yes, most turfs on Turfzo have real-time availability. If a turf has open slots for tonight, you can book it instantly and get a confirmation QR code within 2 minutes.",
  },
  {
    question: "What is the best time to book a football turf in Bangalore?",
    answer:
      "Early morning (6-8 AM) and late evening (8-10 PM) slots are the cheapest and most available. Peak hours (5-8 PM) are the most expensive and book up fast, especially on weekends.",
  },
  {
    question: "Do Bangalore football turfs have floodlights?",
    answer:
      "Yes, most football turfs in Bangalore have floodlights for evening and night games. Turfzo lists the amenities for each venue so you can filter by floodlight availability.",
  },
  {
    question: "How many players are needed for a football turf booking?",
    answer:
      "Football turfs in Bangalore are typically booked for 5-a-side, 7-a-side, or 11-a-side games. Most turfs accommodate 10-22 players depending on the pitch size. You can book for any number of players.",
  },
  {
    question: "Is parking available at Bangalore football turfs?",
    answer:
      "Most football turfs in Bangalore offer free parking. Turf listings on Turfzo show parking availability for each venue. Areas like Koramangala and HSR Layout typically have street parking as well.",
  },
];

export default function BestFootballTurfsBangalore() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <head>
        <title>
          Best Football Turfs in Bangalore [2026 Guide] | Prices & Booking |
          Turfzo
        </title>
        <meta
          name="description"
          content="Discover the top-rated football turfs in Bangalore with real-time pricing, amenities, and instant booking. From HSR Layout to Whitefield, find the perfect pitch for your next game. Prices from ₹700/hr."
        />
        <link
          rel="canonical"
          href="https://turfzo.com/blog/best-football-turfs-bangalore"
        />
        <meta
          property="og:title"
          content="Best Football Turfs in Bangalore [2026 Guide] | Turfzo"
        />
        <meta
          property="og:description"
          content="Top-rated football turfs in Bangalore with pricing, amenities, and instant booking. Prices from ₹700/hr."
        />
        <meta
          property="og:url"
          content="https://turfzo.com/blog/best-football-turfs-bangalore"
        />
      </head>
      <ArticleSchema
        name="Best Football Turfs in Bangalore [2026 Guide]"
        description="Discover the top-rated football turfs in Bangalore with real-time pricing, amenities, and instant booking."
        datePublished="2026-05-31"
        dateModified="2026-05-31"
        author={{ "@type": "Organization", name: "Turfzo" }}
        publisher={{
          "@type": "Organization",
          name: "Turfzo",
          logo: { "@type": "ImageObject", url: "https://turfzo.com/turfzo_mascot.svg" },
        }}
      />
      <FAQPageSchema items={faqItems} />
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-muted font-sans mb-8">
            <Link href="/" className="hover:text-brand-lime transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-brand-lime transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-text-main">Best Football Turfs in Bangalore</span>
          </nav>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-lime/10 text-brand-lime font-poppins font-bold text-[10px] px-2.5 py-1 rounded-pill">
                City Guide
              </span>
              <span className="text-[10px] text-text-muted font-sans">
                May 2026 · 8 min read
              </span>
            </div>
            <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-text-main leading-tight">
              Best Football Turfs in Bangalore [2026 Guide]
            </h1>
            <p className="mt-4 text-text-muted text-sm font-sans leading-relaxed">
              Bangalore has 50+ football turfs across the city, from budget-friendly options in Electronic City to premium floodlit venues in Indiranagar. This guide lists the top-rated turfs with real pricing, amenities, and direct booking links so you can find and book the perfect pitch for your next game.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted font-sans">
              <span>By Turfzo Team</span>
              <span>Updated May 2026</span>
            </div>
          </motion.div>

          {/* Featured Image */}
          <div className="relative rounded-md overflow-hidden mb-12 h-64 sm:h-80">
            <Image
              src="/stadium_turf_bg.png"
              alt="Football turf in Bangalore"
              fill
              className="object-cover"
            />
          </div>

          {/* Direct Answer Block (for AI citation) */}
          <div className="bg-surface-dark border border-brand-lime/10 rounded-md p-6 mb-12">
            <h2 className="font-poppins font-bold text-base text-brand-lime mb-2">
              Quick Answer
            </h2>
            <p className="text-sm text-text-main font-sans leading-relaxed">
              Football turf booking in Bangalore costs ₹700 to ₹2000 per hour depending on the area and facilities. HSR Layout, Koramangala, and Indiranagar have the highest-rated turfs. Budget options start at ₹700/hr in Electronic City, while premium floodlit venues in Indiranagar cost ₹1200-1500/hr. Book instantly on Turfzo with real-time availability and secure online payment.
            </p>
          </div>

          {/* Article Content */}
          <article className="prose prose-invert max-w-none">
            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              Why is Bangalore the Best City for Football Turfs?
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Bangalore has the highest concentration of football turfs in India, with over 50 verified venues across the city. The city&apos;s tech-savvy population, pleasant weather, and strong football culture have driven demand for quality playing surfaces. Most turfs offer floodlights for evening games, making it easy to play after work or on weekends.
            </p>

            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              Top Football Turfs in Bangalore by Area
            </h2>

            {/* Turf Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              {turfs.map((turf) => (
                <div
                  key={turf.name}
                  className="bg-surface-dark border border-white/5 rounded-md p-4 hover:border-brand-lime/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-poppins font-bold text-sm text-text-main">
                      {turf.name}
                    </h3>
                    {turf.premium && (
                      <span className="text-[9px] bg-brand-lime/10 text-brand-lime font-bold px-2 py-0.5 rounded-pill">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted font-sans flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-brand-lime" />{" "}
                    {turf.location}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted font-sans mb-3">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-brand-lime fill-brand-lime" />{" "}
                      {turf.rating} ({turf.reviews} reviews)
                    </span>
                    <span className="font-bold text-brand-lime">
                      ₹{turf.price}/hr
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {turf.facilities.map((f) => (
                      <span
                        key={f}
                        className="text-[9px] bg-elevated-dark text-text-muted px-2 py-0.5 rounded border border-white/5 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-brand-lime" />{" "}
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              How Much Does Football Turf Cost in Bangalore?
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-4">
              Football turf prices in Bangalore vary by location and amenities:
            </p>
            <div className="bg-surface-dark border border-white/5 rounded-md p-5 my-6">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 text-text-main font-poppins font-bold">
                      Area
                    </th>
                    <th className="text-left py-2 text-text-main font-poppins font-bold">
                      Price Range
                    </th>
                    <th className="text-left py-2 text-text-main font-poppins font-bold">
                      Best For
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr className="border-b border-white/5">
                    <td className="py-2">Electronic City</td>
                    <td className="py-2">₹700 - ₹900/hr</td>
                    <td className="py-2">Budget-friendly games</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">HSR Layout</td>
                    <td className="py-2">₹1000 - ₹1400/hr</td>
                    <td className="py-2">Best variety & quality</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Koramangala</td>
                    <td className="py-2">₹900 - ₹1200/hr</td>
                    <td className="py-2">Central location</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">Indiranagar</td>
                    <td className="py-2">₹1200 - ₹1500/hr</td>
                    <td className="py-2">Premium facilities</td>
                  </tr>
                  <tr>
                    <td className="py-2">Whitefield</td>
                    <td className="py-2">₹700 - ₹1000/hr</td>
                    <td className="py-2">East Bangalore</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              What Amenities Should You Look For?
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-4">
              When booking a football turf in Bangalore, consider these key amenities:
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "Floodlights — Essential for evening and night games",
                "Parking — Free parking is standard at most turfs",
                "Changing Rooms — Available at premium venues",
                "Water/Refreshments — Some turfs have cafeterias",
                "Quality Turf — Look for FIFA-rated artificial grass",
                "First Aid — Important for tournament play",
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-text-muted font-sans flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              Best Time to Book a Football Turf in Bangalore
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Early morning slots (6-8 AM) and late evening slots (8-10 PM) are the cheapest and most available. Peak hours (5-8 PM) are the most expensive and book up fast, especially on weekends. If you want to save money, book during off-peak hours on weekdays. Turfzo shows real-time availability so you can find open slots instantly.
            </p>

            <h2 className="font-poppins font-bold text-xl text-text-main mt-12 mb-4">
              How to Book a Football Turf in Bangalore
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Booking a football turf on Turfzo takes 2 minutes. Visit turfzo.com/explore, select Bangalore as your city, browse available turfs, choose your date and time slot, and complete payment online. You&apos;ll receive a QR code ticket that you can scan at the turf entrance.
            </p>

            {/* CTA */}
            <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-md p-6 my-8 text-center">
              <h3 className="font-poppins font-bold text-lg text-text-main mb-2">
                Ready to Book?
              </h3>
              <p className="text-xs text-text-muted font-sans mb-4">
                Browse 50+ football turfs in Bangalore with real-time availability
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-brand-lime text-black font-poppins font-bold text-sm py-3 px-8 rounded-pill hover:bg-brand-lime-hover transition-all"
              >
                Explore Turfs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* FAQ Section */}
          <div className="mt-16 mb-12">
            <h2 className="font-poppins font-bold text-2xl text-text-main mb-8">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="bg-surface-dark border border-white/5 rounded-md p-5 group"
                >
                  <summary className="font-poppins font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-3 text-xs text-text-muted font-sans leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Back to Blog */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-brand-lime transition-colors font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
