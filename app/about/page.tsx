import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { absolute: "About Turfzo | Turf Booking Platform in India" },
  description:
    "Learn about Turfzo, the turf booking platform for football, cricket, badminton and tennis. See how players book venues and how owners list their turf.",
  alternates: { canonical: "https://turfzo.app/about" },
  openGraph: {
    title: "About Turfzo | Turf Booking Platform in India",
    description:
      "Learn about Turfzo, the turf booking platform for football, cricket, badminton and tennis.",
    url: "https://turfzo.app/about",
    images: [
      {
        url: "https://turfzo.app/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Turfzo",
      },
    ],
  },
};

const PLAYER_POINTS = [
  "Search football turfs, cricket grounds, badminton courts, and tennis courts by city, date, and time.",
  "See the hourly price and live availability before you pay.",
  "Pay online and get an instant confirmation with a QR ticket.",
  "Manage upcoming and past bookings from one account.",
];

const OWNER_POINTS = [
  "List your ground with photos, amenities, and hourly pricing.",
  "Manage slots and bookings from one dashboard.",
  "Keep 95% of the slot price. There is no listing fee.",
  "Get paid through a clear settlement process.",
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-32 md:pt-40 pb-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">
              About Turfzo
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-text-main mt-3 leading-tight">
              A simpler way to book a turf.
              <br />
              <span className="text-text-muted">
                A simpler way to fill one.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-muted font-sans leading-relaxed">
              Turfzo is a turf and sports venue booking platform for football,
              cricket, badminton, and tennis. Players use it to find a ground and
              book a slot. Venue owners use it to list their ground, manage
              bookings, and get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
            <section className="rounded-xl border border-border-default bg-surface p-6 sm:p-8">
              <div className="w-11 h-11 rounded-lg bg-bg border border-border-default flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-lime" />
              </div>
              <h2 className="font-sans text-xl font-bold text-text-main mt-5">
                For players
              </h2>
              <p className="mt-2 text-sm text-text-muted font-sans leading-relaxed">
                Find a ground, compare the hourly price, and book the slot that
                fits your game.
              </p>
              <ul className="mt-5 space-y-3">
                {PLAYER_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm text-text-muted font-sans leading-relaxed"
                  >
                    <CalendarCheck className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-lime mt-6 hover:underline"
              >
                Explore turfs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <section className="rounded-xl border border-border-default bg-surface p-6 sm:p-8">
              <div className="w-11 h-11 rounded-lg bg-bg border border-border-default flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-lime" />
              </div>
              <h2 className="font-sans text-xl font-bold text-text-main mt-5">
                For venue owners
              </h2>
              <p className="mt-2 text-sm text-text-muted font-sans leading-relaxed">
                Turn empty slots into bookings with turf booking software built
                for small and mid-sized venues.
              </p>
              <ul className="mt-5 space-y-3">
                {OWNER_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm text-text-muted font-sans leading-relaxed"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/owners"
                className="inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-lime mt-6 hover:underline"
              >
                List your turf
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>

          <section className="mt-14 rounded-xl border border-border-default bg-surface p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-bg border border-border-default flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand-lime" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-bold text-text-main">
                  Where we are launching
                </h2>
                <p className="mt-2 text-sm text-text-muted font-sans leading-relaxed">
                  Turfzo is launching city by city. Bangalore is the first
                  focus. We add a venue only after the owner has been verified,
                  so the listings you see are real and bookable. If your city is
                  not live yet, check the explore page or contact us to request
                  it.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-border-default bg-surface p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-bg border border-border-default flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand-lime" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-bold text-text-main">
                  Contact
                </h2>
                <p className="mt-2 text-sm text-text-muted font-sans leading-relaxed">
                  For booking support, email{" "}
                  <a
                    href="mailto:support@turfzo.app"
                    className="text-brand-lime hover:underline"
                  >
                    support@turfzo.app
                  </a>
                  . For venue partnerships, email{" "}
                  <a
                    href="mailto:partnerships@turfzo.app"
                    className="text-brand-lime hover:underline"
                  >
                    partnerships@turfzo.app
                  </a>
                  . You can also use the{" "}
                  <Link
                    href="/contact"
                    className="text-brand-lime hover:underline"
                  >
                    contact form
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
