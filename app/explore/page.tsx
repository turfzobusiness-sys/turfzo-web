"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronDown,
  Star,
  Calendar as CalendarIcon,
  CreditCard,
  Award,
  Grid,
  List,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Heart,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  Download,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openRazorpayCheckout } from "@/lib/razorpay";
import type { Turf as ConvexTurf, Booking } from "@/lib/types";
import { FAQPageSchema } from "@/lib/schema";
import QRCode from "qrcode";

const exploreFaqItems = [
  { question: "How do I find a football turf near me?", answer: "Visit turfzo.com/explore, select your city, and browse available football turfs. You can filter by location, price, amenities, and availability. Real-time slots are shown for each venue." },
  { question: "What is the average turf booking price in India?", answer: "Turf booking prices in India range from ₹500 to ₹2000 per hour. Football turfs typically cost ₹800-1500/hour in metro cities like Bangalore, Mumbai, and Delhi. Prices vary by location, amenities, and time of day." },
  { question: "Can I book a turf for tonight?", answer: "Yes, Turfzo shows real-time availability. If a turf has open slots for tonight, you can book it instantly. The booking is confirmed immediately with a QR code ticket." },
  { question: "How many turfs are available on Turfzo?", answer: "Turfzo has 50+ verified turfs across 8 major Indian cities including Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, and Ahmedabad." },
  { question: "What sports can I book on Turfzo?", answer: "Turfzo supports football, cricket, badminton, tennis, and multipurpose sports venues. Each sport has dedicated filters to help you find the right venue." },
  { question: "Is there a cancellation policy?", answer: "Yes, you can cancel your booking up to 24 hours before the scheduled time for a full refund, 6-24 hours for a 50% refund, and no refund within 6 hours of the slot." },
];

interface TurfDisplay {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  sport: string;
  size: string;
  premium: boolean;
  facilities: string[];
  image: string;
  city?: string;
}

function mapTurf(t: ConvexTurf): TurfDisplay {
  const location = [t.city, t.state].filter(Boolean).join(", ");
  return {
    id: t._id,
    name: t.name,
    location: location || t.address || "Location not set",
    rating: t.rating ?? 0,
    reviews: t.review_count ?? 0,
    price: t.price_per_hour,
    sport: t.sport_type ?? "Multipurpose",
    size: t.format ?? "N/A",
    premium: t.tier === "premium",
    facilities: t.amenities ?? [],
    image: t.image_url || "/stadium_turf_bg.png",
    city: t.city,
  };
}

type FlowStep = "listing" | "slots" | "checkout" | "processing" | "confirmed" | "error";

interface SlotInfo {
  time: string;
  available: boolean;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseSlotTime(date: string, slot: string): { start: Date; end: Date } | null {
  const match = slot.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, sh, sm, eh, em] = match;
  const start = new Date(date);
  start.setHours(parseInt(sh), parseInt(sm), 0, 0);
  const end = new Date(date);
  end.setHours(parseInt(eh), parseInt(em), 0, 0);
  return { start, end };
}

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function ExplorePage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser } = useAuth();
  const [flowStep, setFlowStep] = useState<FlowStep>("listing");
  const [selectedTurf, setSelectedTurf] = useState<TurfDisplay | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [allTurfs, setAllTurfs] = useState<TurfDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [downloadQrUrl, setDownloadQrUrl] = useState<string>("");

  const [searchLocation, setSearchLocation] = useState("Bengaluru, Karnataka");
  const [searchDate, setSearchDate] = useState(() => toDateKey(new Date()));

  const [selectedSports, setSelectedSports] = useState<string[]>(["Football"]);
  const [priceRange, setPriceRange] = useState(3000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Popular");

  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPitch, setSelectedPitch] = useState("Pitch 1 (Premium Turf)");
  const [selectedPayment, setSelectedPayment] = useState<"upi" | "card" | "netbanking">("upi");
  const [attendees, setAttendees] = useState(10);

  useEffect(() => {
    async function fetchTurfs() {
      try {
        const data = await convexClient.query<ConvexTurf[]>("turfs:getAvailable", {});
        setAllTurfs(data.map(mapTurf));
      } catch (err) {
        console.error("Failed to fetch turfs:", err);
        setLoadError("Could not load turfs. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (flowStep === "slots" && selectedTurf) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const slots = await convexClient.query<SlotInfo[]>(
            "turfs:getAvailableSlots",
            { turf_id: selectedTurf.id, date: selectedDate }
          );
          setAvailableSlots(slots);
          setSelectedTimeSlot(null);
        } catch (err) {
          console.error("Failed to fetch slots:", err);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [flowStep, selectedTurf, selectedDate]);

  const filteredTurfs = useMemo(() => {
    let result = allTurfs;
    if (selectedSports.length > 0) {
      result = result.filter((t) => selectedSports.includes(t.sport));
    }
    result = result.filter((t) => t.price <= priceRange);
    if (selectedFacilities.length > 0) {
      result = result.filter((t) =>
        selectedFacilities.every((f) => t.facilities.includes(f))
      );
    }
    if (sortBy === "Popular") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [allTurfs, selectedSports, priceRange, selectedFacilities, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleResetFilters = () => {
    setSelectedSports(["Football"]);
    setPriceRange(3000);
    setSelectedFacilities([]);
    setSortBy("Popular");
  };

  const handleOpenSlots = (turf: TurfDisplay) => {
    setSelectedTurf(turf);
    setSelectedPitch(turf.premium ? "Pitch 1 (Premium Turf)" : "Pitch 1 (Standard Turf)");
    setFlowStep("slots");
  };

  const handleProceedToCheckout = () => {
    if (!selectedTimeSlot) return;
    if (status !== "authenticated") {
      router.push("/auth/login?redirect=/explore");
      return;
    }
    setBookingError(null);
    setFlowStep("checkout");
  };

  const getPricingDetails = () => {
    if (!selectedTurf) return { subtotal: 0, convenience: 0, gst: 0, total: 0, totalPaise: 0 };
    const subtotal = selectedTurf.price;
    const convenience = Math.round(subtotal * 0.018);
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + convenience + gst;
    return { subtotal, convenience, gst, total, totalPaise: total * 100 };
  };

  const handlePayNow = async () => {
    if (!selectedTurf || !selectedTimeSlot || !firebaseUser) {
      setBookingError("Missing booking details. Please try again.");
      return;
    }
    const parsed = parseSlotTime(selectedDate, selectedTimeSlot);
    if (!parsed) {
      setBookingError("Invalid time slot selected.");
      return;
    }
    setFlowStep("processing");
    setBookingError(null);

    const { convenience, gst, total, totalPaise } = getPricingDetails();
    const receipt = `turf_${Date.now()}`;
    const clientRequestId = `turf_${firebaseUser.uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const order = await convexClient.action<{
        id: string;
        key_id: string;
        amount: number;
        mock?: boolean;
        idempotent_replay?: boolean;
      }>("payments:createRazorpayOrder", {
        amount: totalPaise,
        currency: "INR",
        receipt,
        client_request_id: clientRequestId,
        type: "turf_booking",
      });

      const paymentResponse = await openRazorpayCheckout({
        orderId: order.id,
        amountInPaise: totalPaise,
        description: `Turf booking at ${selectedTurf.name}`,
        customerName: convexUser?.display_name ?? convexUser?.full_name ?? firebaseUser.displayName ?? undefined,
        customerEmail: convexUser?.email ?? firebaseUser.email ?? undefined,
        customerPhone: convexUser?.phone_number ?? undefined,
        notes: { turf_id: selectedTurf.id, date: selectedDate },
      });

      const verifyResult = await convexClient.action<{ verified: boolean; mock?: boolean }>(
        "payments:verifyRazorpayPayment",
        {
          order_id: paymentResponse.razorpay_order_id,
          payment_id: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature,
        }
      );

      if (!verifyResult.verified) {
        throw new Error("Payment verification failed. Please contact support.");
      }

      const pendingBooking = await convexClient.mutation<Booking>("bookings:createPending", {
        turf_id: selectedTurf.id,
        start_time: parsed.start.toISOString(),
        end_time: parsed.end.toISOString(),
        total_price: total,
        service_fee: convenience + gst,
        attendees,
        razorpay_order_id: paymentResponse.razorpay_order_id,
      });

      const confirmed = await convexClient.mutation<Booking>("bookings:confirmPaid", {
        booking_id: pendingBooking._id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      setConfirmedBooking(confirmed);
      const qrPayload = JSON.stringify({
        code: confirmed.booking_code,
        turf: selectedTurf.name,
        date: selectedDate,
        slot: selectedTimeSlot,
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 256,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrCodeUrl(qrDataUrl);
      setDownloadQrUrl(qrDataUrl);
      setFlowStep("confirmed");
    } catch (err) {
      console.error("Payment/booking error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setBookingError(msg);
      setFlowStep("error");
    }
  };

  const handleDownloadTicket = () => {
    if (!confirmedBooking || !selectedTurf) return;
    const link = document.createElement("a");
    link.href = downloadQrUrl;
    link.download = `turfzo-ticket-${confirmedBooking.booking_code}.png`;
    link.click();
  };

  const pricing = getPricingDetails();
  const sportOptions = useMemo(
    () => Array.from(new Set(allTurfs.map((t) => t.sport))).sort(),
    [allTurfs]
  );

  const dateOptions = useMemo(() => {
    const dates: { value: string; label: string; weekday: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        value: toDateKey(d),
        label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return dates;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>Explore Turfs Near You | Book Football, Cricket & More | Turfzo</title>
        <meta name="description" content="Browse 50+ verified football turfs, cricket grounds, and sports venues across India. Filter by sport, price, and amenities. Real-time availability, instant booking, and secure online payment." />
        <link rel="canonical" href="https://turfzo.com/explore" />
        <meta property="og:title" content="Explore Turfs Near You | Turfzo" />
        <meta property="og:description" content="Browse 50+ verified turfs across India. Book football, cricket, badminton, and tennis venues instantly." />
        <meta property="og:url" content="https://turfzo.com/explore" />
      </head>
      <FAQPageSchema items={exploreFaqItems} />
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        {flowStep === "listing" && (
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="relative rounded-lg overflow-hidden border border-border-default shadow-card-shadow p-8 sm:p-12 mb-10 min-h-[220px] flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
                style={{ backgroundImage: `url('/stadium_turf_bg.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent z-0" />

              <div className="relative z-10 text-left mb-6">
                <span className="text-xs font-poppins font-extrabold tracking-widest text-brand-lime uppercase">
                  EXPLORE TURFS
                </span>
                <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-2 leading-none">
                  Find & Book <br />
                  The <span className="text-brand-lime">Best Turfs</span>
                </h1>
                <p className="mt-2 text-text-muted text-sm font-sans">
                  Browse {allTurfs.length}+ verified turfs across India. Filter by sport, price, and amenities. Book in 2 minutes with instant confirmation and secure online payment.
                </p>
              </div>

              <div className="relative z-10 w-full bg-surface/90 backdrop-blur-md border border-border-default rounded-pill p-2 pl-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-card-shadow mt-4">
                <div className="flex items-center gap-3 border-r border-border-subtle pr-4 py-2">
                  <MapPin className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Location</span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="bg-transparent text-xs text-text-main font-semibold mt-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-r border-border-subtle pr-4 py-2">
                  <CalendarIcon className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Date</span>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="bg-transparent text-xs text-text-main font-semibold mt-1 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 border-r border-border-subtle pr-4 py-2">
                  <Clock className="w-5 h-5 text-brand-lime shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] text-text-muted font-sans font-semibold uppercase tracking-wider">Sport</span>
                    <span className="text-xs text-text-main font-semibold mt-1">Football</span>
                  </div>
                </div>

                <button className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3.5 px-6 rounded-pill transition-all duration-300 w-full">
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-3 bg-surface border border-border-default rounded-md p-6 flex flex-col gap-6 sticky top-24">
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-lime" />
                    <span className="font-poppins font-bold text-base text-text-main">Filters</span>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-sans text-text-muted hover:text-brand-lime transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Sport</span>
                  <div className="flex flex-col gap-2">
                    {sportOptions.length === 0 ? (
                      <span className="text-xs text-text-muted">No sports available</span>
                    ) : (
                      sportOptions.map((sport) => {
                        const isChecked = selectedSports.includes(sport);
                        return (
                          <label key={sport} className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-main cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedSports(selectedSports.filter((s) => s !== sport));
                                } else {
                                  setSelectedSports([...selectedSports, sport]);
                                }
                              }}
                              className="w-4 h-4 rounded accent-brand-lime"
                            />
                            <span>{sport}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border-subtle pt-5">
                  <div className="flex justify-between items-center text-xs font-poppins font-bold uppercase text-text-main tracking-wider">
                    <span>Max Price</span>
                    <span className="text-brand-lime font-sans font-bold text-sm">₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-elevated rounded-lg appearance-none cursor-pointer accent-brand-lime"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-sans">
                    <span>₹500</span>
                    <span>₹3000+</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border-subtle pt-5">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Facilities</span>
                  <div className="flex flex-col gap-2">
                    {["Flood Lights", "Parking", "Changing Room", "Cafeteria"].map((facility) => {
                      const isChecked = selectedFacilities.includes(facility);
                      return (
                        <label key={facility} className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-main cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
                              } else {
                                setSelectedFacilities([...selectedFacilities, facility]);
                              }
                            }}
                            className="w-4 h-4 rounded accent-brand-lime"
                          />
                          <span>{facility}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-bold text-sm text-text-muted">
                    <span className="text-brand-lime">{filteredTurfs.length}</span> Turfs found
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
                      <span>Sort by:</span>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-surface border border-border-subtle text-text-main py-1.5 pl-3 pr-8 rounded-md font-semibold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option>Popular</option>
                          <option>Price: Low to High</option>
                          <option>Price: High to Low</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex items-center bg-surface border border-border-subtle rounded-md p-1 gap-1">
                      <button className="p-1 bg-elevated text-brand-lime rounded"><List className="w-4 h-4" /></button>
                      <button className="p-1 text-text-muted hover:text-brand-lime rounded"><Grid className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                {loadError && (
                  <div className="bg-error/10 border border-error/20 rounded-md p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-error shrink-0" />
                    <p className="text-sm text-error font-sans">{loadError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {loading ? (
                    <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                      <h3 className="font-poppins font-bold text-lg text-text-main">Loading Turfs</h3>
                      <p className="text-text-muted text-sm font-sans max-w-xs">Fetching the best venues near you...</p>
                    </div>
                  ) : filteredTurfs.length === 0 ? (
                    <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center justify-center gap-4">
                      <SlidersHorizontal className="w-12 h-12 text-text-muted opacity-50" />
                      <h3 className="font-poppins font-bold text-lg text-text-main">No Venues Found</h3>
                      <p className="text-text-muted text-sm font-sans max-w-xs">Try adjusting your filters or resetting the form to discover matches.</p>
                      <button onClick={handleResetFilters} className="bg-brand-lime text-black font-semibold px-6 py-2 rounded-pill mt-2">Reset Filters</button>
                    </div>
                  ) : (
                    filteredTurfs.map((turf) => (
                      <motion.div
                        key={turf.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-surface border border-border-default hover:border-brand-lime/10 rounded-md p-5 flex flex-col md:flex-row gap-6 transition-all duration-300 hover:shadow-card-shadow"
                      >
                        <div className="relative w-full md:w-60 h-40 bg-elevated rounded-sm overflow-hidden flex-shrink-0">
                          <Image
                            src={turf.image}
                            alt={turf.name}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                          {turf.premium && (
                            <div className="absolute top-3 left-3 bg-overlay-heavy backdrop-blur-sm border border-brand-lime/30 text-brand-lime font-poppins font-bold text-[10px] px-2.5 py-1 rounded-pill flex items-center gap-1 select-none">
                              <Award className="w-3.5 h-3.5 fill-brand-lime text-brand-lime" />
                              Premium
                            </div>
                          )}
                          <button
                            onClick={() => toggleWishlist(turf.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-overlay backdrop-blur-sm flex items-center justify-center text-text-main hover:text-brand-lime transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${wishlist.includes(turf.id) ? "fill-brand-lime text-brand-lime" : ""}`} />
                          </button>
                        </div>

                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-poppins font-bold text-lg text-text-main hover:text-brand-lime transition-colors">
                                {turf.name}
                              </h3>
                              <span className="w-4 h-4 bg-brand-lime text-black rounded-full flex items-center justify-center text-[10px] font-bold select-none" title="Verified Venue">✓</span>
                            </div>

                            <p className="text-xs text-text-muted font-sans flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              {turf.location}
                            </p>

                            <div className="flex items-center gap-5 mt-4 text-xs text-text-muted border-t border-border-subtle pt-4 flex-wrap">
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Sport</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.sport} ({turf.size})</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Flood Lights</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.facilities.includes("Flood Lights") ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Parking</span>
                                <span className="font-semibold text-text-main mt-0.5">{turf.facilities.includes("Parking") ? "Yes" : "No"}</span>
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] uppercase tracking-wider text-text-muted">Rating</span>
                                <span className="font-semibold text-brand-lime mt-0.5 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-brand-lime text-brand-lime" />
                                  {turf.rating} <span className="text-[10px] text-text-muted font-normal">({turf.reviews} Reviews)</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-4 md:mt-0">
                            <div>
                              <span className="text-[10px] text-text-muted block leading-none font-sans uppercase">Starting from</span>
                              <span className="text-xl font-poppins font-extrabold text-brand-lime mt-1 block">
                                {formatPrice(turf.price)} <span className="text-xs text-text-muted font-normal font-sans">/hr</span>
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenSlots(turf)}
                              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3 px-6 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1"
                            >
                              View Slots
                              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {flowStep === "slots" && selectedTurf && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-surface border border-border-default rounded-md max-w-xl w-full p-6 relative shadow-card-shadow max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setFlowStep("listing")}
                  className="absolute top-4 right-4 p-1.5 bg-elevated hover:bg-elevated rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-left">
                  <span className="text-[10px] font-sans font-bold uppercase text-brand-lime bg-brand-lime/10 px-2.5 py-1 rounded-pill w-fit inline-block">
                    SELECT SLOT
                  </span>
                  <h2 className="font-poppins font-bold text-xl text-text-main mt-2">
                    {selectedTurf.name}
                  </h2>
                  <p className="text-xs text-text-muted flex items-center gap-0.5 mt-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" /> {selectedTurf.location}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider text-left">Select Date</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                    {dateOptions.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedDate(d.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border min-w-16 transition-all ${
                          selectedDate === d.value
                            ? "bg-brand-lime text-black border-brand-lime font-bold shadow-glow-lime"
                            : "bg-elevated text-text-muted border-border-subtle hover:text-text-main"
                        }`}
                      >
                        <span className="text-xs">{d.weekday}</span>
                        <span className="text-sm font-poppins font-extrabold mt-1">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 text-left">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Select Pitch</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[`Pitch 1 (${selectedTurf.premium ? "Premium Turf" : "Standard Turf"})`, `Pitch 2 (${selectedTurf.premium ? "Premium Grass" : "Standard Grass"})`].map((pitch) => (
                      <button
                        key={pitch}
                        onClick={() => setSelectedPitch(pitch)}
                        className={`p-3 text-xs rounded-md border text-center font-sans font-semibold transition-all ${
                          selectedPitch === pitch
                            ? "bg-elevated text-brand-lime border-brand-lime/50"
                            : "bg-elevated text-text-muted border-border-subtle hover:text-text-main"
                        }`}
                      >
                        {pitch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-lime" /> Available Time Slots
                    </span>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 text-brand-lime animate-spin" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-text-muted p-4 text-center">No slots configured for this date. Try another day.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTimeSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              className={`p-2.5 rounded-md border text-xs font-semibold text-center transition-all ${
                                !slot.available
                                  ? "bg-bg/40 text-text-muted/30 border-border-subtle line-through cursor-not-allowed"
                                  : isSelected
                                    ? "bg-brand-lime text-black border-brand-lime shadow-glow-lime font-bold"
                                    : "bg-elevated text-text-muted border-border-subtle hover:text-text-main"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-text-muted uppercase">Selected Slot</span>
                    <span className="text-xs font-bold text-text-main block mt-1">
                      {selectedTimeSlot ? `${selectedDate} | ${selectedTimeSlot}` : "No slot selected"}
                    </span>
                  </div>
                  <button
                    disabled={!selectedTimeSlot}
                    onClick={handleProceedToCheckout}
                    className="bg-brand-lime disabled:bg-elevated disabled:text-text-muted/40 text-black font-poppins font-bold text-sm py-3 px-8 rounded-md transition-all duration-300 hover:scale-102 flex items-center gap-1.5"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flowStep === "checkout" && selectedTurf && selectedTimeSlot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-surface border border-border-default rounded-md max-w-xl w-full p-6 relative shadow-card-shadow max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setFlowStep("slots")}
                  className="absolute top-4 left-4 p-1.5 bg-elevated hover:bg-elevated rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5 rotate-45" />
                </button>
                <button
                  onClick={() => setFlowStep("listing")}
                  className="absolute top-4 right-4 p-1.5 bg-elevated hover:bg-elevated rounded-full text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mt-3">
                  <span className="text-[10px] font-sans font-bold uppercase text-brand-lime bg-brand-lime/10 px-2.5 py-1 rounded-pill w-fit inline-block">
                    CHECKOUT
                  </span>
                  <h2 className="font-poppins font-bold text-xl text-text-main mt-3">
                    Confirm Your Booking
                  </h2>
                </div>

                <div className="mt-6 bg-elevated rounded-md p-4 border border-border-subtle text-left flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-text-main">{selectedTurf.name}</h4>
                      <p className="text-[11px] text-text-muted flex items-center gap-0.5 mt-0.5 font-sans">
                        <MapPin className="w-3 h-3 text-brand-lime shrink-0" /> {selectedTurf.location.split(",")[0]}
                      </p>
                    </div>
                    <span className="text-xs bg-brand-lime/10 text-brand-lime font-sans font-bold px-2 py-0.5 rounded border border-brand-lime/10">
                      {selectedTurf.sport}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-muted uppercase">Selected Date</span>
                      <span className="font-semibold text-text-main">{selectedDate}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-text-muted uppercase">Time Slot</span>
                      <span className="font-semibold text-text-main">{selectedTimeSlot}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[10px] text-text-muted uppercase">Pitch Details</span>
                      <span className="font-semibold text-brand-lime">{selectedPitch}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <label className="text-[10px] text-text-muted uppercase">Players</label>
                      <input
                        type="number"
                        min={2}
                        max={selectedTurf.premium ? 22 : 14}
                        value={attendees}
                        onChange={(e) => setAttendees(Math.max(2, Math.min(22, Number(e.target.value))))}
                        className="bg-bg border border-border-subtle rounded px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-lime/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-left">
                  <span className="text-xs font-poppins font-bold uppercase text-text-main tracking-wider">Select Payment Method</span>
                  <div className="flex flex-col gap-2">
                    <label className={`p-4 rounded-md border flex items-center justify-between cursor-pointer select-none transition-colors ${
                      selectedPayment === 'upi' ? 'bg-elevated border-brand-lime/50' : 'bg-surface border-border-subtle'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={selectedPayment === 'upi'} onChange={() => setSelectedPayment('upi')} className="accent-brand-lime" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main">Pay via UPI (GPay, PhonePe, Paytm)</span>
                          <span className="text-[10px] text-text-muted mt-0.5">Instant booking confirmation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/5 border border-border-default px-1.5 py-0.5 rounded text-[8px] font-sans text-text-muted">GPay</span>
                        <span className="bg-white/5 border border-border-default px-1.5 py-0.5 rounded text-[8px] font-sans text-text-muted">Paytm</span>
                      </div>
                    </label>
                    <label className={`p-4 rounded-md border flex items-center justify-between cursor-pointer select-none transition-colors ${
                      selectedPayment === 'card' ? 'bg-elevated border-brand-lime/50' : 'bg-surface border-border-subtle'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={selectedPayment === 'card'} onChange={() => setSelectedPayment('card')} className="accent-brand-lime" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main">Credit / Debit Card</span>
                          <span className="text-[10px] text-text-muted mt-0.5">Visa, Mastercard, RuPay, Amex</span>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-text-muted shrink-0" />
                    </label>
                    <label className={`p-4 rounded-md border flex items-center justify-between cursor-pointer select-none transition-colors ${
                      selectedPayment === 'netbanking' ? 'bg-elevated border-brand-lime/50' : 'bg-surface border-border-subtle'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={selectedPayment === 'netbanking'} onChange={() => setSelectedPayment('netbanking')} className="accent-brand-lime" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main">Net Banking</span>
                          <span className="text-[10px] text-text-muted mt-0.5">All major Indian banks supported</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 border-t border-border-subtle pt-5 flex flex-col gap-2.5 text-xs font-sans text-left">
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Base Fare (1 Hour)</span>
                    <span>{formatPrice(pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Convenience Fee (1.8%)</span>
                    <span>{formatPrice(pricing.convenience)}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted pb-2 border-b border-border-subtle">
                    <span>GST (18%)</span>
                    <span>{formatPrice(pricing.gst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-poppins font-extrabold text-text-main">
                    <span>Total Payable</span>
                    <span className="text-brand-lime">{formatPrice(pricing.total)}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-[10px] text-text-muted font-sans flex items-center justify-center gap-1 select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    Payments are encrypted & secured by Razorpay.
                  </p>
                  <button
                    onClick={handlePayNow}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3.5 rounded-md transition-all duration-300 hover:scale-102 flex items-center justify-center gap-1.5"
                  >
                    Pay Now · {formatPrice(pricing.total)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flowStep === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2.5]" />
              <h3 className="font-poppins font-bold text-lg text-text-main mt-2">Processing Your Booking</h3>
              <p className="text-xs text-text-muted font-sans text-center max-w-xs">Securing your slot and verifying payment. Please do not close or refresh this window.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flowStep === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="bg-surface border border-error/30 rounded-md max-w-md w-full p-6 text-center">
                <AlertCircle className="w-10 h-10 text-error mx-auto" />
                <h3 className="font-poppins font-bold text-lg text-text-main mt-4">Payment Failed</h3>
                <p className="text-xs text-text-muted mt-2 font-sans">{bookingError}</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    onClick={() => setFlowStep("checkout")}
                    className="bg-brand-lime text-black font-poppins font-bold text-sm py-2.5 px-6 rounded-md"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setFlowStep("listing")}
                    className="bg-elevated border border-border-default text-text-main font-sans text-sm py-2.5 px-6 rounded-md"
                  >
                    Browse Other Turfs
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {flowStep === "confirmed" && confirmedBooking && selectedTurf && selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="max-w-xl mx-auto px-6 md:px-8 w-full text-center flex flex-col items-center mt-12"
          >
            <div className="relative w-20 h-20 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-glow-lime-intense select-none">
              <Check className="w-10 h-10 text-brand-lime stroke-[3]" />
            </div>

            <h1 className="font-poppins text-3xl font-extrabold text-text-main mt-6">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-sm text-text-muted font-sans max-w-xs">
              Your slot is successfully reserved. Present the digital ticket QR code when arriving.
            </p>

            <div className="relative w-full bg-surface border border-border-default rounded-md p-6 mt-8 shadow-card-shadow text-left flex flex-col gap-6 overflow-hidden">
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-bg rounded-full border-r border-border-default" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-bg rounded-full border-l border-border-default" />

              <div className="flex justify-between items-center pb-4 border-b border-dashed border-border-default">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-sans">Booking Receipt ID</span>
                  <span className="font-poppins font-bold text-base text-brand-lime tracking-wide">{confirmedBooking.booking_code}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-sans font-bold bg-brand-lime/10 text-brand-lime border border-brand-lime/10 rounded-pill px-3 py-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" /> paid
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-sans">Venue</span>
                <h3 className="font-poppins font-extrabold text-lg text-text-main">{selectedTurf.name}</h3>
                <p className="text-xs text-text-muted flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" /> {selectedTurf.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 text-xs font-sans">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Date</span>
                  <span className="font-semibold text-text-main">{selectedDate}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Time Slot</span>
                  <span className="font-semibold text-text-main">{selectedTimeSlot}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Pitch Info</span>
                  <span className="font-semibold text-text-main">{selectedPitch}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase">Amount Paid</span>
                  <span className="font-bold text-brand-lime">{formatPrice(confirmedBooking.total_price)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-border-default pt-6 flex flex-col items-center justify-center gap-3">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeUrl} alt="Booking QR Code" className="w-40 h-40 rounded-md bg-qr-bg p-2" />
                ) : (
                  <div className="w-40 h-40 bg-elevated animate-pulse rounded" />
                )}
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-text-muted select-none">
                  Scan Ticket Receipt At Entrance
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={handleDownloadTicket}
                className="bg-surface hover:bg-elevated border border-border-default text-text-main font-poppins font-semibold py-3.5 px-8 rounded-pill flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" /> Download Ticket
              </button>
              <button
                onClick={() => setFlowStep("listing")}
                className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-semibold py-3.5 px-8 rounded-pill flex items-center justify-center gap-1.5 transition-all hover:scale-102"
              >
                Explore More Turfs
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <Link
              href="/profile"
              className="mt-6 text-xs text-text-muted hover:text-brand-lime transition-colors underline font-sans"
            >
              View all my bookings
            </Link>
          </motion.div>
        )}
      </main>

      {flowStep === "listing" && (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pb-16">
          <h2 className="font-poppins font-bold text-2xl text-text-main mb-8 text-center">
            Frequently Asked Questions About Turf Booking
          </h2>
          <div className="flex flex-col gap-4">
            {exploreFaqItems.map((item, idx) => (
              <details
                key={idx}
                className="bg-surface border border-border-default rounded-md p-5 group"
              >
                <summary className="font-poppins font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
                  {item.question}
                  <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-xs text-text-muted font-sans leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
