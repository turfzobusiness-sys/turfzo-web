import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ChevronRight, Trophy, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQPageSchema, BreadcrumbListSchema, SportsActivityLocationSchema } from "@/lib/schema";

const CITY_DATA: Record<string, { name: string; state: string; venues: string; avgPrice: string; highlights: string[] }> = {
  bangalore: { name: "Bangalore", state: "Karnataka", venues: "20+", avgPrice: "₹1,100/hr", highlights: ["HSR Layout", "Koramangala", "Indiranagar", "Whitefield", "Marathahalli"] },
  mumbai: { name: "Mumbai", state: "Maharashtra", venues: "15+", avgPrice: "₹1,300/hr", highlights: ["Andheri", "Bandra", "Powai", "Lower Parel", "Goregaon"] },
  delhi: { name: "Delhi", state: "Delhi", venues: "12+", avgPrice: "₹1,400/hr", highlights: ["Saket", "Hauz Khas", "Dwarka", "Rohini", "Vasant Kunj"] },
  hyderabad: { name: "Hyderabad", state: "Telangana", venues: "10+", avgPrice: "₹1,000/hr", highlights: ["Gachibowli", "Jubilee Hills", "Madhapur", "Kondapur", "Banjara Hills"] },
  pune: { name: "Pune", state: "Maharashtra", venues: "8+", avgPrice: "₹1,200/hr", highlights: ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi"] },
  chennai: { name: "Chennai", state: "Tamil Nadu", venues: "8+", avgPrice: "₹950/hr", highlights: ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR"] },
  kolkata: { name: "Kolkata", state: "West Bengal", venues: "6+", avgPrice: "₹900/hr", highlights: ["Salt Lake", "Park Street", "Ballygunge", "New Town", "Howrah"] },
  ahmedabad: { name: "Ahmedabad", state: "Gujarat", venues: "5+", avgPrice: "₹850/hr", highlights: ["Satellite", "Bodakdev", "Vastrapur", "SG Highway", "Prahlad Nagar"] },
};

const CITY_FAQS = [
  { question: "How much does turf booking cost in {city}?", answer: "Turf booking in {city} typically costs ₹{avgPrice} depending on the venue, sport, and time of day. Premium turfs with floodlights and changing rooms may charge more, while off-peak hours (mornings, late nights) are usually discounted." },
  { question: "How do I book a football turf in {city}?", answer: "Visit turfzo.com/explore, select {city} as your city, browse available football turfs, pick a date and time slot, and pay securely online. Your booking is confirmed instantly with a QR code ticket." },
  { question: "Which are the best areas to play in {city}?", answer: "The most popular areas for turf sports in {city} are: {highlights}. These neighborhoods offer easy access, ample parking, and quality floodlit venues." },
  { question: "Can I cancel my booking?", answer: "Yes, you can cancel your booking up to 24 hours before the slot for a full refund, 6-24 hours for a 50% refund, and no refund within 6 hours of the slot." },
  { question: "What sports are available in {city}?", answer: "Turfzo lists football, cricket, badminton, and multipurpose sports venues across {city}. Use the sport filter on the explore page to see only relevant turfs." },
];

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city.toLowerCase()];
  if (!data) return { title: "City Not Found" };
  return {
    title: `Book Turfs in ${data.name} | Football, Cricket & More | Turfzo`,
    description: `Book football turfs, cricket grounds, and sports venues in ${data.name} starting at ${data.avgPrice}. ${data.venues} verified turfs across ${data.highlights.slice(0, 3).join(", ")} and more. Real-time availability, secure payment, instant confirmation.`,
    keywords: [`turf booking ${data.name}`, `football turf ${data.name}`, `cricket ground ${data.name}`, `book turf ${data.name}`, `${data.name} sports venue`],
    alternates: { canonical: `https://turfzo.com/cities/${city}` },
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
    question: f.question.replace(/{city}/g, data.name).replace(/{avgPrice}/g, data.avgPrice),
    answer: f.answer.replace(/{city}/g, data.name).replace(/{avgPrice}/g, data.avgPrice).replace(/{highlights}/g, data.highlights.join(", ")),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <head>
        <link rel="canonical" href={`https://turfzo.com/cities/${city}`} />
        <meta property="og:title" content={`Book Turfs in ${data.name} | Turfzo`} />
        <meta property="og:description" content={`${data.venues} verified turfs in ${data.name}. Book instantly with real-time availability.`} />
        <meta property="og:url" content={`https://turfzo.com/cities/${city}`} />
      </head>
      <BreadcrumbListSchema items={[
        { name: "Home", url: "https://turfzo.com" },
        { name: "Explore", url: "https://turfzo.com/explore" },
        { name: data.name, url: `https://turfzo.com/cities/${city}` },
      ]} />
      <FAQPageSchema items={faqs} />
      <SportsActivityLocationSchema
        name={`Turfzo ${data.name} - Premium Turf Booking`}
        description={`Online booking for football turfs, cricket grounds, and sports venues across ${data.name}.`}
        address={{ streetAddress: data.highlights[0], addressLocality: data.name, addressRegion: data.state, postalCode: "560001" }}
        sportType="Football"
        pricePerHour={parseInt(data.avgPrice.replace(/[^\d]/g, "")) || 1000}
        image="/stadium_turf_bg.png"
        openingHours="Mo-Su 06:00-23:00"
      />
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-card-shadow p-8 sm:p-12 mb-12 min-h-[280px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: `url('/stadium_turf_bg.png')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/70 to-transparent z-0" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-left">
              <nav className="flex items-center gap-1.5 text-xs text-text-muted font-sans mb-4">
                <Link href="/" className="hover:text-brand-lime">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/explore" className="hover:text-brand-lime">Explore</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand-lime">{data.name}</span>
              </nav>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface-dark border border-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime mb-4">
                <MapPin className="w-3.5 h-3.5" /> {data.state}
              </span>
              <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Book Turfs in <span className="text-brand-lime">{data.name}</span>
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base font-sans max-w-2xl leading-relaxed">
                Book football turfs, cricket grounds, and sports venues across {data.name} starting at {data.avgPrice}. {data.venues} verified turfs in {data.highlights.slice(0, 3).join(", ")} and more. Real-time availability, secure payment, instant confirmation.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/explore?city=${city}`} className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3 px-6 rounded-pill inline-flex items-center gap-1.5 transition-all">
                  Browse {data.name} Turfs <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link href="/tournaments" className="bg-surface-dark border border-white/10 hover:border-brand-lime/30 text-text-main font-poppins font-semibold text-sm py-3 px-6 rounded-pill inline-flex items-center gap-1.5 transition-all">
                  <Trophy className="w-4 h-4 text-brand-lime" /> {data.name} Tournaments
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-poppins font-bold text-2xl text-text-main text-left">Popular areas in {data.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.highlights.map((area) => (
                  <Link key={area} href={`/explore?city=${city}`}
                    className="bg-surface-dark border border-white/5 hover:border-brand-lime/20 rounded-md p-5 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-poppins font-bold text-sm text-text-main block">{area}</span>
                        <span className="text-[10px] text-text-muted">Football · Cricket · Multi-sport</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </Link>
                ))}
              </div>

              <div className="bg-surface-dark border border-white/5 rounded-md p-6 shadow-card-shadow mt-6 text-left">
                <h2 className="font-poppins font-bold text-xl text-text-main mb-4">
                  Why book turfs in {data.name} on Turfzo?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    `Instant booking confirmation with QR code tickets`,
                    `Real-time slot availability across ${data.venues} venues`,
                    `Secure online payment via UPI, cards, and net banking`,
                    `Free cancellation up to 24 hours before your slot`,
                    `Bill-splitting with teammates at checkout`,
                    `Verified venues with photos, amenities, and reviews`,
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
              <div className="bg-surface-dark border border-white/5 rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main pb-3 border-b border-white/5 mb-4">
                  Quick facts
                </h3>
                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex justify-between"><span className="text-text-muted">Venues</span><span className="text-text-main font-bold">{data.venues}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Average price</span><span className="text-brand-lime font-bold">{data.avgPrice}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Sports available</span><span className="text-text-main font-bold">Football, Cricket, Multi</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Booking time</span><span className="text-text-main font-bold">2 minutes</span></div>
                </div>
              </div>

              <div className="bg-surface-dark border border-white/5 rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-poppins font-bold text-base text-text-main pb-3 border-b border-white/5 mb-4">
                  Popular turfs in {data.name}
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { name: `${data.highlights[0]} Football Arena`, rating: 4.8, price: 1100 },
                    { name: `${data.highlights[1] || data.highlights[0]} Sports Hub`, rating: 4.6, price: 950 },
                    { name: `${data.highlights[2] || data.highlights[0]} Premier Turf`, rating: 4.7, price: 1300 },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-xs font-sans">
                      <div>
                        <span className="block font-semibold text-text-main">{t.name}</span>
                        <span className="flex items-center gap-1 text-text-muted mt-0.5">
                          <Star className="w-3 h-3 fill-brand-lime text-brand-lime" /> {t.rating}
                        </span>
                      </div>
                      <span className="font-poppins font-extrabold text-brand-lime">₹{t.price}/hr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="font-poppins font-bold text-2xl text-text-main mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.map((item, idx) => (
                <details key={idx} className="bg-surface-dark border border-white/5 rounded-md p-5 group">
                  <summary className="font-poppins font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
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
