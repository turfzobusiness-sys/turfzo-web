"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Building, Calendar, CreditCard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SignInForm } from "@/components/auth/sign-in-form";
import { convexClient } from "@/lib/convex";
import type { OnboardingState } from "@/lib/types";
import { useAuthModal } from "@/lib/auth-modal-context";

export default function OwnerRegisterPage() {
  const { status, convexUser } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    async function checkRedirect() {
      if (status === "authenticated" && convexUser) {
        if (convexUser.role === "owner") {
          try {
            const state = await convexClient.query<OnboardingState | null>("auth:getOwnerProfile");
            if (state?.profile?.onboarding_completed) {
              router.push("/owners/dashboard");
            } else {
              router.push("/owners/onboarding");
            }
          } catch {
            router.push("/owners/onboarding");
          }
        } else {
          // If a player logs in, redirect them to onboarding to show the upgrade option
          router.push("/owners/onboarding");
        }
      }
    }
    checkRedirect();
  }, [status, convexUser, router]);

  return (
    <main className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* Left panel: Value Props (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-surface p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-border-default">
        {/* Background glow effects */}
        
        

        {/* Logo/Header */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex shrink-0 items-center gap-2 select-none">
            <span className="font-sans font-bold text-2xl text-text-main tracking-tight leading-none whitespace-nowrap">
              turf<span className="text-brand-lime">zo</span>
            </span>
            <span className="text-brand-lime font-medium text-[10px] tracking-widest ml-1 border border-brand-lime/30 px-1.5 py-0.5 rounded bg-brand-lime/5">PARTNER</span>
          </div>
        </div>

        {/* Marketing Copylist */}
        <div className="space-y-8 max-w-md my-auto relative z-10">
          <div className="space-y-3">
            <h1 className="font-sans text-3xl lg:text-4xl font-bold text-text-main leading-tight">
              Grow your venue business with Turfzo
            </h1>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Join hundreds of arena owners who use Turfzo to automate bookings, schedule slots, and accept instant digital payouts.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            {[
              {
                icon: Building,
                title: "Register in Minutes",
                desc: "Fill in your business details, add court specs, and provide bank info completely self-serve.",
              },
              {
                icon: Calendar,
                title: "Smart Calendar & Scheduling",
                desc: "Enable online slot bookings, pricing variations, and offline blockouts with our dashboard.",
              },
              {
                icon: CreditCard,
                title: "Instant Settlements",
                desc: "Direct settlements into your bank account within 24 hours of booking completions.",
              },
            ].map((prop, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-default text-text-main">
                  <prop.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans text-sm font-medium text-text-main">{prop.title}</h4>
                  <p className="font-sans text-xs text-text-muted leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs font-sans text-text-muted flex items-center gap-2 relative z-10">
          <ShieldCheck className="h-4 w-4" />
          <span>Secured partner connection. Standard terms of use apply.</span>
        </div>
      </div>

      {/* Right panel: Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-bg relative">

        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-bold text-text-main tracking-wide">
              {isLogin ? "Welcome Back, Partner" : "Get Started as Partner"}
            </h2>
            <p className="font-sans text-xs text-text-muted">
              {isLogin 
                ? "Sign in to resume your turf business setup." 
                : "Create your partner account to set up your turf business."}
            </p>
          </div>

          <div className="bg-surface border border-border-default rounded-[16px] p-6 shadow-xl shadow-brand-lime/1">
            {isLogin ? (
              <SignInForm onSuccess={() => router.push("/owners/onboarding")} />
            ) : (
              <SignUpForm role="owner" onSuccess={() => router.push("/owners/onboarding")} />
            )}
          </div>

          <p className="text-center font-sans text-xs text-text-muted">
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <a
              href="#"
              className="text-brand-lime hover:underline font-semibold"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(!isLogin);
              }}
            >
              {isLogin ? "Sign Up →" : "Sign In to Resume →"}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
