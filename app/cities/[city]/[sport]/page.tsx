import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight, Star } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import {
  FAQPageSchema,
  BreadcrumbListSchema,
  ItemListSchema,
} from "@/lib/schema";
import {
  buildOpenGraph,
  getLiveTurfs,
  getMatchingSportSlugs,
  isCitySportIndexable,
  normalizeCityToSlug,
} from "@/lib/seo";
import { getLocalTurfImage } from "@/lib/turf-images";

export const revalidate = 300;

/** Geography only — see app/cities/[city]/page.tsx for why the venue counts
 *  and average prices were removed. */
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

/**
 * Sports Turfzo actually supports. "pickleball" was listed here and in the
 * profile sport picker, but it has no support anywhere in the product — no
 * slot, pricing or venue data — so it is dropped.
 */
const SPORTS = ["football", "cricket", "badminton", "tennis", "multipurpose"];

type Props = { params: Promise<{ city: string; sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, sport } = await params;
  const citySlug = city.toLowerCase();
  const sportSlug = sport.toLowerCase();
  const data = CITY_DATA[citySlug];
  if (!data || !SPORTS.includes(sportSlug)) notFound();
  const formattedSport = sportSlug.charAt(0).toUpperCase() + sportSlug.slice(1);

  const indexable = await isCitySportIndexable(citySlug, sportSlug);
  const title = `Book ${formattedSport} Turfs in ${data.name} — Prices & Areas`;
  const description = `Looking for ${formattedSport.toLowerCase()} in ${data.name}? See every Turfzo listing's hourly rate, amenities and live slot availability, then book online.`;

  return {
    title,
    // No invented "starting at ₹X/hr" and no venue count.
    description,
    keywords: [`${sportSlug} turf booking ${data.name}`, `book ${sportSlug} turf ${data.name}`, `${sportSlug} ground ${data.name}`, `${data.name} ${sportSlug} venue`],
    alternates: { canonical: `https://turfzo.app/cities/${citySlug}/${sportSlug}` },
    // Auto-indexes per (city, sport) once Convex has 1+ real non-mock venue matching both.
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: buildOpenGraph({
      title,
      description,
      url: `https://turfzo.app/cities/${citySlug}/${sportSlug}`,
    }),
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
  const citySlug = city.toLowerCase();
  const sportSlug = sport.toLowerCase();
  const data = CITY_DATA[citySlug];
  if (!data || !SPORTS.includes(sportSlug)) notFound();

  const [indexable, liveTurfs] = await Promise.all([
    isCitySportIndexable(citySlug, sportSlug),
    getLiveTurfs(),
  ]);
  const matchingVenues = liveTurfs.filter(
    (t) =>
      normalizeCityToSlug(t.city) === citySlug &&
      getMatchingSportSlugs(t.sport_type).includes(sportSlug),
  );

  const formattedSport = sportSlug.charAt(0).toUpperCase() + sportSlug.slice(1);

  const faqs = [
    { question: `How much does a ${formattedSport} turf cost in ${data.name}?`, answer: `Prices are set by each venue and shown on its card, so they vary. Open the explore page filtered to ${data.name} to see every listed rate, then confirm the exact price for your slot at checkout.` },
    { question: `Where are the best ${formattedSport} venues in ${data.name}?`, answer: `You can browse across ${data.name} from the explore page. Areas worth checking include ${data.highlights.join(", ")}.` },
    { question: `Do ${formattedSport} turfs in ${data.name} provide equipment?`, answer: `Each venue lists its own amenities, including whether equipment rental is available. Check the venue's "What this turf offers" section before you book.` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      {/* Canonical comes from generateMetadata (Next metadata API).
          Structured data is derived strictly from live Convex venues + FAQs. */}
      <BreadcrumbListSchema items={[
        { name: "Home", url: "https://turfzo.app" },
        { name: "Explore", url: "https://turfzo.app/explore" },
        { name: data.name, url: `https://turfzo.app/cities/${citySlug}` },
        { name: formattedSport, url: `https://turfzo.app/cities/${citySlug}/${sportSlug}` },
      ]} />
      <FAQPageSchema items={faqs} />
      {matchingVenues.length > 0 && (
        <ItemListSchema
          name={`${formattedSport} Venues in ${data.name}`}
          url={`https://turfzo.app/cities/${citySlug}/${sportSlug}`}
          items={matchingVenues.slice(0, 12).map((v) => ({
            name: v.name,
            url: `https://turfzo.app/venues/${v._id}`,
          }))}
        />
      )}
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
                <Link href={`/cities/${citySlug}`} className="hover:text-text-main">{data.name}</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-text-main font-semibold">{formattedSport}</span>
              </nav>
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Book {formattedSport} Turfs in <span>{data.name}</span>
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base font-sans max-w-2xl leading-relaxed">
                Browse {formattedSport.toLowerCase()} venues across {data.name}{" "}
                with real-time slot availability. Every venue sets its own
                hourly rate, shown on its card.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/explore?city=${citySlug}&sport=${sportSlug}`} rel="nofollow" className="bg-text-main hover:bg-text-main/90 text-bg font-sans font-bold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all">
                  Browse {formattedSport} Turfs <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link href={`/sports/${sportSlug}`} className="bg-surface border border-border-default hover:border-brand-lime/30 text-text-main font-sans font-semibold text-sm py-3 px-5 rounded-md inline-flex items-center gap-1.5 transition-all">
                  All {formattedSport} Guides
                </Link>
              </div>
            </div>
          </div>

          {!indexable && (
            <div className="mb-10 rounded-xl border border-brand-lime/30 bg-brand-lime/5 p-5 text-sm font-sans text-text-main">
              <span className="font-bold">
                Turfzo is onboarding {formattedSport.toLowerCase()} venues in {data.name}.
              </span>{" "}
              <span className="text-text-muted">
                Browse live venues on{" "}
                <Link href="/explore" className="text-brand-lime hover:underline">
                  Explore
                </Link>
                , or{" "}
                <Link href="/owners" className="text-brand-lime hover:underline">
                  list your turf
                </Link>{" "}
                to be one of the first venues in the city.
              </span>
            </div>
          )}

          {matchingVenues.length > 0 && (
            <section className="mb-12" aria-label={`Live ${formattedSport} venues in ${data.name}`}>
              <div className="mb-5">
                <h2 className="font-sans font-bold text-2xl text-text-main tracking-tight text-left">
                  Live {formattedSport} Venues in {data.name}
                </h2>
                <p className="text-sm text-text-muted font-sans mt-1">
                  {matchingVenues.length} active {formattedSport.toLowerCase()} venue{matchingVenues.length === 1 ? "" : "s"} with live hourly slots
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {matchingVenues.map((v) => (
                  <div
                    key={v._id}
                    className="bg-surface border border-border-default hover:border-border-strong rounded-xl overflow-hidden flex flex-col transition-all"
                  >
                    <Link href={`/venues/${v._id}`} className="relative aspect-[4/3] bg-elevated block overflow-hidden group">
                      <Image
                        src={getLocalTurfImage(v)}
                        alt={`${v.name} — ${formattedSport} venue in ${data.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                            <span className="truncate">{v.address || v.location_name || data.name}</span>
                          </span>
                          {typeof v.rating === "number" && v.rating > 0 && (
                            <span className="inline-flex items-center gap-1 font-semibold text-text-main shrink-0 ml-2">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {v.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <Link href={`/venues/${v._id}`}>
                          <h3 className="font-sans font-bold text-base text-text-main hover:text-brand-lime transition-colors">
                            {v.name}
                          </h3>
                        </Link>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between">
                        <Link
                          href={`/venues/${v._id}`}
                          className="text-xs font-semibold text-brand-lime hover:underline inline-flex items-center gap-1"
                        >
                          View slots <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <span className="text-sm font-bold text-text-main tabular-nums">
                          ₹{v.price_per_hour.toLocaleString("en-IN")}/hr
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="font-sans font-bold text-2xl text-text-main tracking-tight text-left">Browse {data.name} by area</h2>
              <p className="text-sm text-text-muted font-sans -mt-3">
                These links open the live explore page filtered to {formattedSport.toLowerCase()} in {data.name}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.highlights.map((area) => (
                  <Link key={area} href={`/explore?city=${citySlug}&sport=${sportSlug}`} rel="nofollow"
                    className="bg-surface border border-border-default hover:border-border-strong rounded-xl p-5 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-text-main">
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
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface border border-border-default rounded-xl p-6 text-left shadow-sm">
                <h3 className="font-sans font-bold text-base text-text-main tracking-tight pb-3 border-b border-border-subtle mb-4">
                  Quick facts
                </h3>
                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex justify-between"><span className="text-text-muted">City</span><span className="text-text-main font-bold">{data.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">State</span><span className="text-text-main font-bold">{data.state}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Sport</span><span className="text-text-main font-bold">{formattedSport}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Live venues</span><span className="text-text-main font-bold">{matchingVenues.length}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Pricing</span><span className="text-text-main font-bold">Per venue, per hour</span></div>
                </div>
                <p className="text-[11px] text-text-muted mt-4">
                  Live slot availability is on the{" "}
                  <Link href="/explore" className="text-brand-lime hover:underline">
                    explore page
                  </Link>
                  .
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
