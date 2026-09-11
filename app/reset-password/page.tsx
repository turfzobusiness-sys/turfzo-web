"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { convexClient } from "@/lib/convex";

type ResetResult =
  | { success: true }
  | { success: false; error: "INVALID_OR_EXPIRED_TOKEN" | "WEAK_PASSWORD" };

const PASSWORD_RULE = "At least 8 characters, 1 uppercase letter and 1 number.";

// W4: the one-time reset token travels in the URL FRAGMENT (#token=...),
// never in the query string, so it is not captured by server logs,
// browser history, or analytics tools.
function readFragmentToken(): string {
  if (typeof window === "undefined") return "";
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return params.get("token") ?? "";
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [token, setToken] = useState("");

  // The one-time token travels in the URL FRAGMENT (#token=...). Read it in
  // an effect (not during render) so it survives hydration and client-side
  // navigation, and react to fragment changes (e.g. a fresh link).
  useEffect(() => {
    // Defer the initial fragment read by one frame so the effect body stays
    // side-effect free (react-hooks/set-state-in-effect). The token still
    // survives hydration and the one-frame flip is invisible.
    const syncToken = () => setToken(readFragmentToken());
    const raf = window.requestAnimationFrame(syncToken);
    window.addEventListener("hashchange", syncToken);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", syncToken);
    };
  }, []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLink = Boolean(email && token);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasLink || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await convexClient.action<ResetResult>("auth:resetPassword", {
        email,
        token,
        newPassword,
      });
      if (result.success) {
        setDone(true);
      } else if (result.error === "WEAK_PASSWORD") {
        setError(`Password is too weak. ${PASSWORD_RULE}`);
      } else {
        setError(
          "This reset link is invalid or has expired. Please request a new one.",
        );
      }
    } catch {
      setError(
        "Something went wrong. Please try again or request a new reset link.",
      );
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
            <h1 className="font-sans text-2xl font-extrabold text-text-main">
              {done ? "Password Updated" : hasLink ? "Choose a New Password" : "Invalid Link"}
            </h1>
            <p className="text-text-muted text-sm font-sans mt-1">
              {done
                ? "You can now sign in with your new password."
                : hasLink
                  ? PASSWORD_RULE
                  : "This reset link is invalid or incomplete."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm font-sans flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {done ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30">
                <Check className="w-7 h-7 text-brand-lime stroke-[3]" />
              </div>
              <p className="text-sm text-text-muted text-center font-sans leading-relaxed">
                Your password for <span className="text-text-main font-semibold">{email}</span> has been updated.
              </p>
              <Link
                href="/auth/login"
                className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>
          ) : hasLink ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans font-semibold text-text-muted uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-elevated border border-border-subtle rounded-md py-3 pl-10 pr-10 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-lime/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans font-semibold text-text-muted uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    minLength={8}
                    className="w-full bg-elevated border border-border-subtle rounded-md py-3 pl-10 pr-4 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-lime/30 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-lime hover:bg-brand-lime-hover disabled:bg-elevated disabled:text-text-muted/40 text-white dark:text-black font-sans font-bold py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center border-2 border-error/20">
                <KeyRound className="w-7 h-7 text-error" />
              </div>
              <p className="text-sm text-text-muted text-center font-sans leading-relaxed">
                Request a new link and click the one sent to your inbox.
              </p>
              <Link
                href="/forgot-password"
                className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-sans font-bold py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                Request New Link
              </Link>
            </div>
          )}

          {!done && (
            <Link
              href="/auth/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-brand-lime transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
