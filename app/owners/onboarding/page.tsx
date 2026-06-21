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

      if (status === "authenticated") {
        if (convexUser?.role === "owner") {
          try {
            const token = firebaseUser ? await firebaseUser.getIdToken() : undefined;
            const state = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile", {}, token);
            if (state?.profile?.onboarding_completed) {
              router.push("/owners/dashboard");
              return;
            }
          } catch (err) {
            console.error("Error checking onboarding status:", err);
          }
        }
        setChecking(false);
      } else if (status === "error") {
        setChecking(false);
      }
    }
    
    if (status !== "initial" && status !== "loading") {
      checkState();
    }
  }, [status, convexUser, firebaseUser, router]);

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
      
      // Hard redirect to re-trigger auth context hydration correctly without looping
      window.location.href = "/owners/onboarding";
    } catch (err) {
      console.error("Failed to upgrade account role:", err);
      setUpgrading(false);
    }
  };

  if (status === "initial" || status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-lime" />
        <span className="font-sans text-sm text-text-muted">Verifying application status...</span>
      </div>
    );
  }

  // Check if player role and needs to upgrade
  if (convexUser?.role === "player") {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border-default rounded-[16px] p-6 md:p-8 space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface border border-border-default text-text-main">
            <Building className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-xl font-bold text-text-main">Become a Turfzo Partner</h2>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Your account is currently registered as a Player. Would you like to upgrade your profile to a Turf Owner to list your venues and manage bookings?
            </p>
          </div>

          <div className="bg-elevated/40 border border-border-default p-4 rounded-lg font-sans text-sm text-text-muted space-y-2">
            <p className="font-medium text-text-main">
              Upgrading will allow you to:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>List multiple turf fields, courts, and nets</li>
              <li>Configure booking calendar slots and pricing</li>
              <li>Withdraw earnings securely to your bank account</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleUpgradeRole}
              disabled={upgrading}
              className="w-full bg-brand-btn-bg text-white hover:bg-brand-btn-bg-hover font-semibold"
            >
              {upgrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Upgrading Account...
                </>
              ) : (
                <>
                  Upgrade to Turf Owner
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text-main py-2 transition-colors font-medium font-sans"
            >
              <ChevronLeft className="h-4 w-4" />
              Return to Homepage
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg relative py-12 px-6 md:py-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-border-default pb-5">
          <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-text-main">
            Partner Onboarding Flow
          </h1>
          <p className="font-sans text-sm text-text-muted">
            Complete the verification details below to launch your venue in the Turfzo ecosystem.
          </p>
        </div>

        <OnboardingWizard />
      </div>
    </main>
  );
}
