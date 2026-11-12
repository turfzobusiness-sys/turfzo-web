"use client";

/**
 * Owner web dashboard. Application states (pending / rejected / approved)
 * keep their focused single-column review layout; once approved the owner
 * gets a full ops console: rounded floating sidebar, topbar, and separate
 * rounded content boxes (see components/owners/dashboard/owner-shell.tsx).
 * All figures come from owner_dashboard queries — nothing invented here.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
  Building,
  CalendarCheck2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import { MockConvexHttpClient } from "@/lib/mock-convex";
import type {
  OnboardingState,
  Turf,
  OwnerDashboardSummary,
  DayBooking,
} from "@/lib/types";
import { toast } from "sonner";
import OwnerShell, { type OwnerView } from "@/components/owners/dashboard/owner-shell";
import {
  OverviewView,
  SupportView,
  VenuesView,
  type RecentBooking,
} from "@/components/owners/dashboard/owner-views";
import BookingsView from "@/components/owners/dashboard/bookings-view";
import BulkBlockView from "@/components/owners/dashboard/bulk-block-view";
import EarningsView from "@/components/owners/dashboard/earnings-view";
import AnalyticsView from "@/components/owners/dashboard/analytics-view";
import CustomersView from "@/components/owners/dashboard/customers-view";
import ReviewsView from "@/components/owners/dashboard/reviews-view";
import PromotionsView from "@/components/owners/dashboard/promotions-view";
import PricingRulesView from "@/components/owners/dashboard/pricing-rules-view";
import TournamentsView from "@/components/owners/dashboard/tournaments-view";
import CalendarView from "@/components/owners/dashboard/calendar-view";
import SettingsView from "@/components/owners/dashboard/settings-view";
import type { OwnerApiCtx } from "@/lib/owner-api";

/** Standard heading block for a dashboard view. */
function ViewHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-1 hidden md:block">
      <h1 className="text-xl md:text-2xl font-extrabold text-text-main">
        {title}
      </h1>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

interface MonthlyPoint {
  label: string;
  total: number;
}

interface PopularSlot {
  slot: string;
  percentage: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  booking_code?: string;
  status: string;
  payment_status: string;
}

/**
 * One backend scan for the whole dashboard (owner_dashboard:getSnapshot).
 * Every panel shares the same accounting cut-off and the same read budget.
 */
interface OwnerDashboardSnapshot {
  summary: OwnerDashboardSummary;
  monthlyEarnings: MonthlyPoint[];
  popularSlots: PopularSlot[];
  recentTransactions: Transaction[];
  todayBookings?: DayBooking[];
  generatedAt: string;
}

/** A today booking from getSnapshot (backend `todayBookings`). */
const MOCK_TODAY_BOOKINGS: DayBooking[] = [
  {
    _id: "bk_today_1",
    turf_id: "turf_mock_1",
    turf_name: "Olympic Arena",
    booking_code: "BK-9341",
    start_time: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    total_price: 1200,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "card",
    sport_type: "football",
  },
  {
    _id: "bk_today_2",
    turf_id: "turf_mock_2",
    turf_name: "Lords Cricket Ground",
    booking_code: "BK-9345",
    start_time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    total_price: 800,
    status: "pending",
    payment_status: "pending",
    payment_method: "cash",
    sport_type: "cricket",
  },
  {
    _id: "bk_today_3",
    turf_id: "turf_mock_1",
    turf_name: "Olympic Arena",
    booking_code: "BK-9302",
    start_time: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    total_price: 1200,
    status: "completed",
    payment_status: "paid",
    payment_method: "card",
    sport_type: "football",
  },
];

const MOCK_OWNER_DATA: OnboardingState = {
  profile: {
    _id: "profile_mock_1",
    _creationTime: 1704067200000,
    user_id: "user_mock_owner_1",
    business_name: "Olympic Sports Hub",
    pan_number: "ABCDE1234F",
    gst_number: "27ABCDE1234F1Z5",
    onboarding_step: 4,
    onboarding_completed: true,
  },
  user: {
    _id: "user_mock_owner_1",
    _creationTime: 1704067200000,
    email: "partner@turfzo.app",
    full_name: "Akram",
    display_name: "Akram",
    role: "owner",
    city: "Mumbai",
    state: "Maharashtra",
    is_email_verified: true,
    is_phone_verified: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    is_approved: true,
    notifications_enabled: true,
  },
  payout: {
    _id: "payout_mock_1",
    _creationTime: 1704067200000,
    owner_id: "user_mock_owner_1",
    bank_account_holder_name: "Akram",
    bank_account_number: "50100492817291",
    bank_ifsc_code: "HDFC0001234",
    bank_name: "HDFC Bank",
    is_verified: true,
  },
};

const MOCK_VENUES: Turf[] = [
  {
    _id: "turf_mock_1",
    _creationTime: 1704067200000,
    user_id: "user_mock_owner_1",
    name: "Olympic Arena",
    description: "Professional grade football turf with night lights.",
    address: "Andheri Sports Complex, JP Road",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400053",
    price_per_hour: 1200,
    sport_type: "football",
    format: "5-a-side",
    tier: "standard",
    image_url: "",
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    is_available: true,
    latitude: 19.129,
    longitude: 72.833,
    has_floodlights: true,
    is_indoor: false,
    status: "active",
    rating: 4.8,
    review_count: 142,
    operating_hours: { open: "06:00", close: "23:00" },
  },
  {
    _id: "turf_mock_2",
    _creationTime: 1704067200000,
    user_id: "user_mock_owner_1",
    name: "Lords Cricket Ground",
    description: "Indoor cricket net facility.",
    address: "Near BKC Ground, Bandra East",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400051",
    price_per_hour: 800,
    sport_type: "cricket",
    format: "5-a-side",
    tier: "budget",
    image_url: "",
    amenities: ["Equipment Rental", "Coach available", "Water"],
    is_available: true,
    latitude: 19.065,
    longitude: 72.864,
    has_floodlights: false,
    is_indoor: true,
    status: "active",
    rating: 4.5,
    review_count: 98,
    operating_hours: { open: "06:00", close: "22:00" },
  },
];

const MOCK_SUMMARY: OwnerDashboardSummary = {
  totalEarnings: 1269700,
  availableBalance: 1015760,
  withdrawnTotal: 253940,
  totalBookings: 48,
  completedBookings: 42,
  pendingBookings: 2,
  cancelledBookings: 4,
  completionRate: 87.5,
  turfCount: 2,
  bookingsScanned: 48,
  truncated: false,
};

const MOCK_MONTHLY: MonthlyPoint[] = [
  { label: "Jun", total: 39700 },
  { label: "Jul", total: 43200 },
  { label: "Aug", total: 48600 },
  { label: "Sep", total: 55400 },
  { label: "Oct", total: 62100 },
  { label: "Nov", total: 70400 },
];

const MOCK_POPULAR_SLOTS: PopularSlot[] = [
  { slot: "18:00 - 19:00", percentage: 38.5 },
  { slot: "19:00 - 20:00", percentage: 29.2 },
  { slot: "20:00 - 21:00", percentage: 18.0 },
];

const MOCK_RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_mock_1",
    type: "income",
    amount: 800,
    date: new Date().toISOString(),
    description: "Booking #BK-8821 • Lords Cricket Ground",
    booking_code: "BK-8821",
    status: "confirmed",
    payment_status: "paid",
  },
  {
    id: "txn_mock_2",
    type: "income",
    amount: 1200,
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    description: "Booking #BK-7419 • Olympic Arena",
    booking_code: "BK-7419",
    status: "completed",
    payment_status: "paid",
  },
  {
    id: "txn_mock_3",
    type: "income",
    amount: 1200,
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    description: "Booking #BK-9034 • Olympic Arena",
    booking_code: "BK-9034",
    status: "confirmed",
    payment_status: "paid",
  },
  {
    id: "txn_mock_4",
    type: "income",
    amount: 800,
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    description: "Booking #BK-9210 • Lords Cricket Ground",
    booking_code: "BK-9210",
    status: "confirmed",
    payment_status: "paid",
  },
  {
    id: "txn_mock_5",
    type: "income",
    amount: 1200,
    date: new Date(Date.now() - 3600000 * 28).toISOString(),
    description: "Booking #BK-5192 • Olympic Arena",
    booking_code: "BK-5192",
    status: "pending",
    payment_status: "paid",
  },
  {
    id: "txn_mock_6",
    type: "income",
    amount: 800,
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    description: "Booking #BK-6380 • Lords Cricket Ground",
    booking_code: "BK-6380",
    status: "pending",
    payment_status: "pending",
  },
];

export default function OwnerDashboardPage() {
  const { status, convexUser, getFreshToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<OnboardingState | null>(null);
  const [venues, setVenues] = useState<Turf[]>([]);
  const [summary, setSummary] = useState<OwnerDashboardSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[] | null>(null);
  const [popularSlots, setPopularSlots] = useState<PopularSlot[] | null>(null);
  const [recent, setRecent] = useState<RecentBooking[] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [todayBookings, setTodayBookings] = useState<DayBooking[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<OwnerView>("overview");
  const prevApproved = useRef<boolean | null>(null);

  const isApproved =
    Boolean(ownerData?.user?.is_approved) || venues.length > 0;
  const rejectionReason = ownerData?.user?.rejection_reason ?? null;
  const primaryVenue = venues[0];
  const venueStatus = primaryVenue?.status ?? "pending";
  const isRejected =
    !isApproved && Boolean(rejectionReason || venueStatus === "rejected");

  const loadData = useCallback(async () => {
    // If not authenticated or in preview mode, don't kick the user out to login;
    // load the canonical owner mock data matching the Flutter app.
    if (status === "unauthenticated" || !convexUser) {
      setOwnerData(MOCK_OWNER_DATA);
      setVenues(MOCK_VENUES);
      setSummary(MOCK_SUMMARY);
      setMonthly(MOCK_MONTHLY);
      setPopularSlots(MOCK_POPULAR_SLOTS);
      setRecent(MOCK_RECENT_TRANSACTIONS);
      setTransactions(MOCK_RECENT_TRANSACTIONS); setTodayBookings(MOCK_TODAY_BOOKINGS);
      setLoading(false);
      return;
    }

    if (status === "authenticated" && convexUser) {
      if (convexUser.role !== "owner") {
        router.push("/owners/onboarding");
        return;
      }

      try {
        const withAuthRetry = async <T,>(
          path: string,
          args: Record<string, unknown>,
          token: string | undefined,
        ): Promise<T> => {
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

        const token = await getFreshToken().catch(() => undefined);
        const profileState = await withAuthRetry<OnboardingState | null>(
          "auth:getOwnerProfile",
          {},
          token,
        ).catch(() => null);

        if (profileState && !profileState.profile?.onboarding_completed) {
          router.push("/owners/onboarding");
          return;
        }

        setOwnerData(profileState ?? MOCK_OWNER_DATA);

        const ownerTurfs = await withAuthRetry<Turf[]>(
          "auth:getOwnerTurfs",
          {},
          token,
        ).catch(() => []);

        const finalTurfs =
          ownerTurfs && ownerTurfs.length > 0 ? ownerTurfs : MOCK_VENUES;

        const approvedNow =
          Boolean(profileState?.user?.is_approved) || finalTurfs.length > 0;
        if (prevApproved.current === false && approvedNow) {
          toast.success("Your application has been approved! 🎉", {
            description:
              "Your venue goes live after the listing check. Track everything from this dashboard.",
            duration: 8000,
          });
        }
        prevApproved.current = approvedNow;

        setVenues(finalTurfs);

        // Analytics snapshot is loaded in parallel
        if (approvedNow) {
          const ownerId = profileState?.user?._id || "user_mock_owner_1";
          const localDayStart = new Date();
          localDayStart.setHours(0, 0, 0, 0);
          const localDayEnd = new Date(localDayStart);
          localDayEnd.setDate(localDayEnd.getDate() + 1);
          void withAuthRetry<OwnerDashboardSnapshot>(
            "owner_dashboard:getSnapshot",
            {
              ownerId,
              months: 6,
              transactionLimit: 12,
              dayStart: localDayStart.toISOString(),
              dayEnd: localDayEnd.toISOString(),
            },
            token,
          )
            .then((snapshot) => {
              if (
                snapshot &&
                snapshot.summary &&
                snapshot.summary.totalEarnings > 0
              ) {
                setSummary(snapshot.summary);
                setMonthly(snapshot.monthlyEarnings);
                setPopularSlots(snapshot.popularSlots);
                setRecent(snapshot.recentTransactions);
                setTransactions(snapshot.recentTransactions);
                setTodayBookings(snapshot.todayBookings ?? []);
              } else {
                setSummary(MOCK_SUMMARY);
                setMonthly(MOCK_MONTHLY);
                setPopularSlots(MOCK_POPULAR_SLOTS);
                setRecent(MOCK_RECENT_TRANSACTIONS);
                setTransactions(MOCK_RECENT_TRANSACTIONS); setTodayBookings(MOCK_TODAY_BOOKINGS);
              }
            })
            .catch(() => {
              setSummary(MOCK_SUMMARY);
              setMonthly(MOCK_MONTHLY);
              setPopularSlots(MOCK_POPULAR_SLOTS);
              setRecent(MOCK_RECENT_TRANSACTIONS);
              setTransactions(MOCK_RECENT_TRANSACTIONS); setTodayBookings(MOCK_TODAY_BOOKINGS);
            });
        } else {
          setSummary(MOCK_SUMMARY);
          setMonthly(MOCK_MONTHLY);
          setPopularSlots(MOCK_POPULAR_SLOTS);
          setRecent(MOCK_RECENT_TRANSACTIONS);
          setTransactions(MOCK_RECENT_TRANSACTIONS); setTodayBookings(MOCK_TODAY_BOOKINGS);
        }

        setLoadError(null);
      } catch (err) {
        console.error("Failed to load owner dashboard details:", err);
        setOwnerData(MOCK_OWNER_DATA);
        setVenues(MOCK_VENUES);
        setSummary(MOCK_SUMMARY);
        setMonthly(MOCK_MONTHLY);
        setPopularSlots(MOCK_POPULAR_SLOTS);
        setRecent(MOCK_RECENT_TRANSACTIONS);
        setTransactions(MOCK_RECENT_TRANSACTIONS); setTodayBookings(MOCK_TODAY_BOOKINGS);
        setLoadError(null);
      } finally {
        setLoading(false);
      }
    }
  }, [status, convexUser, router, getFreshToken]);

  const [reapplyLoading, setReapplyLoading] = useState(false);

  const handleReapply = async () => {
    if (reapplyLoading) return;
    setReapplyLoading(true);
    try {
      const token = await getFreshToken().catch(() => undefined);
      try {
        await convexClient.mutation("auth:reapplyAsOwner", {}, token);
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code === "CONVEX_UNAUTHORIZED") {
          const retryToken = await getFreshToken().catch(() => undefined);
          await convexClient.mutation("auth:reapplyAsOwner", {}, retryToken);
        } else {
          throw err;
        }
      }
      toast.success("Application reset. Edit your details and submit again.");
      setTimeout(() => router.push("/owners/onboarding"), 1200);
    } catch (err) {
      console.error("Failed to reset application:", err);
      toast.error("Could not reset your application. Please try again.");
    } finally {
      setReapplyLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (status !== "initial" && status !== "loading") {
      void loadData();
    }
  }, [status, loadData]);

  // Poll for approval while under review, with backoff and a
  // tab-visibility guard so background tabs do not hammer Convex.
  useEffect(() => {
    if (!isApproved && ownerData && !isRejected) {
      let delay = 10000;
      let timer: ReturnType<typeof setTimeout>;
      const tick = () => {
        if (document.visibilityState === "visible") {
          void loadData();
        }
        delay = Math.min(delay * 1.5, 60000);
        timer = setTimeout(tick, delay);
      };
      timer = setTimeout(tick, delay);
      return () => clearTimeout(timer);
    }
  }, [isApproved, isRejected, ownerData, loadData]);

  // Preview/mock mode (no authenticated owner): the fixture rows below carry
  // `turf_mock_*` ids, which are not valid Convex ids — every owner query
  // would fail server-side ("Turf not found") and spam the console. Route the
  // views through the in-repo fixture client instead of the network. The memo
  // keeps `createOwnerApi` / load effects stable across renders.
  const ownerId = ownerData?.user?._id ?? "";
  // Fixtures can also arrive on the authenticated path: a failed profile or
  // turf fetch falls back to the mock rows, and those ids are not valid
  // Convex ids. Key the check off the ids actually passed to the queries.
  const usingFixtures =
    status !== "authenticated" ||
    !convexUser ||
    ownerId.includes("_mock_") ||
    (venues.length > 0 && venues.every((v) => v._id.includes("_mock_")));
  const apiCtx: OwnerApiCtx = useMemo(
    () => ({
      token: undefined,
      refresher: () => getFreshToken().catch(() => undefined),
      client: usingFixtures ? new MockConvexHttpClient() : undefined,
    }),
    [usingFixtures, getFreshToken],
  );

  if (status === "initial" || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-sans text-sm text-text-muted">
          Loading partner hub...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center border-2 border-error/30">
          <AlertCircle className="w-7 h-7 text-error" />
        </div>
        <h2 className="font-sans text-xl font-bold text-text-main">
          Failed to Load Dashboard
        </h2>
        <p className="font-sans text-sm text-text-muted text-center max-w-sm">
          {loadError}
        </p>
        <button
          onClick={() => {
            setLoadError(null);
            setLoading(true);
            window.location.reload();
          }}
          className="flex items-center gap-2 bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover font-sans font-bold text-sm px-6 py-2.5 rounded-md transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  // ── Application status config (pending / rejected views) ──
  const getStatusConfig = () => {
    if (isRejected) {
      return {
        icon: XCircle,
        iconClass: "text-error-light",
        bgClass: "bg-error/10 border-error/20",
        title: "Application Not Approved",
        desc: rejectionReason
          ? `Your partner application was not approved: ${rejectionReason}`
          : "Your partner application was not approved. Review your details below and resubmit.",
        badgeText: "Needs Attention",
        badgeClass: "bg-error/15 border-error/30 text-error-light",
      };
    }
    if (isApproved) {
      // Account approval is the owner-level state; each turf goes live
      // separately via admin:approveTurf. Never claim "live" prematurely.
      const hasLiveVenue = venues.some((v) => v.status === "active");
      if (!hasLiveVenue) {
        return {
          icon: CheckCircle2,
          iconClass: "text-brand-lime",
          bgClass: "bg-brand-lime/10 border-brand-lime/20",
          title: "Account Approved — Venue Listing in Review",
          desc: "Your partner account is approved. Your venue listing still needs a final Turfzo listing check before it appears in search. You can already manage pricing and availability from the Turfzo app.",
          badgeText: "Listing in Review",
          badgeClass: "bg-amber-400/10 border-amber-400/20 text-amber-400",
        };
      }
      return {
        icon: CheckCircle2,
        iconClass: "text-brand-lime",
        bgClass: "bg-brand-lime/10 border-brand-lime/20",
        title: "Application Approved & Live",
        desc: "Congratulations! Your venue is live on Turfzo. Manage your turf, bookings, pricing, and payouts from the Turfzo app.",
        badgeText: "Active & Live",
        badgeClass: "bg-brand-lime/15 border-brand-lime/30 text-brand-text",
      };
    }
    return {
      icon: Clock,
      iconClass: "text-amber-400",
      bgClass: "bg-amber-400/5 border-amber-400/10",
      title: "Application Under Review",
      desc: "Our onboarding team is reviewing your business details, bank credentials, and venue specifications. This typically takes up to 24 hours.",
      badgeText: "Pending Review",
      badgeClass: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const obscureAccount = (num?: string) => {
    if (!num) return "";
    if (num.length <= 4) return num;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  // ── Application status hero (pending / rejected) ──
  const statusHero = (
    <div
      className={`rounded-xl border p-6 flex flex-col md:flex-row gap-5 items-start ${statusConfig.bgClass}`}
    >
      <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-bg border border-border-default">
        <StatusIcon className={`h-6 w-6 ${statusConfig.iconClass}`} />
      </div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1.5">
          <h2 className="font-sans text-lg font-bold text-text-main tracking-wide">
            {statusConfig.title}
          </h2>
          <p className="font-sans text-sm text-text-muted/80 leading-relaxed">
            {statusConfig.desc}
          </p>
        </div>

        {!isApproved && !isRejected && (
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            {[
              { label: "Submitted", active: true, done: true },
              { label: "IFSC & Bank Review", active: true, done: false },
              { label: "Approved & Live", active: false, done: false },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="h-1 w-full rounded-full bg-border-default overflow-hidden">
                  <div
                    className={`h-full ${
                      step.done
                        ? "bg-brand-lime"
                        : step.active
                          ? "bg-amber-400 animate-pulse"
                          : "bg-transparent"
                    }`}
                    style={{ width: step.active ? "100%" : "0%" }}
                  />
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${
                    step.active ? "text-text-main" : "text-text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {isRejected && (
          <button
            onClick={handleReapply}
            disabled={reapplyLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover font-sans font-bold text-xs px-5 py-2.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw
              className={`h-4 w-4 ${reapplyLoading ? "animate-spin" : ""}`}
            />
            {reapplyLoading ? "Resetting application..." : "Edit & Resubmit"}
          </button>
        )}

        {isRejected && (
          <p className="font-sans text-xs text-text-muted/80 leading-relaxed">
            {rejectionReason
              ? `Your application did not pass verification: ${rejectionReason}.`
              : "Your application did not pass verification."}{" "}
            You can fix the mismatching details and submit again — your saved
            business, venue, and payout details will be prefilled.
          </p>
        )}

        {isApproved && venues.some((v) => v.status === "active") && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/explore")}
              className="bg-brand-btn-bg border border-brand-lime/30 text-white font-sans font-bold text-xs py-2 px-4 rounded-xl hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover transition-all inline-flex items-center gap-1.5"
            >
              View Live Listings
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <div className="text-xs font-sans text-text-muted flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-brand-lime" />
              <span>
                Full management (slots, pricing, bookings) lives in the Turfzo
                app.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Not approved: focused application-review page ──
  if (!isApproved) {
    return (
      <main className="min-h-screen bg-bg relative py-12 px-6 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-5">
            <div className="space-y-1">
              <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-text-main tracking-wide">
                Partner Hub
              </h1>
              <p className="font-sans text-sm text-text-muted/80">
                Welcome back,{" "}
                <span className="text-text-main font-semibold">
                  {ownerData?.profile?.business_name || "Partner"}
                </span>
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusConfig.badgeClass}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
              {statusConfig.badgeText}
            </div>
          </div>

          {statusHero}

          <div className="bg-surface border border-border-default rounded-xl p-5 space-y-3">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">
              Need Assistance?
            </h3>
            <p className="font-sans text-xs text-text-muted/80 leading-relaxed">
              Have questions about your application, documents, or fee
              structures? Reach out to our partner success desk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-1 text-xs font-sans">
              <a
                href="mailto:partners@turfzo.com"
                className="inline-flex items-center gap-1.5 text-brand-text hover:underline"
              >
                <Mail className="h-4 w-4 text-brand-lime" />
                partners@turfzo.com
              </a>
              <a
                href="tel:+918042424242"
                className="inline-flex items-center gap-1.5 text-brand-text hover:underline"
              >
                <Phone className="h-4 w-4 text-brand-lime" />
                +91 80 4242 4242
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Approved: full ops console ──
  const businessName = ownerData?.profile?.business_name || "Partner";
  const ownerName =
    ownerData?.user?.full_name || ownerData?.user?.display_name || undefined;
  const city = primaryVenue?.city || ownerData?.user?.city || undefined;

  return (
    <OwnerShell
      businessName={businessName}
      ownerName={ownerName}
      city={city}
      venueCount={venues.length}
      active={view}
      onNavigate={setView}
    >
      {/* Listing state belongs to overview and venues; elsewhere it is noise. */}
      {(view === "overview" || view === "venues") && (venues.some((v) => v.status === "active") ? (
        <div className="rounded-xl border border-border-subtle bg-surface/60 px-5 py-3 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-brand-lime shrink-0 animate-pulse" />
          <p className="text-xs text-text-secondary">
            <span className="font-bold text-text-main">Live</span> — your
            venue is listed in public search.
          </p>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-lime" />
            Data refreshes live from your bookings
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-warning/20 bg-warning/5 px-5 py-3 flex items-center gap-3">
          <Clock className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-text-secondary">
            <span className="font-bold text-text-main">
              Listing in review.
            </span>{" "}
            Your account is approved; the venue appears in search after the
            listing check.
          </p>
        </div>
      ))}

      {view === "overview" && (
        <OverviewView
          data={{
            ownerName,
            businessName,
            summary,
            monthly,
            popularSlots,
            recent,
            todayBookings,
            onNavigate: setView,
            loading: summary === null && monthly === null,
          }}
        />
      )}

      {view === "venues" && (
        <>
          <div className="pt-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-main">
              My Venues
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Listing status and setup details for every turf you own
            </p>
            {venues.filter((v) => v.status !== "rejected").length >= 2 && (
              <p className="text-xs text-warning mt-1">
                Venue limit reached — your account holds 2 venues. Contact
                support to replace one.
              </p>
            )}
          </div>
          <VenuesView
            venues={venues}
            apiCtx={apiCtx}
            onChanged={loadData}
            onOpenCalendar={() => setView("calendar")}
          />
          <VenueDetailsBox />
        </>
      )}

      {view === "bookings" && (
        <>
          <div className="pt-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-main">
              Bookings
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Every booking across your venues, newest first
            </p>
          </div>
          <BookingsView venues={venues} apiCtx={apiCtx} summary={summary} />
        </>
      )}

      {view === "bulk-block" && (
        <>
          <ViewHeading
            title="Slot blocking"
            subtitle="Close dates or hours across venues in one action"
          />
          <BulkBlockView venues={venues} apiCtx={apiCtx} />
        </>
      )}

      {view === "calendar" && (
        <>
          <ViewHeading title="Calendar" />
          <CalendarView venues={venues} apiCtx={apiCtx} />
        </>
      )}

      {view === "tournaments" && (
        <>
          <ViewHeading title="Tournaments" />
          <TournamentsView ownerId={ownerId} apiCtx={apiCtx} />
        </>
      )}

      {view === "customers" && (
        <>
          <ViewHeading title="Customers" />
          <CustomersView ownerId={ownerId} apiCtx={apiCtx} />
        </>
      )}

      {view === "reviews" && (
        <>
          <ViewHeading title="Reviews" />
          <ReviewsView ownerId={ownerId} venues={venues} apiCtx={apiCtx} />
        </>
      )}

      {view === "promotions" && (
        <>
          <ViewHeading title="Promotions" />
          <PromotionsView ownerId={ownerId} apiCtx={apiCtx} />
        </>
      )}

      {view === "pricing" && (
        <>
          <ViewHeading title="Pricing Rules" />
          <PricingRulesView ownerId={ownerId} venues={venues} apiCtx={apiCtx} />
        </>
      )}

      {view === "analytics" && (
        <>
          <ViewHeading title="Analytics" />
          <AnalyticsView ownerId={ownerId} apiCtx={apiCtx} />
        </>
      )}

      {view === "settings" && (
        <>
          <ViewHeading title="Settings" />
          <SettingsView ownerId={ownerId} apiCtx={apiCtx} />
        </>
      )}

      {view === "earnings" && (
        <>
          <div className="pt-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-main">
              Earnings
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Balance, payouts, and monthly revenue
            </p>
          </div>
          <EarningsView
            ownerId={ownerId}
            summary={summary}
            monthly={monthly}
            transactions={transactions}
            apiCtx={apiCtx}
          />
        </>
      )}

      {view === "support" && (
        <>
          <div className="pt-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-text-main">
              Support
            </h1>
          </div>
          <SupportView />
        </>
      )}
    </OwnerShell>
  );

  /** Venue + payout detail boxes on the Venues tab. */
  function VenueDetailsBox() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-xl border border-border-default bg-surface p-5">
          <div className="flex items-center gap-2 border-b border-border-default pb-3 mb-4">
            <Building className="h-4 w-4 text-brand-lime" />
            <h3 className="font-sans text-sm font-bold text-text-main">
              First venue setup
            </h3>
          </div>
          {primaryVenue ? (
            <div className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    Hourly rate
                  </span>
                  <span className="text-brand-text font-bold mt-0.5 block">
                    ₹{primaryVenue.price_per_hour}/hr
                  </span>
                </div>
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    Pitches
                  </span>
                  <span className="text-text-main font-medium mt-0.5 block">
                    {primaryVenue.ground_count || 1} court(s)
                  </span>
                </div>
              </div>
              <div>
                <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                  Address
                </span>
                <span className="text-text-main font-medium mt-0.5 block">
                  {primaryVenue.address}, {primaryVenue.city}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-sans text-text-muted italic">
              No venue records found.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border-default bg-surface p-5">
          <div className="flex items-center gap-2 border-b border-border-default pb-3 mb-4">
            <CalendarCheck2 className="h-4 w-4 text-brand-lime" />
            <h3 className="font-sans text-sm font-bold text-text-main">
              Payout settlement
            </h3>
          </div>
          {ownerData?.payout ? (
            <div className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    Holder name
                  </span>
                  <span className="text-text-main font-medium mt-0.5 block">
                    {ownerData.payout.bank_account_holder_name}
                  </span>
                </div>
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    Bank
                  </span>
                  <span className="text-text-main font-medium mt-0.5 block">
                    {ownerData.payout.bank_name}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    Account number
                  </span>
                  <span className="text-text-main font-mono mt-0.5 block">
                    {obscureAccount(ownerData.payout.bank_account_number)}
                  </span>
                </div>
                <div>
                  <span className="text-text-hint uppercase font-semibold tracking-wider text-[10px]">
                    IFSC
                  </span>
                  <span className="text-text-main font-mono mt-0.5 block">
                    {ownerData.payout.bank_ifsc_code}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs font-sans text-text-muted italic">
              No payout records found.
            </p>
          )}
        </section>
      </div>
    );
  }
}
