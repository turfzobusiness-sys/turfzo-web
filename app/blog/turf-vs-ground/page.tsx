"use client";

import Link from "next/link";
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
    question: "Is turf better than natural grass for football?",
    answer:
      "Turf is better for consistency and availability — it plays the same regardless of weather and is available year-round. Natural grass is better for playing feel and reduces joint impact. For casual and competitive play, turf is the more practical choice.",
  },
  {
    question: "Does playing on turf cause more injuries?",
    answer:
      "Modern FIFA-rated turf has reduced injury rates significantly. Studies show injury rates on modern turf are comparable to natural grass. However, older or low-quality turf can increase joint stress. Always choose certified turfs.",
  },
  {
    question: "How long does a football turf last?",
    answer:
      "Quality football turf lasts 5-8 years with proper maintenance. Natural grass requires constant maintenance and can be damaged by heavy use. Turf is more durable and cost-effective for commercial use.",
  },
  {
    question: "Is turf booking cheaper than ground booking?",
    answer:
      "Turf and ground booking prices are similar in most cities. Turf booking typically costs ₹800-1500/hr for football, while natural ground booking costs ₹500-1200/hr. Turf offers better availability and consistent playing conditions.",
  },
  {
    question: "Can I play football on turf in the rain?",
    answer:
      "Yes, football turfs drain water quickly and are playable in light rain. Heavy rain may cause waterlogging on some turfs. Indoor turfs are unaffected by weather. Turfzo shows weather conditions for each venue.",
  },
  {
    question: "Which is better for beginners — turf or ground?",
    answer:
      "Turf is generally better for beginners because the playing surface is consistent and predictable. Natural grass can have uneven patches that make ball control harder. Turf also has better lighting for evening practice sessions.",
  },
];

const comparisonData = [
  { factor: "Playing Surface", turf: "Consistent artificial grass", ground: "Natural grass, varies by maintenance" },
  { factor: "Weather Dependency", turf: "Playable in most weather", ground: "Affected by rain, heat, mud" },
  { factor: "Availability", turf: "Year-round, 6 AM - 11 PM", ground: "Seasonal, limited hours" },
  { factor: "Ball Roll", turf: "Fast and predictable", ground: "Slower, depends on grass length" },
  { factor: "Joint Impact", turf: "Slightly higher on older turf", ground: "Lower on natural grass" },
  { factor: "Maintenance", turf: "Low — occasional brushing", ground: "High — mowing, watering, seeding" },
  { factor: "Lighting", turf: "Floodlights standard", ground: "Rarely available" },
  { factor: "Booking Ease", turf: "Online, instant confirmation", ground: "Often requires phone calls" },
  { factor: "Cost", turf: "₹800-2000/hr", ground: "₹500-1200/hr" },
  { factor: "Durability", turf: "5-8 years", ground: "Requires constant upkeep" },
];

export default function TurfVsGround() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>
          Turf vs Ground: Which is Better for Football? [2026 Comparison] |
          Turfzo
        </title>
        <meta
          name="description"
          content="Turf vs natural ground for football — we compare cost, playability, injury risk, availability, and maintenance to help you choose the best playing surface."
        />
        <link
          rel="canonical"
          href="https://turfzo.app/blog/turf-vs-ground"
        />
        <meta
          property="og:title"
          content="Turf vs Ground: Which is Better for Football? | Turfzo"
        />
        <meta
          property="og:description"
          content="Complete comparison of turf vs natural ground for football. Cost, playability, injuries, and more."
        />
        <meta
          property="og:url"
          content="https://turfzo.app/blog/turf-vs-ground"
        />
      </head>
      <ArticleSchema
        name="Turf vs Ground: Which is Better for Football?"
        description="Complete comparison of turf vs natural ground for football including cost, playability, injury risk, and availability."
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
            <Link href="/" className="hover:text-brand-lime transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-lime transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-text-main">Turf vs Ground</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-lime/10 text-brand-lime font-sans font-bold text-[10px] px-2.5 py-1 rounded-md">Comparison</span>
              <span className="text-[10px] text-text-muted font-sans">May 2026 · 5 min read</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-text-main leading-tight">
              Turf vs Ground: Which is Better for Football?
            </h1>
            <p className="mt-4 text-text-muted text-sm font-sans leading-relaxed">
              Choosing between turf and natural ground for your next football game? This comparison breaks down the key differences in cost, playability, injury risk, availability, and maintenance to help you make the right choice.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted font-sans">
              <span>By Turfzo Team</span>
              <span>Updated May 2026</span>
            </div>
          </motion.div>

          {/* Quick Answer */}
          <div className="bg-surface border border-brand-lime/10 rounded-md p-6 mb-12">
            <h2 className="font-sans font-bold text-base text-brand-lime mb-2">Quick Answer</h2>
            <p className="text-sm text-text-main font-sans leading-relaxed">
              Turf is better for consistency, availability, and convenience — it plays the same regardless of weather and is bookable online year-round. Natural ground is better for playing feel and lower joint impact. For most casual and competitive players, turf is the more practical choice due to floodlights, instant booking, and consistent surface quality.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-6">
              Turf vs Ground: Side-by-Side Comparison
            </h2>
            <div className="bg-surface border border-border-subtle rounded-md overflow-hidden">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-elevated border-b border-border-subtle">
                    <th className="text-left py-3 px-4 text-text-main font-sans font-bold w-1/4">Factor</th>
                    <th className="text-left py-3 px-4 text-brand-lime font-sans font-bold w-[37.5%]">⚽ Turf</th>
                    <th className="text-left py-3 px-4 text-text-main font-sans font-bold w-[37.5%]">🌿 Ground</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  {comparisonData.map((row) => (
                    <tr key={row.factor} className="border-b border-border-subtle">
                      <td className="py-3 px-4 font-semibold text-text-main">{row.factor}</td>
                      <td className="py-3 px-4">{row.turf}</td>
                      <td className="py-3 px-4">{row.ground}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <div className="bg-surface border border-border-subtle rounded-md p-6">
              <h3 className="font-sans font-bold text-base text-brand-lime mb-4">⚽ Turf — Pros</h3>
              <ul className="space-y-2">
                {[
                  "Consistent playing surface year-round",
                  "Floodlights for evening/night games",
                  "Online booking with instant confirmation",
                  "Quick drainage — playable after rain",
                  "Low maintenance requirements",
                  "Available 6 AM to 11 PM daily",
                ].map((item) => (
                  <li key={item} className="text-xs text-text-muted font-sans flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-border-subtle rounded-md p-6">
              <h3 className="font-sans font-bold text-base text-error mb-4">🌿 Ground — Pros</h3>
              <ul className="space-y-2">
                {[
                  "Natural playing feel and ball control",
                  "Lower joint impact on knees and ankles",
                  "Cooler surface in hot weather",
                  "Better for professional training",
                  "Traditional football experience",
                  "Often cheaper to book",
                ].map((item) => (
                  <li key={item} className="text-xs text-text-muted font-sans flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* When to choose which */}
          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-6">
              When Should You Choose Turf?
            </h2>
            <div className="space-y-3">
              {[
                { scenario: "Evening or night games", reason: "Floodlights are standard on turfs" },
                { scenario: "Weekend bookings", reason: "Online booking with real-time availability" },
                { scenario: "Rainy season", reason: "Quick drainage, playable in most weather" },
                { scenario: "Corporate events", reason: "Professional setup with amenities" },
                { scenario: "Regular practice sessions", reason: "Consistent surface for skill development" },
              ].map((item) => (
                <div key={item.scenario} className="bg-surface border border-border-subtle rounded-md p-4 flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-sans font-bold text-sm text-text-main">{item.scenario}</h3>
                    <p className="text-[10px] text-text-muted font-sans mt-1">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-6">
              When Should You Choose Natural Ground?
            </h2>
            <div className="space-y-3">
              {[
                { scenario: "Professional training", reason: "Natural grass is closer to match conditions" },
                { scenario: "Joint pain concerns", reason: "Lower impact on knees and ankles" },
                { scenario: "Daytime games in cool weather", reason: "Natural grass is cooler than artificial turf" },
                { scenario: "Budget constraints", reason: "Ground booking is often 20-40% cheaper" },
              ].map((item) => (
                <div key={item.scenario} className="bg-surface border border-border-subtle rounded-md p-4 flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-sans font-bold text-sm text-text-main">{item.scenario}</h3>
                    <p className="text-[10px] text-text-muted font-sans mt-1">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-md p-6 mb-12 text-center">
            <h3 className="font-sans font-bold text-lg text-text-main mb-2">Ready to Play?</h3>
            <p className="text-xs text-text-muted font-sans mb-4">Book a turf or ground near you in 2 minutes</p>
            <Link href="/explore" className="inline-flex items-center gap-2 bg-brand-lime text-white dark:text-black font-sans font-bold text-sm py-3 px-8 rounded-md hover:bg-brand-lime-hover transition-all">
              Explore Venues <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQ */}
          <div className="mt-16 mb-12">
            <h2 className="font-sans font-bold text-2xl text-text-main mb-8">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item, idx) => (
                <details key={idx} className="bg-surface border border-border-subtle rounded-md p-5 group">
                  <summary className="font-sans font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
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
