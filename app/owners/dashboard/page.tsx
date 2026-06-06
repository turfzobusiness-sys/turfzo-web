"use client";

import React, { useEffect, useState } from "react";
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
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import type { OnboardingState, Turf } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function OwnerDashboardPage() {
  const { status, convexUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<OnboardingState | null>(null);
  const [venues, setVenues] = useState<Turf[]>([]);

  useEffect(() => {
    async function loadData() {
      if (status === "unauthenticated") {
        router.push("/owners/register");
        return;
      }

      if (status === "authenticated" && convexUser) {
        if (convexUser.role !== "owner") {
          router.push("/owners/onboarding");
          return;
        }

        try {
          const profileState = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
          
          // If onboarding not completed, redirect back to onboarding wizard
          if (profileState && !profileState.profile?.onboarding_completed) {
            router.push("/owners/onboarding");
            return;
          }

          setOwnerData(profileState);

          const ownerVenues = await convexClient.query<any[]>("auth:getOwnerVenues");
          setVenues(ownerVenues);
        } catch (err) {
          console.error("Failed to load owner dashboard details:", err);
        } finally {
          setLoading(false);
        }
      }
    }

    if (status !== "initial" && status !== "loading") {
      loadData();
    }
  }, [status, convexUser, router]);

  if (status === "initial" || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-sans text-sm text-text-muted">Loading partner dashboard...</span>
      </div>
    );
  }

  const primaryVenue = venues[0];
  const venueStatus = primaryVenue?.status || "pending"; // pending, approved, rejected, active, inactive

  const getStatusConfig = () => {
    switch (venueStatus) {
      case "approved":
      case "active":
        return {
          icon: CheckCircle2,
          iconClass: "text-brand-lime",
          bgClass: "bg-brand-lime/10 border-brand-lime/20",
          title: "Application Approved & Live",
          desc: "Congratulations! Your venue onboarding has been approved, and your turf listing is officially active on the Turfzo explorer search page.",
          badgeText: "Active & Live",
          badgeClass: "bg-brand-lime/15 border-brand-lime/30 text-brand-lime",
        };
      case "rejected":
        return {
          icon: XCircle,
          iconClass: "text-error-light",
          bgClass: "bg-error/10 border-error/20",
          title: "Verification Needs Correction",
          desc: "We found some mismatching information on your bank IFSC or GST records. Please contact support to review and update your credentials.",
          badgeText: "Needs Attention",
          badgeClass: "bg-error/15 border-error/30 text-error-light",
        };
      case "pending":
      default:
        return {
          icon: Clock,
          iconClass: "text-amber-400",
          bgClass: "bg-amber-400/5 border-amber-400/10",
          title: "Application Under Verification",
          desc: "Our onboarding team is reviewing your registered business name, bank account credentials, and field specifications. This takes up to 2-4 hours.",
          badgeText: "Pending Review",
          badgeClass: "bg-amber-400/10 border-amber-400/20 text-amber-400",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const obscureAccount = (num?: string) => {
    if (!num) return "";
    if (num.length <= 4) return num;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <main className="min-h-screen bg-bg relative py-12 px-6 md:py-20">
      {/* Glow backgrounds */}
      
      

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-5">
          <div className="space-y-1">
            <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              Partner Hub
            </h1>
            <p className="font-sans text-sm text-text-muted/80">
              Welcome back, <span className="text-white font-semibold">{ownerData?.profile?.business_name || "Partner"}</span>
            </p>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusConfig.badgeClass}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
            {statusConfig.badgeText}
          </div>
        </div>

        {/* Status Hero Card */}
        <div className={`rounded-[16px] border p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start ${statusConfig.bgClass}`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-bg border border-border-default ${statusConfig.iconClass}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <h2 className="font-sans text-lg font-bold text-white tracking-wide">{statusConfig.title}</h2>
              <p className="font-sans text-sm text-text-muted/80 leading-relaxed">
                {statusConfig.desc}
              </p>
            </div>

            {/* Verification timeline (Pending review state) */}
            {venueStatus === "pending" && (
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                {[
                  { label: "Submitted", active: true, done: true },
                  { label: "IFSC & Bank Review", active: true, done: false },
                  { label: "Approved & Live", active: false, done: false },
                ].map((step, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="h-1 w-full rounded-full bg-border-default overflow-hidden">
                      <div className={`h-full ${step.done ? "bg-brand-lime" : step.active ? "bg-amber-400 animate-pulse" : "bg-transparent"}`} style={{ width: step.active ? "100%" : "0%" }} />
                    </div>
                    <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${step.active ? "text-white" : "text-text-muted/50"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* approved options */}
            {(venueStatus === "approved" || venueStatus === "active") && (
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push(`/explore` /* OR full management dashboard once complete */)}
                  className="bg-brand-btn-bg border border-brand-lime/30 text-white font-sans font-bold text-xs py-2 px-4 rounded-[8px] hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover transition-all inline-flex items-center gap-1.5"
                >
                  View Live Listings
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <div className="text-xs font-sans text-text-muted flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-lime" />
                  <span>Calendar booking slot edits are now unlocked.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Registered Venue Summary */}
          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Building className="h-5 w-5 text-brand-lime" />
              <h3 className="font-sans text-sm font-bold text-white tracking-wide">First Venue Setup</h3>
            </div>
            
            {primaryVenue ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Venue Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{primaryVenue.name}</span>
                  </div>
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Hourly Rate</span>
                    <span className="text-brand-lime font-bold mt-0.5 block">₹{primaryVenue.price_per_hour}/hr</span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Address</span>
                  <span className="text-text-main font-medium mt-0.5 block">
                    {primaryVenue.address}, {primaryVenue.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Pitches Count</span>
                    <span className="text-text-main font-medium mt-0.5 block">{primaryVenue.ground_count || 1} court(s)</span>
                  </div>
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Sport Type</span>
                    <span className="text-text-main font-medium mt-0.5 block capitalize">{primaryVenue.sport_type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-sans text-text-muted italic">No venue records found under review.</p>
            )}
          </div>

          {/* Column 2: Payout Settlements */}
          <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <CreditCard className="h-5 w-5 text-brand-lime" />
              <h3 className="font-sans text-sm font-bold text-white tracking-wide">Payout Settlement</h3>
            </div>

            {ownerData?.payout ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Holder Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{ownerData.payout.bank_account_holder_name}</span>
                  </div>
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Bank Name</span>
                    <span className="text-text-main font-medium mt-0.5 block">{ownerData.payout.bank_name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">Account Number</span>
                    <span className="text-text-main font-mono mt-0.5 block">{obscureAccount(ownerData.payout.bank_account_number)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">IFSC Code</span>
                    <span className="text-text-main font-mono mt-0.5 block">{ownerData.payout.bank_ifsc_code}</span>
                  </div>
                </div>
                {ownerData.payout.upi_id && (
                  <div>
                    <span className="text-text-muted/60 uppercase font-semibold tracking-wider">UPI ID</span>
                    <span className="text-text-main font-mono mt-0.5 block">{ownerData.payout.upi_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-sans text-text-muted italic">No payout records found.</p>
            )}
          </div>
        </div>

        {/* Need Help / Support Section */}
        <div className="bg-surface border border-border-default rounded-[14px] p-5 space-y-3">
          <h3 className="font-sans text-sm font-bold text-white tracking-wide">Need Assistance?</h3>
          <p className="font-sans text-xs text-text-muted/80 leading-relaxed">
            Have questions about document uploads, fee structures, or hardware integration (IoT lighting/gate controller setups)? Reach out to our partner success desk.
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
