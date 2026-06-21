"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
  Smartphone,
  QrCode,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FAQPageSchema, ArticleSchema, HowToSchema } from "@/lib/schema";

const faqItems = [
  {
    question: "How do I book a turf online?",
    answer:
      "Visit turfzo.app/explore, select your city, browse available turfs, choose your date and time slot, and complete payment online. You'll receive a QR code confirmation instantly.",
  },
  {
    question: "How long does it take to book a turf on Turfzo?",
    answer:
      "Booking a turf on Turfzo takes about 2 minutes. Search, select, pay — that's it. No phone calls, no waiting for confirmation.",
  },
  {
    question: "Do I need to create an account to book?",
    answer:
      "Yes, you need a Turfzo account to book. You can sign up with your email, Google account, or phone number. Registration takes less than 30 seconds.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Turfzo accepts UPI (GPay, PhonePe, Paytm), credit cards, debit cards, and net banking. All payments are processed through Cashfree for secure transactions.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel up to 6 hours before your booking time for a full refund. Cancellations within 6 hours receive a 50% refund.",
  },
  {
    question: "What happens after I book?",
    answer:
      "After booking, you receive a QR code ticket via email and in-app. Show this QR code at the turf entrance for access. Floodlights activate automatically for your slot.",
  },
  {
    question: "Can I book for someone else?",
    answer:
      "Yes, you can book on behalf of someone else. Just enter their name and phone number during booking. They'll receive the QR code ticket.",
  },
  {
    question: "Is there a booking limit?",
    answer:
      "You can book up to 3 turfs simultaneously on Turfzo. For tournament or event bookings with multiple slots, contact our support team for bulk booking options.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Search for Turfs",
    description:
      "Visit turfzo.app/explore and select your city. Use filters to narrow down by sport, price, amenities, and location. The search shows real-time availability for each turf.",
    tip: "Pro tip: Filter by 'Flood Lights' if you're planning an evening game.",
  },
  {
    icon: Calendar,
    title: "Pick Your Date & Time",
    description:
      "Click 'View Slots' on any turf to see available time slots. Green slots are available, grey slots are booked. Select your preferred 1-hour slot.",
    tip: "Pro tip: Morning slots (6-8 AM) are the cheapest and least crowded.",
  },
  {
    icon: CreditCard,
    title: "Pay Online Securely",
    description:
      "Review your booking summary — turf name, date, time slot, and total cost. Choose your payment method (UPI, card, or net banking) and complete the payment.",
    tip: "Pro tip: Split the bill with teammates by adding their phone numbers at checkout.",
  },
  {
    icon: QrCode,
    title: "Get Your QR Code Ticket",
    description:
      "Once payment is confirmed, you'll receive a QR code ticket via email and in the Turfzo app. This is your entry pass — show it at the turf entrance.",
    tip: "Pro tip: Screenshot the QR code in case you don't have internet at the venue.",
  },
  {
    icon: Smartphone,
    title: "Show Up & Play",
    description:
      "Arrive at the turf 5-10 minutes before your slot. Scan your QR code at the entrance. Floodlights activate automatically. Enjoy your game!",
    tip: "Pro tip: Check the turf's address and parking info on the booking details page.",
  },
];

export default function HowToBookTurfOnline() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>
          How to Book a Turf Online in 2 Minutes [Step-by-Step Guide] | Turfzo
        </title>
        <meta
          name="description"
          content="Never booked a turf online before? This step-by-step guide walks you through searching, selecting slots, making payment, and getting confirmed in 2 minutes on Turfzo."
        />
        <link
          rel="canonical"
          href="https://turfzo.app/blog/how-to-book-turf-online"
        />
        <meta
          property="og:title"
          content="How to Book a Turf Online in 2 Minutes | Turfzo"
        />
        <meta
          property="og:description"
          content="Step-by-step guide to booking a football turf, cricket ground, or sports venue online in 2 minutes."
        />
        <meta
          property="og:url"
          content="https://turfzo.app/blog/how-to-book-turf-online"
        />
      </head>
      <ArticleSchema
        name="How to Book a Turf Online in 2 Minutes [Step-by-Step Guide]"
        description="Step-by-step guide to booking a football turf online in 2 minutes."
        datePublished="2026-05-31"
        dateModified="2026-05-31"
        author={{ "@type": "Organization", name: "Turfzo" }}
        publisher={{
          "@type": "Organization",
          name: "Turfzo",
          logo: { "@type": "ImageObject", url: "https://turfzo.app/turfzo_mascot.svg" },
        }}
      />
      <HowToSchema
        name="How to Book a Turf Online on Turfzo"
        description="Book a football turf, cricket ground, or sports venue in 2 minutes on Turfzo."
        totalTime="PT2M"
        steps={steps.map((s) => ({ name: s.title, text: s.description }))}
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
            <span className="text-text-main">How to Book a Turf Online</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-lime/10 text-brand-lime font-sans font-bold text-[10px] px-2.5 py-1 rounded-md">How-To</span>
              <span className="text-[10px] text-text-muted font-sans">May 2026 · 4 min read</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-text-main leading-tight">
              How to Book a Turf Online in 2 Minutes
            </h1>
            <p className="mt-4 text-text-muted text-sm font-sans leading-relaxed">
              Booking a football turf, cricket ground, or sports venue online is quick and easy. This step-by-step guide shows you exactly how to search, select a slot, pay, and get confirmed in under 2 minutes on Turfzo.
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
              To book a turf on Turfzo: (1) Visit turfzo.app/explore and select your city, (2) Browse available turfs and click &ldquo;View Slots&rdquo;, (3) Pick your date and time slot, (4) Pay online via UPI or card, (5) Receive your QR code ticket. The entire process takes about 2 minutes.
            </p>
          </div>

          {/* Step-by-Step */}
          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-8">
              Step-by-Step: How to Book a Turf on Turfzo
            </h2>
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-surface border border-border-subtle hover:border-brand-lime/10 rounded-md p-6 flex gap-5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime border border-brand-lime/10 shrink-0">
                      <span className="font-sans font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-brand-lime" />
                        <h3 className="font-sans font-bold text-base text-text-main">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-muted font-sans leading-relaxed">
                        {step.description}
                      </p>
                      <p className="mt-2 text-[10px] text-brand-lime font-sans font-semibold">
                        💡 {step.tip}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-6">
              Payment Methods Accepted on Turfzo
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "UPI", apps: "GPay, PhonePe, Paytm" },
                { name: "Credit Card", apps: "Visa, Mastercard, RuPay" },
                { name: "Debit Card", apps: "All Indian banks" },
                { name: "Net Banking", apps: "All major banks" },
              ].map((method) => (
                <div key={method.name} className="bg-surface border border-border-subtle rounded-md p-4 text-center">
                  <h3 className="font-sans font-bold text-sm text-text-main">{method.name}</h3>
                  <p className="text-[10px] text-text-muted font-sans mt-1">{method.apps}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-12">
            <h2 className="font-sans font-bold text-xl text-text-main mb-6">
              Tips for a Smooth Booking Experience
            </h2>
            <div className="space-y-3">
              {[
                { tip: "Book during off-peak hours (6-8 AM, 10 PM) for cheaper rates and better availability" },
                { tip: "Check the turf's amenities before booking — floodlights, parking, and changing rooms vary by venue" },
                { tip: "Add teammates' phone numbers at checkout to split the bill automatically" },
                { tip: "Screenshot your QR code ticket in case you don't have internet at the venue" },
                { tip: "Arrive 5-10 minutes early to find parking and get settled" },
                { tip: "Save your favorite turfs for quick rebooking next time" },
              ].map((item, idx) => (
                <div key={idx} className="bg-surface border border-border-subtle rounded-md p-4 flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted font-sans">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-md p-6 mb-12 text-center">
            <h3 className="font-sans font-bold text-lg text-text-main mb-2">Ready to Book Your First Turf?</h3>
            <p className="text-xs text-text-muted font-sans mb-4">Browse 50+ verified turfs across India</p>
            <Link href="/explore" className="inline-flex items-center gap-2 bg-brand-lime text-black font-sans font-bold text-sm py-3 px-8 rounded-md hover:bg-brand-lime-hover transition-all">
              Explore Turfs <ArrowRight className="w-4 h-4" />
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
