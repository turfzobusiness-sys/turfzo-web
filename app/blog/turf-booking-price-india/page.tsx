"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQPageSchema, ArticleSchema } from "@/lib/schema";

const cityPricing = [
  { city: "Bangalore", min: 700, max: 2000, avg: 1100, turfs: "50+" },
  { city: "Mumbai", min: 800, max: 2500, avg: 1300, turfs: "40+" },
  { city: "Delhi", min: 600, max: 1800, avg: 1000, turfs: "35+" },
  { city: "Hyderabad", min: 500, max: 1500, avg: 850, turfs: "30+" },
  { city: "Pune", min: 500, max: 1500, avg: 800, turfs: "25+" },
  { city: "Chennai", min: 500, max: 1400, avg: 750, turfs: "20+" },
  { city: "Kolkata", min: 400, max: 1200, avg: 650, turfs: "15+" },
  { city: "Ahmedabad", min: 400, max: 1200, avg: 650, turfs: "15+" },
];

const faqItems = [
  {
    question: "What is the average turf booking price in India?",
    answer:
      "The average turf booking price in India is ₹800-1200 per hour for football. Budget turfs start at ₹400/hr in smaller cities, while premium turfs in Mumbai cost up to ₹2500/hr. Prices vary by city, sport, and amenities.",
  },
  {
    question: "Which city has the cheapest turf booking in India?",
    answer:
      "Kolkata and Ahmedabad have the cheapest turf booking in India, with prices starting from ₹400/hr. Hyderabad and Pune also offer affordable options starting from ₹500/hr.",
  },
  {
    question: "Which city has the most expensive turf booking?",
    answer:
      "Mumbai has the most expensive turf booking in India, with premium turfs costing up to ₹2500/hr. Bangalore is second with prices reaching ₹2000/hr for premium floodlit venues.",
  },
  {
    question: "How much does cricket ground booking cost in India?",
    answer:
      "Cricket ground booking in India ranges from ₹500 to ₹2000 per hour. Indoor cricket nets cost ₹300-800/hr, while outdoor grounds cost ₹800-2000/hr depending on the city.",
  },
  {
    question: "Are there any hidden charges in turf booking?",
    answer:
      "Most turf bookings on Turfzo include the base fare and a small convenience fee (1.8%). GST (18%) is added at checkout. There are no hidden charges — the price shown is the final price.",
  },
  {
    question: "Can I get a discount on turf booking?",
    answer:
      "Yes, many turfs offer discounts for weekday bookings, morning slots, and bulk bookings. Turfzo also runs seasonal promotions and offers for new users. Check the explore page for current deals.",
  },
  {
    question: "How much does badminton court booking cost in India?",
    answer:
      "Badminton court booking in India ranges from ₹300 to ₹800 per hour. Indoor courts with wooden flooring cost ₹500-800/hr, while outdoor synthetic courts cost ₹300-500/hr.",
  },
];

export default function TurfBookingPriceIndia() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>
          Turf Booking Price in India [2026 Data] | City-wise Pricing | Turfzo
        </title>
        <meta
          name="description"
          content="How much does turf booking cost in India? We analyzed 50+ turfs across 8 cities with real pricing data. Football, cricket, badminton prices from ₹400/hr."
        />
        <link
          rel="canonical"
          href="https://turfzo.com/blog/turf-booking-price-india"
        />
        <meta
          property="og:title"
          content="Turf Booking Price in India [2026 Data] | Turfzo"
        />
        <meta
          property="og:description"
          content="Real turf booking prices across 8 Indian cities. Football, cricket, and badminton pricing data from ₹400/hr."
        />
        <meta
          property="og:url"
          content="https://turfzo.com/blog/turf-booking-price-india"
        />
      </head>
      <ArticleSchema
        name="Turf Booking Price in India [2026 Data]"
        description="How much does turf booking cost in India? Real pricing data from 50+ turfs across 8 cities."
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
            <Link href="/" className="hover:text-brand-lime transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-lime transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-text-main">Turf Booking Price India</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-lime/10 text-brand-lime font-poppins font-bold text-[10px] px-2.5 py-1 rounded-pill">Research</span>
              <span className="text-[10px] text-text-muted font-sans">May 2026 · 6 min read</span>
            </div>
            <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-text-main leading-tight">
              Turf Booking Price in India [2026 Data]
            </h1>
            <p className="mt-4 text-text-muted text-sm font-sans leading-relaxed">
              We analyzed 50+ turfs across 8 major Indian cities to give you real pricing data for football, cricket, and badminton venues. This guide breaks down costs by city, sport, and time of day so you know exactly what to expect before booking.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted font-sans">
              <span>By Turfzo Team</span>
              <span>Updated May 2026</span>
            </div>
          </motion.div>

          {/* Quick Answer */}
          <div className="bg-surface border border-brand-lime/10 rounded-md p-6 mb-12">
            <h2 className="font-poppins font-bold text-base text-brand-lime mb-2">Quick Answer</h2>
            <p className="text-sm text-text-main font-sans leading-relaxed">
              Turf booking in India costs ₹400 to ₹2500 per hour depending on the city and sport. Football turfs average ₹800-1200/hr, cricket grounds ₹500-1500/hr, and badminton courts ₹300-800/hr. Mumbai and Bangalore are the most expensive cities, while Kolkata and Ahmedabad are the most affordable.
            </p>
          </div>

          {/* City Pricing Table */}
          <div className="mb-12">
            <h2 className="font-poppins font-bold text-xl text-text-main mb-6">
              City-wise Turf Booking Prices (Football)
            </h2>
            <div className="bg-surface border border-border-subtle rounded-md overflow-hidden">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-elevated border-b border-border-subtle">
                    <th className="text-left py-3 px-4 text-text-main font-poppins font-bold">City</th>
                    <th className="text-left py-3 px-4 text-text-main font-poppins font-bold">Min Price</th>
                    <th className="text-left py-3 px-4 text-text-main font-poppins font-bold">Max Price</th>
                    <th className="text-left py-3 px-4 text-text-main font-poppins font-bold">Average</th>
                    <th className="text-left py-3 px-4 text-text-main font-poppins font-bold">Turfs Available</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  {cityPricing.map((row) => (
                    <tr key={row.city} className="border-b border-border-subtle hover:bg-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-main">{row.city}</td>
                      <td className="py-3 px-4">₹{row.min}/hr</td>
                      <td className="py-3 px-4">₹{row.max}/hr</td>
                      <td className="py-3 px-4 font-bold text-brand-lime">₹{row.avg}/hr</td>
                      <td className="py-3 px-4">{row.turfs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price by Sport */}
          <div className="mb-12">
            <h2 className="font-poppins font-bold text-xl text-text-main mb-6">
              Turf Booking Price by Sport
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { sport: "Football", price: "₹800 - ₹2000/hr", desc: "5-a-side to 11-a-side turfs", icon: "⚽" },
                { sport: "Cricket", price: "₹500 - ₹1500/hr", desc: "Nets, nets with bowling machine, grounds", icon: "🏏" },
                { sport: "Badminton", price: "₹300 - ₹800/hr", desc: "Indoor wooden courts, outdoor synthetic", icon: "🏸" },
              ].map((item) => (
                <div key={item.sport} className="bg-surface border border-border-subtle rounded-md p-5">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-poppins font-bold text-sm text-text-main mt-2">{item.sport}</h3>
                  <p className="text-lg font-poppins font-extrabold text-brand-lime mt-1">{item.price}</p>
                  <p className="text-[10px] text-text-muted font-sans mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Factors affecting price */}
          <div className="mb-12">
            <h2 className="font-poppins font-bold text-xl text-text-main mb-6">
              What Factors Affect Turf Booking Price?
            </h2>
            <div className="space-y-3">
              {[
                { factor: "Location", impact: "High", desc: "Premium areas like Indiranagar (Bangalore) and Bandra (Mumbai) cost 30-50% more than suburban areas." },
                { factor: "Time of Day", impact: "Medium", desc: "Peak hours (5-8 PM) cost 20-40% more than off-peak hours (6-10 AM, 10 PM onwards)." },
                { factor: "Day of Week", impact: "Medium", desc: "Weekends cost 10-20% more than weekdays. Friday evenings are the most expensive." },
                { factor: "Facilities", impact: "High", desc: "Floodlights, changing rooms, and cafeterias add to the price. Basic turfs without amenities are cheaper." },
                { factor: "Turf Quality", impact: "High", desc: "FIFA-rated artificial grass turfs cost more than basic synthetic grass surfaces." },
                { factor: "Sport Type", impact: "Medium", desc: "Football turfs are generally more expensive than badminton courts due to larger playing area." },
              ].map((item) => (
                <div key={item.factor} className="bg-surface border border-border-subtle rounded-md p-4 flex gap-4">
                  <div className="w-16 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-pill ${
                      item.impact === "High" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-text-main">{item.factor}</h3>
                    <p className="text-[10px] text-text-muted font-sans mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-md p-6 mb-12 text-center">
            <h3 className="font-poppins font-bold text-lg text-text-main mb-2">Compare Prices & Book</h3>
            <p className="text-xs text-text-muted font-sans mb-4">Browse real-time pricing for turfs in your city</p>
            <Link href="/explore" className="inline-flex items-center gap-2 bg-brand-lime text-black font-poppins font-bold text-sm py-3 px-8 rounded-pill hover:bg-brand-lime-hover transition-all">
              Explore Turfs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQ */}
          <div className="mt-16 mb-12">
            <h2 className="font-poppins font-bold text-2xl text-text-main mb-8">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item, idx) => (
                <details key={idx} className="bg-surface border border-border-subtle rounded-md p-5 group">
                  <summary className="font-poppins font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-3 text-xs text-text-muted font-sans leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-brand-lime transition-colors font-sans">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
