"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    slug: "book-football-turf-instantly",
    title: "Tired of Calling? How to Book the Best Turfs Instantly",
    excerpt:
      "Wasting time calling multiple turfs, dealing with double bookings, and navigating lack of pricing transparency? Learn how to find and secure the best sports venues in your city instantly. Turfzo guarantees a seamless, confirmed booking every time.",
    category: "For Players",
    readTime: "5 min read",
    date: "June 2026",
    image: "/players_playing_football_1781975762157.png",
  },
  {
    slug: "organize-local-sports-tournaments",
    title: "How to Organize the Perfect Local Sports Tournament",
    excerpt:
      "Struggling to find teammates or coordinate matches? Discover the best ways to bring your community together through sports, organize 5v5 tournaments, and foster local growth. Turfzo empowers community leaders with the right tools.",
    category: "For Community",
    readTime: "7 min read",
    date: "June 2026",
    image: "/community_sports_tournament_1781975774951.png",
  },
  {
    slug: "maximize-turf-roi-booking-management",
    title: "Maximizing Your Turf's ROI: The Ultimate Management Guide",
    excerpt:
      "Are empty slots, complex booking management, and high marketing costs hurting your business? Learn how to increase bookings during off-peak hours. Turfzo partners with owners to streamline operations and maximize revenue.",
    category: "For Owners",
    readTime: "6 min read",
    date: "June 2026",
    image: "/turf_owner_dashboard_1781975786523.png",
  },
  {
    slug: "future-of-amateur-sports-india",
    title: "The Future of Amateur Sports Infrastructure in India",
    excerpt:
      "As grassroots sports rapidly expand across India, the demand for high-quality, accessible playing facilities has never been higher. Explore how Turfzo is democratizing access to premium sports infrastructure in top metro cities.",
    category: "Industry",
    readTime: "8 min read",
    date: "June 2026",
    image: "/future_of_amateur_sports_1781976167558.png",
  },
  {
    slug: "turf-vs-ground-injury-prevention",
    title: "Turf Quality & Injury Prevention: What Players Need to Know",
    excerpt:
      "Not all artificial turfs are created equal. Understand the difference between FIFA-certified 3G/4G pitches and subpar surfaces, and learn why Turfzo stringently verifies every venue for player safety and optimal performance.",
    category: "Educational",
    readTime: "6 min read",
    date: "June 2026",
    image: "/turf_quality_closeup_1781976182142.png",
  },
];

export default function BlogIndex() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>Turfzo Blog | Turf Booking Tips, Guides & City Guides</title>
        <meta
          name="description"
          content="Expert guides on turf booking, football turf prices, city guides, and sports venue comparisons. Learn how to book the best turfs in India."
        />
        <link rel="canonical" href="https://turfzo.app/blog" />
      </head>
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight">
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
                  className="group block bg-surface border border-border-default hover:border-brand-lime/10 rounded-md overflow-hidden transition-all duration-300 hover:shadow-card-shadow"
                >
                  <div className="relative h-48 bg-elevated overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-brand-lime text-black font-sans font-bold text-[10px] px-2.5 py-1 rounded-md">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="font-sans font-bold text-lg text-text-main group-hover:text-brand-lime transition-colors">
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
                      <span className="text-brand-lime text-xs font-sans font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
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
