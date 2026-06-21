"use client";

import React, { useState } from "react";
import { Check, ClipboardCheck, ArrowLeft, Loader2, Sparkles, AlertCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SummaryData {
  business: {
    business_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    gst_number?: string;
    pan_number?: string;
  };
  venue: {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    price_per_hour?: number;
    sport_type?: string;
    amenities?: string[];
    ground_count?: number;
    is_indoor?: boolean;
    image_gallery?: string[];
  };
  payout: {
    bank_account_holder_name?: string;
    bank_account_number?: string;
    bank_ifsc_code?: string;
    bank_name?: string;
    bank_branch?: string;
    upi_id?: string;
  };
}

interface StepReviewSubmitProps {
  data: SummaryData;
  onEditStep: (step: number) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export function StepReviewSubmit({ data, onEditStep, onBack, onSubmit, loading }: StepReviewSubmitProps) {
  const [agreement, setAgreement] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) {
      setErrorMsg("You must accept the Partner Agreement to proceed.");
      return;
    }
    setErrorMsg(null);
    await onSubmit();
  };

  const obscureAccount = (num?: string) => {
    if (!num) return "";
    if (num.length <= 4) return num;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sans text-xl font-bold text-text-main tracking-wide">Review & Submit</h2>
        <p className="font-sans text-sm text-text-muted/70">
          Double check your details before submitting your application for admin review.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-[8px] border border-error/20 bg-error/10 p-3 text-xs text-error-light font-sans">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Section 1: Business Profile */}
        <div className="rounded-[12px] border border-border-default bg-surface/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">1. Business Profile</h3>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-brand-lime font-sans font-medium hover:underline cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Business Name</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.business.business_name || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Phone Number</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.business.phone_number || "N/A"}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Business Address</span>
              <span className="text-text-main font-medium mt-0.5 block">
                {data.business.address}, {data.business.city}, {data.business.state} {data.business.zip_code ? `- ${data.business.zip_code}` : ""}
              </span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">GST Number</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.business.gst_number || <span className="text-text-muted/40 italic">Not Provided</span>}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Business PAN</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.business.pan_number || <span className="text-text-muted/40 italic">Not Provided</span>}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Venue Details */}
        <div className="rounded-[12px] border border-border-default bg-surface/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">2. First Venue Setup</h3>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1.5 text-xs text-brand-lime font-sans font-medium hover:underline cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Venue Name</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.venue.name || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Price Per Hour</span>
              <span className="text-brand-lime font-bold mt-0.5 block">₹{data.venue.price_per_hour}/hr</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Venue Address</span>
              <span className="text-text-main font-medium mt-0.5 block">
                {data.venue.address}, {data.venue.city}, {data.venue.state} {data.venue.zip_code ? `- ${data.venue.zip_code}` : ""}
              </span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Pitches Count</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.venue.ground_count} {data.venue.ground_count === 1 ? "Court" : "Courts"} ({data.venue.is_indoor ? "Indoor" : "Outdoor"})</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Primary Sport</span>
              <span className="text-text-main font-medium mt-0.5 block capitalize">{data.venue.sport_type || "N/A"}</span>
            </div>
            {data.venue.amenities && data.venue.amenities.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-text-muted/60 uppercase font-semibold block tracking-wider mb-1">Amenities</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {data.venue.amenities.map((item) => (
                    <span
                      key={item}
                      className="bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-semibold px-2 py-0.5 rounded-[4px] capitalize"
                    >
                      {item.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Venue Photos</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.venue.image_gallery?.length || 0} photos uploaded</span>
            </div>
          </div>
        </div>

        {/* Section 3: Payout Details */}
        <div className="rounded-[12px] border border-border-default bg-surface/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="font-sans text-sm font-bold text-text-main tracking-wide">3. Payout Settings</h3>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1.5 text-xs text-brand-lime font-sans font-medium hover:underline cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Account Holder</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.payout.bank_account_holder_name || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Bank Name</span>
              <span className="text-text-main font-medium mt-0.5 block">{data.payout.bank_name || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Account Number</span>
              <span className="text-text-main font-mono mt-0.5 block tracking-wide">{obscureAccount(data.payout.bank_account_number)}</span>
            </div>
            <div>
              <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">IFSC Code</span>
              <span className="text-text-main font-mono mt-0.5 block tracking-wide">{data.payout.bank_ifsc_code || "N/A"}</span>
            </div>
            {data.payout.upi_id && (
              <div>
                <span className="text-text-muted/60 uppercase font-semibold block tracking-wider">Settlement UPI ID</span>
                <span className="text-text-main font-mono mt-0.5 block">{data.payout.upi_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agreement Block */}
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 bg-surface p-3.5 border border-border-default rounded-[10px]">
          <input
            id="agreement_checkbox"
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border-default bg-elevated text-brand-lime focus:ring-brand-lime/30 focus:ring-offset-0 transition-colors accent-brand-lime"
          />
          <label htmlFor="agreement_checkbox" className="font-sans text-xs text-text-muted/90 cursor-pointer leading-relaxed select-none">
            I agree to the <span className="text-brand-lime hover:underline font-semibold">Turfzo Partner Terms & Agreement</span>. I verify that I own or am authorized to register this venue, and that all information entered is accurate.
          </label>
        </div>
      </div>

      {/* Form Navigation */}
      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="inline-flex items-center gap-2 py-2.5 px-4 font-sans text-sm text-text-muted hover:text-text-main transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="submit"
          disabled={loading || !agreement}
          className="inline-flex items-center gap-2 bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover hover:border-brand-lime/60 shadow-sm py-3 px-8 font-sans font-bold text-sm tracking-wide rounded-[8px] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-lime/10 hover:shadow-brand-lime/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              Submitting Application...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 fill-current text-brand-lime" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
