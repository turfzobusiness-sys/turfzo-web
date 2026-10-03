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

export default function BookingsPage() {
  const router = useRouter();
  const { status, convexUser, getFreshToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfs, setTurfs] = useState<Record<string, Turf>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("all");
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newStartHour, setNewStartHour] = useState("10");
  const [newDuration, setNewDuration] = useState("1");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/bookings");
    }
  }, [status, router]);

  // Load bookings on mount when authenticated. setState calls happen inside
  // async callbacks (after the await), which is the correct pattern.
  // Authenticated reads pass a fresh Firebase ID token explicitly; on a
  // 401 (token raced expiry) retry once with a new token before failing.
  const queryWithAuthRetry = async <T,>(
    path: string,
    args: Record<string, unknown>,
  ): Promise<T> => {
    const token = await getFreshToken().catch(() => undefined);
    try {
      return await convexClient.query<T>(path, args, token);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "CONVEX_UNAUTHORIZED") {
        const retryToken = await getFreshToken().catch(() => undefined);
        return await convexClient.query<T>(path, args, retryToken);
      }
      throw err;
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await queryWithAuthRetry<Booking[]>(
          "bookings:getMyBookings",
          {},
        );
        if (cancelled) return;
        setBookings(data);
        const turfIds = Array.from(new Set(data.map((b) => b.turf_id)));
        const turfMap: Record<string, Turf> = {};
        try {
          // One batched call instead of one request per turf (N+1).
          const turfs = await convexClient.query<Turf[]>("turfs:getMany", {
            turfIds,
          });
          for (const t of turfs) turfMap[t._id] = t;
        } catch {
          // batch failure: cards fall back to placeholders
        }
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

  const loadBookings = async (
    activeFilter: "all" | "upcoming" | "past" | "cancelled" = filter,
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Server-side filtering: upcoming/past/cancelled use dedicated
      // indexed queries; "all" uses the hydrated getMyBookings list.
      const userId = convexUser?._id;
      let data: Booking[];
      if (userId && activeFilter === "upcoming") {
        data = await queryWithAuthRetry<Booking[]>(
          "bookings:getUpcomingForUser",
          { userId, limit: 100 },
        );
      } else if (userId && activeFilter === "past") {
        data = await queryWithAuthRetry<Booking[]>(
          "bookings:getPastForUser",
          { userId, limit: 100 },
        );
      } else if (userId && activeFilter === "cancelled") {
        data = await queryWithAuthRetry<Booking[]>(
          "bookings:getForUserByStatus",
          { userId, status: "cancelled", limit: 100 },
        );
      } else {
        data = await queryWithAuthRetry<Booking[]>(
          "bookings:getMyBookings",
          {},
        );
      }
      setBookings(data);
      const turfIds = Array.from(new Set(data.map((b) => b.turf_id)));
      const turfMap: Record<string, Turf> = {};
      try {
        // One batched call instead of one request per turf (N+1).
        const turfs = await convexClient.query<Turf[]>("turfs:getMany", {
          turfIds,
        });
        for (const t of turfs) turfMap[t._id] = t;
      } catch {
        // batch failure: cards fall back to placeholders
      }
      setTurfs(turfMap);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Could not load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refund disclosure for the cancel confirm — mirrors the mobile app's
   * dialog. Amounts come from bookings:getRefundPreview, which runs the
   * SAME math the cancellation itself runs, so this can never disagree
   * with the actual refund.
   *
   * The backend deliberately RETAINS the service fee on cancellation, so
   * this never promises a refund of `total_price` (the pre-fee slot
   * subtotal) as a "full refund" without saying the fee is kept. It names
   * the refundable base and the non-refundable fee explicitly.
   */
  const refundMessage = (
    preview: {
      refundAmount: number;
      refundPolicy: string;
      chargedOnline: boolean;
      canCancel: boolean;
    } | null,
    booking: Booking,
  ): string => {
    const base = Math.round(booking.total_price);
    const fee = Math.round(booking.service_fee ?? 0);
    const feeNote =
      fee > 0 ? ` The \u20B9${fee} service fee is non-refundable.` : "";
    if (!preview) {
      return `Are you sure you want to cancel this booking? The \u20B9${base} slot price is refundable.${feeNote} If refund details are unavailable, the policy that applied at booking time is used.`;
    }
    if (!preview.canCancel) {
      return "This booking can no longer be cancelled — the slot has already started or its status has changed.";
    }
    switch (preview.refundPolicy) {
      case "not_charged":
        return "This is a pay-at-venue booking — nothing has been charged, so there is nothing to refund.";
      case "full":
        return `You will receive a FULL refund of the \u20B9${base} slot price back to your original payment method (may take 5\u20137 days to appear).${feeNote}`;
      case "partial":
        return `Cancelling now refunds 50% of the \u20B9${base} slot price: \u20B9${Math.round(preview.refundAmount)} to your original payment method.${feeNote} Full slot-price refunds only apply 24+ hours before the slot.`;
      default:
        return `No refund is available — cancellations within 6 hours of the slot are non-refundable.${feeNote}`;
    }
  };

  const handleCancel = async (booking: Booking) => {
    // Fetch the refund preview first so the confirm dialog shows real
    // numbers. A failed lookup never blocks cancellation.
    let preview = null;
    try {
      preview = await convexClient.query<{
        refundAmount: number;
        refundPolicy: string;
        chargedOnline: boolean;
        canCancel: boolean;
      }>("bookings:getRefundPreview", { bookingId: booking._id });
    } catch {
      preview = null;
    }
    if (!confirm(refundMessage(preview, booking))) return;
    try {
      await convexClient.mutation<Booking>("bookings:cancel", {
        bookingId: booking._id,
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
      const { default: QRCode } = await import("qrcode");
      const url = await QRCode.toDataURL(payload, { width: 256, margin: 1 });
      setQrUrls((prev) => ({ ...prev, [booking._id]: url }));
      setActiveQR(booking._id);
    } catch (err) {
      console.error("Failed to generate QR", err);
    }
  };

  // Reload from the server whenever the tab changes so each tab uses
  // its dedicated indexed query instead of client-side filtering.
  const handleFilterChange = (f: "all" | "upcoming" | "past" | "cancelled") => {
    setFilter(f);
    void loadBookings(f);
  };

  const handleReschedule = async (booking: Booking) => {
    if (!newDate || !newStartHour) {
      toast.error("Pick a new date and start hour.");
      return;
    }
    const startHour = parseInt(newStartHour, 10);
    const duration = parseInt(newDuration, 10) || 1;
    if (startHour < 0 || startHour > 23 || duration < 1 || duration > 4) {
      toast.error("Enter a valid hour (0-23) and duration (1-4 hours).");
      return;
    }
    const start = new Date(`${newDate}T${String(startHour).padStart(2, "0")}:00:00Z`);
    const end = new Date(start.getTime() + duration * 3_600_000);
    try {
      const token = await getFreshToken().catch(() => undefined);
      await convexClient.mutation(
        "bookings:reschedule",
        {
          bookingId: booking._id,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
        token,
      );
      toast.success("Booking rescheduled!");
      setRescheduling(null);
      await loadBookings();
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(
        getErrorMessage(err, "Failed to reschedule. Please try again."),
      );
    }
  };

  const filteredBookings = bookings;

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
              className="bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-sm py-3 px-6 rounded-md inline-flex items-center gap-1.5 transition-all w-fit"
            >
              Book a new slot <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          <div className="flex gap-2 mb-6 bg-surface border border-border-subtle rounded-md p-1 w-fit">
            {(["all", "upcoming", "past", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
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
                className="bg-brand-lime text-white dark:text-black font-sans font-bold text-xs py-2.5 px-6 rounded-md mt-2"
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
                          {(booking.payment_status === "refunded" ||
                            (booking.refunded_amount ?? 0) > 0) && (
                            <span className="text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-md border bg-info/10 text-info border-info/20">
                              refunded
                              {(booking.refunded_amount ?? 0) > 0
                                ? ` ₹${booking.refunded_amount}`
                                : ""}
                            </span>
                          )}
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
                          <span className="text-text-muted font-mono">
                            #{booking.booking_code}
                          </span>
                        </div>
                        {/* The service fee is charged (total_price +
                            service_fee), so it is shown rather than
                            silently folded into a single number. */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-text-muted font-sans">
                          <span>Slot price ₹{booking.total_price.toLocaleString("en-IN")}</span>
                          <span>
                            Service fee ₹{(booking.service_fee ?? 0).toLocaleString("en-IN")}
                          </span>
                          <span className="font-semibold text-text-main">
                            Total ₹
                            {(
                              (booking.total_price ?? 0) +
                              (booking.service_fee ?? 0)
                            ).toLocaleString("en-IN")}
                          </span>
                          {booking.payment_method === "cash" && (
                            <span className="text-amber-500">
                              Pay at venue
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        {isUpcoming && (
                          <>
                            {/* An admission pass is only valid once the
                                server says confirmed. A pending booking is
                                still awaiting the venue, so no gate-scan QR
                                is issued. */}
                            {booking.status === "confirmed" ? (
                              <button
                                onClick={() => showQR(booking)}
                                className="bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold text-xs py-2 px-4 rounded-md flex items-center gap-1.5 transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" /> View QR
                              </button>
                            ) : (
                              <span className="text-[11px] text-text-muted font-sans px-1">
                                Awaiting venue approval — pass issued once
                                confirmed
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setRescheduling(booking._id);
                                setNewDate(
                                  new Date(booking.start_time)
                                    .toISOString()
                                    .slice(0, 10),
                                );
                              }}
                              className="bg-elevated hover:bg-brand-lime/10 border border-border-subtle hover:border-brand-lime/30 text-text-main font-sans text-xs py-2 px-4 rounded-md transition-colors"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(booking)}
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

      {rescheduling && (
        <div
          className="fixed inset-0 z-50 bg-overlay-heavy backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setRescheduling(null)}
        >
          <div
            className="bg-surface border border-border-default rounded-md max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-sans font-bold text-lg text-text-main mb-1">
              Reschedule booking
            </h3>
            <p className="text-xs text-text-muted font-sans mb-4">
              Pick a new date and start hour (whole hours only, within 7 days).
              Price differences are settled at the venue or refunded per policy.
            </p>
            <label className="block text-xs font-semibold text-text-muted mb-1">
              New date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-main mb-3"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Start hour (0-23 UTC)
                </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newStartHour}
                  onChange={(e) => setNewStartHour(e.target.value)}
                  className="w-full bg-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-main"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Duration (hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full bg-elevated border border-border-subtle rounded-md px-3 py-2 text-sm text-text-main"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRescheduling(null)}
                className="flex-1 py-2.5 border border-border-subtle rounded-md text-sm font-semibold text-text-muted hover:text-text-main"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const b = bookings.find((x) => x._id === rescheduling);
                  if (b) void handleReschedule(b);
                }}
                className="flex-1 py-2.5 bg-brand-lime text-white dark:text-black rounded-md text-sm font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="mt-4 w-full bg-brand-lime text-white dark:text-black font-sans font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-1.5"
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
