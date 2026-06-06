"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Sparkles, Building, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { OnboardingWizard } from "@/components/owners/onboarding/onboarding-wizard";
import { Button } from "@/components/ui/button";
import { convexClient } from "@/lib/convex";
import type { OnboardingState, AppUser } from "@/lib/types";

export default function OnboardingPage() {
  const { status, convexUser, firebaseUser, signUp } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    async function checkState() {
      if (status === "unauthenticated") {
        router.push("/owners/register");
        return;
      }

      if (status === "authenticated" && convexUser) {
        if (convexUser.role === "owner") {
          try {
            const state = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
            if (state?.profile?.onboarding_completed) {
              router.push("/owners/dashboard");
              return;
            }
          } catch (err) {
            console.error("Error checking onboarding status:", err);
          }
        }
        setChecking(false);
      }
    }
    
    if (status !== "initial" && status !== "loading") {
      checkState();
    }
  }, [status, convexUser, router]);

  // Handle player account upgrading to owner account
  const handleUpgradeRole = async () => {
    if (!firebaseUser) return;
    setUpgrading(true);
    try {
      const token = await firebaseUser.getIdToken();
      // Sync Firebase User with the role "owner"
      await convexClient.mutation<{
        success: boolean;
        user: AppUser;
      }>(
        "auth:syncFirebaseUser",
        {
          role: "owner",
          displayName: convexUser?.display_name || firebaseUser.displayName || "",
          city: convexUser?.city || "",
        },
        token
      );
      
      // Reload page to re-trigger auth context hydration
      window.location.reload();
    } catch (err) {
      console.error("Failed to upgrade account role:", err);
      setUpgrading(false);
    }
  };

  if (status === "initial" || status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-poppins text-sm text-text-muted">Verifying application status...</span>
      </div>
    );
  }

  // Check if player role and needs to upgrade
  if (convexUser?.role === "player") {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-brand-lime/3 blur-[120px] -z-10" />

        <div className="max-w-md w-full bg-surface border border-border-default rounded-[16px] p-6 md:p-8 space-y-6 shadow-xl shadow-brand-lime/1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime/10 border border-brand-lime/30 text-brand-lime">
            <Building className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-semibold uppercase tracking-wider">
              Account Upgrade
            </span>
            <h2 className="font-poppins text-xl font-bold text-white tracking-wide">Become a Turfzo Partner</h2>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Your account is currently registered as a **Player**. Would you like to upgrade your profile to a **Turf Owner** to list your venues and manage bookings?
            </p>
          </div>

          <div className="bg-[#0f1f0f]/20 border border-brand-lime/10 p-4 rounded-[12px] font-sans text-xs text-text-muted/80 space-y-2.5">
            <p className="font-semibold text-white flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-lime fill-current" />
              Upgrading will allow you to:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>List multiple turf fields, courts, and nets</li>
              <li>Configure booking calendar slots and pricing</li>
              <li>Withdraw earnings securely to your bank account</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleUpgradeRole}
              disabled={upgrading}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-lime border border-brand-lime text-[#0c1b0c] hover:bg-[#b0f782] py-2.5 font-poppins font-bold text-sm tracking-wide rounded-[8px] transition-all"
            >
              {upgrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0c1b0c]" />
                  Upgrading Account...
                </>
              ) : (
                <>
                  Upgrade to Turf Owner
                  <ArrowRight className="h-4 w-4 text-[#0c1b0c]" />
                </>
              )}
            </Button>

            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-main py-2 transition-colors font-medium font-sans"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Return to Homepage
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg relative py-12 px-6 md:py-20">
      {/* Background glow decorations */}
      <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-brand-lime/2 blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-brand-lime/1 blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-border-default pb-5">
          <h1 className="font-poppins text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Partner Onboarding Flow
          </h1>
          <p className="font-sans text-sm text-text-muted/80">
            Complete the verification details below to launch your venue in the Turfzo ecosystem.
          </p>
        </div>

        <OnboardingWizard />
      </div>
    </main>
  );
}
