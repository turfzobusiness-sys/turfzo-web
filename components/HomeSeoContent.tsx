import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  MapPin,
  Wallet,
} from "lucide-react";
import { FaqAccordion } from "@/components/ui/faq-accordion";

export const HOME_FAQ_ITEMS = [
  {
    question: "How do I book a turf online?",
    answer:
      "Open the explore page, choose your sport and city, pick a date and time slot, and pay online. You get an instant confirmation with a QR ticket.",
  },
  {
    question: "How much does turf booking cost in India?",
    answer:
      "Most football turfs list at ₹800 to ₹1,500 per hour, cricket grounds at ₹500 to ₹1,500, and badminton courts at ₹300 to ₹800. The exact price depends on the city, facilities, and time slot. The price shown on the venue page is the price you pay.",
  },
  {
    question: "Can I book a turf for tonight?",
    answer:
      "Yes, if a venue has an open slot for tonight, you can book it instantly. Live availability is shown on every venue page.",
  },
  {
    question: "Does Turfzo operate in my city?",
    answer:
      "Turfzo is launching city by city across India — with active venues in Mumbai and upcoming partner rollouts across Bangalore, Delhi NCR, Hyderabad, and Pune. Check the explore page for live venues, or contact us to request your city.",
  },
  {
    question: "How do I list my turf on Turfzo?",
    answer:
      "Register at turfzo.app/owners, add your ground details, and go live after a quick review. There is no listing fee, and owners keep 95% of the slot price.",
  },
];

const BENEFITS = [
  {
    icon: MapPin,
    title: "Find a turf near you",
    description:
      "Search by sport, city, date, and time. See live availability before you pay.",
  },
  {
    icon: Wallet,
    title: "Know the price upfront",
    description:
      "Compare hourly rates and see the full price at checkout. No phone calls, no hidden charges.",
  },
  {
    icon: CalendarCheck,
    title: "Book in under 60 seconds",
    description:
      "Pay online and get an instant confirmation with a QR ticket for your slot.",
  },
  {
    icon: Building2,
    title: "For venue owners",
    description:
      "List your ground, manage slots, and get paid from one dashboard. No listing fee.",
  },
];

export default function HomeSeoContent() {
  return (
    <section
      id="turf-booking"
      className="py-20 sm:py-24 bg-bg border-t border-border-default"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
            Turf booking
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-text-main mt-2">
            Turf booking in India, made simple
          </h2>
          <p className="mt-4 text-sm sm:text-base text-text-muted font-sans leading-relaxed">
            Turfzo is a turf booking platform for football, cricket, badminton,
            and tennis. Compare hourly prices, check live availability, and book
            a turf online in under 60 seconds. We are onboarding venues city by
            city, so the listings you see are the ones you can actually book.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-xl border border-border-default bg-surface p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-bg border border-border-default flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-lime" />
                </div>
                <h3 className="font-sans font-bold text-sm text-text-main mt-4">
                  {benefit.title}
                </h3>
                <p className="font-sans text-xs text-text-muted leading-relaxed mt-2">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Book a turf
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/owners"
            className="inline-flex items-center justify-center gap-2 border border-border-default hover:border-border-strong text-text-main font-sans font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            List your turf
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 mt-20">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
              Turf booking FAQs
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main mt-2">
              Questions before you book?
            </h2>
            <p className="mt-3 text-sm text-text-muted font-sans leading-relaxed">
              Short answers to the things players ask most. For the full
              walkthrough, read the guides below.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/how-it-works"
                className="text-sm font-sans font-semibold text-text-main hover:text-brand-lime transition-colors"
              >
                How booking works
              </Link>
              <Link
                href="/blog/how-to-book-turf-online"
                className="text-sm font-sans font-semibold text-text-main hover:text-brand-lime transition-colors"
              >
                How to book a turf online
              </Link>
              <Link
                href="/blog/turf-booking-price-india"
                className="text-sm font-sans font-semibold text-text-main hover:text-brand-lime transition-colors"
              >
                Turf booking price guide
              </Link>
            </div>
          </div>
          <FaqAccordion items={HOME_FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
