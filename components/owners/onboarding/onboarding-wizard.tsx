"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { StepBusinessProfile, type BusinessProfileData } from "./step-business-profile";
import { StepVenueSetup, type VenueDraftData } from "./step-venue-setup";
import { StepPayoutDetails, type PayoutData } from "./step-payout-details";
import { StepReviewSubmit } from "./step-review-submit";
import { convexClient } from "@/lib/convex";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { OnboardingState } from "@/lib/types";

export function OnboardingWizard() {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadState() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const state = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile", {}, token);
        if (state) {
          setOnboardingState(state);
          const currentStep = state.profile?.onboarding_step || 1;
          setStep(currentStep);
          
          // Compute completed steps
          const completed: number[] = [];
          if (currentStep > 1) completed.push(1);
          if (currentStep > 2) completed.push(2);
          if (currentStep > 3) completed.push(3);
          setCompletedSteps(completed);
        }
      } catch (err) {
        console.error("Failed to load onboarding state:", err);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-sans text-sm text-text-muted">Loading your partner application...</span>
      </div>
    );
  }

  if (!onboardingState) {
    return (
      <div className="text-center p-6 border border-border-default rounded-[12px] bg-surface/50">
        <p className="font-sans text-sm text-error-light">Unable to load owner profile details. Please make sure you are registered as an owner.</p>
      </div>
    );
  }

  // Handle Step 1 Save
  const handleSaveStep1 = async (businessData: Required<Omit<BusinessProfileData, "zip_code" | "gst_number" | "pan_number">> & BusinessProfileData) => {
    setActionLoading(true);
    try {
      await convexClient.mutation("auth:completeOnboardingStep", {
        step: 1,
        businessProfile: businessData,
      });
      // Refresh local state
      const updated = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
      if (updated) setOnboardingState(updated);
      
      setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Step 2 Save
  const handleSaveStep2 = async (venueData: Required<Pick<VenueDraftData, "name" | "address" | "city" | "price_per_hour">> & VenueDraftData) => {
    setActionLoading(true);
    try {
      await convexClient.mutation("auth:completeOnboardingStep", {
        step: 2,
        venueDraft: venueData,
      });
      // Refresh local state
      const updated = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
      if (updated) setOnboardingState(updated);

      setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Step 3 Save
  const handleSaveStep3 = async (payoutData: Required<Omit<PayoutData, "bank_branch" | "upi_id">> & PayoutData) => {
    setActionLoading(true);
    try {
      await convexClient.mutation("auth:completeOnboardingStep", {
        step: 3,
        payoutDetails: payoutData,
      });
      // Refresh local state
      const updated = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
      if (updated) setOnboardingState(updated);

      setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
      setStep(4);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Step 4 Final Submit
  const handleFinalSubmit = async () => {
    setActionLoading(true);
    try {
      await convexClient.mutation("auth:submitOnboarding", {
        agreementAccepted: true,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 px-6 space-y-6 max-w-lg mx-auto"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime mx-auto shadow-md shadow-brand-lime/5">
          <CheckCircle2 className="h-10 w-10 text-brand-lime" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans text-2xl font-bold text-text-main tracking-wide">Application Submitted!</h2>
          <p className="font-sans text-sm text-text-muted leading-relaxed">
            Thank you for registering with Turfzo! Your venue details and business credentials have been successfully logged. Our onboarding success team is verifying your registration.
          </p>
        </div>
        <div className="bg-[#0f1f0f]/30 border border-brand-lime/10 p-4 rounded-[12px] font-sans text-xs text-text-muted/80 text-left space-y-2">
          <p className="font-semibold text-text-main flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-lime fill-current" />
            What happens next?
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>We will review your account holder credentials and IFSC matching (typically 2-4 hours).</li>
            <li>Once approved, your venue will appear in the Turfzo search catalog.</li>
            <li>You will receive an email confirmation and immediate access to booking calendars.</li>
          </ul>
        </div>
        <div className="pt-2">
          <button
            onClick={() => window.location.href = "/owners/dashboard"}
            className="inline-flex items-center justify-center rounded-md bg-brand-btn-bg border border-brand-lime/30 text-white hover:bg-brand-btn-bg-hover hover:border-brand-lime/60 shadow-sm px-6 py-2.5 font-sans font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-lime/10 cursor-pointer"
          >
            Go to Partner Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  // Pre-aggregate data for the Step 4 summary review
  const summaryData = {
    business: {
      business_name: onboardingState.profile?.business_name,
      phone_number: onboardingState.profile?.phone_number,
      address: onboardingState.profile?.address,
      city: onboardingState.profile?.city,
      state: onboardingState.profile?.state,
      zip_code: onboardingState.profile?.zip_code,
      gst_number: onboardingState.profile?.gst_number,
      pan_number: onboardingState.profile?.pan_number,
    },
    venue: {
      name: onboardingState.profile?.venue_draft?.name,
      description: onboardingState.profile?.venue_draft?.description,
      address: onboardingState.profile?.venue_draft?.address,
      city: onboardingState.profile?.venue_draft?.city,
      state: onboardingState.profile?.venue_draft?.state,
      zip_code: onboardingState.profile?.venue_draft?.zip_code,
      price_per_hour: onboardingState.profile?.venue_draft?.price_per_hour,
      sport_type: onboardingState.profile?.venue_draft?.sport_type,
      amenities: onboardingState.profile?.venue_draft?.amenities,
      ground_count: onboardingState.profile?.venue_draft?.ground_count,
      is_indoor: onboardingState.profile?.venue_draft?.is_indoor,
      image_gallery: onboardingState.profile?.venue_draft?.image_gallery,
    },
    payout: {
      bank_account_holder_name: onboardingState.payout?.bank_account_holder_name,
      bank_account_number: onboardingState.payout?.bank_account_number,
      bank_ifsc_code: onboardingState.payout?.bank_ifsc_code,
      bank_name: onboardingState.payout?.bank_name,
      bank_branch: onboardingState.payout?.bank_branch,
      upi_id: onboardingState.payout?.upi_id,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Stepper column (Desktop 4/12, Mobile full width) */}
      <div className="md:col-span-4 lg:col-span-3">
        <StepIndicator currentStep={step} completedSteps={completedSteps} />
      </div>

      {/* Form panel (Desktop 8/12, Mobile full width) */}
      <div className="md:col-span-8 lg:col-span-9 bg-surface border border-border-default rounded-[16px] p-6 md:p-8 shadow-xl shadow-brand-lime/1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 1 && (
              <StepBusinessProfile
                initialData={summaryData.business}
                onNext={handleSaveStep1}
                loading={actionLoading}
              />
            )}

            {step === 2 && (
              <StepVenueSetup
                initialData={summaryData.venue}
                onNext={handleSaveStep2}
                onBack={() => setStep(1)}
                loading={actionLoading}
              />
            )}

            {step === 3 && (
              <StepPayoutDetails
                initialData={summaryData.payout}
                onNext={handleSaveStep3}
                onBack={() => setStep(2)}
                loading={actionLoading}
              />
            )}

            {step === 4 && (
              <StepReviewSubmit
                data={summaryData}
                onEditStep={(target) => setStep(target)}
                onBack={() => setStep(3)}
                onSubmit={handleFinalSubmit}
                loading={actionLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
