"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Ticket,
  ArrowRight,
  AlertCircle,
  Download,
  X,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import { toast } from "sonner";
import type { Booking, Turf } from "@/lib/types";
import QRCode from "qrcode";

export default function BookingsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfs, setTurfs] = useState<Record<string, Turf>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("all");
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/bookings");
    }
  }, [status, router]);

  // Load bookings on mount when authenticated. setState calls happen inside
  // async callbacks (after the await), which is the correct pattern.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await convexClient.query<Booking[]>(
          "bookings:getMyBookings",
          {},
        );
        if (cancelled) return;
        setBookings(data);
        const turfIds = Array.from(new Set(data.map((b) => b.turf_id)));
        const turfMap: Record<string, Turf> = {};
        await Promise.all(
          turfIds.map(async (id) => {
            try {
              const t = await convexClient.query<Turf | null>("turfs:getById", {
                turfId: id,
              });
              if (t) turfMap[id] = t;
            } catch {
              // ignore individual failures
            }
          }),
        );
        if (cancelled) return;
        setTurfs(turfMap);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load bookings:", err);
          setError("Could not load your bookings. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await convexClient.query<Booking[]>(
        "bookings:getMyBookings",
        {},
      );
      setBookings(data);
      const turfIds = Array.from(new Set(data.map((b) => b.turf_id)));
      const turfMap: Record<string, Turf> = {};
      await Promise.all(
        turfIds.map(async (id) => {
          try {
            const t = await convexClient.query<Turf | null>("turfs:getById", {
              turfId: id,
            });
            if (t) turfMap[id] = t;
          } catch {
            // ignore individual failures
          }
        }),
      );
      setTurfs(turfMap);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Could not load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Refund rules apply.",
      )
    )
      return;
    try {
      await convexClient.mutation<Booking>("bookings:cancel", {
        bookingId,
        reason: "Cancelled by user",
      });
      await loadBookings();
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(
        getErrorMessage(err, "Failed to cancel booking. Please try again."),
      );
    }
  };

  const showQR = async (booking: Booking) => {
    if (qrUrls[booking._id]) {
      setActiveQR(booking._id);
      return;
    }
    try {
      const turf = turfs[booking.turf_id];
      const payload = JSON.stringify({
        code: booking.booking_code,
        turf: turf?.name ?? "Turf",
        date: booking.start_time,
      });
      const url = await QRCode.toDataURL(payload, { width: 256, margin: 1 });
      setQrUrls((prev) => ({ ...prev, [booking._id]: url }));
      setActiveQR(booking._id);
    } catch (err) {
      console.error("Failed to generate QR", err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return b.status === "cancelled";
    if (filter === "upcoming")
      return (
        (b.status === "confirmed" || b.status === "pending") &&
        new Date(b.start_time) > new Date()
      );
    if (filter === "past")
      return (
        b.status === "completed" ||
        ((b.status === "confirmed" || b.status === "pending") &&
          new Date(b.start_time) <= new Date())
      );
    return true;
  });

  if (
    status === "initial" ||
    status === "loading" ||
    status === "unauthenticated"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>My Bookings | Turfzo</title>
        <meta
          name="description"
          content="View and manage your turf bookings on Turfzo. See upcoming slots, past bookings, and download tickets."
        />
        <link rel="canonical" href="https://turfzo.app/bookings" />
      </head>
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 w-full">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-sans font-extrabold tracking-widest text-brand-lime uppercase">
                MY BOOKINGS
              </span>
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main mt-2">
                Your <span className="text-brand-lime">Bookings</span>
              </h1>
              <p className="mt-2 text-text-muted text-sm font-sans">
                Manage upcoming slots and view past bookings.
              </p>
            </div>
            <Link
              href="/explore"
              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-sans font-bold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all w-fit"
            >
              Book a new slot <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          <div className="flex gap-2 mb-6 bg-surface border border-border-subtle rounded-md p-1 w-fit">
            {(["all", "upcoming", "past", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-xs font-sans font-semibold capitalize transition-colors ${
                  filter === f
                    ? "bg-brand-lime text-black"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 bg-error/10 border border-error/20 rounded-md p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-error shrink-0" />
              <p className="text-sm text-error font-sans">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
              <h3 className="font-sans font-bold text-lg text-text-main">
                Loading Bookings
              </h3>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-surface border border-border-default rounded-md p-16 text-center flex flex-col items-center gap-3">
              <Ticket className="w-12 h-12 text-text-muted opacity-50" />
              <h3 className="font-sans font-bold text-lg text-text-main">
                No Bookings Found
              </h3>
              <p className="text-text-muted text-sm font-sans max-w-xs">
                {filter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings.`}
              </p>
              <Link
                href="/explore"
                className="bg-brand-lime text-black font-sans font-bold text-xs py-2.5 px-6 rounded-md mt-2"
              >
                Explore Turfs
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredBookings.map((booking) => {
                const turf = turfs[booking.turf_id];
                const isUpcoming =
                  (booking.status === "confirmed" ||
                    booking.status === "pending") &&
                  new Date(booking.start_time) > new Date();
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border-default hover:border-brand-lime/10 rounded-md p-5 flex flex-col md:flex-row gap-5"
                  >
                    <div className="w-full md:w-40 h-28 bg-elevated rounded-sm overflow-hidden flex-shrink-0 relative">
                      {turf?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={turf.image_url}
                          alt={turf.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-sans font-bold text-base text-text-main">
                            {turf?.name ?? "Turf"}
                          </h3>
                          <span
                            className={`text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                              (booking.status === "confirmed" ||
                                booking.status === "pending") &&
                              isUpcoming
                                ? "bg-brand-lime/10 text-brand-lime border-brand-lime/30"
                                : booking.status === "cancelled"
                                  ? "bg-error/10 text-error border-error/20"
                                  : "bg-white/5 text-text-muted border-border-default"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        {turf && (
                          <p className="text-xs text-text-muted font-sans flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-brand-lime" />{" "}
                            {turf.city ?? turf.address ?? "—"}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-text-muted font-sans">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-brand-lime" />
                            {new Date(booking.start_time).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-lime" />
                            {new Date(booking.start_time).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )}
                          </span>
                          <span className="font-bold text-brand-lime">
                            ₹{booking.total_price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-text-muted/70">
                            #{booking.booking_code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        {isUpcoming && (
                          <>
                            <button
                              onClick={() => showQR(booking)}
                              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-sans font-bold text-xs py-2 px-4 rounded-md flex items-center gap-1.5 transition-colors"
                            >
                              <Ticket className="w-3.5 h-3.5" /> View QR
                            </button>
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="bg-elevated hover:bg-error/10 border border-border-subtle hover:border-error/30 text-text-muted hover:text-error font-sans text-xs py-2 px-4 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {activeQR && qrUrls[activeQR] && (
        <div
          className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveQR(null)}
        >
          <div
            className="bg-surface border border-border-default rounded-md max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-lg text-text-main">
                Booking QR Code
              </h3>
              <button
                onClick={() => setActiveQR(null)}
                className="p-1.5 hover:bg-elevated rounded-full"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrls[activeQR]}
              alt="Booking QR"
              className="w-56 h-56 mx-auto rounded bg-qr-bg p-2"
            />
            <p className="text-xs text-text-muted font-sans mt-4">
              Show this QR at the venue entrance to check in.
            </p>
            <a
              href={qrUrls[activeQR]}
              download={`turfzo-booking-${bookings.find((b) => b._id === activeQR)?.booking_code}.png`}
              className="mt-4 w-full bg-brand-lime text-black font-sans font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
