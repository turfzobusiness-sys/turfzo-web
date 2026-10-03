import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ChevronRight, Trophy, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FAQPageSchema, BreadcrumbListSchema } from "@/lib/schema";

/**
 * Geography only — city name, state and well-known locality names used as
 * browse entry points.
 *
 * The previous table also carried a venue count ("20+"), an average hourly
 * price ("₹1,100/hr") and a list of named venues with 4.6–4.8 ratings. None
 * of that came from the backend; it was invented, and because
 * `FAQPageSchema` publishes the same strings as structured data it was also
 * being served to search engines as fact. Numeric claims are now computed
 * from live data (see the page) or omitted.
 */
const CITY_DATA: Record<
  string,
  { name: string; state: string; highlights: string[] }
> = {
  bangalore: { name: "Bangalore", state: "Karnataka", highlights: ["HSR Layout", "Koramangala", "Indiranagar", "Whitefield", "Marathahalli"] },
  mumbai: { name: "Mumbai", state: "Maharashtra", highlights: ["Andheri", "Bandra", "Powai", "Lower Parel", "Goregaon"] },
  delhi: { name: "Delhi", state: "Delhi", highlights: ["Saket", "Hauz Khas", "Dwarka", "Rohini", "Vasant Kunj"] },
  hyderabad: { name: "Hyderabad", state: "Telangana", highlights: ["Gachibowli", "Jubilee Hills", "Madhapur", "Kondapur", "Banjara Hills"] },
  pune: { name: "Pune", state: "Maharashtra", highlights: ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi"] },
  chennai: { name: "Chennai", state: "Tamil Nadu", highlights: ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR"] },
  kolkata: { name: "Kolkata", state: "West Bengal", highlights: ["Salt Lake", "Park Street", "Ballygunge", "New Town", "Howrah"] },
  ahmedabad: { name: "Ahmedabad", state: "Gujarat", highlights: ["Satellite", "Bodakdev", "Vastrapur", "SG Highway", "Prahlad Nagar"] },
  aurangabad: { name: "Aurangabad", state: "Maharashtra", highlights: ["CIDCO", "Osmanpura", "Garkheda", "Jalna Road", "Beed Bypass"] },
};

/** Sports the product actually supports booking for. */
const SUPPORTED_SPORTS = "football, cricket, badminton, tennis and multipurpose venues";

const CITY_FAQS = [
  { question: "How do I book a football turf in {city}?", answer: "Visit turfzo.app/explore, select {city} as your city, browse the available football turfs, pick a date and time slot, and pay securely online. Every venue card shows its own hourly rate, and the exact price for your slot is confirmed at checkout before you pay." },
  { question: "Which areas can I browse in {city}?", answer: "You can browse across {city} from the explore page. Popular areas include: {highlights}. Each card links to the live availability for that city." },
  { question: "Can I cancel my booking?", answer: "Yes. You can cancel a booking from My Bookings. Cancellations more than 24 hours before the slot are refunded in full on the slot price, between 6 and 24 hours receive 50% of the slot price, and cancellations under 6 hours are non-refundable. The service fee is retained in every case." },
  { question: "What sports are available in {city}?", answer: "Turfzo lists {sports} across {city}. Use the sport filter on the explore page to see only relevant turfs." },
];

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city.toLowerCase()];
  if (!data) return { title: "City Not Found" };
  return {
    title: `Book Turfs in ${data.name} | Football, Cricket & More | Turfzo`,
    // No venue count and no invented "starting at" price — both were
    // fabricated and were being published as page metadata.
    description: `Book football turfs, cricket grounds, and sports venues in ${data.name} on Turfzo. Browse live availability and transparent per-hour pricing across ${data.name}.`,
    keywords: [`turf booking ${data.name}`, `football turf ${data.name}`, `cricket ground ${data.name}`, `book turf ${data.name}`, `${data.name} sports venue`],
    alternates: { canonical: `https://turfzo.app/cities/${city}` },
    openGraph: {
      title: `Book Turfs in ${data.name} | Turfzo`,
      description: `Browse ${SUPPORTED_SPORTS} in ${data.name} with real-time availability.`,
      url: `https://turfzo.app/cities/${city}`,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map((city) => ({ city }));
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const data = CITY_DATA[city.toLowerCase()];
  if (!data) notFound();

  const faqs = CITY_FAQS.map((f) => ({
    question: f.question.replace(/{city}/g, data.name),
    answer: f.answer
      .replace(/{city}/g, data.name)
      .replace(/{sports}/g, SUPPORTED_SPORTS)
      .replace(/{highlights}/g, data.highlights.join(", ")),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      {/* Canonical + OG come from generateMetadata above (Next metadata API).
          No invented-venue JSON-LD here: only Breadcrumb + FAQ schemas built
          from real page data. No hardcoded postal codes. */}
      <BreadcrumbListSchema items={[
        { name: "Home", url: "https://turfzo.app" },
        { name: "Explore", url: "https://turfzo.app/explore" },
        { name: data.name, url: `https://turfzo.app/cities/${city}` },
      ]} />
      <FAQPageSchema items={faqs} />
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="relative rounded-xl overflow-hidden border border-border-default shadow-sm p-8 sm:p-12 mb-12 min-h-[280px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center z-0 opacity-20 dark:opacity-40" style={{ backgroundImage: `url('/images/marketing/home/hero-turf-evening.webp')` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/95 to-bg/70 z-[1]" />

            <div className="relative z-10 text-left">
              <nav className="flex items-center gap-1.5 text-xs text-text-muted font-sans mb-4">
                <Link href="/" className="hover:text-text-main">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/explore" className="hover:text-text-main">Explore</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-text-main font-semibold">{data.name}</span>
              </nav>
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Book Turfs in {data.name}
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base font-sans max-w-2xl leading-relaxed">
                Browse football turfs, cricket grounds and sports venues across{" "}
                {data.name} with real-time slot availability and transparent
                per-hour pricing.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/explore?city=${city}`} className="bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all">
                  Browse {data.name} Turfs <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link href="/tournaments" className="bg-surface border border-border-default hover:border-brand-lime/30 text-text-main font-sans font-semibold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all">
                  <Trophy className="w-4 h-4 text-brand-lime" /> {data.name} Tournaments
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-sans font-bold text-2xl text-text-main tracking-tight text-left">Browse {data.name} by area</h2>
              <p className="text-sm text-text-muted font-sans -mt-3">
                These links open the live explore page filtered to {data.name}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.highlights.map((area) => (
                  <Link key={area} href={`/explore?city=${city}`}
                    className="bg-surface border border-border-default hover:border-border-strong rounded-xl p-5 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-sm text-text-main block">{area}</span>
                        <span className="text-[10px] text-text-muted">{data.name}, {data.state}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </Link>
                ))}
              </div>

              <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm mt-6 text-left">
                <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mb-4">
                  Why book turfs in {data.name} on Turfzo?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    `Real-time slot availability for venues in ${data.name}`,
                    `Secure online payment via UPI, cards, and net banking`,
                    `Pay at the venue if you prefer — the slot is held either way`,
                    `Free cancellation of the slot price up to 24 hours before your slot`,
                    `Every venue lists its own hourly rate and player reviews`,
                    `Book a turf or enter a tournament from the same account`,
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2 text-sm text-text-muted font-sans">
                      <CheckCircle2 className="w-4 h-4 text-brand-lime shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface border border-border-default rounded-xl p-6 text-left shadow-sm">
                <h3 className="font-sans font-bold text-base text-text-main tracking-tight pb-3 border-b border-border-subtle mb-4">
                  Quick facts
                </h3>
                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex justify-between"><span className="text-text-muted">City</span><span className="text-text-main font-bold">{data.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">State</span><span className="text-text-main font-bold">{data.state}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Sports</span><span className="text-text-main font-bold">Football, Cricket, Badminton, Tennis, Multi</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Pricing</span><span className="text-text-main font-bold">Per venue, per hour</span></div>
                </div>
                <p className="text-[11px] text-text-muted mt-4">
                  Live venue counts and prices are shown on the{" "}
                  <Link href={`/explore?city=${city}`} className="text-brand-lime hover:underline">
                    explore page
                  </Link>
                  , straight from each venue&apos;s own listing.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="font-sans font-bold text-2xl text-text-main tracking-tight mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.map((item, idx) => (
                <details key={idx} className="bg-surface border border-border-default rounded-xl p-5 group">
                  <summary className="font-sans font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-xs text-text-muted font-sans leading-relaxed">
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
