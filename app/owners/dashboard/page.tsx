"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building, 
  CreditCard, 
  Mail, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Smartphone,
  TrendingUp,
  CalendarCheck2,
  X
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import type {
  OnboardingState,
  Turf,
  OwnerDashboardSummary,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OwnerDashboardPage() {
  const { status, convexUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<OnboardingState | null>(null);
  const [venues, setVenues] = useState<Turf[]>([]);
  const [summary, setSummary] = useState<OwnerDashboardSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const prevApproved = useRef<boolean | null>(null);

  const isApproved = Boolean(ownerData?.user?.is_approved);
  const rejectionReason = ownerData?.user?.rejection_reason ?? null;
  const primaryVenue = venues[0];
  const venueStatus = primaryVenue?.status ?? "pending"; // pending, approved, rejected, active, inactive
  // Rejection is tracked on the user row (set by admin:rejectOwner); the
  // venue status is a fallback for applications rejected before that field.
  const isRejected = !isApproved && Boolean(rejectionReason || venueStatus === "rejected");

  const loadData = useCallback(async () => {
    if (status === "unauthenticated") {
      router.push("/owners/register?login=true");
      return;
    }

    if (status === "authenticated" && convexUser) {
      if (convexUser.role !== "owner") {
        router.push("/owners/onboarding");
        return;
      }

      try {
        const profileState =
          await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");

        if (profileState && !profileState.profile?.onboarding_completed) {
          router.push("/owners/onboarding");
          return;
        }

        setOwnerData(profileState);

        const ownerTurfs = await convexClient.query<Turf[]>("auth:getOwnerTurfs");

        // Detect approval transition so we can celebrate it once.
        const approvedNow = Boolean(profileState?.user?.is_approved);
        if (prevApproved.current === false && approvedNow) {
          toast.success("Your application has been approved! 🎉", {
            description:
              "Your venue is live. Manage your turf, bookings, and payouts from the Turfzo app.",
            duration: 8000,
          });
        }
        prevApproved.current = approvedNow;

        setVenues(ownerTurfs);

        // Approved owners get a read-only analytics snapshot. Management
        // lives in the Turfzo app — this page only ever displays data.
        if (approvedNow && profileState?.user?._id) {
          const s = await convexClient.query<OwnerDashboardSummary>(
            "owner_dashboard:getSummary",
            { ownerId: profileState.user._id },
          );
          setSummary(s);
        } else {
          setSummary(null);
        }

        setLoadError(null);
      } catch (err) {
        console.error("Failed to load owner dashboard details:", err);
        setLoadError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }, [status, convexUser, router]);

  const [reapplyLoading, setReapplyLoading] = useState(false);

  const handleReapply = async () => {
    if (reapplyLoading) return;
    setReapplyLoading(true);
    try {
      await convexClient.mutation("auth:reapplyAsOwner", {});
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
      void (async () => {
        await loadData();
      })();
    }
  }, [status, loadData]);

  // Poll for approval while the application is under review
  useEffect(() => {
    if (!isApproved && ownerData && !isRejected) {
      const interval = setInterval(() => {
        void loadData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isApproved, isRejected, ownerData, loadData]);

  if (status === "initial" || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-sans text-sm text-text-muted">Loading partner hub...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center border-2 border-error/30">
          <AlertCircle className="w-7 h-7 text-error" />
        </div>
        <h2 className="font-sans text-xl font-bold text-text-main">Failed to Load Dashboard</h2>
        <p className="font-sans text-sm text-text-muted text-center max-w-sm">{loadError}</p>
        <button
          onClick={() => { setLoadError(null); setLoading(true); window.location.reload(); }}
          className="flex items-center gap-2 bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover font-sans font-bold text-sm px-6 py-2.5 rounded-md transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

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
      return {
        icon: CheckCircle2,
        iconClass: "text-brand-lime",
        bgClass: "bg-brand-lime/10 border-brand-lime/20",
        title: "Application Approved & Live",
        desc: "Congratulations! Your venue is live on Turfzo. Manage your turf, bookings, pricing, and payouts from the Turfzo app.",
        badgeText: "Active & Live",
        badgeClass: "bg-brand-lime/15 border-brand-lime/30 text-brand-lime",
      };
    }
    return {
      icon: Clock,
      iconClass: "text-amber-400",
      bgClass: "bg-amber-400/5 border-amber-400/10",
      title: "Application Under Review",
      desc: "Our onboarding team is reviewing your business details, bank credentials, and venue specifications. This typically takes up to 2-4 hours.",
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

  const formatINR = (value?: number) => {
    if (value === undefined || value === null) return "₹0";
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  // ── Status hero (shared between under-review and approved states) ──
  const statusHero = (
    <div className={`rounded-[16px] border p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start ${statusConfig.bgClass}`}>
      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-bg border border-border-default ${statusConfig.iconClass}`}>
        <StatusIcon className="h-6 w-6" />
      </div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1.5">
          <h2 className="font-sans text-lg font-bold text-text-main tracking-wide">{statusConfig.title}</h2>
          <p className="font-sans text-sm text-text-muted/80 leading-relaxed">{statusConfig.desc}</p>
        </div>

        {/* Verification timeline (pending review) */}
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
                    className={`h-full ${step.done ? "bg-brand-lime" : step.active ? "bg-amber-400 animate-pulse" : "bg-transparent"}`}
                    style={{ width: step.active ? "100%" : "0%" }}
                  />
                </div>
                <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${step.active ? "text-text-main" : "text-text-muted"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {isApproved && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => router.push("/explore")}
              className="bg-brand-btn-bg border border-brand-lime/30 text-white font-sans font-bold text-xs py-2 px-4 rounded-[8px] hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover transition-all inline-flex items-center gap-1.5"
            >
              View Live Listings
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <div className="text-xs font-sans text-text-muted flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-brand-lime" />
              <span>Full management (slots, pricing, bookings) lives in the Turfzo app.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Application status page (not approved yet) ──
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
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusConfig.badgeClass}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
              {statusConfig.badgeText}
            </div>
          </div>

          {statusHero}

          {/* What happens next / support */}
          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">
              {isRejected ? "How to proceed" : "What happens next?"}
            </h3>
            {isRejected ? (
              <div className="space-y-3">
                <p className="font-sans text-xs text-text-muted/80 leading-relaxed">
                  {rejectionReason
                    ? `Your application did not pass verification: ${rejectionReason}.`
                    : "Your application did not pass verification."}{" "}
                  You can fix the mismatching details and submit again — your saved business,
                  venue, and payout details will be prefilled.
                </p>
                <button
                  onClick={handleReapply}
                  disabled={reapplyLoading}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover font-sans font-bold text-xs px-5 py-2.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw className={`h-4 w-4 ${reapplyLoading ? "animate-spin" : ""}`} />
                  {reapplyLoading ? "Resetting application..." : "Edit & Resubmit"}
                </button>
              </div>
            ) : (
              <ul className="list-disc pl-4 space-y-1.5 font-sans text-xs text-text-muted/80">
                <li>We review your business credentials and IFSC/bank matching (typically 2-4 hours).</li>
                <li>Once approved, your venue appears live in the Turfzo search catalog.</li>
                <li>You will receive an email confirmation. You then manage everything from the Turfzo app.</li>
                <li>This page automatically refreshes — no need to reload.</li>
              </ul>
            )}
          </div>

          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-3">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">Need Assistance?</h3>
            <p className="font-sans text-xs text-text-muted/80 leading-relaxed">
              Have questions about your application, documents, or fee structures? Reach out to our
              partner success desk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-1 text-xs font-sans">
              <a href="mailto:partners@turfzo.com" className="inline-flex items-center gap-1.5 text-brand-lime hover:underline">
                <Mail className="h-4 w-4 text-brand-lime" />
                partners@turfzo.com
              </a>
              <a href="tel:+918042424242" className="inline-flex items-center gap-1.5 text-brand-lime hover:underline">
                <Phone className="h-4 w-4 text-brand-lime" />
                +91 80 4242 4242
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Approved analytics view (display-only, no management) ──
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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusConfig.badgeClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
            {statusConfig.badgeText}
          </div>
        </div>

        {statusHero}

        {/* Analytics snapshot */}
        <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-default pb-3">
            <TrendingUp className="h-5 w-5 text-brand-lime" />
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">
              Venue Analytics
            </h3>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
              {summary ? `${summary.turfCount} turf${summary.turfCount === 1 ? "" : "s"}` : "—"}
            </span>
          </div>

          {summary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-[12px] border border-border-default bg-elevated p-4">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Total Earnings</span>
                <span className="block text-xl font-extrabold text-brand-lime mt-1">{formatINR(summary.totalEarnings)}</span>
              </div>
              <div className="rounded-[12px] border border-border-default bg-elevated p-4">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Available Balance</span>
                <span className="block text-xl font-extrabold text-text-main mt-1">{formatINR(summary.availableBalance)}</span>
              </div>
              <div className="rounded-[12px] border border-border-default bg-elevated p-4">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Total Bookings</span>
                <span className="block text-xl font-extrabold text-text-main mt-1">{summary.totalBookings}</span>
              </div>
              <div className="rounded-[12px] border border-border-default bg-elevated p-4">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Completion Rate</span>
                <span className="block text-xl font-extrabold text-text-main mt-1">{summary.completionRate}%</span>
              </div>
              <div className="col-span-2 md:col-span-4 border-t border-border-default pt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs font-sans text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime" />
                  {summary.completedBookings} completed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck2 className="h-3.5 w-3.5 text-amber-400" />
                  {summary.pendingBookings} upcoming
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5 text-rose-500" />
                  {summary.cancelledBookings} cancelled
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-sans text-text-muted italic">
              Analytics unavailable right now. Please try again shortly.
            </p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Registered Venue Summary */}
          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Building className="h-5 w-5 text-brand-lime" />
              <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">First Venue Setup</h3>
            </div>

            {primaryVenue ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Venue Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{primaryVenue.name}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Hourly Rate</span>
                    <span className="text-brand-lime font-bold mt-0.5 block">₹{primaryVenue.price_per_hour}/hr</span>
                  </div>
                </div>
                <div>
                  <span className="text-text-secondary uppercase font-semibold tracking-wider">Address</span>
                  <span className="text-text-main font-medium mt-0.5 block">
                    {primaryVenue.address}, {primaryVenue.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Pitches Count</span>
                    <span className="text-text-main font-medium mt-0.5 block">{primaryVenue.ground_count || 1} court(s)</span>
                  </div>
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Sport Type</span>
                    <span className="text-text-main font-medium mt-0.5 block capitalize">{primaryVenue.sport_type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-sans text-text-muted italic">No venue records found.</p>
            )}
          </div>

          {/* Column 2: Payout Settlements */}
          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <CreditCard className="h-5 w-5 text-brand-lime" />
              <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">Payout Settlement</h3>
            </div>

            {ownerData?.payout ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Holder Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{ownerData.payout.bank_account_holder_name}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Bank Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{ownerData.payout.bank_name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">Account Number</span>
                    <span className="text-text-main font-mono mt-0.5 block">{obscureAccount(ownerData.payout.bank_account_number)}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">IFSC Code</span>
                    <span className="text-text-main font-mono mt-0.5 block">{ownerData.payout.bank_ifsc_code}</span>
                  </div>
                </div>
                {ownerData.payout.upi_id && (
                  <div>
                    <span className="text-text-secondary uppercase font-semibold tracking-wider">UPI ID</span>
                    <span className="text-text-main font-mono mt-0.5 block">{ownerData.payout.upi_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-sans text-text-muted italic">No payout records found.</p>
            )}
          </div>
        </div>

        {/* Manage in app callout */}
        <div className="bg-surface border border-brand-lime/20 rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-brand-lime/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-brand-lime" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">Manage everything in the Turfzo app</h3>
              <p className="font-sans text-xs text-text-muted leading-relaxed">
                Slots &amp; calendar, dynamic pricing, promotions, customer insights, payouts, and
                tournament tools all live in the app. This page is your read-only analytics snapshot.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans text-text-muted shrink-0">
            <ShieldCheck className="h-4 w-4 text-brand-lime" />
            <span>Data refreshes live from your bookings</span>
          </div>
        </div>

        {/* Need Help / Support Section */}
        <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-3">
          <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">Need Assistance?</h3>
          <p className="font-sans text-xs text-text-muted leading-relaxed">
            Have questions about payouts, fee structures, or hardware integration (IoT lighting/gate
            controller setups)? Reach out to our partner success desk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-1 text-xs font-sans">
            <a href="mailto:partners@turfzo.com" className="inline-flex items-center gap-1.5 text-brand-lime hover:underline">
              <Mail className="h-4 w-4 text-brand-lime" />
              partners@turfzo.com
            </a>
            <a href="tel:+918042424242" className="inline-flex items-center gap-1.5 text-brand-lime hover:underline">
              <Phone className="h-4 w-4 text-brand-lime" />
              +91 80 4242 4242
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
