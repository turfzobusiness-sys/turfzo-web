"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
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
  ArrowLeft,
  AlertCircle,
  Search,
  Sparkles,
  Info,
  Calendar,
  Wifi,
  Zap,
  Droplet,
  Coffee,
  Home,
  Sun,
  Sunrise,
  Moon,
  ParkingCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  GiSoccerBall,
  GiCricketBat,
  GiShuttlecock,
  GiTennisRacket,
  GiAmericanFootballBall,
} from "react-icons/gi";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { openCashfreeCheckout } from "@/lib/cashfree";
import type {
  Turf as ConvexTurf,
  Booking,
  FavoriteWithTurf,
} from "@/lib/types";
import { FAQPageSchema } from "@/lib/schema";
import QRCode from "qrcode";

const exploreFaqItems = [
  {
    question: "How do I find a football turf near me?",
    answer:
      "Visit turfzo.app/explore, select your city, and browse available football turfs. You can filter by location, price, amenities, and availability. Real-time slots are shown for each venue.",
  },
  {
    question: "What is the average turf booking price in India?",
    answer:
      "Turf booking prices in India range from ₹500 to ₹2000 per hour. Football turfs typically cost ₹800-1500/hour in metro cities like Bangalore, Mumbai, and Delhi. Prices vary by location, amenities, and time of day.",
  },
  {
    question: "Can I book a turf for tonight?",
    answer:
      "Yes, Turfzo shows real-time availability. If a turf has open slots for tonight, you can book it instantly. The booking is confirmed immediately with a QR code ticket.",
  },
  {
    question: "How many turfs are available on Turfzo?",
    answer:
      "Turfzo has 50+ verified turfs across 8 major Indian cities including Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, and Ahmedabad.",
  },
  {
    question: "What sports can I book on Turfzo?",
    answer:
      "Turfzo supports football, cricket, badminton, tennis, and multipurpose sports venues. Each sport has dedicated filters to help you find the right venue.",
  },
  {
    question: "Is there a cancellation policy?",
    answer:
      "Yes, you can cancel your booking up to 24 hours before the scheduled time for a full refund, 6-24 hours for a 50% refund, and no refund within 6 hours of the slot.",
  },
];

const SPORT_CATEGORIES = [
  { id: "all", label: "All Sports", icon: TrophyIcon },
  { id: "Football", label: "Football", icon: GiSoccerBall },
  { id: "Cricket", label: "Cricket", icon: GiCricketBat },
  { id: "Badminton", label: "Badminton", icon: GiShuttlecock },
  { id: "Tennis", label: "Tennis", icon: GiTennisRacket },
  { id: "Multipurpose", label: "Multipurpose", icon: GiAmericanFootballBall },
];

function TrophyIcon(props: React.ComponentProps<typeof Award>) {
  return <Award {...props} />;
}

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
  hasFloodlights?: boolean;
  hasFreeParking?: boolean;
  hasChangingRoom?: boolean;
  hasDrinkingWater?: boolean;
  hasFirstAid?: boolean;
  isIndoor?: boolean;
  convenience_fee?: number;
  gst_tax?: number;
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
    convenience_fee: t.convenience_fee,
    gst_tax: t.gst_tax,
    facilities: t.amenities ?? [],
    image: t.image_url || "/stadium_turf_bg.png",
    city: t.city,
    hasFloodlights: t.has_floodlights,
    hasFreeParking: t.has_free_parking,
    hasChangingRoom: t.has_changing_room,
    hasDrinkingWater: t.has_drinking_water,
    hasFirstAid: t.has_first_aid,
    isIndoor: t.is_indoor,
  };
}

type FlowStep = "listing" | "checkout" | "processing" | "confirmed" | "error";

interface SlotInfo {
  time: string;
  available: boolean;
  // Absolute instants supplied by `turfs:getAvailableSlots`. The backend
  // owns the turf's operating hours and timezone offset, so the client must
  // never re-derive these from the "HH:MM" label.
  start_time: string;
  end_time: string;
}

interface BookingPricePreview {
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ── Accordion FAQ Item ── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface border border-border-default rounded-xl overflow-hidden mb-3">
      <button
        className="w-full flex items-center justify-between p-4 font-semibold text-text-main text-left cursor-pointer hover:bg-elevated transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180 text-brand-lime" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 pt-0 text-text-muted text-sm border-t border-border-default bg-elevated/20 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Custom Select Dropdown ── */
function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
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
    <div ref={ref} className="relative inline-flex items-center">
      <button
        className="bg-surface border border-border-default text-xs font-bold text-text-main px-3 py-1.5 rounded-xl cursor-pointer hover:border-border-strong transition-all flex items-center gap-1 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1.5 min-w-[160px] bg-surface border border-border-default rounded-xl shadow-lg z-50 p-1.5 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full block text-left px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors focus:outline-none
                  ${opt === value ? "bg-brand-lime/10 text-brand-lime font-semibold" : "text-text-main hover:bg-elevated"}`}
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
function CalendarPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (v: string) => void;
  onClose?: () => void;
}) {
  const todayRef = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selected);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthLabel = viewMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const days = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: {
      date: Date;
      key: string;
      disabled: boolean;
      isToday: boolean;
      label: number;
    }[] = [];
    for (let i = 0; i < firstDay; i++) {
      result.push({
        date: new Date(year, month, -firstDay + i + 1),
        key: `pad-${i}`,
        disabled: true,
        isToday: false,
        label: -firstDay + i + 1,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      dt.setHours(0, 0, 0, 0);
      const key = toDateKey(dt);
      result.push({
        date: dt,
        key,
        disabled: dt < todayRef,
        isToday: dt.getTime() === todayRef.getTime(),
        label: d,
      });
    }
    return result;
  }, [viewMonth, todayRef]);

  const canGoPrev =
    viewMonth.getFullYear() > todayRef.getFullYear() ||
    (viewMonth.getFullYear() === todayRef.getFullYear() &&
      viewMonth.getMonth() > todayRef.getMonth());

  return (
    <div className="w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          disabled={!canGoPrev}
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
            )
          }
          className="w-8 h-8 rounded-full border-none bg-elevated hover:bg-border-default disabled:opacity-30 disabled:cursor-default flex items-center justify-center cursor-pointer transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-text-main" />
        </button>
        <span className="text-sm font-bold text-text-main">{monthLabel}</span>
        <button
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
            )
          }
          className="w-8 h-8 rounded-full border-none bg-elevated hover:bg-border-default flex items-center justify-center cursor-pointer transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-text-main rotate-180" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="text-center text-[10px] font-bold text-text-muted py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isSelected = day.key === selected;
          const isCurrentMonth = day.key.startsWith(
            `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`,
          );
          return (
            <button
              key={day.key}
              disabled={day.disabled || !isCurrentMonth}
              onClick={() => {
                if (!day.disabled && isCurrentMonth) {
                  onSelect(day.key);
                  if (onClose) onClose();
                }
              }}
              className={`w-8 h-8 rounded-full border-none p-0 mx-auto text-xs flex items-center justify-center transition-all duration-150
                ${
                  isSelected
                    ? "bg-text-main text-bg font-bold"
                    : day.disabled || !isCurrentMonth
                      ? "text-text-muted/40 cursor-default"
                      : "text-text-main hover:bg-elevated cursor-pointer"
                } ${day.isToday && !isSelected ? "ring-1 ring-brand-lime" : ""}`}
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
  const { status, firebaseUser, convexUser, getFreshToken } = useAuth();

  const [flowStep, setFlowStep] = useState<FlowStep>("listing");
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [selectedTurf, setSelectedTurf] = useState<TurfDisplay | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [allTurfs, setAllTurfs] = useState<TurfDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [downloadQrUrl, setDownloadQrUrl] = useState<string>("");

  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState(() => toDateKey(new Date()));
  const [whenCalendarOpen, setWhenCalendarOpen] = useState(false);
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState("all");
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterMinPrice, setFilterMinPrice] = useState(500);
  const [filterMaxPrice, setFilterMaxPrice] = useState(3000);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Popular");

  const [hoveredSlider, setHoveredSlider] = useState<"min" | "max" | null>(
    null,
  );
  const [activeSlider, setActiveSlider] = useState<"min" | "max" | null>(null);
  const [minInputVal, setMinInputVal] = useState("500");
  const [maxInputVal, setMaxInputVal] = useState("3000");

  const [selectedDate, setSelectedDate] = useState<string>(
    toDateKey(new Date()),
  );
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPitch, setSelectedPitch] = useState("Pitch 1 (Premium Turf)");
  const [selectedPayment, setSelectedPayment] = useState<
    "upi" | "card" | "netbanking" | "pay_at_venue"
  >("upi");
  const [attendees, setAttendees] = useState(10);
  const [showCalendarBooking, setShowCalendarBooking] = useState(false);
  const [pricePreview, setPricePreview] = useState<BookingPricePreview | null>(
    null,
  );

  const groupedSlots = useMemo(() => {    const groups: { title: string; icon: LucideIcon; slots: SlotInfo[] }[] = [
      { title: "Morning", icon: Sunrise, slots: [] },
      { title: "Evening", icon: Sun, slots: [] },
      { title: "Night", icon: Moon, slots: [] },
    ];
    availableSlots.forEach((slot) => {
      const startHourStr = slot.time.split(" ")[0].split(":")[0];
      const hour = parseInt(startHourStr, 10);
      if (hour < 12) groups[0].slots.push(slot);
      else if (hour < 18) groups[1].slots.push(slot);
      else groups[2].slots.push(slot);
    });
    return groups.filter((g) => g.slots.length > 0);
  }, [availableSlots]);

  // Resolve the selected label back to the server-supplied slot so every
  // downstream call uses the backend's instants. Goes null while a date
  // change is refetching, which correctly gates the checkout button.
  const selectedSlot = useMemo(
    () => availableSlots.find((s) => s.time === selectedTimeSlot) ?? null,
    [availableSlots, selectedTimeSlot],
  );

  const format12HourRange = (timeStr: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(" - ");
    if (parts.length !== 2) return timeStr;
    const formatTime = (t: string) => {
      const [h, m] = t.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    };
    return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
  };

  useEffect(() => {
    async function fetchTurfs() {
      try {
        const data = await convexClient.query<ConvexTurf[]>(
          "turfs:getAvailable",
          {},
        );
        setAllTurfs(data.map(mapTurf));
      } catch (err) {
        console.error("Failed to fetch turfs:", err);
        setLoadError(
          "Could not load turfs. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchTurfs();
  }, []);

  // Load the user's saved turfs from the backend so the heart reflects the
  // same favorites as the app and the profile page (persisted, not local).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status !== "authenticated" || !convexUser?._id) {
        if (!cancelled) setWishlist([]);
        return;
      }
      try {
        const data = await convexClient.query<FavoriteWithTurf[]>(
          "favorites:getByUser",
          { user_id: convexUser._id, limit: 50 },
        );
        if (!cancelled) {
          setWishlist(data?.map((f) => f.turf_id) ?? []);
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, convexUser?._id]);

  useEffect(() => {
    if (viewMode === "details" && selectedTurf) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const slots = await convexClient.query<SlotInfo[]>(
            "turfs:getAvailableSlots",
            { turf_id: selectedTurf.id, date: selectedDate },
          );
          // NOTE: no mock fallback here — in mock mode the mock client
          // supplies the slots; in live mode an empty list means the
          // turf is closed/fully booked for that date.
          setAvailableSlots(slots ?? []);
          setLoadingSlots(false);
        } catch (err) {
          console.error("Failed to fetch slots:", err);
          setAvailableSlots([]);
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [viewMode, selectedTurf, selectedDate]);

  useEffect(() => {
    if (!selectedTurf || !selectedSlot) return;

    let cancelled = false;
    (async () => {
      try {
        const preview = await convexClient.query<BookingPricePreview>(
          "bookings:calculatePreview",
          {
            turf_id: selectedTurf.id,
            start_time: selectedSlot.start_time,
            end_time: selectedSlot.end_time,
          },
        );
        if (!cancelled) {
          setPricePreview(preview);
        }
      } catch {
        if (!cancelled) {
          setPricePreview(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTurf, selectedSlot]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-when-calendar]")) {
        setWhenCalendarOpen(false);
      }
      if (!target.closest("[data-sport-dropdown]")) {
        setSportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredTurfs = useMemo(() => {
    let result = allTurfs;
    if (selectedSport !== "all") {
      result = result.filter(
        (t) => t.sport.toLowerCase() === selectedSport.toLowerCase(),
      );
    }
    if (searchLocation) {
      result = result.filter(
        (t) =>
          t.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
          (t.city &&
            t.city.toLowerCase().includes(searchLocation.toLowerCase())),
      );
    }
    if (filterFormat !== "all") {
      result = result.filter(
        (t) => t.size.toLowerCase() === filterFormat.toLowerCase(),
      );
    }
    result = result.filter(
      (t) => t.price >= filterMinPrice && t.price <= filterMaxPrice,
    );
    if (filterAmenities.length > 0) {
      result = result.filter((t) => {
        return filterAmenities.every((amenityId) => {
          if (amenityId === "instant")
            return (
              t.premium ||
              t.facilities.some(
                (f) =>
                  f.toLowerCase().includes("instant") ||
                  f.toLowerCase().includes("confirm"),
              )
            );
          if (amenityId === "wifi")
            return t.facilities.some(
              (f) =>
                f.toLowerCase().includes("wifi") ||
                f.toLowerCase().includes("internet"),
            );
          if (amenityId === "parking")
            return (
              t.hasFreeParking ||
              t.facilities.some((f) => f.toLowerCase().includes("parking"))
            );
          if (amenityId === "floodlight")
            return (
              t.hasFloodlights ||
              t.facilities.some(
                (f) =>
                  f.toLowerCase().includes("flood") ||
                  f.toLowerCase().includes("light"),
              )
            );
          if (amenityId === "water")
            return (
              t.hasDrinkingWater ||
              t.facilities.some((f) => f.toLowerCase().includes("water"))
            );
          if (amenityId === "changing")
            return (
              t.hasChangingRoom ||
              t.facilities.some(
                (f) =>
                  f.toLowerCase().includes("changing") ||
                  f.toLowerCase().includes("restroom") ||
                  f.toLowerCase().includes("shower") ||
                  f.toLowerCase().includes("washroom"),
              )
            );
          if (amenityId === "rental")
            return t.facilities.some(
              (f) =>
                f.toLowerCase().includes("rental") ||
                f.toLowerCase().includes("equipment") ||
                f.toLowerCase().includes("bat") ||
                f.toLowerCase().includes("ball"),
            );
          if (amenityId === "first-aid")
            return (
              t.hasFirstAid ||
              t.facilities.some(
                (f) =>
                  f.toLowerCase().includes("first aid") ||
                  f.toLowerCase().includes("medical") ||
                  f.toLowerCase().includes("safety"),
              )
            );
          if (amenityId === "cafeteria")
            return t.facilities.some(
              (f) =>
                f.toLowerCase().includes("cafe") ||
                f.toLowerCase().includes("food") ||
                f.toLowerCase().includes("refreshment") ||
                f.toLowerCase().includes("canteen"),
            );
          if (amenityId === "indoor")
            return (
              t.isIndoor ||
              t.facilities.some((f) => f.toLowerCase().includes("indoor"))
            );
          if (amenityId === "outdoor")
            return (
              !t.isIndoor ||
              t.facilities.some((f) => f.toLowerCase().includes("outdoor"))
            );
          return false;
        });
      });
    }
    if (sortBy === "Popular") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [
    allTurfs,
    selectedSport,
    searchLocation,
    filterFormat,
    filterMinPrice,
    filterMaxPrice,
    filterAmenities,
    sortBy,
  ]);

  const toggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "authenticated" || !convexUser?._id) {
      router.push("/auth/login?redirect=/explore");
      return;
    }
    const isFavorited = wishlist.includes(id);
    setWishlist((prev) =>
      isFavorited ? prev.filter((x) => x !== id) : [...prev, id],
    );
    try {
      if (isFavorited) {
        await convexClient.mutation("favorites:remove", { turf_id: id });
      } else {
        await convexClient.mutation("favorites:add", { turf_id: id });
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setWishlist((prev) =>
        isFavorited ? [...prev, id] : prev.filter((x) => x !== id),
      );
    }
  };

  const handleOpenSlots = (turf: TurfDisplay) => {
    setSelectedTurf(turf);
    setSelectedPitch(
      turf.premium ? "Pitch 1 (Premium Turf)" : "Pitch 1 (Standard Turf)",
    );
    setSelectedDate(searchDate);
    setViewMode("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Derived price preview: null whenever the current selection is invalid,
  // so a stale preview from a previous slot is never shown. The effect above
  // only fetches fresh previews for a valid selection (no synchronous
  // setState-in-effect).
  const effectivePricePreview =
    !selectedTurf || !selectedSlot ? null : pricePreview;

  const getPricingDetails = () => {
    if (!selectedTurf)
      return {
        subtotal: 0,
        serviceFee: 0,
        convenience: 0,
        gst: 0,
        total: 0,
        totalPaise: 0,
      };
    const subtotal = effectivePricePreview?.subtotal ?? selectedTurf.price;
    // The real charge is the backend's 5% service fee (total_price +
    // service_fee) — never fall back to the legacy 1.8%+18% convenience/GST
    // numbers, or the breakdown won't add up to what Cashfree charges.
    const serviceFee =
      effectivePricePreview?.serviceFee ??
      Math.round(subtotal * 0.05 * 100) / 100;
    const total = effectivePricePreview?.grandTotal ?? subtotal + serviceFee;
    return {
      subtotal,
      serviceFee,
      convenience: 0,
      gst: 0,
      total,
      totalPaise: total * 100,
    };
  };

  const handlePayNow = async () => {
    if (!selectedTurf || !selectedTimeSlot || !firebaseUser) {
      setBookingError("Missing booking details. Please try again.");
      return;
    }
    if (!selectedSlot) {
      setBookingError("Invalid time slot selected.");
      return;
    }
    setFlowStep("processing");
    setBookingError(null);

    // Track the pending booking ID so we can cancel it on failure / abort,
    // freeing the slot for other users (abandonment cleanup).
    let pendingBookingId: string | null = null;

    try {
      // Force-refresh the auth token before any payment calls
      const token = await getFreshToken();

      // ── Step 1: Create a pending booking (reserves the slot) ──
      const pendingBooking = await convexClient.mutation<Booking>(
        "bookings:createPending",
        {
          turf_id: selectedTurf.id,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          attendees,
          // MUST be sent: the stale-booking cron only spares bookings whose
          // payment_method is "cash". Omitting it made every pay-at-venue
          // booking self-destruct after 15 minutes ("Payment timeout"),
          // even though the user was holding a downloaded ticket.
          payment_method:
            selectedPayment === "pay_at_venue" ? "cash" : selectedPayment,
        },
      );
      pendingBookingId = pendingBooking._id;

      // ── Pay-at-venue: no online payment, the venue collects on arrival ──
      if (selectedPayment === "pay_at_venue") {
        // Render exactly what the backend stored — do not fabricate
        // status/payment_status client-side.
        setConfirmedBooking(pendingBooking);
        const qrPayload = JSON.stringify({
          code: pendingBooking.booking_code,
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
        return;
      }

      // ── Step 2: Create the Cashfree order (amount is computed server-side) ──
      const order = await convexClient.action<{
        success: boolean;
        cf_order_id: string;
        payment_session_id: string;
        order_amount: number;
        error?: string;
      }>(
        "payments:createCashfreeOrder",
        {
          booking_id: pendingBooking._id,
          customer_name:
            convexUser?.full_name ?? firebaseUser.displayName ?? undefined,
          customer_email: convexUser?.email ?? firebaseUser.email ?? undefined,
          customer_phone:
            convexUser?.phone_number ?? firebaseUser.phoneNumber ?? undefined,
        },
        token,
      );

      if (!order.success) {
        throw new Error(order.error || "Failed to initialize payment session.");
      }

      if (!order.payment_session_id) {
        throw new Error("Failed to initialize payment session.");
      }

      // ── Step 3: Open the Cashfree checkout modal ──
      await openCashfreeCheckout({
        paymentSessionId: order.payment_session_id,
      });

      // ── Step 4: Verify the payment server-side (single source of truth) ──
      const verifyResult = await convexClient.action<{
        success: boolean;
        payment_verified: boolean;
        payment_id?: string;
        order_id?: string;
        booking_id?: string;
        error?: string;
      }>(
        "payments:verifyCashfreePayment",
        {
          cf_order_id: order.cf_order_id,
        },
        token,
      );

      if (!verifyResult.success || !verifyResult.payment_verified) {
        throw new Error(verifyResult.error || "Payment verification failed.");
      }

      // verifyCashfreePayment already set status="confirmed" & payment_status="paid"
      // on the booking server-side. Construct the confirmed booking for the UI.
      const confirmedBooking: Booking = {
        ...pendingBooking,
        status: "confirmed",
        payment_status: "paid",
        pg_order_id: verifyResult.order_id,
        pg_payment_id: verifyResult.payment_id,
      };
      setConfirmedBooking(confirmedBooking);

      const qrPayload = JSON.stringify({
        code: confirmedBooking.booking_code,
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
      // ── Abandonment cleanup: release the slot if a booking was created ──
      if (pendingBookingId) {
        // SECURITY (T11): verification can fail transiently even when
        // Cashfree actually collected the money. Re-check the booking
        // before cancelling so a paid slot isn't refunded/cancelled.
        // The recheck gets its OWN try: if it throws (network blip, expired
        // token), we must still fall through to the cancel, otherwise the
        // slot stays locked until the 15-minute cron sweeps it.
        let alreadyPaid = false;
        try {
          const recheck = await convexClient.query<{
            payment_status?: string;
          }>("bookings:getById", { bookingId: pendingBookingId });
          alreadyPaid = recheck?.payment_status === "paid";
        } catch (recheckErr) {
          console.error(
            "Failed to re-check booking payment status:",
            recheckErr,
          );
        }

        if (alreadyPaid) {
          setFlowStep("confirmed");
          return;
        }

        try {
          await convexClient.mutation("bookings:cancel", {
            bookingId: pendingBookingId,
            reason: "Payment failed or cancelled by user.",
          });
        } catch (cancelErr) {
          console.error(
            "Failed to cancel pending booking after payment failure:",
            cancelErr,
          );
        }
      }
      const { getErrorMessage } = await import("@/lib/errors");
      setBookingError(getErrorMessage(err));
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

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <FAQPageSchema items={exploreFaqItems} />

      <Header />

      <main className="flex-grow pt-24 pb-16">
        {/* ========================================================
            VIEW 1: TURFS LISTING BROWSER
            ======================================================== */}
        {viewMode === "list" && flowStep === "listing" && (
          <div>
            {/* Full Bleed Hero Section */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative -mt-24 overflow-visible min-h-[380px] sm:min-h-[440px] flex flex-col items-start justify-end mb-6"
            >
              <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-95 dark:opacity-50 brightness-[0.70] dark:brightness-100"
                style={{ backgroundImage: `url('/stadium_light_bg.png')` }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-bg via-bg/40 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent" />
              <div className="relative z-10 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full pb-10 sm:pb-14">
                <h1 className="font-[family-name:var(--font-anton)] text-4xl sm:text-5xl lg:text-6xl text-text-main dark:text-white uppercase leading-[1.1] tracking-wide mb-2">
                  Find &amp; Book
                  <br />
                  The Best Turfs Near You
                </h1>
                <p className="text-text-muted dark:text-white/70 text-sm sm:text-base max-w-xl mb-6">
                  Check real-time slots, secure bookings in under 60 seconds,
                  and play on 100% verified fields.
                </p>

                {/* Airbnb-style Search Pill */}
                <div className="w-full max-w-3xl bg-surface border border-border-default rounded-full shadow-lg h-[66px] flex items-center focus-within:border-border-strong focus-within:shadow-xl transition-all duration-200 relative z-20">
                  {/* Segment 1: Where */}
                  <div className="flex flex-col justify-center px-8 h-full rounded-l-full cursor-pointer hover:bg-elevated/50 transition-colors flex-[1.3] min-w-0">
                    <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                      Where
                    </span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Search destinations/cities"
                      className="text-xs text-text-main placeholder-text-muted bg-transparent border-none outline-none w-full mt-0.5 font-semibold"
                    />
                  </div>

                  {/* Segment 2: When */}
                  <div
                    data-when-calendar
                    className="flex flex-col justify-center px-8 h-full cursor-pointer hover:bg-elevated/50 border-l border-border-default transition-colors relative flex-[0.9] min-w-0"
                    onClick={() => {
                      setWhenCalendarOpen((v) => !v);
                      setSportDropdownOpen(false);
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                      When
                    </span>
                    <span className="text-xs text-text-main font-semibold mt-0.5 truncate">
                      {formatDisplayDate(searchDate)}
                    </span>

                    {/* Calendar Popover */}
                    <AnimatePresence>
                      {whenCalendarOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 bg-surface border border-border-default rounded-2xl shadow-xl p-5 w-[calc(100vw-2rem)] max-w-[320px]"
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

                  {/* Segment 3: Sport */}
                  <div
                    data-sport-dropdown
                    className="flex flex-col justify-center px-8 h-full cursor-pointer hover:bg-elevated/50 border-l border-border-default transition-colors relative flex-[0.8] min-w-0"
                    onClick={() => {
                      setSportDropdownOpen((v) => !v);
                      setWhenCalendarOpen(false);
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                      Sport
                    </span>
                    <span className="text-xs text-text-main font-semibold mt-0.5 truncate">
                      {selectedSport === "all" ? "All Sports" : selectedSport}
                    </span>

                    {/* Sport Dropdown Popover */}
                    <AnimatePresence>
                      {sportDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 bg-surface border border-border-default rounded-2xl shadow-xl p-2 min-w-[200px]"
                        >
                          <div className="flex flex-col gap-1">
                            {SPORT_CATEGORIES.map((s) => {
                              const Icon = s.icon;
                              const isActive = selectedSport === s.id;
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setSelectedSport(s.id);
                                    setSportDropdownOpen(false);
                                  }}
                                  className={`flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold rounded-xl transition-colors text-left cursor-pointer
                                    ${isActive ? "bg-brand-lime/10 text-brand-lime" : "text-text-main hover:bg-elevated"}`}
                                >
                                  <Icon className="w-4 h-4 shrink-0" />
                                  <span>{s.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Search Orb */}
                  <button className="w-12 h-12 rounded-full bg-brand-lime hover:bg-brand-lime-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center mr-2 ml-auto shrink-0 cursor-pointer">
                    <Search className="w-5 h-5 text-bg" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.section>

            <div className="max-w-[1280px] mx-auto px-6 md:px-10 w-full">
              {/* Category Strip Row */}
              <div className="border-b border-border-default mt-2 mb-6">
                <div className="flex gap-10 overflow-x-auto scrollbar-none pb-0 justify-start sm:justify-center items-center">
                  {SPORT_CATEGORIES.map((s) => {
                    const Icon = s.icon;
                    const isActive = selectedSport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSport(s.id)}
                        className={`flex flex-col items-center gap-2 pb-3.5 cursor-pointer border-b-2 transition-all duration-200 relative -mb-[2px]
                          ${
                            isActive
                              ? "border-text-main text-text-main opacity-100 font-semibold"
                              : "border-transparent text-text-muted opacity-55 hover:opacity-100 hover:text-text-main"
                          }`}
                      >
                        <Icon className="w-7 h-7 shrink-0" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Filters and Count Row */}
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="text-sm text-text-muted font-medium">
                  {filteredTurfs.length} turf
                  {filteredTurfs.length !== 1 ? "s" : ""} available
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      Sort by:
                    </span>
                    <CustomSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        "Popular",
                        "Price: Low to High",
                        "Price: High to Low",
                      ]}
                    />
                  </div>

                  {/* Filters Button */}
                  <button
                    onClick={() => setIsFiltersModalOpen(true)}
                    className="flex items-center gap-2 bg-surface border border-border-default hover:border-border-strong text-text-main text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer h-[38px] shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-lime" />{" "}
                    Filters
                  </button>
                </div>
              </div>

              {/* Error warning state */}
              {loadError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{loadError}</p>
                </div>
              )}

              {/* Empty warning state */}
              {!loading && filteredTurfs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-border-default rounded-2xl text-center p-8">
                  <SlidersHorizontal
                    className="w-12 h-12 text-text-muted"
                    strokeWidth={1.2}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-text-main">
                      No venues found
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      We couldn&apos;t find any sports venues matching your
                      exact filters. Adjust your queries and slide max price.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSport("all");
                      setSearchLocation("");
                      setFilterFormat("all");
                      setFilterMinPrice(500);
                      setFilterMaxPrice(3000);
                      setMinInputVal("500");
                      setMaxInputVal("3000");
                      setFilterAmenities([]);
                      setSortBy("Popular");
                    }}
                    className="mt-2 bg-text-main hover:bg-text-main/90 text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Turfs Cards Grid */}
              {!loading && filteredTurfs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTurfs.map((turf) => (
                    <motion.div
                      key={turf.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleOpenSlots(turf)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenSlots(turf);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View slots for ${turf.name}`}
                      className="bg-surface border border-border-default rounded-2xl overflow-hidden hover:shadow-lg hover:border-border-strong transition-all duration-300 cursor-pointer group flex flex-col h-full relative focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2"
                    >
                      {/* Heart Save button */}
                      <button
                        onClick={(e) => toggleWishlist(turf.id, e)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-bg/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${wishlist.includes(turf.id) ? "fill-brand-lime text-brand-lime" : "text-white"}`}
                        />
                      </button>

                      {/* Image banner */}
                      <div className="relative w-full h-48 bg-elevated overflow-hidden shrink-0">
                        <Image
                          src={turf.image}
                          alt={turf.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          {turf.rating >= 4.7 && (
                            <span className="bg-bg/85 dark:bg-surface/85 backdrop-blur-sm text-text-main text-[10px] font-bold px-2.5 py-1 rounded-md border border-border-default">
                              Guest Favorite
                            </span>
                          )}
                          {turf.premium && (
                            <span className="bg-brand-lime text-bg text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content body */}
                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                            <span className="truncate">{turf.location}</span>
                          </div>

                          <h3 className="text-lg font-bold text-text-main leading-tight mb-2 group-hover:text-brand-lime transition-colors duration-200">
                            {turf.name}
                          </h3>

                          <p className="text-xs text-text-muted">
                            {turf.sport} · {turf.size} format matches
                          </p>
                        </div>

                        <div className="border-t border-border-default mt-5 pt-4 flex items-center justify-between">
                          <div>
                            <span className="block text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                              Hourly Rate
                            </span>
                            <span className="text-lg font-extrabold text-brand-lime">
                              {formatPrice(turf.price)}
                              <span className="text-xs text-text-muted font-normal ml-0.5">
                                /hr
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-text-main text-text-main" />
                            <span className="text-xs font-bold text-text-main">
                              {turf.rating > 0 ? turf.rating.toFixed(2) : "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: PREMIUM AIRBNB-STYLE DETAILS VIEW
            ======================================================== */}
        {viewMode === "details" && selectedTurf && flowStep === "listing" && (
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 w-full">
            {/* Top Navigation breadcrumbs */}
            <div className="flex items-center justify-between pb-6">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2 text-sm font-semibold text-text-main hover:text-brand-lime transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                Back to all venues
              </button>
              <div className="flex items-center gap-4 text-sm font-semibold">
                <button className="flex items-center gap-1.5 text-text-main hover:text-brand-lime transition-colors">
                  <Heart
                    className={`w-4 h-4 ${wishlist.includes(selectedTurf.id) ? "fill-brand-lime text-brand-lime" : ""}`}
                    onClick={(e) => toggleWishlist(selectedTurf.id, e)}
                  />
                  {wishlist.includes(selectedTurf.id) ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Title Header */}
            <div className="pb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                {selectedTurf.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted mt-2">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-text-main text-text-main" />{" "}
                  {selectedTurf.rating > 0
                    ? selectedTurf.rating.toFixed(2)
                    : "4.8"}
                </span>
                <span>·</span>
                <span className="underline cursor-pointer hover:text-text-main">
                  {selectedTurf.reviews > 0
                    ? `${selectedTurf.reviews} reviews`
                    : "15 reviews"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-text-main">
                  <MapPin className="w-3.5 h-3.5 text-brand-lime" />{" "}
                  {selectedTurf.location}
                </span>
              </div>
            </div>

            {/* Photos Grid Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden bg-elevated relative h-[300px] md:h-[420px]">
              {/* Left Large main photo */}
              <div className="md:col-span-2 relative h-full w-full overflow-hidden group">
                <Image
                  src={selectedTurf.image}
                  alt={selectedTurf.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover group-hover:brightness-95 transition-all duration-300"
                />
              </div>
              {/* Right stacked photos */}
              <div className="hidden md:flex flex-col gap-3 h-full">
                <div className="relative flex-1 w-full overflow-hidden group">
                  <Image
                    src="/feature_verified.jpg"
                    alt="Verified pitch conditions"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:brightness-95 transition-all duration-300"
                  />
                </div>
                <div className="relative flex-1 w-full overflow-hidden group">
                  <Image
                    src="/stadium_cinematic_bg.png"
                    alt="Cinematic stadium lights"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:brightness-95 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Show all photos button */}
              <button className="absolute bottom-6 right-6 bg-surface border border-border-strong text-text-main hover:bg-elevated transition-colors text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md">
                <Info className="w-3.5 h-3.5" /> Show all photos
              </button>
            </div>

            {/* Split Content columns */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 mt-8 items-start">
              {/* LEFT COLUMN: Overview features, ratings, FAQs */}
              <div className="space-y-6">
                <div className="pb-6 border-b border-border-default">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                    {selectedTurf.sport} court managed by Turfzo
                  </h2>
                  <p className="text-text-muted mt-1 text-sm">
                    {selectedTurf.size} dimensions layout · Play up to 14
                    players · Floodlight lighting system
                  </p>
                </div>

                {/* Host card */}
                <div className="pb-6 border-b border-border-default flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime font-bold text-lg border border-brand-lime/30 shrink-0">
                      TZ
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main">
                        Verified Sports Arena
                      </h3>
                      <p className="text-xs text-text-muted">
                        Superhost · Booking confirmed instantly
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bullet checklist highlights */}
                <div className="pb-6 border-b border-border-default space-y-5">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-text-main text-sm">
                        100% Inspected Field
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Our venue specialists personally verify pitch grip,
                        lighting level, and net quality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Check className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-text-main text-sm">
                        Instant Confirmation
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Direct connection to the venue&apos;s manager dashboard
                        guarantees no double bookings.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Info className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-text-main text-sm">
                        Flexible Cancellations
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Cancel up to 24 hours in advance to receive automatic
                        full refund options.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description text */}
                <div className="pb-6 border-b border-border-default">
                  <h3 className="text-lg font-bold text-text-main mb-3">
                    About this venue
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    This premium court features professional artificial grass
                    turf designed to reduce joint strain and maximize ball
                    control. Ideal for corporate matches, friendly matches, or
                    intensive team training sessions. Changing room facilities
                    and showers are available, and free parking spots are
                    provided.
                  </p>
                </div>

                {/* Amenities checklist icons */}
                <div className="pb-6 border-b border-border-default">
                  <h3 className="text-lg font-bold text-text-main mb-4">
                    What this turf offers
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                    {[
                      {
                        label: "High-intensity floodlights",
                        icon: <Award className="w-4 h-4 text-text-muted" />,
                      },
                      {
                        label: "Free parking spots on premises",
                        icon: (
                          <SlidersHorizontal className="w-4 h-4 text-text-muted" />
                        ),
                      },
                      {
                        label: "Purified drinking water stations",
                        icon: <Info className="w-4 h-4 text-text-muted" />,
                      },
                      {
                        label: "Changing rooms & restroom blocks",
                        icon: <Check className="w-4 h-4 text-text-muted" />,
                      },
                      {
                        label: "Wi-Fi access for spectators",
                        icon: <Star className="w-4 h-4 text-text-muted" />,
                      },
                      {
                        label: "Equipped first-aid box on site",
                        icon: (
                          <ShieldCheck className="w-4 h-4 text-text-muted" />
                        ),
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm text-text-main"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Turf review rating progress bars */}
                <div className="pb-6 border-b border-border-default">
                  <h3 className="text-lg font-bold text-text-main flex items-center gap-1.5 mb-6">
                    <Star className="w-5 h-5 fill-text-main text-text-main" />{" "}
                    {selectedTurf.rating > 0
                      ? selectedTurf.rating.toFixed(2)
                      : "4.8"}{" "}
                    · Venue Ratings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                    {[
                      { label: "Turf Grass Bounce", score: "4.8" },
                      { label: "Lighting Uniformity", score: "4.9" },
                      { label: "Facility Cleanliness", score: "4.7" },
                      { label: "Staff Hospitality", score: "4.9" },
                    ].map((rating, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-text-main">
                          {rating.label}
                        </span>
                        <div className="flex items-center gap-3 shrink-0 w-36 sm:w-44">
                          <div className="h-1.5 flex-grow bg-border-default rounded-full overflow-hidden">
                            <div
                              className="h-full bg-text-main rounded-full"
                              style={{
                                width: `${(parseFloat(rating.score) / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-text-main text-right w-5">
                            {rating.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-6 text-center">
                    Frequently asked questions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {exploreFaqItems.map((item, idx) => (
                      <FaqItem
                        key={idx}
                        question={item.question}
                        answer={item.answer}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Sticky booking selectors (Airbnb-style) */}
              <div className="sticky top-28 bg-surface border border-border-default rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-text-main">
                      {formatPrice(selectedTurf.price)}
                    </span>
                    <span className="text-sm text-text-muted font-medium ml-1">
                      / hour
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Star className="w-3 h-3 fill-text-main text-text-main" />{" "}
                    {selectedTurf.rating > 0
                      ? selectedTurf.rating.toFixed(2)
                      : "4.8"}
                  </div>
                </div>

                {/* Select Date popup box selector */}
                <div className="border border-border-strong rounded-xl overflow-visible text-xs bg-bg relative">
                  {/* Top split */}
                  <div className="grid grid-cols-2 border-b border-border-strong overflow-visible">
                    <div
                      className="p-3 border-r border-border-strong cursor-pointer hover:bg-elevated/25"
                      onClick={() =>
                        setShowCalendarBooking(!showCalendarBooking)
                      }
                    >
                      <label className="block text-[8px] uppercase font-bold text-text-muted">
                        Select Date
                      </label>
                      <span className="font-semibold text-text-main mt-0.5 block truncate flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-lime" />{" "}
                        {formatDisplayDate(selectedDate)}
                      </span>
                    </div>
                    <div className="p-3">
                      <label className="block text-[8px] uppercase font-bold text-text-muted">
                        Format size
                      </label>
                      <span className="font-semibold text-text-main mt-0.5 block truncate">
                        {selectedTurf.size}
                      </span>
                    </div>

                    {/* Inline Calendar Popover */}
                    <AnimatePresence>
                      {showCalendarBooking && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute top-12 left-2 z-50 bg-surface border border-border-default rounded-2xl shadow-xl p-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarPicker
                            selected={selectedDate}
                            onSelect={(v) => {
                              setSelectedDate(v);
                              setShowCalendarBooking(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom selection Pitch */}
                  <div className="p-3">
                    <label className="block text-[8px] uppercase font-bold text-text-muted mb-1.5">
                      Select Pitch
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        `Pitch 1 (${selectedTurf.premium ? "Premium" : "Standard"})`,
                        `Pitch 2 (${selectedTurf.premium ? "Grass" : "Standard"})`,
                      ].map((pitch) => (
                        <button
                          key={pitch}
                          onClick={() => setSelectedPitch(pitch)}
                          className={`py-1.5 border rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all
                            ${selectedPitch === pitch ? "border-text-main bg-elevated text-text-main" : "border-border-default text-text-muted hover:border-border-strong hover:text-text-main"}`}
                        >
                          {pitch.split(" ")[0]} {pitch.split(" ")[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available time slots section */}
                <div className="space-y-3">
                  <label className="block text-[9px] uppercase font-bold text-text-muted">
                    Available time slots
                  </label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-lime" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-xs text-text-muted py-2 bg-elevated/40 rounded-xl">
                      No slots available. Try another date.
                    </p>
                  ) : (
                    <div className="max-h-[280px] overflow-y-auto pr-1 space-y-4">
                      {groupedSlots.map((group) => {
                        const Icon = group.icon;
                        return (
                          <div key={group.title}>
                            <div className="flex items-center gap-1.5 mb-2 text-text-main">
                              <Icon className="w-3.5 h-3.5 text-brand-lime" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {group.title}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {group.slots.map((slot) => {
                                const isSelected =
                                  selectedTimeSlot === slot.time;
                                return (
                                  <button
                                    key={slot.time}
                                    disabled={!slot.available}
                                    onClick={() =>
                                      setSelectedTimeSlot(slot.time)
                                    }
                                    className={`py-1.5 text-[10px] font-medium border rounded-md transition-all text-center sm:text-xs
                                      ${
                                        isSelected
                                          ? "border-text-main bg-text-main text-bg font-bold"
                                          : !slot.available
                                            ? "opacity-30 cursor-not-allowed border-border-subtle line-through"
                                            : "border-border-default text-text-main hover:border-border-strong cursor-pointer"
                                      }`}
                                  >
                                    {format12HourRange(slot.time)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CTA Action button */}
                <button
                  disabled={!selectedTimeSlot}
                  onClick={handleProceedToCheckout}
                  className="w-full bg-brand-lime hover:bg-brand-lime-hover disabled:bg-border-default disabled:text-text-muted text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  Book Turf
                </button>

                {/* Fee calculation breakdown */}
                {selectedTimeSlot && (
                  <div className="border-t border-border-default pt-4 space-y-2.5 text-sm text-text-muted">
                    <div className="flex justify-between">
                      <span className="underline">Base fare</span>
                      <span className="text-text-main">
                        {formatPrice(pricing.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Service fee (5%)</span>
                      <span className="text-text-main">
                        {formatPrice(pricing.serviceFee)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-main border-t border-border-default pt-2.5 text-base">
                      <span>Total</span>
                      <span>{formatPrice(pricing.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BOOKING SUMMARY CHECKOUT MODALS
          ======================================================== */}
      <AnimatePresence>
        {flowStep === "checkout" && selectedTurf && selectedTimeSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Scrim backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setFlowStep("listing");
                setViewMode("details");
              }}
            />

            {/* Checkout Form Modal Card */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-default">
                <h3 className="text-lg font-bold text-text-main">
                  Request to Book
                </h3>
                <button
                  onClick={() => {
                    setFlowStep("listing");
                    setViewMode("details");
                  }}
                  className="p-1 hover:bg-elevated rounded-full border border-border-default transition-colors text-text-muted hover:text-text-main"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Summary details card */}
              <div className="bg-transparent border border-border-default rounded-xl p-4 text-xs font-semibold space-y-3">
                <div className="flex justify-between border-b border-border-strong pb-2">
                  <div>
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Venue Turf
                    </span>
                    <span className="font-bold text-text-main text-sm">
                      {selectedTurf.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Booking Date
                    </span>
                    <span className="font-semibold text-text-main text-xs">
                      {formatDisplayDate(selectedDate)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Time Slot
                    </span>
                    <span className="font-semibold text-text-main text-xs">
                      {format12HourRange(selectedTimeSlot)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Select Pitch
                    </span>
                    <span className="font-semibold text-text-main text-xs">
                      {selectedPitch}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold mb-1">
                      Attendees count
                    </span>
                    <div className="relative w-[100px]">
                      <input
                        type="number"
                        min={2}
                        max={selectedTurf.premium ? 22 : 14}
                        value={attendees}
                        onChange={(e) =>
                          setAttendees(
                            Math.max(2, Math.min(22, Number(e.target.value))),
                          )
                        }
                        className="w-full bg-black border border-border-strong rounded-lg pl-3 pr-2 py-1.5 text-text-main text-xs font-semibold focus:outline-none focus:border-brand-lime transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment selection list */}
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      key: "upi" as const,
                      label: "UPI Payments (GPay, PhonePe, Paytm)",
                      sub: "Instant slot confirmation pass",
                    },
                    {
                      key: "card" as const,
                      label: "Credit & Debit Cards (Visa, MasterCard)",
                      sub: "Major international banks supported",
                    },
                    {
                      key: "netbanking" as const,
                      label: "NetBanking Bank Access",
                      sub: "Redirect to official netbanking portal",
                    },
                    {
                      key: "pay_at_venue" as const,
                      label: "Pay at Venue",
                      sub: "Pay directly at the turf before your game",
                    },
                  ].map((method) => {
                    const isSelected = selectedPayment === method.key;
                    return (
                      <div
                        key={method.key}
                        onClick={() => setSelectedPayment(method.key)}
                        className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                          ${isSelected ? "border-brand-lime bg-transparent" : "border-border-default hover:bg-elevated"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                          ${isSelected ? "border-brand-lime" : "border-border-strong"}`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-brand-lime" />
                          )}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-text-main leading-none">
                            {method.label}
                          </span>
                          <span className="block text-[10px] text-text-muted mt-1 leading-tight">
                            {method.sub}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing breakdown summary */}
              <div className="bg-transparent border border-border-default rounded-xl p-4 flex flex-col gap-2 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Base slot price</span>
                  <span className="text-text-main">
                    {formatPrice(pricing.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee (5%)</span>
                  <span className="text-text-main">
                    {formatPrice(pricing.serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-strong pt-2.5 font-bold text-text-main text-sm">
                  <span>Grand Total</span>
                  <span className="text-brand-lime">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-1">
                <button
                  onClick={handlePayNow}
                  className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  {selectedPayment === "pay_at_venue"
                    ? `Book & Pay at Venue · ${formatPrice(pricing.total)}`
                    : `Pay Now · ${formatPrice(pricing.total)}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          PROCESSING CHECKOUT LOADER
          ======================================================== */}
      <AnimatePresence>
        {flowStep === "processing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-lime" />
              <div>
                <h3 className="text-lg font-bold text-text-main">
                  Securing Your Slot
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-[280px]">
                  Confirming your payment signature and locking slot times.
                  Please do not refresh.
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          CHECKOUT ERROR MODAL
          ======================================================== */}
      <AnimatePresence>
        {flowStep === "error" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-surface border border-border-default rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/25">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main">
                Payment Failed
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {bookingError ||
                  "Something went wrong during checkout. Please try again."}
              </p>
              <div className="flex gap-3 mt-4 w-full justify-center text-xs font-semibold">
                <button
                  onClick={() => setFlowStep("checkout")}
                  className="bg-brand-lime hover:bg-brand-lime-hover text-bg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setFlowStep("listing");
                    setViewMode("list");
                  }}
                  className="bg-elevated border border-border-default text-text-main px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Browse Turfs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          BOOKING CONFIRMED PASS VIEW (Airbnb Style)
          ======================================================== */}
      <AnimatePresence>
        {flowStep === "confirmed" &&
          confirmedBooking &&
          selectedTurf &&
          selectedTimeSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-surface border border-border-default rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 text-center my-8"
              >
                <div className="w-16 h-16 bg-brand-lime/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-lime/20">
                  <Check className="w-8 h-8 text-brand-lime" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-extrabold text-text-main">
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Your pitch reservation has been successfully booked.
                </p>

                {/* Ticket receipt box */}
                <div className="relative mt-6 rounded-2xl overflow-hidden shadow-xl border border-border-default bg-surface">
                  {/* Top Section */}
                  <div className="bg-gradient-to-br from-brand-lime to-green-600 p-5 text-bg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="block text-[10px] uppercase font-bold opacity-80 tracking-widest mb-0.5">
                          Venue
                        </span>
                        <span className="font-extrabold text-lg">
                          {selectedTurf.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[10px] uppercase font-bold opacity-80 tracking-widest mb-1.5">
                          Status
                        </span>
                        <span className="font-black text-xs uppercase px-2 py-0.5 bg-bg text-brand-lime rounded-md shadow-sm">
                          {selectedPayment === "pay_at_venue"
                            ? "Pay at Venue"
                            : "Paid"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] uppercase font-bold opacity-80 tracking-widest mb-0.5">
                          Date
                        </span>
                        <span className="font-semibold text-sm">
                          {formatDisplayDate(selectedDate)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold opacity-80 tracking-widest mb-0.5">
                          Time
                        </span>
                        <span className="font-semibold text-sm">
                          {format12HourRange(selectedTimeSlot)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated separator */}
                  <div className="relative h-6 flex items-center justify-between z-10 px-[-16px]">
                    <div
                      className="w-6 h-6 rounded-full bg-black/60 dark:bg-black/85 absolute -left-3 shadow-inner"
                      style={{ backdropFilter: "blur(4px)" }}
                    ></div>
                    <div className="w-full border-t-[3px] border-dashed border-border-strong mx-5 opacity-50"></div>
                    <div
                      className="w-6 h-6 rounded-full bg-black/60 dark:bg-black/85 absolute -right-3 shadow-inner"
                      style={{ backdropFilter: "blur(4px)" }}
                    ></div>
                  </div>

                  {/* Bottom Section */}
                  <div className="bg-surface p-5 pt-2 text-left">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-5">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-muted tracking-widest mb-0.5">
                          Booking ID
                        </span>
                        <span className="font-bold text-text-main text-sm">
                          {confirmedBooking.booking_code}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-muted tracking-widest mb-0.5">
                          Pitch No
                        </span>
                        <span className="font-bold text-text-main text-sm">
                          {selectedPitch}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-muted tracking-widest mb-0.5">
                          Amount
                        </span>
                        <span className="font-bold text-brand-lime text-sm">
                          {formatPrice(confirmedBooking.total_price)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-text-muted tracking-widest mb-0.5">
                          Attendees
                        </span>
                        <span className="font-bold text-text-main text-sm">
                          {attendees} Players
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border-default pt-5 flex flex-col items-center gap-3">
                      {qrCodeUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrCodeUrl}
                          alt="Booking QR Pass"
                          className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-elevated animate-pulse rounded-xl" />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        Scan at entrance gate
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    onClick={handleDownloadTicket}
                    className="w-full bg-elevated border border-border-default hover:bg-bg text-text-main font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Ticket Pass
                  </button>
                  <button
                    onClick={() => {
                      setFlowStep("listing");
                      setViewMode("list");
                    }}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-bg font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* ========================================================
          AIRBNB FILTERS MODAL
          ======================================================== */}
      <AnimatePresence>
        {isFiltersModalOpen &&
          (() => {
            const isMinOnTop =
              activeSlider === "min" ||
              (activeSlider !== "max" && hoveredSlider === "min");
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Scrim backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
                  onClick={() => setIsFiltersModalOpen(false)}
                />

                {/* Modal Card */}
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-surface border border-border-default rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl z-10"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
                    <button
                      onClick={() => setIsFiltersModalOpen(false)}
                      className="p-1 hover:bg-elevated rounded-full border border-border-default transition-colors text-text-muted hover:text-text-main cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <h3 className="text-base font-bold text-text-main">
                      Filters
                    </h3>
                    <div className="w-6 h-6" /> {/* Spacer */}
                  </div>

                  {/* Scrollable content body */}
                  <div className="p-6 overflow-y-auto space-y-8 flex-grow">
                    {/* Section 1: Recommended for you */}
                    <div className="pb-8 border-b border-border-default mb-8">
                      <h4 className="text-base font-bold text-text-main mb-4">
                        Recommended for you
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          {
                            id: "instant",
                            label: "Instant Book",
                            icon: Zap,
                            color:
                              "text-amber-500 bg-amber-500/10 border-amber-500/20",
                          },
                          {
                            id: "wifi",
                            label: "Spectator Wifi",
                            icon: Wifi,
                            color:
                              "text-blue-500 bg-blue-500/10 border-blue-500/20",
                          },
                          {
                            id: "parking",
                            label: "Free parking",
                            icon: ParkingCircle,
                            color:
                              "text-green-500 bg-green-500/10 border-green-500/20",
                          },
                          {
                            id: "floodlight",
                            label: "Floodlights",
                            icon: Sparkles,
                            color:
                              "text-brand-lime bg-brand-lime/10 border-brand-lime/20",
                          },
                        ].map((card) => {
                          const isChecked = filterAmenities.includes(card.id);
                          const Icon = card.icon;
                          return (
                            <button
                              key={card.id}
                              onClick={() => {
                                setFilterAmenities((prev) =>
                                  isChecked
                                    ? prev.filter((x) => x !== card.id)
                                    : [...prev, card.id],
                                );
                              }}
                              className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 aspect-square select-none
                              ${
                                isChecked
                                  ? "border-text-main bg-elevated/40 ring-1 ring-text-main"
                                  : "border-border-default hover:border-border-strong hover:bg-elevated/10"
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 border ${card.color}`}
                              >
                                <Icon className="w-5 h-5 shrink-0" />
                              </div>
                              <span className="text-[11px] font-bold text-text-main text-center leading-tight">
                                {card.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Type of place */}
                    <div className="pb-8 border-b border-border-default mb-8">
                      <h4 className="text-base font-bold text-text-main mb-3">
                        Type of turf
                      </h4>
                      <div className="flex border border-border-default rounded-full p-1 bg-bg/50 select-none w-full justify-between gap-1">
                        {[
                          { id: "all", label: "Any format" },
                          { id: "5v5", label: "5v5 Pitch" },
                          { id: "7v7", label: "7v7 Pitch" },
                          { id: "11v11", label: "11v11 Pitch" },
                        ].map((fmt) => {
                          const isActive = filterFormat === fmt.id;
                          return (
                            <button
                              key={fmt.id}
                              onClick={() => setFilterFormat(fmt.id)}
                              className={`flex-1 py-3 text-xs font-extrabold text-center rounded-full transition-all cursor-pointer focus:outline-none
                              ${
                                isActive
                                  ? "bg-surface border border-text-main text-text-main shadow-sm"
                                  : "text-text-muted hover:bg-elevated/40 hover:text-text-main"
                              }`}
                            >
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3: Price range */}
                    <div className="pb-8 border-b border-border-default mb-8">
                      <h4 className="text-base font-bold text-text-main mb-1">
                        Price range
                      </h4>
                      <p className="text-xs text-text-muted mb-6 font-medium">
                        Hourly rate for turf pitch bookings, including all taxes
                      </p>

                      {/* Airbnb-style Decorative Price Density Histogram */}
                      <div className="flex items-end justify-between gap-[2px] h-12 px-4 relative select-none">
                        {[
                          15, 20, 30, 25, 40, 55, 70, 85, 95, 80, 65, 50, 45,
                          60, 75, 80, 60, 40, 30, 25, 35, 45, 55, 60, 50, 35,
                          20, 15, 10, 8,
                        ].map((height, i) => {
                          // Calculate if this bar is within the current min/max price range
                          const barPercentage = (i / 30) * 100;
                          const minPercentage =
                            ((filterMinPrice - 500) / 2500) * 100;
                          const maxPercentage =
                            ((filterMaxPrice - 500) / 2500) * 100;
                          const isHighlighted =
                            barPercentage >= minPercentage &&
                            barPercentage <= maxPercentage;
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm transition-all duration-300"
                              style={{
                                height: `${height}%`,
                                backgroundColor: isHighlighted
                                  ? "var(--brand-lime, #4ADE80)"
                                  : "var(--border-strong, #3f3f46)",
                                opacity: isHighlighted ? 1 : 0.25,
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Custom Dual Range Slider */}
                      <div className="relative w-full h-8 flex items-center mb-4 select-none">
                        <div className="relative w-full mx-4 h-full flex items-center">
                          {/* Track line background */}
                          <div className="absolute left-0 right-0 h-1 bg-border-default rounded-full" />
                          {/* Highlighted track line between thumbs */}
                          <div
                            className="absolute h-1 bg-brand-lime rounded-full"
                            style={{
                              left: `${((filterMinPrice - 500) / 2500) * 100}%`,
                              right: `${100 - ((filterMaxPrice - 500) / 2500) * 100}%`,
                            }}
                          />

                          {/* Minimum Range Slider Input */}
                          <input
                            type="range"
                            min={500}
                            max={3000}
                            step={100}
                            value={filterMinPrice}
                            onMouseEnter={() => setHoveredSlider("min")}
                            onMouseLeave={() => setHoveredSlider(null)}
                            onMouseDown={() => setActiveSlider("min")}
                            onMouseUp={() => setActiveSlider(null)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val <= filterMaxPrice) {
                                setFilterMinPrice(val);
                                setMinInputVal(val.toString());
                              }
                            }}
                            className={`absolute left-0 right-0 w-full h-1 pointer-events-none appearance-none bg-transparent outline-none focus:outline-none
                            ${isMinOnTop ? "z-40" : "z-30"}
                            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border-strong [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border-strong [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer`}
                          />

                          {/* Maximum Range Slider Input */}
                          <input
                            type="range"
                            min={500}
                            max={3000}
                            step={100}
                            value={filterMaxPrice}
                            onMouseEnter={() => setHoveredSlider("max")}
                            onMouseLeave={() => setHoveredSlider(null)}
                            onMouseDown={() => setActiveSlider("max")}
                            onMouseUp={() => setActiveSlider(null)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= filterMinPrice) {
                                setFilterMaxPrice(val);
                                setMaxInputVal(val.toString());
                              }
                            }}
                            className={`absolute left-0 right-0 w-full h-1 pointer-events-none appearance-none bg-transparent outline-none focus:outline-none
                            ${isMinOnTop ? "z-30" : "z-40"}
                            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border-strong [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border-strong [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer`}
                          />
                        </div>
                      </div>

                      {/* Dual price inputs */}
                      <div className="grid grid-cols-2 gap-4 items-center">
                        {/* Min Price Box */}
                        <div className="border border-border-default focus-within:border-text-main focus-within:ring-1 focus-within:ring-text-main rounded-full px-6 py-2.5 bg-bg flex flex-col justify-center">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                            Minimum
                          </label>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-sm font-bold text-text-muted">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={minInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  setMinInputVal(val);
                                }
                              }}
                              onBlur={() => {
                                let num = Number(minInputVal);
                                if (isNaN(num) || num < 500) num = 500;
                                if (num > filterMaxPrice) num = filterMaxPrice;
                                setFilterMinPrice(num);
                                setMinInputVal(num.toString());
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  let num = Number(minInputVal);
                                  if (isNaN(num) || num < 500) num = 500;
                                  if (num > filterMaxPrice)
                                    num = filterMaxPrice;
                                  setFilterMinPrice(num);
                                  setMinInputVal(num.toString());
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-full text-sm font-bold text-text-main bg-transparent border-none outline-none focus:ring-0 p-0"
                            />
                          </div>
                        </div>

                        {/* Max Price Box */}
                        <div className="border border-border-default focus-within:border-text-main focus-within:ring-1 focus-within:ring-text-main rounded-full px-6 py-2.5 bg-bg flex flex-col justify-center">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                            Maximum
                          </label>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-sm font-bold text-text-muted">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={maxInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  setMaxInputVal(val);
                                }
                              }}
                              onBlur={() => {
                                let num = Number(maxInputVal);
                                if (isNaN(num) || num > 3000) num = 3000;
                                if (num < filterMinPrice) num = filterMinPrice;
                                setFilterMaxPrice(num);
                                setMaxInputVal(num.toString());
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  let num = Number(maxInputVal);
                                  if (isNaN(num) || num > 3000) num = 3000;
                                  if (num < filterMinPrice)
                                    num = filterMinPrice;
                                  setFilterMaxPrice(num);
                                  setMaxInputVal(num.toString());
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-full text-sm font-bold text-text-main bg-transparent border-none outline-none focus:ring-0 p-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Amenities (Pills) */}
                    <div className="pb-8 border-b border-border-default mb-8">
                      <h4 className="text-base font-bold text-text-main mb-3">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          {
                            id: "water",
                            label: "Drinking water",
                            icon: Droplet,
                          },
                          {
                            id: "changing",
                            label: "Changing rooms",
                            icon: Info,
                          },
                          {
                            id: "rental",
                            label: "Equipment rental",
                            icon: Award,
                          },
                          {
                            id: "first-aid",
                            label: "First Aid kit",
                            icon: ShieldCheck,
                          },
                          {
                            id: "cafeteria",
                            label: "Snacks / Cafe",
                            icon: Coffee,
                          },
                        ].map((amenity) => {
                          const isChecked = filterAmenities.includes(
                            amenity.id,
                          );
                          const Icon = amenity.icon;
                          return (
                            <button
                              key={amenity.id}
                              onClick={() => {
                                setFilterAmenities((prev) =>
                                  isChecked
                                    ? prev.filter((x) => x !== amenity.id)
                                    : [...prev, amenity.id],
                                );
                              }}
                              className={`flex items-center gap-2 border px-4 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 select-none
                              ${
                                isChecked
                                  ? "border-text-main ring-1 ring-text-main text-text-main bg-surface/30"
                                  : "border-border-default text-text-main hover:border-border-strong bg-surface/50"
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${isChecked ? "text-text-main" : "text-text-muted"}`}
                              />
                              <span>{amenity.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 5: Booking Options (Pills) */}
                    <div>
                      <h4 className="text-base font-bold text-text-main mb-3">
                        Booking options
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { id: "instant", label: "Instant Book", icon: Zap },
                          {
                            id: "changing",
                            label: "Free cancellation",
                            icon: Calendar,
                          },
                          { id: "indoor", label: "Indoor Court", icon: Home },
                          { id: "outdoor", label: "Outdoor Field", icon: Sun },
                        ].map((option) => {
                          const isChecked = filterAmenities.includes(option.id);
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                setFilterAmenities((prev) =>
                                  isChecked
                                    ? prev.filter((x) => x !== option.id)
                                    : [...prev, option.id],
                                );
                              }}
                              className={`flex items-center gap-2 border px-4 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 select-none
                              ${
                                isChecked
                                  ? "border-text-main ring-1 ring-text-main text-text-main bg-surface/30"
                                  : "border-border-default text-text-main hover:border-border-strong bg-surface/50"
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${isChecked ? "text-text-main" : "text-text-muted"}`}
                              />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="px-6 py-4 border-t border-border-default flex items-center justify-between shrink-0 bg-surface">
                    <button
                      onClick={() => {
                        setFilterFormat("all");
                        setFilterMinPrice(500);
                        setFilterMaxPrice(3000);
                        setMinInputVal("500");
                        setMaxInputVal("3000");
                        setFilterAmenities([]);
                      }}
                      className="text-xs font-bold text-text-main hover:text-text-main hover:underline cursor-pointer bg-transparent border-none outline-none underline decoration-solid"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setIsFiltersModalOpen(false)}
                      className="bg-text-main hover:bg-text-main/90 text-bg font-extrabold text-xs py-3 px-6 rounded-full transition-all cursor-pointer"
                    >
                      Show {filteredTurfs.length} turf
                      {filteredTurfs.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
