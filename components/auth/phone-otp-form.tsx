"use client";

import * as React from "react";
import { Phone, Smartphone, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { safeRedirectTarget } from "@/lib/redirect";
import { toast } from "sonner";

export function PhoneOtpForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signInWithPhone, verifyPhoneOtp, error } = useAuth();
  const { closeAuthModal, returnTo } = useAuthModal();
  const router = useRouter();

  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const handlePostAuth = () => {
    onSuccess?.();
    toast.success("Signed in successfully!");
    setTimeout(() => {
      closeAuthModal();
      const target = safeRedirectTarget(returnTo);
      if (target) {
        router.push(target);
      }
    }, 2000);
  };

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [countdown]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setStep("otp");
      setCountdown(60);
      toast.success("OTP sent to your phone.");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit code from your SMS.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOtp(otp.trim());
      handlePostAuth();
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
      await signInWithPhone(phone);
      setCountdown(60);
      toast.success("OTP resent.");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-1">
      {/* The invisible reCAPTCHA widget renders into this container and must
          stay mounted for the whole phone flow — it persists across both steps. */}
      <div id="phone-recaptcha-container" aria-hidden="true" />

      {error && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error-light"
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
              id="auth-phone"
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
            <ArrowLeft className="h-3.5 w-3.5" /> Change number
          </button>

          <div className="relative">
            <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="auth-otp"
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              required
              autoFocus
              className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200 tracking-widest"
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
                Verifying…
              </>
            ) : (
              "Verify & Sign In"
            )}
          </button>

          <div className="flex items-center justify-between pt-0.5">
            <span className="font-sans text-xs text-text-muted">
              OTP sent to +91 {phone}
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              className="font-sans text-xs font-medium text-brand-lime hover:text-brand-lime-hover disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
