import Link from "next/link";
import {
  Compass,
  Users,
  ScanLine,
  MapPin,
  Calendar,
  BarChart3,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import {
  HowToSchema,
  FAQPageSchema,
  BreadcrumbListSchema,
} from "@/lib/schema";

const howToSteps = [
  {
    name: "Search & Discover",
    text: "Find verified pitches near you that support your sport, format, and timing. Filter by floodlights, parking, and amenities.",
  },
  {
    name: "Select Date & Time Slot",
    text: "Choose your preferred date and available time slot from real-time availability. No phone calls needed.",
  },
  {
    name: "Split & Pay Online",
    text: "Reserve the slot instantly. Add your teammates' contacts at checkout to split the bill, allowing everyone to pay their share directly via UPI or card.",
  },
  {
    name: "Show Up & Play",
    text: "Access the pitch by scanning your receipt QR code at the entrance gates. Check in and start on time.",
  },
];

const faqItems = [
  {
    question: "How do I book a turf on Turfzo?",
    answer:
      "Visit turfzo.app/explore, select your city, browse available turfs, choose your date and time slot, and complete payment online. Your booking is confirmed instantly with a QR code ticket pass.",
  },
  {
    question: "How much does turf booking cost?",
    answer:
      "Turf booking prices in India typically range from ₹500 to ₹2,000 per hour depending on the city, sport, and facilities. Each venue sets its own hourly rate shown upfront on its listing.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes. Cancel 24+ hours before the slot for a full refund of the slot price, 6–24 hours before for a 50% refund. Cancellations under 6 hours are non-refundable. The service fee is retained in every case.",
  },
  {
    question: "How does bill splitting work?",
    answer:
      "When you book a turf on Turfzo, you can add your teammates' contacts at checkout so players can pay their share directly online.",
  },
  {
    question: "What sports can I book on Turfzo?",
    answer:
      "Turfzo supports football, cricket, badminton, tennis, and multipurpose sports venues across Indian cities including Mumbai and upcoming metro launches.",
  },
  {
    question: "Is online payment safe on Turfzo?",
    answer:
      "Yes, Turfzo uses Cashfree for payment processing, supporting UPI, credit cards, debit cards, and net banking.",
  },
  {
    question: "Do I need to download an app to book?",
    answer:
      "No, you can book directly on turfzo.app from any browser. We also have a mobile app if you prefer.",
  },
  {
    question: "What happens if it rains on my booking day?",
    answer:
      "For outdoor turfs where weather prevents play, the venue may approve a reschedule from My Bookings, or you can cancel under the standard policy: full refund of the slot price (service fee is non-refundable) 24+ hours before the slot, 50% up to 6 hours before, and no refund within 6 hours. Indoor turfs are not affected by weather.",
  },
];

const playerFlow = [
  {
    num: "01",
    icon: Compass,
    title: "Search & Discover",
    desc: "Find verified pitches near you that support your sport, match format, and timing. Filter by floodlights, parking, indoor courts, and amenities.",
    tag: "Discover",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Real-time Search
        </span>
        <div className="bg-bg border border-border-subtle p-3 rounded-lg flex flex-col gap-1 shadow-inner">
          <span className="text-[8px] text-text-muted">City &amp; Sport</span>
          <div className="text-text-main font-semibold flex items-center justify-between text-[10px]">
            <span>Mumbai · Football</span>
            <span className="text-brand-lime">✓</span>
          </div>
        </div>
        <div className="bg-bg border border-border-subtle p-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#16211B] flex items-center justify-center font-bold text-xs text-brand-lime">
            OA
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-main text-[10px]">
              Olympic Arena
            </span>
            <span className="text-[8px] text-text-muted">
              Football · Andheri West · ₹1,200/hr
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    icon: Calendar,
    title: "Select Date & Time Slot",
    desc: "Choose your preferred date and available hour from real-time availability. Check live slot pricing, evening peak hours, and lock your spot instantly.",
    tag: "Slot Select",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Live Booking Grid
        </span>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
          <span className="bg-elevated text-text-muted p-2 rounded border border-border-subtle line-through">
            05:00 PM (Booked)
          </span>
          <span className="bg-elevated text-text-muted p-2 rounded border border-border-subtle line-through">
            06:00 PM (Booked)
          </span>
          <span className="bg-brand-lime text-black font-bold p-2 rounded border border-brand-lime shadow-sm">
            07:00 PM (Selected)
          </span>
          <span className="bg-elevated text-text-main p-2 rounded border border-border-subtle">
            08:00 PM (Available)
          </span>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: Users,
    title: "Split & Pay Online",
    desc: "Reserve the slot instantly. Pay securely via UPI, card, or net banking, and keep the booking breakdown transparent with no phone-call haggling.",
    tag: "Secure Pay",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Checkout Summary
        </span>
        <div className="bg-bg border border-border-subtle p-3.5 rounded-lg flex flex-col gap-2 shadow-inner text-[10px]">
          <div className="flex justify-between border-b border-border-subtle pb-1.5 text-text-muted">
            <span>Slot Rate</span>
            <span>₹1,200</span>
          </div>
          <div className="flex justify-between font-bold text-brand-lime text-xs pt-0.5">
            <span>5% Service Fee</span>
            <span>₹60</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            <span className="flex-1 bg-elevated border border-border-default rounded p-1.5 text-center text-[8px] font-bold">
              UPI / Cards
            </span>
            <span className="flex-1 bg-elevated border border-border-default rounded p-1.5 text-center text-[8px] font-bold">
              Instant Pass
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    icon: ScanLine,
    title: "Show Up & Play",
    desc: "Access the pitch by showing your digital QR booking pass at the ground entrance. Your slot is reserved under your name with zero overlap.",
    tag: "Access Pass",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm flex flex-col items-center justify-center space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider self-start">
          Gate Entrance QR Pass
        </span>
        <div className="bg-white p-3 rounded-xl shadow-md">
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-black">
            <rect x="0" y="0" width="30" height="30" fill="black" />
            <rect x="5" y="5" width="20" height="20" fill="white" />
            <rect x="10" y="10" width="10" height="10" fill="black" />
            <rect x="70" y="0" width="30" height="30" fill="black" />
            <rect x="75" y="5" width="20" height="20" fill="white" />
            <rect x="80" y="10" width="10" height="10" fill="black" />
            <rect x="0" y="70" width="30" height="30" fill="black" />
            <rect x="5" y="75" width="20" height="20" fill="white" />
            <rect x="10" y="80" width="10" height="10" fill="black" />
            <rect x="40" y="40" width="20" height="20" fill="black" />
          </svg>
        </div>
        <span className="text-[9px] text-brand-lime font-bold tracking-widest uppercase font-sans">
          Entrance Pass Active
        </span>
      </div>
    ),
  },
];

const ownerFlow = [
  {
    num: "01",
    icon: MapPin,
    title: "List Venue Showcase",
    desc: "List your venue with photographs, turf surface specifications, location pin, amenities, and available sports courts in minutes.",
    tag: "Setup",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Pitch Specifications
        </span>
        <div className="bg-bg border border-border-subtle p-3 rounded-lg flex flex-col gap-2 text-[10px]">
          <div className="flex justify-between border-b border-border-subtle pb-1">
            <span className="text-text-muted">Surface</span>
            <span className="font-semibold text-text-main">FIFA-grade Turf</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Amenities</span>
            <span className="font-semibold text-text-main">
              Floodlights, Parking
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    icon: Calendar,
    title: "Manage Slots & Rates",
    desc: "Set operating hours, peak evening or weekend rates, and block recurring coaching or walk-in hours to eliminate double bookings.",
    tag: "Controls",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Schedule Controls
        </span>
        <div className="bg-bg border border-border-subtle p-3.5 rounded-lg flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">Peak hour pricing</span>
            <span className="text-brand-lime font-bold">Configured</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="text-text-muted">Zero-overlap calendar</span>
            <span className="text-brand-lime font-bold">Enabled</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Track Payouts & Occupancy",
    desc: "Track completed bookings, utilization trends, and settlements from your owner dashboard. Owners keep 95% of every slot booking.",
    tag: "Analytics",
    visual: (
      <div className="bg-surface border border-border-default rounded-2xl p-6 w-full max-w-sm font-sans text-xs space-y-3">
        <span className="text-[9px] font-bold text-brand-lime uppercase tracking-wider block">
          Transparent Take Rate
        </span>
        <div className="bg-bg border border-border-subtle p-3 rounded-lg flex items-center justify-between shadow-inner">
          <div className="flex flex-col">
            <span className="text-[8px] text-text-muted uppercase">
              Owner Share
            </span>
            <span className="font-sans font-extrabold text-text-main text-base mt-0.5">
              95% per booking
            </span>
          </div>
          <div className="bg-[#16211B] text-brand-lime border border-brand-lime/10 px-2 py-1 rounded text-[9px] font-bold">
            ₹0 Listing Fee
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: "https://turfzo.app" },
          { name: "How It Works", url: "https://turfzo.app/how-it-works" },
        ]}
      />
      <HowToSchema
        name="How to Book a Turf on Turfzo"
        description="Book a football turf, cricket ground, or sports venue in 2 minutes on Turfzo. Search, select your slot, pay online, and show up to play."
        totalTime="PT2M"
        steps={howToSteps}
      />
      <FAQPageSchema items={faqItems} />

      <Header />

      <main className="flex-grow pt-24 pb-20 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-10">
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight tracking-tight">
              Discover How <span className="text-brand-lime">Turfzo Works</span>
            </h1>
            <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
              Book a turf in 2 minutes. Search for available venues near you,
              select your time slot, pay online, and show up to play. No phone
              calls, no hassle.
            </p>

            {/* Anchor Pills — both sections remain SSR-visible */}
            <div className="mt-8 inline-flex justify-center bg-elevated border border-border-default p-1 rounded-lg gap-1">
              <a
                href="#for-players"
                className="font-sans font-semibold text-xs px-5 py-2.5 rounded-md bg-surface text-brand-lime shadow-sm border border-border-subtle transition-all"
              >
                For Players
              </a>
              <a
                href="#for-owners"
                className="font-sans font-semibold text-xs px-5 py-2.5 rounded-md text-text-main hover:text-brand-lime transition-all"
              >
                For Turf Owners
              </a>
            </div>
          </div>

          {/* SECTION 1: PLAYER FLOW */}
          <section id="for-players" className="max-w-5xl mx-auto mb-24 scroll-mt-24">
            <div className="mb-12 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-lime">
                For Players
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight mt-1">
                From search to kickoff in 4 steps
              </h2>
            </div>

            <div className="space-y-20">
              {playerFlow.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={step.num}
                    className={`flex flex-col gap-10 lg:gap-16 items-center justify-between ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    <div className="w-full lg:w-[50%] space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-sm font-bold text-brand-lime tracking-wide">
                          {step.num}
                        </span>
                        <span className="text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-elevated text-text-muted border border-border-subtle">
                          {step.tag}
                        </span>
                      </div>
                      <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="w-full lg:w-[40%] flex items-center justify-center">
                      {step.visual}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Explore Live Turfs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sports/football"
                className="inline-flex items-center gap-2 bg-surface border border-border-default hover:border-border-strong text-text-main font-sans font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
              >
                Football Turfs
              </Link>
              <Link
                href="/sports/cricket"
                className="inline-flex items-center gap-2 bg-surface border border-border-default hover:border-border-strong text-text-main font-sans font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
              >
                Box Cricket
              </Link>
            </div>
          </section>

          {/* SECTION 2: OWNER FLOW */}
          <section
            id="for-owners"
            className="max-w-5xl mx-auto mb-24 pt-16 border-t border-border-default scroll-mt-24"
          >
            <div className="mb-12 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-lime">
                For Turf Owners
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight mt-1">
                List your turf and automate bookings in 3 steps
              </h2>
            </div>

            <div className="space-y-20">
              {ownerFlow.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={step.num}
                    className={`flex flex-col gap-10 lg:gap-16 items-center justify-between ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    <div className="w-full lg:w-[50%] space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-sm font-bold text-brand-lime tracking-wide">
                          {step.num}
                        </span>
                        <span className="text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-elevated text-text-muted border border-border-subtle">
                          {step.tag}
                        </span>
                      </div>
                      <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="w-full lg:w-[40%] flex items-center justify-center">
                      {step.visual}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link
                href="/owners"
                className="inline-flex items-center gap-2 bg-text-main hover:bg-text-main/90 text-bg font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                For Turf Owners <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto px-6 md:px-8 mt-20 border-t border-border-default pt-20">
            <h2 className="font-sans font-extrabold text-3xl text-text-main tracking-tight mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-border-default">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="py-5 group cursor-pointer"
                >
                  <summary className="font-sans font-bold text-sm sm:text-base text-text-main cursor-pointer list-none flex items-center justify-between focus:outline-none select-none">
                    <span>{item.question}</span>
                    <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform duration-300" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-text-muted font-sans leading-relaxed max-w-2xl pr-4">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
