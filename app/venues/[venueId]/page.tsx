import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { MapPin, Star, ChevronRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { BreadcrumbListSchema, SportsActivityLocationSchema } from "@/lib/schema";
import { convexClient } from "@/lib/convex";
import { FavoriteButton } from "@/components/ui/favorite-button";
import type { Turf } from "@/lib/types";
import { getLocalTurfImage } from "@/lib/turf-images";

type Props = { params: Promise<{ venueId: string }> };

// React.cache dedupes this per request, so generateMetadata and the page
// body share one backend call instead of two.
const getTurf = cache((turfId: string) =>
  convexClient.query<Turf | null>("turfs:getById", { turfId }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId } = await params;
  try {
    const turf = await getTurf(venueId);
    if (!turf) return { title: "Venue Not Found" };

    const sport = turf.sport_type || "Sports";
    const city = turf.city || "India";
    const title = `${turf.name} | Book ${sport} Turf in ${city} | Turfzo`;
    const description = `Book ${turf.name} for ${sport}. Located in ${turf.address || city}. Instant booking, real-time availability, and verified reviews. Starts at ₹${turf.price_per_hour}/hr.`;

    return {
      title,
      description,
      keywords: [`${turf.name}`, `${sport} turf ${city}`, `book ${turf.name}`, `turf booking near me`],
      alternates: { canonical: `https://turfzo.app/venues/${venueId}` },
    };
  } catch {
    return { title: "Venue Not Found" };
  }
}

export default async function VenuePage({ params }: Props) {
  const { venueId } = await params;
  
  let turf: Turf | null = null;
  try {
    turf = await getTurf(venueId);
  } catch (err) {
    console.error("Failed to fetch venue:", err);
  }

  if (!turf) notFound();

  const sport = turf.sport_type || "Sports";
  const city = turf.city || "India";
  const venueImage = getLocalTurfImage(turf);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <BreadcrumbListSchema items={[
        { name: "Home", url: "https://turfzo.app" },
        { name: "Explore", url: "https://turfzo.app/explore" },
        { name: city, url: `https://turfzo.app/cities/${city.toLowerCase()}` },
        { name: turf.name, url: `https://turfzo.app/venues/${venueId}` },
      ]} />
      <SportsActivityLocationSchema
        name={turf.name}
        description={`Online booking for ${turf.name}. Play ${sport} in ${city}.`}
        address={{ streetAddress: turf.address || "", addressLocality: city, addressRegion: turf.state || "", postalCode: turf.zip_code || "" }}
        sportType={sport}
        pricePerHour={turf.price_per_hour || 1000}
        image={venueImage}
        openingHours="Mo-Su 06:00-23:00"
      />
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <div className="relative rounded-xl overflow-hidden border border-border-default shadow-sm mb-8 min-h-[350px]">
            <div className="absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-40" style={{ backgroundImage: `url(${encodeURI(venueImage)})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40 dark:from-bg dark:via-bg/60 dark:to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface border border-border-default text-xs font-bold text-brand-lime mb-4">
                <MapPin className="w-3.5 h-3.5" /> {city}
              </span>
              <h1 className="font-sans text-4xl font-extrabold text-text-main tracking-tight mb-2">
                {turf.name}
              </h1>
              <p className="text-text-muted text-sm max-w-2xl">
                {turf.address || "Location unavailable"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                <h2 className="font-sans font-bold text-xl text-text-main tracking-tight mb-4">About Venue</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-text-muted text-xs block mb-1">Sport</span>
                    <span className="font-semibold text-text-main">{sport}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block mb-1">Rating</span>
                    <span className="font-semibold text-text-main flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
                      {turf.rating || "New"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block mb-1">Price</span>
                    <span className="font-semibold text-text-main tabular-nums">₹{turf.price_per_hour}/hr</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs block mb-1">Size</span>
                    <span className="font-semibold text-text-main">{turf.format || "Standard"}</span>
                  </div>
                </div>

                <h3 className="font-sans font-bold text-base text-text-main tracking-tight mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {turf.amenities?.map((amenity, idx) => (
                    <span key={idx} className="bg-elevated px-3 py-1.5 rounded-md text-xs text-text-main font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-lime" /> {amenity}
                    </span>
                  ))}
                  {turf.has_floodlights && (
                    <span className="bg-elevated px-3 py-1.5 rounded-md text-xs text-text-main font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-lime" /> Floodlights
                    </span>
                  )}
                  {turf.has_free_parking && (
                    <span className="bg-elevated px-3 py-1.5 rounded-md text-xs text-text-main font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-lime" /> Free Parking
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm sticky top-24">
                <div className="text-center mb-6">
                  <span className="text-3xl font-extrabold text-text-main tabular-nums">₹{turf.price_per_hour}</span>
                  <span className="text-text-muted text-sm"> / hour</span>
                </div>
                <Link href={`/explore`} className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm py-4 px-6 rounded-md flex justify-center items-center gap-2 transition-all">
                  Check Availability & Book
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <FavoriteButton
                  turfId={venueId}
                  className="w-full py-3 px-6 mt-3"
                />
                <p className="text-center text-xs text-text-muted mt-4">
                  Free cancellation up to 24 hours in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
