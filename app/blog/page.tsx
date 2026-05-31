"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    slug: "best-football-turfs-bangalore",
    title: "Best Football Turfs in Bangalore [2026 Guide]",
    excerpt:
      "Discover the top-rated football turfs in Bangalore with real-time pricing, amenities, and booking links. From HSR Layout to Whitefield, find the perfect pitch for your next game.",
    category: "City Guide",
    readTime: "8 min read",
    date: "May 2026",
    image: "/stadium_turf_bg.png",
  },
  {
    slug: "turf-booking-price-india",
    title: "Turf Booking Price in India [2026 Data]",
    excerpt:
      "How much does turf booking actually cost in India? We analyzed 50+ turfs across 8 cities to give you real pricing data — from budget options to premium venues.",
    category: "Research",
    readTime: "6 min read",
    date: "May 2026",
    image: "/stadium_turf_bg.png",
  },
  {
    slug: "turf-vs-ground",
    title: "Turf vs Ground: Which is Better for Football?",
    excerpt:
      "Confused between turf and natural ground for your next football game? We break down the differences in cost, playability, injury risk, and availability to help you decide.",
    category: "Comparison",
    readTime: "5 min read",
    date: "May 2026",
    image: "/stadium_turf_bg.png",
  },
  {
    slug: "how-to-book-turf-online",
    title: "How to Book a Turf Online in 2 Minutes [Step-by-Step]",
    excerpt:
      "Never booked a turf online before? This step-by-step guide walks you through searching, selecting slots, making payment, and getting your booking confirmed instantly.",
    category: "How-To",
    readTime: "4 min read",
    date: "May 2026",
    image: "/stadium_turf_bg.png",
  },
];

export default function BlogIndex() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <head>
        <title>Turfzo Blog | Turf Booking Tips, Guides & City Guides</title>
        <meta
          name="description"
          content="Expert guides on turf booking, football turf prices, city guides, and sports venue comparisons. Learn how to book the best turfs in India."
        />
        <link rel="canonical" href="https://turfzo.com/blog" />
      </head>
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-dark border border-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime">
              <Tag className="w-3.5 h-3.5" /> Turfzo Blog
            </span>
            <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight">
              Turf Booking <span className="text-brand-lime">Guides & Tips</span>
            </h1>
            <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto">
              Everything you need to know about booking football turfs, cricket grounds, and sports venues in India. City guides, pricing data, and step-by-step tutorials.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post, idx) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-surface-dark border border-white/5 hover:border-brand-lime/10 rounded-md overflow-hidden transition-all duration-300 hover:shadow-card-shadow"
                >
                  <div className="relative h-48 bg-elevated-dark overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-brand-lime text-black font-poppins font-bold text-[10px] px-2.5 py-1 rounded-pill">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="font-poppins font-bold text-lg text-text-main group-hover:text-brand-lime transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-xs text-text-muted font-sans leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-text-muted font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                      <span className="text-brand-lime text-xs font-poppins font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
