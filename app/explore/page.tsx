"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronDown,
  ChevronLeft,
  Star,
  Award,
  SlidersHorizontal,
  Check,
  Heart,
  ShieldCheck,
  X,
  Loader2,
  Download,
  ArrowRight,
  AlertCircle,
  Search,
} from "lucide-react";
import { GiSoccerBall, GiCricketBat, GiShuttlecock, GiTennisRacket, GiAmericanFootballBall } from "react-icons/gi";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openCashfreeCheckout } from "@/lib/cashfree";
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

const SPORT_CATEGORIES = [
  { id: "Football", label: "Football", icon: GiSoccerBall },
  { id: "Cricket", label: "Cricket", icon: GiCricketBat },
  { id: "Badminton", label: "Badminton", icon: GiShuttlecock },
  { id: "Tennis", label: "Tennis", icon: GiTennisRacket },
  { id: "Multipurpose", label: "Multipurpose", icon: GiAmericanFootballBall },
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

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/* ── Accordion FAQ Item ── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ae-faq-item">
      <button className="ae-faq-trigger" onClick={() => setOpen((v) => !v)}>
        <span>{question}</span>
        <div className={`ae-faq-icon ${open ? "ae-faq-item-open" : ""}`}>
          <ChevronDown className="w-4 h-4" style={{ color: "var(--ae-ink)" }} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div className="ae-faq-content">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Custom Select Dropdown ── */
function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const handleClick = (e: MouseEvent) => {
      if (!node.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="ae-select-wrapper" style={{ position: "relative" }}>
      <button className="ae-select" onClick={() => setOpen((v) => !v)}>
        {value}
      </button>
      <ChevronDown className="ae-select-arrow w-3.5 h-3.5" style={{ color: "var(--ae-muted)" }} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              minWidth: "180px",
              borderRadius: "var(--ae-radius-md)",
              border: "1px solid var(--ae-hairline)",
              background: "var(--ae-canvas)",
              boxShadow: "var(--ae-shadow-hover)",
              zIndex: 20,
              padding: "6px",
              overflow: "hidden",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--ae-radius-sm)",
                  border: "none",
                  background: opt === value ? "var(--ae-surface-soft)" : "transparent",
                  color: "var(--ae-ink)",
                  fontSize: "14px",
                  fontWeight: opt === value ? 600 : 400,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background-color 0.12s",
                }}
                onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.background = "var(--ae-surface-soft)"; }}
                onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Calendar Picker — Airbnb-style month grid ── */
function CalendarPicker({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const todayRef = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: { date: Date; key: string; disabled: boolean; isToday: boolean; label: number }[] = [];
    for (let i = 0; i < firstDay; i++) {
      result.push({ date: new Date(year, month, -firstDay + i + 1), key: `pad-${i}`, disabled: true, isToday: false, label: -firstDay + i + 1 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      dt.setHours(0, 0, 0, 0);
      const key = toDateKey(dt);
      result.push({ date: dt, key, disabled: dt < todayRef, isToday: dt.getTime() === todayRef.getTime(), label: d });
    }
    return result;
  }, [viewMonth, todayRef]);

  const canGoPrev = viewMonth.getFullYear() > todayRef.getFullYear() || (viewMonth.getFullYear() === todayRef.getFullYear() && viewMonth.getMonth() > todayRef.getMonth());

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button
          disabled={!canGoPrev}
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          style={{
            width: "32px", height: "32px", borderRadius: "50%", border: "none",
            background: canGoPrev ? "var(--ae-surface-soft)" : "transparent",
            cursor: canGoPrev ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: canGoPrev ? 1 : 0.3,
            transition: "all 0.15s",
          }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--ae-ink)" }} />
        </button>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--ae-ink)", letterSpacing: "-0.01em" }}>{monthLabel}</span>
        <button
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          style={{
            width: "32px", height: "32px", borderRadius: "50%", border: "none",
            background: "var(--ae-surface-soft)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: "var(--ae-ink)", transform: "rotate(-90deg)" }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
        {weekdays.map((wd) => (
          <div key={wd} style={{ textAlign: "center", fontSize: "12px", fontWeight: 600, color: "var(--ae-muted)", padding: "6px 0", letterSpacing: "0.02em" }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}>
        {days.map((day) => {
          const isSelected = day.key === selected;
          const isCurrentMonth = day.key.startsWith(`${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`);
          return (
            <button
              key={day.key}
              disabled={day.disabled || !isCurrentMonth}
              onClick={() => { if (!day.disabled && isCurrentMonth) onSelect(day.key); }}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                border: "none", padding: 0, margin: "auto",
                background: isSelected ? "var(--ae-ink)" : "transparent",
                color: isSelected ? "var(--ae-canvas)" : day.disabled || !isCurrentMonth ? "var(--ae-muted-soft)" : "var(--ae-ink)",
                fontSize: "14px", fontWeight: isSelected || day.isToday ? 700 : 400,
                cursor: day.disabled || !isCurrentMonth ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                transition: "all 0.15s ease",
                outline: day.isToday && !isSelected ? "2px solid var(--ae-primary)" : "none",
                outlineOffset: "-2px",
              }}
              onMouseEnter={(e) => {
                if (!day.disabled && isCurrentMonth && !isSelected) {
                  e.currentTarget.style.background = "var(--ae-surface-soft)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const { status, firebaseUser } = useAuth();

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
  const [whenCalendarOpen, setWhenCalendarOpen] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>(["Football"]);
  const [priceRange, setPriceRange] = useState(3000);
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
          // Fallback: if no slots returned, generate mock slots for testing
          if (!slots || slots.length === 0) {
            const mockSlots: SlotInfo[] = [
              { time: "06:00 - 07:00", available: true },
              { time: "07:00 - 08:00", available: true },
              { time: "08:00 - 09:00", available: false },
              { time: "09:00 - 10:00", available: true },
              { time: "10:00 - 11:00", available: true },
              { time: "11:00 - 12:00", available: true },
              { time: "14:00 - 15:00", available: true },
              { time: "15:00 - 16:00", available: false },
              { time: "16:00 - 17:00", available: true },
              { time: "17:00 - 18:00", available: true },
              { time: "18:00 - 19:00", available: true },
              { time: "19:00 - 20:00", available: true },
              { time: "20:00 - 21:00", available: false },
              { time: "21:00 - 22:00", available: true },
            ];
            setAvailableSlots(mockSlots);
          } else {
            setAvailableSlots(slots);
          }
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
    if (sortBy === "Popular") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [allTurfs, selectedSports, priceRange, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    if (flowStep !== "listing" || !whenCalendarOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-when-calendar]")) {
        setWhenCalendarOpen(false);
      }
    };
    // Use setTimeout to avoid closing on the same click that opened it
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [whenCalendarOpen, flowStep]);

  const handleResetFilters = () => {
    setSelectedSports(["Football"]);
    setPriceRange(3000);
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
        payment_session_id?: string;
        amount: number;
        mock?: boolean;
        idempotent_replay?: boolean;
      }>("payments:createCashfreeOrder", {
        amount: totalPaise, currency: "INR", receipt, client_request_id: clientRequestId, type: "turf_booking",
      });

      if (!order.payment_session_id) throw new Error("Failed to initialize payment session");
      await openCashfreeCheckout({ paymentSessionId: order.payment_session_id });

      const verifyResult = await convexClient.action<{ verified: boolean; payment_id?: string; mock?: boolean }>(
        "payments:verifyCashfreePayment", { order_id: order.id }
      );
      if (!verifyResult.verified) throw new Error("Payment verification failed.");

      const pendingBooking = await convexClient.mutation<Booking>("bookings:createPending", {
        turf_id: selectedTurf.id, start_time: parsed.start.toISOString(), end_time: parsed.end.toISOString(),
        total_price: total, service_fee: convenience + gst, attendees, pg_order_id: order.id,
      });

      const confirmed = await convexClient.mutation<Booking>("bookings:confirmPaid", {
        booking_id: pendingBooking._id, pg_payment_id: verifyResult.payment_id || "mock", pg_signature: "verified",
      });

      setConfirmedBooking(confirmed);
      const qrPayload = JSON.stringify({ code: confirmed.booking_code, turf: selectedTurf.name, date: selectedDate, slot: selectedTimeSlot });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } });
      setQrCodeUrl(qrDataUrl);
      setDownloadQrUrl(qrDataUrl);
      setFlowStep("confirmed");
    } catch (err) {
      console.error("Payment/booking error:", err);
      setBookingError(err instanceof Error ? err.message : "Something went wrong.");
      setFlowStep("error");
    }
  };

  const handleDownloadTicket = () => {
    if (!confirmedBooking) return;
    const link = document.createElement("a");
    link.href = downloadQrUrl;
    link.download = `turfzo-ticket-${confirmedBooking.booking_code}.png`;
    link.click();
  };

  const pricing = getPricingDetails();

  const accentColor = "#4ADE80";

  return (
    <div className="airbnb-explore-theme flex flex-col min-h-screen" style={{ fontFamily: "Inter, -apple-system, system-ui, sans-serif" }}>
      <FAQPageSchema items={exploreFaqItems} />

      <div className="sticky top-0 z-50 w-full" style={{ backgroundColor: "var(--ae-canvas)", borderBottom: "1px solid var(--ae-hairline)", transition: "background-color 0.25s, border-color 0.25s" }}>
        <Header />
      </div>

      <main className="flex-grow">
        {/* ═══ LISTING VIEW ═══ */}
        {flowStep === "listing" && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 w-full">
            {/* Hero + Search */}
            <div className="pt-8 pb-6">
              <h1 className="mb-6" style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1.2, color: "var(--ae-ink)", letterSpacing: "-0.02em" }}>
                Find &amp; book the best turfs near you
              </h1>

              <div className="ae-search-bar" style={{ maxWidth: "860px" }}>
                <div className="ae-search-segment" style={{ flex: 1.3, minWidth: 0 }}>
                  <span className="ae-search-segment-label">Where</span>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search destinations"
                    className="ae-search-segment-value"
                  />
                </div>
                <div
                  data-when-calendar
                  className="ae-search-segment"
                  style={{ flex: 0.9, minWidth: 0, position: "relative" }}
                  onClick={() => setWhenCalendarOpen((v) => !v)}
                >
                  <span className="ae-search-segment-label">When</span>
                  <span className="ae-search-segment-value" style={{ color: "var(--ae-ink)", cursor: "pointer" }}>
                    {formatDisplayDate(searchDate)}
                  </span>

                  {/* Calendar Popover */}
                  <AnimatePresence>
                    {whenCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 12px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 40,
                          background: "var(--ae-canvas)",
                          borderRadius: "var(--ae-radius-lg)",
                          boxShadow: "var(--ae-shadow-hover)",
                          padding: "20px",
                          minWidth: "320px",
                          border: "1px solid var(--ae-hairline)",
                        }}
                      >
                        <CalendarPicker
                          selected={searchDate}
                          onSelect={(v) => {
                            setSearchDate(v);
                            setWhenCalendarOpen(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="ae-search-segment" style={{ flex: 0.8, minWidth: 0 }}>
                  <span className="ae-search-segment-label">Sport</span>
                  <span className="ae-search-segment-value" style={{ color: "var(--ae-ink)" }}>
                    {selectedSports.length > 0 ? selectedSports.join(", ") : "Any sport"}
                  </span>
                </div>
                <button className="ae-search-orb" aria-label="Search">
                  <Search className="w-5 h-5" style={{ color: "#ffffff" }} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Category Strip */}
            <div className="ae-hairline-bottom" style={{ paddingBottom: "0" }}>
              <div className="ae-category-strip" style={{ paddingTop: "4px", paddingBottom: "0" }}>
                {SPORT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedSports.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedSports(isActive
                          ? selectedSports.filter((s) => s !== cat.id)
                          : [...selectedSports, cat.id]
                        );
                      }}
                      className={`ae-category-item ${isActive ? "ae-category-item-active" : ""}`}
                    >
                      <div className="ae-category-icon">
                        <Icon size={26} />
                      </div>
                      <span className="ae-category-label">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 16px" }}>
              <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--ae-muted)" }}>
                {filteredTurfs.length > 0
                  ? `${filteredTurfs.length} turf${filteredTurfs.length !== 1 ? "s" : ""} available`
                  : "No turfs found"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", color: "var(--ae-muted)" }}>Sort:</span>
                  <CustomSelect value={sortBy} onChange={setSortBy} options={["Popular", "Price: Low to High", "Price: High to Low"]} />
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="ae-state-card" style={{ padding: "80px 32px" }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
                <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--ae-ink)" }}>Loading turfs...</span>
                <span style={{ fontSize: "14px", color: "var(--ae-muted)" }}>Finding the best venues near you</span>
              </div>
            )}

            {/* Error */}
            {loadError && (
              <div style={{ padding: "18px 22px", borderRadius: "var(--ae-radius-md)", border: "1px solid var(--ae-error)", backgroundColor: "var(--ae-surface-soft)", display: "flex", alignItems: "center", gap: "12px" }}>
                <AlertCircle className="w-5 h-5 shrink-0" style={{ color: "var(--ae-error)" }} />
                <p style={{ fontSize: "14px", color: "var(--ae-error)" }}>{loadError}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && filteredTurfs.length === 0 && (
              <div className="ae-state-card">
                <SlidersHorizontal className="w-12 h-12" style={{ color: "var(--ae-muted-soft)" }} />
                <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--ae-ink)" }}>No venues found</span>
                <span style={{ fontSize: "14px", textAlign: "center", maxWidth: "340px", color: "var(--ae-muted)", lineHeight: 1.5 }}>
                  Try adjusting your filters or resetting to discover more turfs.
                </span>
                <button onClick={handleResetFilters} className="ae-btn-primary" style={{ padding: "12px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "14px", marginTop: "8px" }}>
                  Reset filters
                </button>
              </div>
            )}

            {/* Cards Grid */}
            {!loading && filteredTurfs.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", paddingBottom: "48px" }}>
                {filteredTurfs.map((turf) => (
                  <motion.div
                    key={turf.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="ae-property-card"
                    onClick={() => handleOpenSlots(turf)}
                  >
                    <div className="ae-property-card-photo">
                      <Image src={turf.image} alt={turf.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" style={{ objectFit: "cover" }} />
                      {turf.rating >= 4.5 && <div className="ae-guest-favorite-badge">Guest favourite</div>}
                      {turf.premium && (
                        <div style={{ position: "absolute", top: "12px", right: "52px", backgroundColor: "var(--ae-ink)", borderRadius: "var(--ae-radius-pill)", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "var(--ae-canvas)", display: "flex", alignItems: "center", gap: "4px", zIndex: 2, letterSpacing: "0.02em" }}>
                          <Award className="w-3 h-3" /> Premium
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(turf.id); }}
                        className="ae-heart-btn"
                        aria-label={wishlist.includes(turf.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className="w-[18px] h-[18px]" style={{ fill: wishlist.includes(turf.id) ? accentColor : "rgba(255,255,255,0.9)", color: wishlist.includes(turf.id) ? accentColor : "rgba(255,255,255,0.9)", transition: "all 0.2s" }} strokeWidth={2} />
                      </button>
                      <div className="ae-carousel-dots">
                        <div className="ae-carousel-dot ae-carousel-dot-active" />
                        <div className="ae-carousel-dot" />
                        <div className="ae-carousel-dot" />
                      </div>
                    </div>

                    <div style={{ padding: "0 2px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--ae-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {turf.name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                          <Star className="w-[13px] h-[13px]" style={{ fill: "var(--ae-ink)", color: "var(--ae-ink)" }} />
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ae-ink)" }}>
                            {turf.rating > 0 ? turf.rating.toFixed(2) : "New"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px", fontSize: "14px", color: "var(--ae-muted)" }}>
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--ae-muted)" }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{turf.location}</span>
                      </div>
                      <div style={{ marginTop: "4px", fontSize: "14px", color: "var(--ae-muted)" }}>
                        {turf.sport} · {turf.size}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "6px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--ae-ink)" }}>{formatPrice(turf.price)}</span>
                        <span style={{ fontSize: "14px", color: "var(--ae-muted)" }}>/hr</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SLOT PICKER MODAL ═══ */}
        <AnimatePresence>
          {flowStep === "slots" && selectedTurf && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="ae-scrim" onClick={() => setFlowStep("listing")}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }} className="ae-modal" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setFlowStep("listing")} className="ae-modal-close">
                  <X className="w-4 h-4" style={{ color: "var(--ae-ink)" }} />
                </button>

                <div style={{ marginBottom: "28px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2, color: "var(--ae-ink)", letterSpacing: "-0.01em" }}>{selectedTurf.name}</h2>
                  <p style={{ fontSize: "14px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", color: "var(--ae-muted)" }}>
                    <MapPin className="w-3.5 h-3.5" /> {selectedTurf.location}
                  </p>
                </div>

                {/* Date Calendar */}
                <div style={{ marginBottom: "28px" }}>
                  <span className="ae-section-title" style={{ display: "block", marginBottom: "16px" }}>Select date</span>
                  <div style={{ padding: "16px", borderRadius: "var(--ae-radius-md)", border: "1px solid var(--ae-hairline)", backgroundColor: "var(--ae-canvas)" }}>
                    <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />
                  </div>
                </div>

                {/* Pitch */}
                <div style={{ marginBottom: "28px" }}>
                  <span className="ae-section-title" style={{ display: "block", marginBottom: "14px" }}>Select pitch</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[`Pitch 1 (${selectedTurf.premium ? "Premium Turf" : "Standard Turf"})`, `Pitch 2 (${selectedTurf.premium ? "Premium Grass" : "Standard Grass"})`].map((pitch) => (
                      <button key={pitch} onClick={() => setSelectedPitch(pitch)} className={`ae-pitch-btn ${selectedPitch === pitch ? "ae-pitch-btn-active" : ""}`}>
                        {pitch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div style={{ marginBottom: "28px" }}>
                  <span className="ae-section-title" style={{ display: "block", marginBottom: "14px" }}>Available time slots</span>
                  {loadingSlots ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: accentColor }} />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p style={{ fontSize: "14px", padding: "20px", textAlign: "center", color: "var(--ae-muted)", borderRadius: "var(--ae-radius-md)", backgroundColor: "var(--ae-surface-soft)" }}>
                      No slots available for this date. Try another day.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.time;
                        const cls = `ae-time-slot ${isSelected ? "ae-time-slot-active" : ""} ${!slot.available ? "ae-time-slot-disabled" : ""}`;
                        return (
                          <button key={slot.time} disabled={!slot.available} onClick={() => setSelectedTimeSlot(slot.time)} className={cls}>
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="ae-divider" style={{ paddingTop: "20px", marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--ae-muted)", fontWeight: 500 }}>Selected slot</span>
                      <span style={{ fontSize: "15px", fontWeight: 600, display: "block", marginTop: "3px", color: "var(--ae-ink)" }}>
                        {selectedTimeSlot ? `${formatDisplayDate(selectedDate)} · ${selectedTimeSlot}` : "None selected"}
                      </span>
                    </div>
                    <button disabled={!selectedTimeSlot} onClick={handleProceedToCheckout} className="ae-btn-primary" style={{ padding: "14px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "15px" }}>
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CHECKOUT MODAL ═══ */}
        <AnimatePresence>
          {flowStep === "checkout" && selectedTurf && selectedTimeSlot && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="ae-scrim" onClick={() => setFlowStep("slots")}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }} className="ae-modal" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setFlowStep("slots")} className="ae-modal-close">
                  <X className="w-4 h-4" style={{ color: "var(--ae-ink)" }} />
                </button>

                <h2 style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2, color: "var(--ae-ink)", letterSpacing: "-0.01em", marginBottom: "24px" }}>Request to book</h2>

                {/* Summary Card */}
                <div style={{ padding: "20px", borderRadius: "var(--ae-radius-md)", border: "1px solid var(--ae-hairline)", marginBottom: "24px" }}>
                  <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--ae-hairline-soft)", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ae-ink)" }}>{selectedTurf.name}</h3>
                    <p style={{ fontSize: "14px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", color: "var(--ae-muted)" }}>
                      <MapPin className="w-3.5 h-3.5" /> {selectedTurf.location.split(",")[0]}
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 600, display: "block", color: "var(--ae-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</span>
                      <span style={{ fontWeight: 500, marginTop: "4px", display: "block", color: "var(--ae-ink)" }}>{formatDisplayDate(selectedDate)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 600, display: "block", color: "var(--ae-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</span>
                      <span style={{ fontWeight: 500, marginTop: "4px", display: "block", color: "var(--ae-ink)" }}>{selectedTimeSlot}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 600, display: "block", color: "var(--ae-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pitch</span>
                      <span style={{ fontWeight: 500, marginTop: "4px", display: "block", color: "var(--ae-ink)" }}>{selectedPitch}</span>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, display: "block", color: "var(--ae-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Players</label>
                      <input type="number" min={2} max={selectedTurf.premium ? 22 : 14} value={attendees} onChange={(e) => setAttendees(Math.max(2, Math.min(22, Number(e.target.value))))} style={{ marginTop: "4px", padding: "8px 12px", borderRadius: "var(--ae-radius-sm)", border: "1.5px solid var(--ae-hairline)", fontSize: "14px", color: "var(--ae-ink)", background: "var(--ae-surface-soft)", width: "80px", outline: "none", transition: "border-color 0.15s" }} />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ marginBottom: "24px" }}>
                  <span className="ae-section-title" style={{ display: "block", marginBottom: "14px" }}>Payment method</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {([
                      { key: "upi" as const, label: "UPI (GPay, PhonePe, Paytm)", sub: "Instant booking confirmation" },
                      { key: "card" as const, label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay, Amex" },
                      { key: "netbanking" as const, label: "Net Banking", sub: "All major Indian banks" },
                    ]).map((method) => (
                      <div key={method.key} className={`ae-payment-option ${selectedPayment === method.key ? "ae-payment-option-active" : ""}`} onClick={() => setSelectedPayment(method.key)}>
                        <div className={`ae-payment-radio ${selectedPayment === method.key ? "ae-payment-radio-active" : ""}`}>
                          <div className="ae-payment-radio-inner" />
                        </div>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ae-ink)", display: "block" }}>{method.label}</span>
                          <span style={{ fontSize: "12px", color: "var(--ae-muted)", marginTop: "2px", display: "block" }}>{method.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: "1px solid var(--ae-hairline)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ae-muted)" }}>
                    <span>Base fare (1 hour)</span><span>{formatPrice(pricing.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ae-muted)" }}>
                    <span>Convenience fee (1.8%)</span><span>{formatPrice(pricing.convenience)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ae-muted)", paddingBottom: "12px", borderBottom: "1px solid var(--ae-hairline-soft)" }}>
                    <span>GST (18%)</span><span>{formatPrice(pricing.gst)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--ae-ink)", fontSize: "16px" }}>
                    <span>Total</span><span>{formatPrice(pricing.total)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <p style={{ fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--ae-muted)" }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} /> Payments secured by Cashfree
                  </p>
                  <button onClick={handlePayNow} className="ae-btn-primary" style={{ width: "100%", padding: "16px", borderRadius: "var(--ae-radius-sm)", fontSize: "16px" }}>
                    Pay now · {formatPrice(pricing.total)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ PROCESSING ═══ */}
        <AnimatePresence>
          {flowStep === "processing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ae-scrim">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: accentColor }} />
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--ae-ink)" }}>Processing your booking</h3>
                  <p style={{ fontSize: "14px", color: "var(--ae-muted)", marginTop: "8px", maxWidth: "320px" }}>
                    Securing your slot and verifying payment. Please do not close this window.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ ERROR ═══ */}
        <AnimatePresence>
          {flowStep === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ae-scrim">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ae-modal" style={{ maxWidth: "420px", textAlign: "center" }}>
                <AlertCircle className="w-12 h-12 mx-auto" style={{ color: "var(--ae-error)" }} />
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ae-ink)", marginTop: "16px" }}>Payment failed</h3>
                <p style={{ fontSize: "14px", color: "var(--ae-muted)", marginTop: "8px", lineHeight: 1.5 }}>{bookingError}</p>
                <div style={{ marginTop: "28px", display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button onClick={() => setFlowStep("checkout")} className="ae-btn-primary" style={{ padding: "12px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "14px" }}>
                    Try again
                  </button>
                  <button onClick={() => setFlowStep("listing")} className="ae-btn-secondary" style={{ padding: "12px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "14px" }}>
                    Browse turfs
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CONFIRMED ═══ */}
        {flowStep === "confirmed" && confirmedBooking && selectedTurf && selectedTimeSlot && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-xl mx-auto px-6 md:px-8 w-full text-center flex flex-col items-center mt-12 mb-16">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }} style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "var(--ae-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ae-hairline)" }}>
              <Check className="w-9 h-9" style={{ color: "#16a34a", strokeWidth: 2.5 }} />
            </motion.div>

            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--ae-ink)", marginTop: "24px", letterSpacing: "-0.02em" }}>Booking confirmed!</h1>
            <p style={{ fontSize: "15px", color: "var(--ae-muted)", marginTop: "8px", maxWidth: "380px", lineHeight: 1.5 }}>
              Your turf is reserved. Show the QR code at the entrance.
            </p>

            <div className="ae-confirmed-card" style={{ width: "100%", marginTop: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1.5px dashed var(--ae-hairline)" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Booking code</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: accentColor, display: "block", marginTop: "4px" }}>{confirmedBooking.booking_code}</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", backgroundColor: "var(--ae-surface-soft)", padding: "5px 12px", borderRadius: "var(--ae-radius-pill)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Paid</span>
              </div>

              <div style={{ marginTop: "16px" }}>
                <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Venue</span>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ae-ink)", marginTop: "4px" }}>{selectedTurf.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--ae-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <MapPin className="w-3 h-3" /> {selectedTurf.location}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--ae-hairline-soft)", fontSize: "13px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</span>
                  <span style={{ fontWeight: 500, color: "var(--ae-ink)", display: "block", marginTop: "3px" }}>{formatDisplayDate(selectedDate)}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</span>
                  <span style={{ fontWeight: 500, color: "var(--ae-ink)", display: "block", marginTop: "3px" }}>{selectedTimeSlot}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Pitch</span>
                  <span style={{ fontWeight: 500, color: "var(--ae-ink)", display: "block", marginTop: "3px" }}>{selectedPitch}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--ae-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Amount</span>
                  <span style={{ fontWeight: 700, color: accentColor, display: "block", marginTop: "3px" }}>{formatPrice(confirmedBooking.total_price)}</span>
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1.5px dashed var(--ae-hairline)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Booking QR Code" style={{ width: "160px", height: "160px", borderRadius: "var(--ae-radius-md)", padding: "8px", backgroundColor: "#ffffff" }} />
                ) : (
                  <div style={{ width: "160px", height: "160px", backgroundColor: "var(--ae-surface-soft)", borderRadius: "var(--ae-radius-md)" }} />
                )}
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ae-muted)" }}>Scan at entrance</span>
              </div>
            </div>

            <div style={{ marginTop: "28px", display: "flex", gap: "12px", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleDownloadTicket} className="ae-btn-secondary" style={{ padding: "14px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                <Download className="w-4 h-4" /> Download ticket
              </button>
              <button onClick={() => setFlowStep("listing")} className="ae-btn-primary" style={{ padding: "14px 28px", borderRadius: "var(--ae-radius-sm)", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                Explore more <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <Link href="/profile" style={{ marginTop: "20px", fontSize: "14px", color: "var(--ae-muted)", textDecoration: "underline", transition: "color 0.15s" }}>
              View all my bookings
            </Link>
          </motion.div>
        )}
      </main>

      {/* ═══ FAQ ═══ */}
      {flowStep === "listing" && (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pb-20">
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--ae-ink)", marginBottom: "32px", textAlign: "center", letterSpacing: "-0.01em" }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {exploreFaqItems.map((item, idx) => (
              <FaqItem key={idx} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
