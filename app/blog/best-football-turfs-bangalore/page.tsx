"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FAQPageSchema, ArticleSchema } from "@/lib/schema";

const faqItems = [
  {
    question: "How much does football turf cost in Bangalore?",
    answer:
      "Football turf booking in Bangalore ranges from ₹700 to ₹2000 per hour. Budget turfs in areas like Electronic City start at ₹700/hr, while premium turfs in HSR Layout and Indiranagar cost ₹1200-1500/hr. Prices vary by location, amenities, and time of day.",
  },
  {
    question: "Which area in Bangalore has the best football turfs?",
    answer:
      "HSR Layout, Koramangala, and Indiranagar have the densest clusters of football turfs in Bangalore. HSR Layout has a wide range of options, while Indiranagar has more premium venues with better facilities.",
  },
  {
    question: "Can I book a football turf for tonight in Bangalore?",
    answer:
      "Yes, if a venue has an open slot for tonight, you can book it instantly. Live availability is shown on each venue page, and you get a confirmation QR code after payment.",
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
      "Many football turfs in Bangalore offer parking. Check the venue page for the amenities listed by the owner. Areas like Koramangala and HSR Layout also have street parking.",
  },
];

export default function BestFootballTurfsBangalore() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <ArticleSchema
        name="Football Turf Booking in Bangalore [2026 Guide]"
        description="Football turf booking in Bangalore: typical prices, popular areas, and how to compare live availability."
        datePublished="2026-05-31"
        dateModified="2026-05-31"
        author={{ "@type": "Organization", name: "Turfzo" }}
        publisher={{
          "@type": "Organization",
          name: "Turfzo",
          logo: { "@type": "ImageObject", url: "https://turfzo.app/turfzo_mascot.svg" },
        }}
      />
      <FAQPageSchema items={faqItems} />
      <Header />

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
            <span className="text-text-main">Football Turf Booking in Bangalore</span>
          </nav>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-lime/10 text-brand-lime font-sans font-bold text-[10px] px-2.5 py-1 rounded-md">
                City Guide
              </span>
              <span className="text-[10px] text-text-muted font-sans">
                May 2026 · 8 min read
              </span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-text-main leading-tight tracking-tight">
              Football Turf Booking in Bangalore [2026 Guide]
            </h1>
            <p className="mt-4 text-text-muted text-sm font-sans leading-relaxed">
              Bangalore has one of the densest football-turf markets in India, from budget-friendly options in Electronic City to premium floodlit venues in Indiranagar. Prices vary by area, amenities, and time of day — this guide explains what to expect and how to compare live availability before you book.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted font-sans">
              <span>By Turfzo Team</span>
              <span>Updated May 2026</span>
            </div>
          </motion.div>

          {/* Featured Image */}
          <div className="relative rounded-xl overflow-hidden mb-12 h-64 sm:h-80">
            <Image
              src="/images/marketing/explore/football-card.webp"
              alt="Football turf in Bangalore"
              fill
              className="object-cover"
            />
          </div>

          {/* Direct Answer Block (for AI citation) */}
          <div className="bg-surface border border-border-default rounded-xl p-6 mb-12">
            <h2 className="font-sans font-bold text-base text-text-main tracking-tight mb-2">
              Quick Answer
            </h2>
            <p className="text-sm text-text-main font-sans leading-relaxed">
              Football turf booking in Bangalore typically costs ₹700 to ₹2,000 per hour depending on the area and facilities. HSR Layout, Koramangala, and Indiranagar have the densest clusters of football turfs. Budget options start at ₹700/hr in Electronic City, while premium floodlit venues in Indiranagar cost ₹1,200-1,500/hr. When a venue is live on Turfzo, you can book it with real-time availability and secure online payment.
            </p>
          </div>

          {/* Article Content */}
          <article className="prose dark:prose-invert max-w-none">
            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
              Why Does Bangalore Have So Many Football Turfs?
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Bangalore has a high concentration of football turfs, and the number of live venues on Turfzo grows as new partners onboard. The city&apos;s tech-savvy population, pleasant weather, and strong football culture have driven demand for quality playing surfaces. Most turfs offer floodlights for evening games, making it easy to play after work or on weekends.
            </p>

            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
              Where to Play Football in Bangalore
            </h2>

            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              We don&apos;t publish static venue lists — venue quality,
              pricing, and availability change week to week, and a list that
              was right last month is wrong tomorrow. Instead, every turf on
              Turfzo shows its live rating, real hourly price, and bookable
              slots straight from the source.
            </p>

            <div className="bg-surface border border-border-default rounded-xl p-4 my-8">
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                <span className="font-bold text-text-main">Popular areas:</span>{" "}
                HSR Layout, Koramangala, and Indiranagar have the densest
                football-turf clusters. Premium floodlit venues cluster in
                Indiranagar; budget options are common in Electronic City and
                Whitefield. Filter by area, price, and floodlights on
                Turfzo&apos;s explore page to compare what&apos;s actually
                open for your date and time.
              </p>
            </div>

            <div className="flex justify-center my-8">
              <Link
                href="/explore"
                className="bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
              >
                Browse live football turfs in Bangalore
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
              How Much Does Football Turf Cost in Bangalore?
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-4">
              Football turf prices in Bangalore vary by location and amenities:
            </p>
            <div className="bg-surface border border-border-default rounded-xl p-5 my-6">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left py-2 text-text-main font-sans font-bold">
                      Area
                    </th>
                    <th className="text-left py-2 text-text-main font-sans font-bold">
                      Price Range
                    </th>
                    <th className="text-left py-2 text-text-main font-sans font-bold">
                      Best For
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">Electronic City</td>
                    <td className="py-2 tabular-nums">₹700 - ₹900/hr</td>
                    <td className="py-2">Budget-friendly games</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">HSR Layout</td>
                    <td className="py-2 tabular-nums">₹1000 - ₹1400/hr</td>
                    <td className="py-2">Best variety & quality</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">Koramangala</td>
                    <td className="py-2 tabular-nums">₹900 - ₹1200/hr</td>
                    <td className="py-2">Central location</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">Indiranagar</td>
                    <td className="py-2 tabular-nums">₹1200 - ₹1500/hr</td>
                    <td className="py-2">Premium facilities</td>
                  </tr>
                  <tr>
                    <td className="py-2">Whitefield</td>
                    <td className="py-2 tabular-nums">₹700 - ₹1000/hr</td>
                    <td className="py-2">East Bangalore</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
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

            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
              Best Time to Book a Football Turf in Bangalore
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Early morning slots (6-8 AM) and late evening slots (8-10 PM) are the cheapest and most available. Peak hours (5-8 PM) are the most expensive and book up fast, especially on weekends. If you want to save money, book during off-peak hours on weekdays. Turfzo shows real-time availability so you can find open slots instantly.
            </p>

            <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mt-12 mb-4">
              How to Book a Football Turf in Bangalore
            </h2>
            <p className="text-sm text-text-muted font-sans leading-relaxed mb-6">
              Booking a football turf on Turfzo takes 2 minutes. Visit turfzo.app/explore, select Bangalore as your city, browse available turfs, choose your date and time slot, and complete payment online. You&apos;ll receive a QR code ticket that you can scan at the turf entrance.
            </p>

            {/* CTA */}
            <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-xl p-6 my-8 text-center">
              <h3 className="font-sans font-bold text-lg text-text-main mb-2">
                Ready to Book?
              </h3>
              <p className="text-xs text-text-muted font-sans mb-4">
                Browse 50+ football turfs in Bangalore with real-time availability
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-brand-lime text-white dark:text-black font-sans font-bold text-sm py-3 px-8 rounded-md hover:bg-brand-lime-hover transition-all"
              >
                Explore Turfs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* FAQ Section */}
          <div className="mt-16 mb-12">
            <h2 className="font-sans font-bold text-2xl text-text-main tracking-tight mb-8">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="bg-surface border border-border-default rounded-xl p-5 group"
                >
                  <summary className="font-sans font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
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
