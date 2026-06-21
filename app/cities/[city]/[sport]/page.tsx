import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, ChevronRight, Trophy, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/ui/header-2";
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

const SPORTS = ["football", "cricket", "badminton", "tennis", "pickleball"];

type Props = { params: Promise<{ city: string; sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, sport } = await params;
  const data = CITY_DATA[city.toLowerCase()];
  if (!data || !SPORTS.includes(sport.toLowerCase())) return { title: "Not Found" };
  const formattedSport = sport.charAt(0).toUpperCase() + sport.slice(1);

  return {
    title: `Book ${formattedSport} Turfs in ${data.name} | Turfzo`,
    description: `Looking to play ${formattedSport} in ${data.name}? Book premium ${formattedSport} turfs starting at ${data.avgPrice}. Verified venues in ${data.highlights.slice(0, 3).join(", ")}. Instant confirmation.`,
    keywords: [`${sport} turf booking ${data.name}`, `book ${sport} turf ${data.name}`, `${sport} ground ${data.name}`, `${data.name} ${sport} venue`],
    alternates: { canonical: `https://turfzo.app/cities/${city}/${sport}` },
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const city of Object.keys(CITY_DATA)) {
    for (const sport of SPORTS) {
      params.push({ city, sport });
    }
  }
  return params;
}

export default async function CitySportPage({ params }: Props) {
  const { city, sport } = await params;
  const data = CITY_DATA[city.toLowerCase()];
  if (!data || !SPORTS.includes(sport.toLowerCase())) notFound();

  const formattedSport = sport.charAt(0).toUpperCase() + sport.slice(1);

  const faqs = [
    { question: `How much does a ${formattedSport} turf cost in ${data.name}?`, answer: `${formattedSport} turfs in ${data.name} typically start around ${data.avgPrice} per hour, depending on the area and time.` },
    { question: `Where are the best ${formattedSport} venues in ${data.name}?`, answer: `Top locations for ${formattedSport} in ${data.name} include ${data.highlights.join(", ")}.` },
    { question: `Do ${formattedSport} turfs in ${data.name} provide equipment?`, answer: `Many ${formattedSport} turfs provide basic equipment, but it's always recommended to carry your own gear or confirm with the venue during booking.` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <link rel="canonical" href={`https://turfzo.app/cities/${city}/${sport}`} />
      </head>
      <BreadcrumbListSchema items={[
        { name: "Home", url: "https://turfzo.app" },
        { name: "Explore", url: "https://turfzo.app/explore" },
        { name: data.name, url: `https://turfzo.app/cities/${city}` },
        { name: formattedSport, url: `https://turfzo.app/cities/${city}/${sport}` },
      ]} />
      <FAQPageSchema items={faqs} />
      <SportsActivityLocationSchema
        name={`Turfzo ${data.name} - ${formattedSport} Turf Booking`}
        description={`Online booking for ${formattedSport} turfs and grounds across ${data.name}.`}
        address={{ streetAddress: data.highlights[0], addressLocality: data.name, addressRegion: data.state, postalCode: "560001" }}
        sportType={formattedSport}
        pricePerHour={parseInt(data.avgPrice.replace(/[^\d]/g, "")) || 1000}
        image="/stadium_turf_bg.png"
        openingHours="Mo-Su 06:00-23:00"
      />
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="relative rounded-lg overflow-hidden border border-border-default shadow-card-shadow p-8 sm:p-12 mb-12 min-h-[280px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40" style={{ backgroundImage: `url('/stadium_turf_bg.png')` }} />
            
            <div className="relative z-10 text-left">
              <nav className="flex items-center gap-1.5 text-xs text-text-muted font-sans mb-4">
                <Link href="/" className="hover:text-text-main">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/explore" className="hover:text-text-main">Explore</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/cities/${city}`} className="hover:text-text-main">{data.name}</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-text-main font-semibold">{formattedSport}</span>
              </nav>
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Book {formattedSport} Turfs in <span>{data.name}</span>
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base font-sans max-w-2xl leading-relaxed">
                Looking to play {formattedSport}? Book premium turfs and grounds across {data.name} starting at {data.avgPrice}. Discover {data.venues} verified venues in {data.highlights.slice(0, 3).join(", ")} and more.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/explore?city=${city}&sport=${sport}`} className="bg-text-main hover:bg-text-main/90 text-bg font-sans font-bold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all">
                  Browse {formattedSport} Turfs <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-sans font-bold text-2xl text-text-main text-left">Popular {formattedSport} areas in {data.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.highlights.map((area) => (
                  <Link key={area} href={`/explore?city=${city}&sport=${sport}`}
                    className="bg-surface border border-border-default hover:border-border-strong rounded-md p-5 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-text-main">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-sm text-text-main block">{area}</span>
                        <span className="text-[10px] text-text-muted">{formattedSport} pitches</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface border border-border-default rounded-md p-6 text-left shadow-card-shadow">
                <h3 className="font-sans font-bold text-base text-text-main pb-3 border-b border-border-subtle mb-4">
                  Quick facts
                </h3>
                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex justify-between"><span className="text-text-muted">Venues</span><span className="text-text-main font-bold">{data.venues}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Average price</span><span className="text-text-main font-bold">{data.avgPrice}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Sport</span><span className="text-text-main font-bold">{formattedSport}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="font-sans font-bold text-2xl text-text-main mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.map((item, idx) => (
                <details key={idx} className="bg-surface border border-border-default rounded-md p-5 group">
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
