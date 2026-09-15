import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
  description: "India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly.",
  alternates: { canonical: "https://turfzo.app" }
};

import { Header } from "@/components/ui/header-2";
import Hero from "@/components/Hero";
import PopularTurfs from "@/components/PopularTurfs";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow">
        <Hero />
        <PopularTurfs />
        <Features />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
