"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Phone,
  Loader2,
  Check,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function VerifyPhonePage() {
  const router = useRouter();
  const { status, convexUser, linkPhone, verifyLinkedPhone, error } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (convexUser?.is_phone_verified) {
      toast.success("Your mobile number is verified!");
      router.replace("/profile");
    }
  }, [convexUser, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [countdown]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-surface border border-border-default rounded-md p-8 shadow-card-shadow text-center"
        >
          <p className="font-sans text-sm text-text-muted mb-4">
            You need to be signed in to verify your mobile number.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 w-full justify-center rounded-md text-sm font-semibold h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover"
          >
            Sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await linkPhone(phone);
      setStep("otp");
      setCountdown(60);
      toast.success("OTP sent to your phone.");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit code from your SMS.");
      return;
    }
    setLoading(true);
    try {
      await verifyLinkedPhone(otp.trim());
      toast.success("Mobile number verified!");
      router.replace("/profile");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading || countdown > 0) return;
    setLoading(true);
    try {
      await linkPhone(phone);
      setCountdown(60);
      toast.success("OTP resent.");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border-default rounded-md p-8 shadow-card-shadow">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image
                src="/turfzo_mascot.svg"
                alt="Turfzo"
                width={40}
                height={40}
              />
              <span className="font-sans font-bold text-xl text-text-main">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </Link>
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-lime/15 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-brand-lime" />
            </div>
            <h1 className="font-sans text-2xl font-extrabold text-text-main">
              Verify your mobile number
            </h1>
            <p className="text-text-muted text-sm font-sans mt-1">
              A verified mobile number is required to create and manage
              tournaments on Turfzo.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm font-sans"
            >
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSend} className="space-y-2.5">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-sm font-medium text-text-muted">
                  +91
                </span>
                <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="verify-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  required
                  className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-11 pr-10 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:border-border-strong disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-2.5">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="inline-flex items-center gap-1 font-sans text-xs font-medium text-text-muted hover:text-text-main transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change number
              </button>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.5em] text-text-main placeholder:text-sm placeholder:text-text-muted placeholder:tracking-normal focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:border-border-strong disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="w-full text-center text-xs font-medium text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
              >
                {countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : "Resend OTP"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-border-default text-center">
            <p className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              The OTP is sent by SMS and verified on Turfzo&apos;s server — you
              can&apos;t claim a number you don&apos;t control.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
