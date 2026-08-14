"use client";

import * as React from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Phone, ShieldCheck, ArrowLeft, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { safeRedirectTarget } from "@/lib/redirect";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SignUpMethod = "email" | "phone";

export function SignUpForm({ onSuccess, role }: { onSuccess?: () => void; role?: string }) {
  const { signUp, signInWithGoogle, phoneSignUp, verifyPhoneSignUp, error } = useAuth();
  const { closeAuthModal, returnTo } = useAuthModal();
  const router = useRouter();

  const [method, setMethod] = React.useState<SignUpMethod>("email");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Phone sign up
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearInterval(t);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      toast.error(
        "Password must be at least 8 characters with one uppercase letter and one number.",
      );
      return;
    }
    setLoading(true);
    try {
      await signUp({
        email,
        password,
        role: role ?? "player",
        displayName: name,
      });
      onSuccess?.();
      toast.success("Account created successfully!");
      finish();
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await phoneSignUp({ phone, role: role ?? "player", displayName: name });
      setStep("otp");
      setCountdown(60);
      toast.success("OTP sent to your phone.");
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit code from your SMS.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneSignUp(otp.trim());
      onSuccess?.();
      toast.success("Account created successfully!");
      finish();
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading || countdown > 0) return;
    setLoading(true);
    try {
      await phoneSignUp({ phone, role: role ?? "player", displayName: name });
      setCountdown(60);
      toast.success("OTP resent.");
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const finish = () => {
    setTimeout(() => {
      closeAuthModal();
      const target = safeRedirectTarget(returnTo);
      if (target) {
        router.push(target);
      }
    }, 2000);
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      toast.success("Account created successfully!");
      finish();
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const phoneLoggedIn = step === "otp";

  return (
    <form
      onSubmit={method === "email" ? handleSubmit : (phoneLoggedIn ? handleVerifyOtp : handlePhoneSubmit)}
      className="space-y-2.5"
    >
      {error && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error-light"
        >
          {error}
        </div>
      )}

      {/* Method toggle */}
      <div
        role="tablist"
        aria-label="Sign up method"
        className="flex rounded-md border border-border-default bg-elevated p-1 text-sm font-medium"
      >
        {(
          [
            { key: "phone", label: "Phone", icon: <Smartphone className="h-3.5 w-3.5" /> },
            { key: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={method === tab.key}
            onClick={() => { setMethod(tab.key); setStep("phone"); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 font-sans text-xs transition-colors",
              method === tab.key
                ? "bg-brand-lime text-white"
                : "text-text-muted hover:text-text-main"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {method === "phone" && phoneLoggedIn ? (
        <>
          <button
            type="button"
            onClick={() => { setStep("phone"); setOtp(""); }}
            className="inline-flex items-center gap-1 font-sans text-xs font-medium text-text-muted hover:text-text-main transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change number
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg px-3.5 py-2.5">
            <ShieldCheck className="h-4 w-4 text-brand-lime" />
            <span className="font-sans text-xs text-text-muted">
              We sent a 6-digit code to <span className="font-medium text-text-main">+91&nbsp;{phone}</span>
            </span>
          </div>
          <input
            id="auth-signup-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-md border border-border-default bg-bg px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.5em] text-text-main placeholder:text-sm placeholder:text-text-muted placeholder:tracking-normal focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:border-border-strong disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Create Account"
            )}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="w-full text-center text-xs font-medium text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
          </button>
        </>
      ) : (
        <>
          {/* Name */}
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
            <input
              id="auth-signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              autoComplete="name"
              className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
            />
          </div>

          {method === "phone" ? (
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-sm font-medium text-text-muted">
                +91
              </span>
              <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="auth-signup-phone"
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
          ) : (
            <>
              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
                <input
                  id="auth-signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
                <input
                  id="auth-signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-10 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:border-border-strong disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-brand-lime text-white hover:bg-brand-lime-hover mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {method === "phone" ? "Sending OTP…" : "Creating account…"}
              </>
            ) : (
              method === "phone" ? "Send OTP" : "Create Account"
            )}
          </button>
        </>
      )}

      {/* Divider */}
      <div className="relative my-1.5 pt-1">
        <div className="absolute inset-0 flex items-center pt-1">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center pt-1">
          <span className="bg-bg px-2 font-sans text-[10px] text-text-muted">
            or
          </span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-elevated px-4 py-2.5 font-sans text-sm font-semibold text-text-main transition-all duration-300",
          "hover:border-border-strong hover:bg-elevated/70",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
